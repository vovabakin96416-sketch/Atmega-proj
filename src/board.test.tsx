import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { Circuit } from "tscircuit"
import TemplateBoard from "./board"

type CircuitElement = {
  anchor_position?: { x: number; y: number }
  center?: { x: number; y: number }
  manufacturer_part_number?: unknown
  name?: unknown
  pin_number?: unknown
  schematic_sheet_id?: unknown
  source_component_id?: unknown
  source_port_id?: unknown
  subcircuit_connectivity_map_key?: unknown
  text?: unknown
  type?: unknown
}

type SourcePort = CircuitElement & {
  name: string
  source_component_id: string
  subcircuit_connectivity_map_key: string
  type: "source_port"
}

describe("WS2811 ESP32-C3 controller schematic", () => {
  it("renders the protected power, controller and interface blocks", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const names = new Set(elements.map((element) => element.name))
    const types = new Set(elements.map((element) => element.type))

    expect(names).toContain("F1")
    expect(names).toContain("Q1")
    expect(names).toContain("Q3")
    expect(names).toContain("U1")
    expect(names).toContain("U2")
    expect(names).toContain("U5")
    expect(names).toContain("ENC1")
    expect(names).toContain("J2")
    expect(names).toContain("J3")
    expect(types).toContain("pcb_board")
    expect(types).not.toContain("pcb_trace")
  }, 15_000)

  it("preserves the critical power, USB and LED DATA connections", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const components = new Map(
      elements
        .filter((element) => element.type === "source_component")
        .map((element) => [element.name, element.source_component_id]),
    )
    const ports = elements.filter(
      (element): element is SourcePort => element.type === "source_port",
    )
    const netOf = (component: string, port: string) => {
      const componentId = components.get(component)
      const sourcePort = ports.find(
        (candidate) =>
          candidate.source_component_id === componentId &&
          candidate.name === port,
      )
      expect(sourcePort, `${component}.${port} is missing`).toBeDefined()
      expect(
        sourcePort?.subcircuit_connectivity_map_key,
        `${component}.${port} is unconnected`,
      ).not.toBe("")
      return sourcePort?.subcircuit_connectivity_map_key
    }
    const expectSameNet = (first: [string, string], second: [string, string]) =>
      expect(netOf(...first)).toBe(netOf(...second))

    expectSameNet(["J1", "VIN_12V"], ["F1", "pin1"])
    expectSameNet(["F1", "pin2"], ["Q1", "D1"])
    expectSameNet(["F1", "pin2"], ["Q3", "D1"])
    expectSameNet(["Q1", "S1"], ["J2", "V12"])
    expectSameNet(["Q3", "S1"], ["J2", "V12"])
    expectSameNet(["C3", "pin1"], ["C18", "pin1"])
    expectSameNet(["U2", "IO4"], ["U5", "A"])
    expectSameNet(["U5", "Y"], ["R16", "pin1"])
    expectSameNet(["R16", "pin2"], ["J2", "DATA"])
    expectSameNet(["R21", "pin1"], ["J2", "DATA"])
    expectSameNet(["R21", "pin2"], ["J2", "GND"])
    expectSameNet(["J3", "A6_DP"], ["U4", "DPLUS"])
    expectSameNet(["J3", "A7_DM"], ["U4", "DMINUS"])
    expectSameNet(["R9", "pin2"], ["U2", "IO19_USB_DP"])
    expectSameNet(["R20", "pin1"], ["J3", "A4_VBUS"])
    expectSameNet(["R20", "pin2"], ["J3", "A1_GND"])
  }, 15_000)

  it("keeps functional blocks separated on one converter-safe sheet", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const sourceComponents = new Map(
      elements
        .filter((element) => element.type === "source_component")
        .map((element) => [element.source_component_id, element.name]),
    )
    const centerOf = (componentName: string) => {
      const schematicComponent = elements.find(
        (element) =>
          element.type === "schematic_component" &&
          sourceComponents.get(element.source_component_id) === componentName,
      )
      expect(schematicComponent).toBeDefined()
      expect(schematicComponent?.center).toBeDefined()
      return schematicComponent?.center as { x: number; y: number }
    }

    expect(
      elements.filter((element) => element.type === "schematic_sheet"),
    ).toHaveLength(0)
    expect(centerOf("J1").x).toBeLessThan(centerOf("U1").x)
    expect(centerOf("U1").x).toBeLessThan(centerOf("U3").x)
    expect(centerOf("U2").y).toBeGreaterThan(centerOf("ENC1").y)
    expect(centerOf("J3").x).toBeLessThan(centerOf("J4").x)
    expect(centerOf("ENC1").x).toBeLessThan(centerOf("U5").x)
  }, 15_000)

  it("anchors LOGIC_INPUT to the common D3/D4 cathode island", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const d3 = elements.find(
      (element) => element.type === "source_component" && element.name === "D3",
    )
    const d3Cathode = elements.find(
      (element) =>
        element.type === "source_port" &&
        element.source_component_id === d3?.source_component_id &&
        element.name === "pin2",
    )
    const d3CathodeSchematicPort = elements.find(
      (element) =>
        element.type === "schematic_port" &&
        element.source_port_id === d3Cathode?.source_port_id,
    )
    const labels = elements.filter(
      (element) =>
        element.type === "schematic_net_label" &&
        element.text === "LOGIC_INPUT",
    )

    expect(d3CathodeSchematicPort?.center).toBeDefined()
    expect(labels).toContainEqual(
      expect.objectContaining({
        anchor_position: d3CathodeSchematicPort?.center,
      }),
    )
  }, 15_000)

  it("keeps the TPD2EUSB30 DRT physical pin mapping from the TI datasheet", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const esd = elements.find(
      (element) =>
        element.type === "source_component" &&
        element.manufacturer_part_number === "TPD2EUSB30DRTR",
    )
    expect(esd).toBeDefined()

    const pins = new Map(
      elements
        .filter(
          (element) =>
            element.type === "source_port" &&
            element.source_component_id === esd?.source_component_id,
        )
        .map((element) => [element.name, element.pin_number]),
    )
    expect(pins).toEqual(
      new Map([
        ["DPLUS", 1],
        ["DMINUS", 2],
        ["GND", 3],
      ]),
    )
  }, 15_000)

  it("locks the reviewed TLV760, TPS2113A and ESP32-C3 physical pins", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const pinsFor = (mpn: string) => {
      const component = elements.find(
        (element) =>
          element.type === "source_component" &&
          element.manufacturer_part_number === mpn,
      )
      expect(component, `${mpn} is missing`).toBeDefined()
      return new Map(
        elements
          .filter(
            (element) =>
              element.type === "source_port" &&
              element.source_component_id === component?.source_component_id,
          )
          .map((element) => [element.name, element.pin_number]),
      )
    }

    expect(pinsFor("TLV76050DBZR")).toEqual(
      new Map([
        ["VOUT", 1],
        ["VIN", 2],
        ["GND", 3],
      ]),
    )
    expect(pinsFor("TPS2113APWR")).toEqual(
      new Map([
        ["STAT", 1],
        ["EN", 2],
        ["VSNS", 3],
        ["ILIM", 4],
        ["GND", 5],
        ["IN2", 6],
        ["OUT", 7],
        ["IN1", 8],
      ]),
    )

    const espPins = pinsFor("ESP32-C3-MINI-1-N4X")
    expect(espPins.get("V3P3")).toBe(3)
    expect(espPins.get("EN")).toBe(8)
    expect(espPins.get("IO2")).toBe(5)
    expect(espPins.get("IO8")).toBe(22)
    expect(espPins.get("IO9")).toBe(23)
    expect(espPins.get("IO18_USB_DM")).toBe(26)
    expect(espPins.get("IO19_USB_DP")).toBe(27)
    expect(espPins.get("RXD0_IO20")).toBe(30)
    expect(espPins.get("TXD0_IO21")).toBe(31)
  }, 15_000)

  it("uses the reviewed protection and buffer-supply parts", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const mpns = new Set(
      elements.map((element) => element.manufacturer_part_number),
    )
    const names = new Set(elements.map((element) => element.name))

    const boardSource = readFileSync(
      new URL("./board.tsx", import.meta.url),
      "utf8",
    )
    expect(boardSource).toContain('manufacturerPartNumber="0451012.MRL"')
    expect(boardSource).toContain('name="Q3"')
    expect(mpns).toContain("MMSZ5242B-7-F")
    expect(mpns).toContain("RB058LAM-40TR")
    expect(mpns).not.toContain("SS34-E3/57T")
    expect(mpns).toContain("TPS2113APWR")
    expect(names).not.toContain("D5")
    expect(names).not.toContain("D6")
  }, 15_000)
})
