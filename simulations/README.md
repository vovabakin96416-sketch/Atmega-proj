# Pre-order simulation models

## Power path

Run:

```powershell
C:\Users\bakin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\run-ngspice.py
```

`power_path.cir` is an ngspice transient model covering 12 V startup, reverse
polarity, USB takeover, low-leakage Schottky OR-ing, USB VBUS discharge, the averaged 3.3 V rail, the 5 V LDO,
the TPS2113A mux, the 7.5 A worst-case strip load, two parallel hot MOSFETs and
an illustrative overvoltage pulse. The committed result log is produced by
KiCad 10's bundled ngspice library.

The AP63203 and TPS2113A are behavioral/averaged models because manufacturer
encrypted or validated public macromodels were not used. The RB058LAM-40 and SMBJ15A
models are conservative first-order substitutes. Consequently this run cannot
validate loop stability, EMI, inductor saturation, TVS surge energy, hot-plug
ringing, USB compliance, temperature rise, MOSFET current sharing or layout
parasitics.

## Logic equivalent

`src/logic.sim.test.ts` is the Wokwi-equivalent deterministic model for encoder
quadrature, RC time constants, reset-time DATA tri-state behavior and WS2811
timing/level margins. It runs with the normal Vitest suite. It is deliberately
not described as an ESP32-C3 or WS2811 silicon simulation and cannot validate
firmware drivers, contact bounce statistics, USB ROM behavior or real waveform
integrity.
