import { existsSync } from "node:fs"
import { mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import { spawnSync } from "node:child_process"

const command = process.argv[2]
const allowedCommands = new Set([
  "erc",
  "erc-all",
  "drc",
  "drc-all",
  "schematic-pdf",
  "render",
])

if (!allowedCommands.has(command)) {
  console.error(
    "Usage: node scripts/kicad-check.mjs <erc|erc-all|drc|drc-all|schematic-pdf|render>",
  )
  process.exit(2)
}

const manifestPath = path.resolve("build", "manifest.json")
if (!existsSync(manifestPath)) {
  console.error("Generated files are missing. Run npm run generate first.")
  process.exit(2)
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
const reportsDirectory = path.resolve("build", "reports")
const rendersDirectory = path.resolve("build", "renders")
const pdfDirectory = path.resolve("output", "pdf")
await mkdir(reportsDirectory, { recursive: true })
await mkdir(rendersDirectory, { recursive: true })
await mkdir(pdfDirectory, { recursive: true })

const configuredCli = process.env.KICAD_CLI
const installedCli = String.raw`D:\KiCad\bin\kicad-cli.exe`
const kicadCli =
  configuredCli ?? (existsSync(installedCli) ? installedCli : "kicad-cli")

const actions = {
  erc: [
    "sch",
    "erc",
    "--format",
    "json",
    "--severity-error",
    "--exit-code-violations",
    "--output",
    path.join(reportsDirectory, "erc.json"),
    manifest.outputs.schematic,
  ],
  "erc-all": [
    "sch",
    "erc",
    "--format",
    "json",
    "--severity-all",
    "--output",
    path.join(reportsDirectory, "erc-all.json"),
    manifest.outputs.schematic,
  ],
  drc: [
    "pcb",
    "drc",
    "--format",
    "json",
    "--severity-error",
    "--exit-code-violations",
    "--output",
    path.join(reportsDirectory, "drc.json"),
    manifest.outputs.pcb,
  ],
  "drc-all": [
    "pcb",
    "drc",
    "--format",
    "json",
    "--severity-all",
    "--output",
    path.join(reportsDirectory, "drc-all.json"),
    manifest.outputs.pcb,
  ],
  "schematic-pdf": [
    "sch",
    "export",
    "pdf",
    "--output",
    path.join(pdfDirectory, `${manifest.projectName}-schematic.pdf`),
    manifest.outputs.schematic,
  ],
  render: [
    "pcb",
    "render",
    "--quality",
    "high",
    "--perspective",
    "--rotate",
    "-35,0,45",
    "--output",
    path.join(rendersDirectory, `${manifest.projectName}.png`),
    manifest.outputs.pcb,
  ],
}

const result = spawnSync(kicadCli, actions[command], {
  encoding: "utf8",
  stdio: "inherit",
})

if (result.error) {
  console.error(result.error.message)
  process.exit(2)
}

if (command === "erc" && result.status === 0) {
  const netlistPath = path.join(reportsDirectory, "connectivity.net")
  const netlistResult = spawnSync(
    kicadCli,
    [
      "sch",
      "export",
      "netlist",
      "--output",
      netlistPath,
      manifest.outputs.schematic,
    ],
    {
      encoding: "utf8",
      stdio: "inherit",
    },
  )
  if (netlistResult.error || netlistResult.status !== 0) {
    console.error(
      netlistResult.error?.message ??
        "KiCad connectivity netlist export failed",
    )
    process.exit(2)
  }

  const circuitJson = JSON.parse(
    await readFile(path.resolve("build", "circuit.json"), "utf8"),
  )
  const componentNames = new Map(
    circuitJson
      .filter((element) => element.type === "source_component")
      .map((component) => [component.source_component_id, component.name]),
  )
  const netNamesByKey = new Map(
    circuitJson
      .filter((element) => element.type === "source_net")
      .map((net) => [net.subcircuit_connectivity_map_key, net.name]),
  )
  const expectedNets = new Map(
    [...netNamesByKey.values()].map((name) => [name, new Set()]),
  )
  for (const port of circuitJson.filter(
    (element) => element.type === "source_port",
  )) {
    const netName = netNamesByKey.get(port.subcircuit_connectivity_map_key)
    const componentName = componentNames.get(port.source_component_id)
    if (netName && componentName) {
      expectedNets.get(netName).add(`${componentName}.${port.pin_number}`)
    }
  }

  const netlist = await readFile(netlistPath, "utf8")
  const actualNets = new Map()
  const netBlocks = netlist.matchAll(
    /^\t\t\(net\r?\n([\s\S]*?)(?=^\t\t\(net\r?$|^\t\)\r?$)/gm,
  )
  for (const match of netBlocks) {
    const block = match[1]
    const name = block.match(/\(name "([^"]+)"\)/)?.[1]
    if (!name) continue
    const nodes = new Set()
    for (const match of block.matchAll(
      /\(node\s+\(ref "([^"]+)"\)\s+\(pin "([^"]+)"\)/g,
    )) {
      nodes.add(`${match[1]}.${match[2]}`)
    }
    actualNets.set(name, nodes)
  }

  const connectivityIssues = []
  for (const [name, expectedNodes] of expectedNets) {
    const actualNodes = actualNets.get(name)
    if (!actualNodes) {
      connectivityIssues.push(
        `${name}: named net missing; expected ${[...expectedNodes].sort().join(", ")}`,
      )
      continue
    }
    const missing = [...expectedNodes]
      .filter((node) => !actualNodes.has(node))
      .sort()
    const unexpected = [...actualNodes]
      .filter((node) => !expectedNodes.has(node))
      .sort()
    if (missing.length > 0 || unexpected.length > 0) {
      connectivityIssues.push(
        `${name}: missing [${missing.join(", ")}], unexpected [${unexpected.join(", ")}]`,
      )
    }
  }
  if (connectivityIssues.length > 0) {
    console.error("KiCad named-net connectivity differs from Circuit JSON:")
    for (const issue of connectivityIssues) console.error(`- ${issue}`)
    process.exit(1)
  }
  console.log(
    `${expectedNets.size} named nets exactly match Circuit JSON in KiCad netlist`,
  )
}

process.exit(result.status ?? 2)
