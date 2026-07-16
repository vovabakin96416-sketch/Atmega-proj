import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  CircuitJson,
  SchematicComponent,
  SchematicNetLabel,
  SchematicPort,
  SchematicTrace,
  SourceNet,
} from "circuit-json"
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

const replaceCrossGroupTracesWithLabels = (circuitJson: CircuitJson) => {
  const schematicComponents = circuitJson.filter(
    (element): element is SchematicComponent =>
      element.type === "schematic_component",
  )
  const schematicPorts = circuitJson.filter(
    (element): element is SchematicPort => element.type === "schematic_port",
  )
  const schematicTraces = circuitJson.filter(
    (element): element is SchematicTrace => element.type === "schematic_trace",
  )
  const sourceNets = circuitJson.filter(
    (element): element is SourceNet => element.type === "source_net",
  )
  const existingNetLabels = circuitJson.filter(
    (element): element is SchematicNetLabel =>
      element.type === "schematic_net_label",
  )
  const componentById = new Map(
    schematicComponents.map((component) => [
      component.schematic_component_id,
      component,
    ]),
  )
  const sourceNetByConnectivityKey = new Map(
    sourceNets.map((net) => [net.subcircuit_connectivity_map_key, net]),
  )
  const removedTraceIds = new Set<string>()
  const boundaryLabels: Array<{
    net: SourceNet
    port: SchematicPort
    connectivityKey: string
  }> = []

  for (const trace of schematicTraces) {
    const firstPoint = trace.edges[0]?.from
    const lastPoint = trace.edges.at(-1)?.to
    const firstPort = schematicPorts.find((port) =>
      samePoint(port.center, firstPoint),
    )
    const lastPort = schematicPorts.find((port) =>
      samePoint(port.center, lastPoint),
    )
    if (firstPort === undefined || lastPort === undefined) continue
    if (
      firstPort.schematic_component_id === undefined ||
      lastPort.schematic_component_id === undefined
    ) {
      continue
    }

    const firstGroup = componentById.get(
      firstPort.schematic_component_id,
    )?.schematic_group_id
    const lastGroup = componentById.get(
      lastPort.schematic_component_id,
    )?.schematic_group_id
    if (firstGroup === undefined || firstGroup === lastGroup) continue

    const connectivityKey = trace.subcircuit_connectivity_map_key
    if (connectivityKey === undefined) continue
    const net = sourceNetByConnectivityKey.get(connectivityKey)
    if (net === undefined) {
      throw new Error(
        `No source net for cross-group trace ${trace.source_trace_id}`,
      )
    }

    removedTraceIds.add(trace.schematic_trace_id)
    boundaryLabels.push(
      {
        net,
        port: firstPort,
        connectivityKey,
      },
      {
        net,
        port: lastPort,
        connectivityKey,
      },
    )
  }

  for (let index = circuitJson.length - 1; index >= 0; index -= 1) {
    const element = circuitJson[index]
    if (element === undefined) continue
    if (
      element.type === "schematic_trace" &&
      removedTraceIds.has(element.schematic_trace_id)
    ) {
      circuitJson.splice(index, 1)
    }
  }

  const insertedLabels = new Set<string>()
  for (const { net, port, connectivityKey } of boundaryLabels) {
    const labelKey = `${net.source_net_id}:${port.center.x}:${port.center.y}`
    if (insertedLabels.has(labelKey)) continue
    insertedLabels.add(labelKey)

    const boundaryComponent =
      port.schematic_component_id === undefined
        ? undefined
        : componentById.get(port.schematic_component_id)
    const boundarySourceComponent = circuitJson.find(
      (element) =>
        element.type === "source_component" &&
        element.source_component_id === boundaryComponent?.source_component_id,
    )
    const mayReuseGeneratedLabel = ["R10", "C13"].includes(
      boundarySourceComponent?.type === "source_component"
        ? boundarySourceComponent.name
        : "",
    )
    const nearbyGeneratedLabels = mayReuseGeneratedLabel
      ? existingNetLabels.filter(
          (label) =>
            label.text === net.name &&
            (label.anchor_side === "top" || label.anchor_side === "bottom") &&
            label.anchor_position !== undefined &&
            Math.hypot(
              label.anchor_position.x - port.center.x,
              label.anchor_position.y - port.center.y,
            ) <= 2 &&
            circuitJson.some((element) => {
              if (element.type === "schematic_port") {
                return samePoint(element.center, label.anchor_position)
              }
              if (element.type === "schematic_trace") {
                return element.edges.some(
                  (edge) =>
                    samePoint(edge.from, label.anchor_position) ||
                    samePoint(edge.to, label.anchor_position),
                )
              }
              return false
            }),
        )
      : []
    if (nearbyGeneratedLabels.length > 0) {
      for (const duplicateLabel of nearbyGeneratedLabels) {
        const horizontalSide =
          boundarySourceComponent?.type === "source_component" &&
          boundarySourceComponent.name === "R10"
            ? "right"
            : "left"
        const anchor = duplicateLabel.anchor_position
        if (anchor === undefined) continue
        duplicateLabel.anchor_side = horizontalSide
        duplicateLabel.center = {
          x:
            anchor.x +
            (horizontalSide === "left" ? 1 : -1) * net.name.length * 0.06,
          y: anchor.y,
        }
      }
      continue
    }

    const anchorSide =
      port.facing_direction === "right"
        ? "left"
        : port.facing_direction === "left"
          ? "right"
          : port.facing_direction === "up"
            ? "bottom"
            : "top"
    const anchor = { ...port.center }
    if (port.facing_direction === "right") anchor.x += 0.8
    if (port.facing_direction === "left") anchor.x -= 0.8
    if (port.facing_direction === "up") anchor.y += 0.8
    if (port.facing_direction === "down") anchor.y -= 0.8

    const stub: SchematicTrace = {
      type: "schematic_trace",
      schematic_trace_id: `schematic_trace_cross_group_stub_${insertedLabels.size}`,
      source_trace_id: `cross_group_stub_${insertedLabels.size}`,
      edges: [{ from: { ...port.center }, to: anchor }],
      junctions: [],
      subcircuit_connectivity_map_key: connectivityKey,
    }
    circuitJson.push(stub)

    const halfTextWidth = net.name.length * 0.06
    const center = { ...anchor }
    if (anchorSide === "left") center.x += halfTextWidth
    if (anchorSide === "right") center.x -= halfTextWidth
    if (anchorSide === "bottom") center.y += 0.09
    if (anchorSide === "top") center.y -= 0.09

    const label: SchematicNetLabel = {
      type: "schematic_net_label",
      schematic_net_label_id: `schematic_net_label_cross_group_${insertedLabels.size}`,
      text: net.name,
      source_net_id: net.source_net_id,
      anchor_position: anchor,
      center,
      anchor_side: anchorSide,
    }
    circuitJson.push(label)
  }
}

