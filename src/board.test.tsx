import { describe, expect, it } from "vitest"
import { Circuit } from "tscircuit"
import TemplateBoard from "./board"

type CircuitElement = {
  name?: unknown
  type?: unknown
}

describe("template board", () => {
  it("renders the expected components and PCB data", async () => {
    const circuit = new Circuit()
    circuit.add(<TemplateBoard />)
    await circuit.renderUntilSettled()

    const elements = circuit.getCircuitJson() as CircuitElement[]
    const names = new Set(elements.map((element) => element.name))
    const types = new Set(elements.map((element) => element.type))

    expect(names).toContain("R1")
    expect(names).toContain("D1")
    expect(types).toContain("pcb_board")
    expect(types).toContain("pcb_trace")
  })
})
