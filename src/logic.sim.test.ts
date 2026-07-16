import { describe, expect, it } from "vitest"

const logic = {
  wsBitPeriodUs: 1.25,
  zeroHighUs: 0.35,
  oneHighUs: 0.7,
  encoderTauUs: 100,
  switchTauUs: 1_000,
  enTauMs: 10,
} as const

const rcLevel = (elapsed: number, tau: number) => 1 - Math.exp(-elapsed / tau)

const decodeQuadrature = (states: readonly string[]) => {
  const transitions = new Map([
    ["00>01", 1],
    ["01>11", 1],
    ["11>10", 1],
    ["10>00", 1],
    ["00>10", -1],
    ["10>11", -1],
    ["11>01", -1],
    ["01>00", -1],
  ])
  return states.slice(1).reduce((sum, state, index) => {
    return sum + (transitions.get(`${states[index]}>${state}`) ?? 0)
  }, 0)
}

describe("equivalent digital/RC model for bring-up-critical logic", () => {
  it("accepts both directions of a debounced quadrature sequence", () => {
    expect(decodeQuadrature(["00", "01", "11", "10", "00"])).toBe(4)
    expect(decodeQuadrature(["00", "10", "11", "01", "00"])).toBe(-4)
    expect(logic.encoderTauUs).toBeLessThan(2_000)
  })

  it("keeps strip DATA low until firmware explicitly enables the buffer", () => {
    const bufferOutput = (
      reset: boolean,
      bufferEnable: boolean,
      data: 0 | 1,
    ) => (reset || !bufferEnable ? "Z" : data)
    const stripData = (reset: boolean, bufferEnable: boolean, data: 0 | 1) => {
      const output = bufferOutput(reset, bufferEnable, data)
      return output === "Z" ? 0 : output
    }

    expect(bufferOutput(true, false, 1)).toBe("Z")
    expect(stripData(true, false, 1)).toBe(0)
    expect(stripData(false, false, 1)).toBe(0)
    expect(stripData(false, true, 0)).toBe(0)
    expect(stripData(false, true, 1)).toBe(1)
  })

  it("has compatible WS2811 timing and worst-case DC-high margins", () => {
    const wsInputHighMax = 0.7 * 5.5
    const ahctHighMinAtLightLoad = 4.4

    expect(logic.zeroHighUs).toBeLessThan(logic.wsBitPeriodUs / 2)
    expect(logic.oneHighUs).toBeGreaterThan(logic.wsBitPeriodUs / 2)
    expect(ahctHighMinAtLightLoad - wsInputHighMax).toBeCloseTo(0.55)
  })

  it("allows EN to cross 75 percent only after the strap hold interval", () => {
    expect(rcLevel(3, logic.enTauMs)).toBeLessThan(0.75)
    expect(rcLevel(14, logic.enTauMs)).toBeGreaterThan(0.75)
    expect(logic.switchTauUs).toBe(10 * logic.encoderTauUs)
  })
})