type SchematicFile = { filename: string; content: string }

const markNoConnectPinTypes = (
  schematicFiles: SchematicFile[],
  pinNames: string[],
) => {
  const remainingPins = new Set(pinNames)
  const updatedFiles = schematicFiles.map(({ filename, content }) => {
    const lines = content.split("\n")

    for (const pinName of [...remainingPins]) {
      const nameLine = lines.findIndex((line) =>
        line.includes(`(name "${pinName}"`),
      )
      if (nameLine < 0) continue

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
      remainingPins.delete(pinName)
    }

    return { filename, content: lines.join("\n") }
  })

  if (remainingPins.size > 0) {
    throw new Error(
      `KiCad no-connect pins were not generated: ${[...remainingPins].join(", ")}`,
    )
  }

  return updatedFiles
}

const addDocumentTitleBlock = (schematic: string, sheetName: string) => {
  const insertionPoint = "  (lib_symbols"
  if (!schematic.includes(insertionPoint)) {
    throw new Error(`KiCad schematic ${sheetName} has no lib_symbols section`)
  }

  const titleBlock = [
    "  (title_block",
    '    (title "Autonomous WS2811 LED Controller")',
    '    (date "2026-07-16")',
    '    (rev "A")',
    '    (company "Author: Vladimir Bakin")',
    '    (comment 1 "Document: WS2811-CTRL-SCH")',
    '    (comment 2 "12 V input; three-wire WS2811 strip")',
    '    (comment 3 "Local control works without Wi-Fi")',
    `    (comment 4 "Sheet: ${sheetName}")`,
    "  )",
  ].join("\n")

  return schematic.replace(insertionPoint, `${titleBlock}\n${insertionPoint}`)
}

