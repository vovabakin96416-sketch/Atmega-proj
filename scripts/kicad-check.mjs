import { existsSync } from "node:fs"
import { mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import { spawnSync } from "node:child_process"

const command = process.argv[2]
const allowedCommands = new Set(["erc", "erc-all", "drc", "drc-all", "render"])

if (!allowedCommands.has(command)) {
  console.error(
    "Usage: node scripts/kicad-check.mjs <erc|erc-all|drc|drc-all|render>",
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
await mkdir(reportsDirectory, { recursive: true })
await mkdir(rendersDirectory, { recursive: true })

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

process.exit(result.status ?? 2)
