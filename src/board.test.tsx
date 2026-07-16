import { describe, expect, it } from "vitest"
import { Circuit } from "tscircuit"
import TemplateBoard from "./board"

type CircuitElement = {
  center?: { x: number; y: number }
  manufacturer_part_number?: unknown
  name?: unknown
  pin_number?: unknown
  schematic_sheet_id?: unknown
  source_component_id?: unknown
  subcircuit_connectivity_map_key?: unknown
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
    expectSameNet(["Q1", "S1"], ["J2", "V12"])
    expectSameNet(["U2", "IO4"], ["U5", "A"])
    expectSameNet(["U5", "Y"], ["R16", "pin1"])
    expectSameNet(["R16", "pin2"], ["J2", "DATA"])
    expectSameNet(["J3", "A6_DP"], ["U4", "DPLUS"])
    expectSameNet(["J3", "A7_DM"], ["U4", "DMINUS"])
    expectSameNet(["R9", "pin2"], ["U2", "IO19_USB_DP"])
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
})