const orientVerticalLabelNearReference = (
  schematic: string,
  reference: string,
  netName: string,
) => {
  const referenceIndex = schematic.indexOf(
    `(property "Reference" "${reference}"`,
  )
  if (referenceIndex < 0) return schematic
  const symbolStart = schematic.lastIndexOf("\n  (symbol", referenceIndex)
  if (symbolStart < 0) return schematic
  const symbolHeader = schematic.slice(symbolStart, referenceIndex)
  const symbolAt = symbolHeader.match(
    /\n {4}\(at ([+-]?[\d.eE]+) ([+-]?[\d.eE]+) [+-]?[\d.eE]+\)/,
  )
  if (symbolAt === null) return schematic
  const referencePoint = {
    x: Number(symbolAt[1]),
    y: Number(symbolAt[2]),
  }

  const escapedNetName = netName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const labelPattern = new RegExp(
    `\\(global_label "${escapedNetName}"[\\s\\S]*?\\(at ([+-]?[\\d.eE]+) ([+-]?[\\d.eE]+) (90|270)\\)`,
    "g",
  )
  let nearest:
    | { index: number; text: string; x: string; y: string; distance: number }
    | undefined
  for (const match of schematic.matchAll(labelPattern)) {
    const x = Number(match[1])
    const y = Number(match[2])
    const distance = Math.hypot(x - referencePoint.x, y - referencePoint.y)
    if (nearest === undefined || distance < nearest.distance) {
      nearest = {
        index: match.index,
        text: match[0],
        x: match[1] ?? "0",
        y: match[2] ?? "0",
        distance,
      }
    }
  }
  if (nearest === undefined || nearest.distance > 30) return schematic

  const horizontal = nearest.text.replace(
    /\(at ([+-]?[\d.eE]+) ([+-]?[\d.eE]+) (90|270)\)/,
    `(at ${nearest.x} ${nearest.y} 180)`,
  )
  const outwardFacing = horizontal.replace("(justify right)", "(justify left)")
  return `${schematic.slice(0, nearest.index)}${outwardFacing}${schematic.slice(nearest.index + nearest.text.length)}`
}

await mkdir(kicadDirectory, { recursive: true })

const circuit = new Circuit()
circuit.add(<TemplateBoard />)
await circuit.renderUntilSettled()

const circuitJson = circuit.getCircuitJson()

// Named nets are the readable inter-block interface. tscircuit currently also
// autoroutes those nets across group boundaries, producing page-spanning wires.
// Replace only cross-group routes with global labels at the physical pins;
// short wires inside each functional block remain intact.
replaceCrossGroupTracesWithLabels(circuitJson)

// circuit-json-to-kicad 0.0.163 builds rail/ground labels as custom symbols.
// Their generated pin is slightly offset from the net-label anchor, which makes
// KiCad 10 report false pin_not_connected errors. A global label at the same
// anchor carries the identical net semantics without the faulty symbol geometry.
for (const element of circuitJson) {
  if (element.type === "schematic_net_label") {
    delete element.symbol_name
  }
}

// The autorouter can leave its own rail label at the exact point where the
// cross-group transform adds a directional label. Keep the later, deliberate
// label so KiCad does not render two texts on top of one another.
const seenNetLabelAnchors = new Set<string>()
for (let index = circuitJson.length - 1; index >= 0; index -= 1) {
  const element = circuitJson[index]
  if (element?.type !== "schematic_net_label") continue
  if (element.anchor_position === undefined) continue
  const key = `${element.source_net_id}:${element.anchor_position.x}:${element.anchor_position.y}`
  if (seenNetLabelAnchors.has(key)) {
    circuitJson.splice(index, 1)
  } else {
    seenNetLabelAnchors.add(key)
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

const schematicFilename = `${PROJECT_NAME}.kicad_sch`
const schematicFiles = markNoConnectPinTypes(
  schematicConverter.getOutputFiles({ schematicFilename }),
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
).map((file) => ({
  ...file,
  content: addDocumentTitleBlock(
    orientVerticalLabelNearReference(file.content, "R10", "V3P3_ESP"),
    file.filename,
  ),
}))

const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson)
pcbConverter.runUntilFinished()

const projectConverter = new CircuitJsonToKicadProConverter(circuitJson, {
  projectName: PROJECT_NAME,
  schematicFilename,
  pcbFilename: `${PROJECT_NAME}.kicad_pcb`,
  schematicSheetPlan: schematicConverter.schematicSheetPlan,
})
projectConverter.runUntilFinished()

const outputs = {
  circuitJson: path.join(buildDirectory, "circuit.json"),
  project: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_pro`),
  schematic: path.join(kicadDirectory, schematicFilename),
  schematics: schematicFiles.map((file) =>
    path.join(kicadDirectory, file.filename),
  ),
  pcb: path.join(kicadDirectory, `${PROJECT_NAME}.kicad_pcb`),
}

await Promise.all([
  writeFile(outputs.circuitJson, JSON.stringify(circuitJson, null, 2), "utf8"),
  writeFile(outputs.project, projectConverter.getOutputString(), "utf8"),
  ...schematicFiles.map((file) =>
    writeFile(path.join(kicadDirectory, file.filename), file.content, "utf8"),
  ),
  writeFile(outputs.pcb, pcbConverter.getOutputString(), "utf8"),
  writeFile(
    path.join(buildDirectory, "manifest.json"),
    JSON.stringify({ projectName: PROJECT_NAME, outputs }, null, 2),
    "utf8",
  ),
])

console.log(`Generated ${PROJECT_NAME} in ${kicadDirectory}`)
