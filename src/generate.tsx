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

await mkdir(kicadDirectory, { recursive: true })

const circuit = new Circuit()
circuit.add(<TemplateBoard />)
await circuit.renderUntilSettled()

const circuitJson = circuit.getCircuitJson()

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

const outputs = {
  circuitJson: path.join(buildDirectory, "circuit.json"),
  project: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_pro`),
  schematic: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_sch`),
  pcb: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_pcb`),
}

await Promise.all([
  writeFile(outputs.circuitJson, JSON.stringify(circuitJson, null, 2), "utf8"),
  writeFile(outputs.project, projectConverter.getOutputString(), "utf8"),
  writeFile(outputs.schematic, schematicConverter.getOutputString(), "utf8"),
  writeFile(outputs.pcb, pcbConverter.getOutputString(), "utf8"),
  writeFile(
    path.join(buildDirectory, "manifest.json"),
    JSON.stringify({ projectName: PROJECT_NAME, outputs }, null, 2),
    "utf8",
  ),
])

console.log(`Generated ${PROJECT_NAME} in ${kicadDirectory}`)
