import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import {
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadProConverter,
  CircuitJsonToKicadSchConverter,
} from "circuit-json-to-kicad"
import { Circuit } from "tscircuit"
import TemplateBoard, { PROJECT_NAME } from "./board"

const buildDirectory = path.resolve("build")
const kicadDirectory = path.join(buildDirectory, "kicad")

const samePoint = (
  first: { x: number; y: number } | undefined,
  second: { x: number; y: number } | undefined,
) =>
  first !== undefined &&
  second !== undefined &&
  Math.abs(first.x - second.x) < 1e-6 &&
  Math.abs(first.y - second.y) < 1e-6

const markNoConnectPinTypes = (schematic: string, pinNames: string[]) => {
  const lines = schematic.split("\n")

  for (const pinName of pinNames) {
    const nameLine = lines.findIndex((line) =>
      line.includes(`(name "${pinName}"`),
    )
    if (nameLine < 0) {
      throw new Error(`KiCad symbol pin ${pinName} was not generated`)
    }

    let pinLine = nameLine
    while (pinLine >= 0 && !lines[pinLine]?.includes("(pin passive line")) {
      pinLine -= 1
    }
    const pinDefinition = lines[pinLine]
    if (pinDefinition === undefined) {
      throw new Error(`KiCad symbol pin ${pinName} has no pin definition`)
    }
    lines[pinLine] = pinDefinition.replace(
      "(pin passive line",
      "(pin no_connect line",
    )
  }

  return lines.join("\n")
}

await mkdir(kicadDirectory, { recursive: true })

const circuit = new Circuit()
circuit.add(<TemplateBoard />)
await circuit.renderUntilSettled()

const circuitJson = circuit.getCircuitJson()

// circuit-json-to-kicad 0.0.163 builds rail/ground labels as custom symbols.
// Their generated pin is slightly offset from the net-label anchor, which makes
// KiCad 10 report false pin_not_connected errors. A global label at the same
// anchor carries the identical net semantics without the faulty symbol geometry.
for (const element of circuitJson) {
  if (element.type === "schematic_net_label") {
    delete element.symbol_name
  }
}

// Auto-layout can leave redundant labels at points with neither a port nor a
// wire endpoint. They carry no electrical connection and KiCad correctly calls
// them dangling, so remove only these orphaned render artifacts.
const connectedSchematicPoints = circuitJson.flatMap((element) => {
  if (element.type === "schematic_port") return [element.center]
  if (element.type === "schematic_trace") {
    return element.edges.flatMap((edge) => [edge.from, edge.to])
  }
  return []
})
for (let index = circuitJson.length - 1; index >= 0; index -= 1) {
  const element = circuitJson[index]
  if (
    element?.type === "schematic_net_label" &&
    !connectedSchematicPoints.some((point) =>
      samePoint(point, element.anchor_position),
    )
  ) {
    circuitJson.splice(index, 1)
  }
}

const schematicConverter = new CircuitJsonToKicadSchConverter(circuitJson)
schematicConverter.runUntilFinished()

const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson)
pcbConverter.runUntilFinished()

const projectConverter = new CircuitJsonToKicadProConverter(circuitJson, {
  projectName: PROJECT_NAME,
  schematicFilename: `${PROJECT_NAME}.kicad_sch`,
  pcbFilename: `${PROJECT_NAME}.kicad_pcb`,
})
projectConverter.runUntilFinished()

const schematicOutput = markNoConnectPinTypes(
  schematicConverter.getOutputString(),
  [
    "NC4",
    "NC7",
    "NC9",
    "NC10",
    "NC15",
    "NC17",
    "IO6",
    "IO7",
    "NC24",
    "NC25",
    "NC28",
    "NC29",
    "NC32",
    "NC33",
    "NC34",
    "NC35",
    "A8_SBU1",
    "B8_SBU2",
  ],
)

const outputs = {
  circuitJson: path.join(buildDirectory, "circuit.json"),
  project: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_pro`),
  schematic: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_sch`),
  pcb: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_pcb`),
}

await Promise.all([
  writeFile(outputs.circuitJson, JSON.stringify(circuitJson, null, 2), "utf8"),
  writeFile(outputs.project, projectConverter.getOutputString(), "utf8"),
  writeFile(outputs.schematic, schematicOutput, "utf8"),
  writeFile(outputs.pcb, pcbConverter.getOutputString(), "utf8"),
  writeFile(
    path.join(buildDirectory, "manifest.json"),
    JSON.stringify({ projectName: PROJECT_NAME, outputs }, null, 2),
    "utf8",
  ),
])

console.log(`Generated ${PROJECT_NAME} in ${kicadDirectory}`)
