import { describe, expect, it } from "vitest"
import { Circuit } from "tscircuit"
import TemplateBoard from "./board"

type CircuitElement = {
  manufacturer_part_number?: unknown
  name?: unknown
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
})
