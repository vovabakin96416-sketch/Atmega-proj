import { sel as tscSel } from "tscircuit"

const pinSel = tscSel as unknown as Record<string, Record<string, string>>
const pinSelector = (component: string, pin: number) => {
  const selector = pinSel[component]?.[`pin${pin}`]
  if (!selector) throw new Error(`Selector ${component}.pin${pin} is missing`)
  return selector
}

type CustomNet =
  | "VIN_12V_RAW"
  | "VIN_12V_FUSED"
  | "V12_PROTECTED"
  | "Q1_GATE"
  | "LOGIC_INPUT"
  | "USB_VBUS"
  | "V3P3"
  | "BUCK_SW"
  | "BUCK_BST"
  | "V5_LDO"
  | "V5_BUFFER"
  | "POWER_MUX_ILIM"
  | "POWER_MUX_STAT"
  | "V3P3_ESP"
  | "ENC_A"
  | "ENC_B"
  | "ENC_SW"
  | "STRAP_IO2"
  | "STRAP_IO8"
  | "BOOT_IO9"
  | "ESP_EN"
  | "LED_DATA_3V3"
  | "LED_DATA_5V_RAW"
  | "LED_DATA_OUT"
  | "BUFFER_OE_N"
  | "BUFFER_ENABLE"
  | "USB_CC1"
  | "USB_CC2"
  | "USB_DM_CONN"
  | "USB_DP_CONN"
  | "USB_DM_ESP"
  | "USB_DP_ESP"
  | "UART_RX"
  | "UART_TX"
  | "STATUS_LED"
  | "STATUS_LED_DRIVE"

const sel = { ...tscSel, net: tscSel.net<CustomNet>() }

export const PROJECT_NAME = "ws2811_esp32c3_controller"

const at = (schX: number, schY: number, schRotation?: number) => ({
  schX,
  schY,
  ...(schRotation === undefined ? {} : { schRotation }),
})

const esp32C3Mini1PinLabels = {
  pin1: "GND1",
  pin2: "GND2",
  pin3: "V3P3",
  pin4: "NC4",
  pin5: "IO2",
  pin6: "IO3",
  pin7: "NC7",
  pin8: "EN",
  pin9: "NC9",
  pin10: "NC10",
  pin11: "GND11",
  pin12: "IO0",
  pin13: "IO1",
  pin14: "GND14",
  pin15: "NC15",
  pin16: "IO10",
  pin17: "NC17",
  pin18: "IO4",
  pin19: "IO5",
  pin20: "IO6",
  pin21: "IO7",
  pin22: "IO8",
  pin23: "IO9",
  pin24: "NC24",
  pin25: "NC25",
  pin26: "IO18_USB_DM",
  pin27: "IO19_USB_DP",
  pin28: "NC28",
  pin29: "NC29",
  pin30: "RXD0_IO20",
  pin31: "TXD0_IO21",
  pin32: "NC32",
  pin33: "NC33",
  pin34: "NC34",
  pin35: "NC35",
  pin36: "GND36",
  pin37: "GND37",
  pin38: "GND38",
  pin39: "GND39",
  pin40: "GND40",
  pin41: "GND41",
  pin42: "GND42",
  pin43: "GND43",
  pin44: "GND44",
  pin45: "GND45",
  pin46: "GND46",
  pin47: "GND47",
  pin48: "GND48",
  pin49: "EPAD49",
  pin50: "GND50",
  pin51: "GND51",
  pin52: "GND52",
  pin53: "GND53",
} as const

const espGroundConnections = {
  GND1: sel.net.GND,
  GND2: sel.net.GND,
  GND11: sel.net.GND,
  GND14: sel.net.GND,
  GND36: sel.net.GND,
  GND37: sel.net.GND,
  GND38: sel.net.GND,
  GND39: sel.net.GND,
  GND40: sel.net.GND,
  GND41: sel.net.GND,
  GND42: sel.net.GND,
  GND43: sel.net.GND,
  GND44: sel.net.GND,
  GND45: sel.net.GND,
  GND46: sel.net.GND,
  GND47: sel.net.GND,
  GND48: sel.net.GND,
  EPAD49: sel.net.GND,
  GND50: sel.net.GND,
  GND51: sel.net.GND,
  GND52: sel.net.GND,
  GND53: sel.net.GND,
} as const

const espNoConnectPins = [
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
] as const

export default function Ws2811Controller() {
  return (
    <board width="80mm" height="55mm" routingDisabled>
      <group name="PowerInputBlock" schX={-27} schY={10}>
        <schematictext
          {...at(-8, 4.5)}
          text="12 V INPUT AND PROTECTION"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-8, 3.5)}
          text="F1 0451012.MRL 12 A; Q1/Q3 DMP4015SSS-13; D1 MMSZ5242B; D2 SMBJ15A."
          fontSize={0.65}
          anchor="left"
        />
        {/* 12 V input, over-current, reverse-polarity and transient protection. */}
        <chip
          {...at(-8, 1.5)}
          name="J1"
          manufacturerPartNumber="1715721"
          datasheetUrl="https://www.phoenixcontact.com/en-pc/products/pcb-terminal-block-mkds-15-2-508-1715721"
          footprint="kicad:TerminalBlock_Phoenix/TerminalBlock_Phoenix_MKDS-1,5-2-5.08_1x02_P5.08mm_Horizontal"
          pinLabels={{ pin1: "VIN_12V", pin2: "GND" }}
          connections={{ VIN_12V: sel.net.VIN_12V_RAW, GND: sel.net.GND }}
        />
        <fuse
          {...at(-5.5, 1.5)}
          name="F1"
          displayName="0451012.MRL 12A"
          manufacturerPartNumber="0451012.MRL"
          datasheetUrl="https://www.littelfuse.com/products/fuses-overcurrent-protection/fuses/surface-mount-fuses/nano-2-fuses/451/0451012"
          currentRating="12A"
          footprint="kicad:Fuse/Fuse_Littelfuse-NANO2-451_453"
          connections={{
            pin1: sel.net.VIN_12V_RAW,
            pin2: sel.net.VIN_12V_FUSED,
          }}
        />
        <chip
          {...at(-2, 1.5)}
          name="Q1"
          manufacturerPartNumber="DMP4015SSS-13"
          datasheetUrl="https://www.diodes.com/datasheet/download/DMP4015SSS.pdf"
          footprint="soic8"
          schPinArrangement={{
            leftSide: ["D1", "D2", "D3", "D4"],
            rightSide: ["S1", "S2", "S3"],
            bottomSide: ["G"],
          }}
          pinLabels={{
            pin1: "S1",
            pin2: "S2",
            pin3: "S3",
            pin4: "G",
            pin5: "D1",
            pin6: "D2",
            pin7: "D3",
            pin8: "D4",
          }}
          connections={{
            S1: sel.net.V12_PROTECTED,
            S2: sel.net.V12_PROTECTED,
            S3: sel.net.V12_PROTECTED,
            G: sel.net.Q1_GATE,
            D1: sel.net.VIN_12V_FUSED,
            D2: sel.net.VIN_12V_FUSED,
            D3: sel.net.VIN_12V_FUSED,
            D4: sel.net.VIN_12V_FUSED,
          }}
        />
        <chip
          {...at(1.5, 1.5)}
          name="Q3"
          manufacturerPartNumber="DMP4015SSS-13"
          datasheetUrl="https://www.diodes.com/datasheet/download/DMP4015SSS.pdf"
          footprint="soic8"
          schPinArrangement={{
            leftSide: ["D1", "D2", "D3", "D4"],
            rightSide: ["S1", "S2", "S3"],
            bottomSide: ["G"],
          }}
          pinLabels={{
            pin1: "S1",
            pin2: "S2",
            pin3: "S3",
            pin4: "G",
            pin5: "D1",
            pin6: "D2",
            pin7: "D3",
            pin8: "D4",
          }}
          connections={{
            S1: sel.net.V12_PROTECTED,
            S2: sel.net.V12_PROTECTED,
            S3: sel.net.V12_PROTECTED,
            G: sel.net.Q1_GATE,
            D1: sel.net.VIN_12V_FUSED,
            D2: sel.net.VIN_12V_FUSED,
            D3: sel.net.VIN_12V_FUSED,
            D4: sel.net.VIN_12V_FUSED,
          }}
        />
        <resistor
          {...at(-2, -1, 90)}
          name="R1"
          resistance="100k"
          manufacturerPartNumber="RC0603FR-07100KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.Q1_GATE, pin2: sel.net.GND }}
        />
        <diode
          {...at(0, -1, 90)}
          name="D1"
          displayName="MMSZ5242B 12V"
          manufacturerPartNumber="MMSZ5242B-7-F"
          datasheetUrl="https://www.diodes.com/assets/Datasheets/ds18010.pdf"
          variant="zener"
          footprint="sod123"
          connections={{
            anode: sel.net.Q1_GATE,
            cathode: sel.net.V12_PROTECTED,
          }}
        />
        <diode
          {...at(2.5, -1, 90)}
          name="D2"
          displayName="SMBJ15A"
          manufacturerPartNumber="SMBJ15A"
          datasheetUrl="https://www.littelfuse.com/assetdocs/littelfuse-tvs-diode-smbj-datasheet?assetguid=3a4f178d-d52c-42e0-8b55-654288f779f2"
          variant="tvs"
          footprint="smb"
          connections={{ anode: sel.net.GND, cathode: sel.net.V12_PROTECTED }}
        />
        {/* Each parallel MOSFET is a separate local schematic island. Explicit
            labels preserve the intended common drain, source and gate nets in
            the exported KiCad netlist. */}
        <netlabel
          net="VIN_12V_FUSED"
          connectsTo={pinSelector("Q1", 5)}
          anchorSide="top"
        />
        <netlabel
          net="VIN_12V_FUSED"
          connectsTo={pinSelector("Q3", 5)}
          anchorSide="top"
        />
        <netlabel
          net="V12_PROTECTED"
          connectsTo={pinSelector("Q1", 1)}
          anchorSide="top"
        />
        <netlabel
          net="Q1_GATE"
          connectsTo={pinSelector("Q1", 4)}
          anchorSide="left"
        />
        <capacitor
          {...at(4.5, -1, 90)}
          name="C1"
          capacitance="470uF"
          manufacturerPartNumber="EEU-FR1V471B"
          datasheetUrl="https://industrial.panasonic.com/cdbs/www-data/pdf/RDF0000/ABA0000C1214.pdf"
          maxVoltageRating="35V"
          schShowRatings
          footprint="radial_cap_p5mm_d10mm"
          connections={{ pin1: sel.net.V12_PROTECTED, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(7, -1, 90)}
          name="C2"
          capacitance="100nF"
          manufacturerPartNumber="GRM188R71H104KA93D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H104KA93D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.V12_PROTECTED, pin2: sel.net.GND }}
        />

        {/* Passive OR-ing allows programming from USB when the 12 V supply is off. */}
        <diode
          {...at(-1.5, -3)}
          name="D3"
          displayName="RB058LAM-40"
          manufacturerPartNumber="RB058LAM-40TR"
          datasheetUrl="https://www.rohm.com/products/diodes/schottky-barrier-diodes/ultra-low-ir/rb058lam-40-product"
          variant="schottky"
          footprint="sod128"
          connections={{
            anode: sel.net.V12_PROTECTED,
            cathode: sel.net.LOGIC_INPUT,
          }}
        />
        <diode
          {...at(2, -3)}
          name="D4"
          displayName="RB058LAM-40"
          manufacturerPartNumber="RB058LAM-40TR"
          datasheetUrl="https://www.rohm.com/products/diodes/schottky-barrier-diodes/ultra-low-ir/rb058lam-40-product"
          variant="schottky"
          footprint="sod128"
          connections={{
            anode: sel.net.USB_VBUS,
            cathode: sel.net.LOGIC_INPUT,
          }}
        />
        {/* tscircuit can keep this named net electrically correct in Circuit JSON
            while omitting the inter-group label in KiCad. Anchor an explicit
            label to the common D3/D4 cathode so the exported schematic/netlist
            remains connected to U1 VIN/EN and C3/C18. */}
        <netlabel
          net="LOGIC_INPUT"
          connectsTo={tscSel.D3.pin2}
          anchorSide="top"
        />
      </group>

      <group name="Power3V3Block" schX={-17} schY={10}>
        <schematictext
          {...at(-8, 4.5)}
          text="3.3 V BUCK - AP63203WU-7"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-8, 3.5)}
          text="Input: protected 12 V or USB VBUS through D3/D4 RB058LAM-40TR."
          fontSize={0.65}
          anchor="left"
        />
        {/* AP63203WU-7 fixed 3.3 V synchronous buck, datasheet application circuit. */}
        <chip
          {...at(0, 0.5)}
          name="U1"
          manufacturerPartNumber="AP63203WU-7"
          datasheetUrl="https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf"
          footprint="kicad:Package_TO_SOT_SMD/TSOT-23-6"
          schPinArrangement={{
            leftSide: ["VIN", "EN", "FB"],
            rightSide: ["SW"],
            topSide: ["BST"],
            bottomSide: ["GND"],
          }}
          schPinSpacing={0.8}
          pinLabels={{
            pin1: "FB",
            pin2: "EN",
            pin3: "VIN",
            pin4: "GND",
            pin5: "SW",
            pin6: "BST",
          }}
          connections={{
            FB: sel.net.V3P3,
            EN: sel.net.LOGIC_INPUT,
            VIN: sel.net.LOGIC_INPUT,
            GND: sel.net.GND,
            SW: sel.net.BUCK_SW,
            BST: sel.net.BUCK_BST,
          }}
        />
        <capacitor
          {...at(-1, -1.5, 90)}
          name="C3"
          capacitance="10uF"
          manufacturerPartNumber="GRM32ER71H106KA12L"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM32ER71H106KA12L"
          maxVoltageRating="50V"
          footprint="1210"
          connections={{ pin1: sel.net.LOGIC_INPUT, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(-3, -1.5, 90)}
          name="C18"
          capacitance="10uF"
          manufacturerPartNumber="GRM32ER71H106KA12L"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM32ER71H106KA12L"
          maxVoltageRating="50V"
          footprint="1210"
          connections={{ pin1: sel.net.LOGIC_INPUT, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(2.5, 2.5, 90)}
          name="C4"
          capacitance="100nF"
          manufacturerPartNumber="GRM188R71H104KA93D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H104KA93D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.BUCK_BST, pin2: sel.net.BUCK_SW }}
        />
        <netlabel net="BUCK_BST" connectsTo={tscSel.C4.pin1} anchorSide="top" />
        <chip
          {...at(4.5, 0.5)}
          name="L1"
          displayName="3.9uH"
          manufacturerPartNumber="784787039"
          datasheetUrl="https://www.we-online.com/en/components/products/WE-PD2SA"
          footprint="kicad:Inductor_SMD/L_Wuerth_WE-PD2-Typ-L"
          schPinArrangement={{ leftSide: ["SW"], rightSide: ["VOUT"] }}
          pinLabels={{ pin1: "SW", pin2: "VOUT" }}
          connections={{ SW: sel.net.BUCK_SW, VOUT: sel.net.V3P3 }}
        />
        <capacitor
          {...at(6.5, -1.5, 90)}
          name="C5"
          capacitance="22uF"
          manufacturerPartNumber="GRM31CR71A226KE15L"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM31CR71A226KE15L"
          maxVoltageRating="10V"
          footprint="1206"
          connections={{ pin1: sel.net.V3P3, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(8.5, -1.5, 90)}
          name="C6"
          capacitance="22uF"
          manufacturerPartNumber="GRM31CR71A226KE15L"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM31CR71A226KE15L"
          maxVoltageRating="10V"
          footprint="1206"
          connections={{ pin1: sel.net.V3P3, pin2: sel.net.GND }}
        />
        <netlabel net="V3P3" connectsTo={tscSel.C5.pin1} anchorSide="top" />
        <netlabel net="GND" connectsTo={tscSel.C5.pin2} anchorSide="bottom" />
      </group>

      <group name="Power5VBlock" schX={-3.5} schY={10}>
        <schematictext
          {...at(-3.5, 4.5)}
          text="5 V DATA-BUFFER SUPPLY"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-3.5, 3.5)}
          text="TLV76050 plus TPS2113A reverse-blocking automatic power mux."
          fontSize={0.65}
          anchor="left"
        />
        {/* A tiny 5 V rail is used only by the WS2811 data-level buffer. */}
        <chip
          {...at(-0.5, 0.5)}
          name="U3"
          manufacturerPartNumber="TLV76050DBZR"
          datasheetUrl="https://www.ti.com/lit/ds/symlink/tlv760.pdf"
          footprint="sot23"
          schPinArrangement={{
            leftSide: ["VIN"],
            rightSide: ["VOUT"],
            bottomSide: ["GND"],
          }}
          pinLabels={{ pin1: "VOUT", pin2: "VIN", pin3: "GND" }}
          connections={{
            GND: sel.net.GND,
            VIN: sel.net.V12_PROTECTED,
            VOUT: sel.net.V5_LDO,
          }}
        />
        <capacitor
          {...at(-3.5, -1.5, 90)}
          name="C7"
          capacitance="1uF"
          manufacturerPartNumber="GRM21BR71H105KA12L"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM21BR71H105KA12L"
          maxVoltageRating="50V"
          footprint="0805"
          connections={{ pin1: sel.net.V12_PROTECTED, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(1.5, -1.5, 90)}
          name="C8"
          capacitance="1uF"
          manufacturerPartNumber="GRM188R71A105KA61D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71A105KA61D"
          maxVoltageRating="10V"
          footprint="0603"
          connections={{ pin1: sel.net.V5_LDO, pin2: sel.net.GND }}
        />
        <netlabel net="V5_LDO" connectsTo={tscSel.U3.pin1} anchorSide="top" />
        <netlabel net="GND" connectsTo={tscSel.C7.pin2} anchorSide="bottom" />
        <chip
          {...at(4, 0)}
          name="U6"
          manufacturerPartNumber="TPS2113APWR"
          datasheetUrl="https://www.ti.com/lit/ds/symlink/tps2113a.pdf"
          footprint="kicad:Package_SO/TSSOP-8_4.4x3mm_P0.65mm"
          schPinArrangement={{
            leftSide: ["IN1", "IN2"],
            rightSide: ["OUT", "STAT"],
            bottomSide: ["EN", "VSNS", "ILIM", "GND"],
          }}
          pinLabels={{
            pin1: "STAT",
            pin2: "EN",
            pin3: "VSNS",
            pin4: "ILIM",
            pin5: "GND",
            pin6: "IN2",
            pin7: "OUT",
            pin8: "IN1",
          }}
          connections={{
            STAT: sel.net.POWER_MUX_STAT,
            EN: sel.net.GND,
            VSNS: sel.net.GND,
            ILIM: sel.net.POWER_MUX_ILIM,
            GND: sel.net.GND,
            IN2: sel.net.USB_VBUS,
            OUT: sel.net.V5_BUFFER,
            IN1: sel.net.V5_LDO,
          }}
        />
        <resistor
          {...at(6.5, -2, 90)}
          name="R18"
          resistance="402"
          manufacturerPartNumber="RC0603FR-07402RL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.POWER_MUX_ILIM, pin2: sel.net.GND }}
        />
        <resistor
          {...at(7.5, 1.5, 90)}
          name="R19"
          resistance="100k"
          manufacturerPartNumber="RC0603FR-07100KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{
            pin1: sel.net.V5_BUFFER,
            pin2: sel.net.POWER_MUX_STAT,
          }}
        />
        <capacitor
          {...at(2, -2.5, 90)}
          name="C16"
          capacitance="1uF"
          manufacturerPartNumber="GRM188R71A105KA61D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71A105KA61D"
          maxVoltageRating="10V"
          footprint="0603"
          connections={{ pin1: sel.net.USB_VBUS, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(7.5, -2, 90)}
          name="C17"
          capacitance="1uF"
          manufacturerPartNumber="GRM188R71A105KA61D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71A105KA61D"
          maxVoltageRating="10V"
          footprint="0603"
          connections={{ pin1: sel.net.V5_BUFFER, pin2: sel.net.GND }}
        />
      </group>

      <group name="ControllerBlock" schX={-27} schY={1}>
        <schematictext
          {...at(-8, 4.5)}
          text="ESP32-C3, POWER, RESET, BOOT AND STRAPPING"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-8, 3.5)}
          text="GPIO2, GPIO8 and GPIO9 are sampled at reset; GPIO9 has no large capacitor."
          fontSize={0.65}
          anchor="left"
        />
        {/* ESP32-C3-MINI-1-N4X. Exact 53-pin mapping follows Espressif v2.2. */}
        <chip
          {...at(4, 0)}
          name="U2"
          manufacturerPartNumber="ESP32-C3-MINI-1-N4X"
          datasheetUrl="https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf"
          pinLabels={esp32C3Mini1PinLabels}
          noConnect={espNoConnectPins}
          schPinArrangement={{
            leftSide: ["EN", "IO0", "IO1", "IO2", "IO3", "IO8", "IO9"],
            rightSide: [
              "IO4",
              "IO5",
              "IO10",
              "IO18_USB_DM",
              "IO19_USB_DP",
              "RXD0_IO20",
              "TXD0_IO21",
            ],
            topSide: ["V3P3", ...espNoConnectPins],
            bottomSide: Object.keys(espGroundConnections),
          }}
          schPinSpacing={0.45}
          connections={{
            ...espGroundConnections,
            V3P3: sel.net.V3P3_ESP,
            IO0: sel.net.ENC_A,
            IO1: sel.net.ENC_B,
            IO2: sel.net.STRAP_IO2,
            IO3: sel.net.ENC_SW,
            IO4: sel.net.LED_DATA_3V3,
            IO5: sel.net.BUFFER_ENABLE,
            IO8: sel.net.STRAP_IO8,
            IO9: sel.net.BOOT_IO9,
            IO10: sel.net.STATUS_LED,
            EN: sel.net.ESP_EN,
            IO18_USB_DM: sel.net.USB_DM_ESP,
            IO19_USB_DP: sel.net.USB_DP_ESP,
            RXD0_IO20: sel.net.UART_RX,
            TXD0_IO21: sel.net.UART_TX,
          }}
        />
        <chip
          {...at(-7, 2.75)}
          name="FB1"
          manufacturerPartNumber="BLM21PG221SN1D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=BLM21PG221SN1D"
          footprint="0805"
          pinLabels={{ pin1: "IN", pin2: "OUT" }}
          connections={{ IN: sel.net.V3P3, OUT: sel.net.V3P3_ESP }}
        />
        <capacitor
          {...at(-3.75, 2.75, 90)}
          name="C9"
          capacitance="10uF"
          manufacturerPartNumber="GRM21BR71A106KE51L"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM21BR71A106KE51L"
          maxVoltageRating="10V"
          footprint="0805"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(-1.25, 2.75, 90)}
          name="C10"
          capacitance="100nF"
          manufacturerPartNumber="GRM188R71H104KA93D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H104KA93D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.GND }}
        />

        {/* Reset and boot straps. */}
        <resistor
          {...at(-7, 1.25, 90)}
          name="R2"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ESP_EN }}
        />
        <capacitor
          {...at(-5, -0.25, 90)}
          name="C11"
          capacitance="1uF"
          manufacturerPartNumber="GRM188R71A105KA61D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71A105KA61D"
          maxVoltageRating="10V"
          footprint="0603"
          connections={{ pin1: sel.net.ESP_EN, pin2: sel.net.GND }}
        />
        <chip
          {...at(-7, -2)}
          name="SW1"
          manufacturerPartNumber="B3F-1000"
          datasheetUrl="https://components.omron.com/us-en/datasheet_pdf/A070-E1.pdf"
          footprint="kicad:Button_Switch_THT/SW_TH_Tactile_Omron_B3F-100x"
          pinLabels={{ pin1: "A", pin2: "B" }}
          connections={{ A: sel.net.ESP_EN, B: sel.net.GND }}
        />
        <resistor
          {...at(-7.5, -4.25, 90)}
          name="R3"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.STRAP_IO2 }}
        />
        <resistor
          {...at(-4, -4.25, 90)}
          name="R4"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.STRAP_IO8 }}
        />
        <netlabel net="V3P3_ESP" connectsTo={tscSel.R3.pin1} anchorSide="top" />
        <netlabel net="GND" connectsTo={tscSel.C9.pin2} anchorSide="bottom" />
        <resistor
          {...at(0, -4.25, 90)}
          name="R5"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.BOOT_IO9 }}
        />
      </group>

      {/* Internal controller subgroup keeps the BOOT switch locally readable
          while the named net replaces a page-spanning wire. */}
      <group name="ControllerBootSwitchBlock" schX={-27} schY={1}>
        <chip
          {...at(-8.5, -5.25)}
          name="SW2"
          manufacturerPartNumber="B3F-1000"
          datasheetUrl="https://components.omron.com/us-en/datasheet_pdf/A070-E1.pdf"
          footprint="kicad:Button_Switch_THT/SW_TH_Tactile_Omron_B3F-100x"
          pinLabels={{ pin1: "A", pin2: "B" }}
          connections={{ A: sel.net.BOOT_IO9, B: sel.net.GND }}
        />
      </group>

      <group name="UsbBlock" schX={-12.5} schY={1}>
        <schematictext
          {...at(-8, 4.5)}
          text="USB-C, ESD AND NATIVE USB"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-8, 3.5)}
          text="USB4105-GF-A-060; two independent 5.1 kOhm CC pull-downs."
          fontSize={0.65}
          anchor="left"
        />
        {/* Native USB-C programming and diagnostics. */}
        <chip
          {...at(-5, 0)}
          name="J3"
          manufacturerPartNumber="USB4105-GF-A-060"
          datasheetUrl="https://gct.co/files/drawings/usb4105.pdf"
          noConnect={["A8_SBU1", "B8_SBU2"]}
          footprint="kicad:Connector_USB/USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal"
          schPinArrangement={{
            rightSide: [
              "A5_CC1",
              "A6_DP",
              "A7_DM",
              "A8_SBU1",
              "B5_CC2",
              "B6_DP",
              "B7_DM",
              "B8_SBU2",
            ],
            topSide: ["A4_VBUS", "A9_VBUS", "B9_VBUS", "B4_VBUS"],
            bottomSide: ["A1_GND", "A12_GND", "B12_GND", "B1_GND", "SHIELD"],
          }}
          pinLabels={{
            pin1: "A1_GND",
            pin2: "A4_VBUS",
            pin3: "A5_CC1",
            pin4: "A6_DP",
            pin5: "A7_DM",
            pin6: "A8_SBU1",
            pin7: "A9_VBUS",
            pin8: "A12_GND",
            pin9: "B12_GND",
            pin10: "B9_VBUS",
            pin11: "B8_SBU2",
            pin12: "B7_DM",
            pin13: "B6_DP",
            pin14: "B5_CC2",
            pin15: "B4_VBUS",
            pin16: "B1_GND",
            pin17: "SHIELD",
          }}
          connections={{
            A1_GND: sel.net.GND,
            A4_VBUS: sel.net.USB_VBUS,
            A5_CC1: sel.net.USB_CC1,
            A6_DP: sel.net.USB_DP_CONN,
            A7_DM: sel.net.USB_DM_CONN,
            A9_VBUS: sel.net.USB_VBUS,
            A12_GND: sel.net.GND,
            B12_GND: sel.net.GND,
            B9_VBUS: sel.net.USB_VBUS,
            B7_DM: sel.net.USB_DM_CONN,
            B6_DP: sel.net.USB_DP_CONN,
            B5_CC2: sel.net.USB_CC2,
            B4_VBUS: sel.net.USB_VBUS,
            B1_GND: sel.net.GND,
            SHIELD: sel.net.GND,
          }}
        />
        <resistor
          {...at(-2, -2, 90)}
          name="R6"
          resistance="5.1k"
          manufacturerPartNumber="RC0603FR-075K1L"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.USB_CC1, pin2: sel.net.GND }}
        />
        <resistor
          {...at(0, -2, 90)}
          name="R7"
          resistance="5.1k"
          manufacturerPartNumber="RC0603FR-075K1L"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.USB_CC2, pin2: sel.net.GND }}
        />
        {/* Ultra-low-leakage D4 plus this discharge path keeps an unplugged
            USB VBUS from floating upward when the 12 V rail is active. */}
        <resistor
          {...at(2, -2, 90)}
          name="R20"
          resistance="470"
          manufacturerPartNumber="RC0805FR-07470RL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0805"
          connections={{ pin1: sel.net.USB_VBUS, pin2: sel.net.GND }}
        />
        <netlabel net="GND" connectsTo={tscSel.R20.pin2} anchorSide="bottom" />
        <chip
          {...at(1, 0)}
          name="U4"
          manufacturerPartNumber="TPD2EUSB30DRTR"
          datasheetUrl="https://www.ti.com/lit/ds/symlink/tpd2eusb30a.pdf"
          footprint="kicad:Package_TO_SOT_SMD/Texas_DRT-3"
          schPinArrangement={{
            leftSide: ["DPLUS", "DMINUS"],
            bottomSide: ["GND"],
          }}
          pinLabels={{ pin1: "DPLUS", pin2: "DMINUS", pin3: "GND" }}
          connections={{
            DPLUS: sel.net.USB_DP_CONN,
            GND: sel.net.GND,
            DMINUS: sel.net.USB_DM_CONN,
          }}
        />
        <resistor
          {...at(4.5, -1.25)}
          name="R8"
          resistance="22"
          manufacturerPartNumber="RC0603FR-0722RL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.USB_DM_CONN, pin2: sel.net.USB_DM_ESP }}
        />
        <resistor
          {...at(4.5, 1.25)}
          name="R9"
          resistance="22"
          manufacturerPartNumber="RC0603FR-0722RL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.USB_DP_CONN, pin2: sel.net.USB_DP_ESP }}
        />
      </group>

      <group name="LocalControlBlock" schX={-27} schY={-5}>
        <schematictext
          {...at(-8, 3.5)}
          text="LOCAL ENCODER CONTROL AND STATUS INDICATOR"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-8, 2.5)}
          text="All local modes and brightness control remain available without Wi-Fi."
          fontSize={0.65}
          anchor="left"
        />
        {/* Encoder remains the primary local control and works without Wi-Fi. */}
        <chip
          {...at(-5.5, -0.5)}
          name="ENC1"
          manufacturerPartNumber="EC11E09244AQ"
          datasheetUrl="https://tech.alpsalpine.com/e/products/detail/EC11E09244AQ/"
          footprint="kicad:Rotary_Encoder/RotaryEncoder_Alps_EC11E-Switch_Vertical_H20mm"
          schPinArrangement={{
            rightSide: ["A", "B", "SW1"],
            bottomSide: ["COMMON", "SW2"],
          }}
          pinLabels={{
            pin1: "A",
            pin2: "COMMON",
            pin3: "B",
            pin4: "SW1",
            pin5: "SW2",
          }}
          connections={{
            A: sel.net.ENC_A,
            COMMON: sel.net.GND,
            B: sel.net.ENC_B,
            SW1: sel.net.ENC_SW,
            SW2: sel.net.GND,
          }}
        />
      </group>

      {/* Separate filter subgroups make the three identical channels readable:
          short local RC wires are retained and named interfaces use labels. */}
      <group name="EncoderAFilterBlock" schX={-28.5} schY={-5}>
        <resistor
          {...at(0.5, 0.5)}
          name="R10"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ENC_A }}
        />
        <capacitor
          {...at(3.5, 0.5)}
          name="C12"
          capacitance="10nF"
          manufacturerPartNumber="GRM188R71H103KA01D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H103KA01D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.ENC_A, pin2: sel.net.GND }}
        />
      </group>

      <group name="EncoderBFilterBlock" schX={-28.5} schY={-5}>
        <resistor
          {...at(0.5, -1)}
          name="R11"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ENC_B }}
        />
        <capacitor
          {...at(3.5, -1)}
          name="C13"
          capacitance="10nF"
          manufacturerPartNumber="GRM188R71H103KA01D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H103KA01D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.ENC_B, pin2: sel.net.GND }}
        />
      </group>

      <group name="EncoderSwitchFilterBlock" schX={-28.5} schY={-5}>
        <resistor
          {...at(0.5, -2.5)}
          name="R12"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ENC_SW }}
        />
        <capacitor
          {...at(3.5, -2.5)}
          name="C14"
          capacitance="100nF"
          manufacturerPartNumber="GRM188R71H104KA93D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H104KA93D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.ENC_SW, pin2: sel.net.GND }}
        />
      </group>

      <group name="LedOutputBlock" schX={-9} schY={-5}>
        <schematictext
          {...at(1, 3.5)}
          text="WS2811 DATA LEVEL SHIFT AND OUTPUT"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(1, 2.5)}
          text="J2: +12V/DATA/GND; U5 SN74AHCT1G125; D7 PESD5V0S1BA; reset DATA low."
          fontSize={0.65}
          anchor="left"
        />
        {/* 3.3 V to 5 V level translation is mandatory for the WS2811 VIH limit. */}
        <resistor
          {...at(-7.5, -2.75, 90)}
          name="R13"
          resistance="100k"
          manufacturerPartNumber="RC0603FR-07100KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.LED_DATA_3V3, pin2: sel.net.GND }}
        />
        <chip
          {...at(-2, 0)}
          name="U5"
          manufacturerPartNumber="SN74AHCT1G125DBVR"
          datasheetUrl="https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf"
          footprint="sot23_5"
          schPinArrangement={{
            leftSide: ["A", "OE_N"],
            rightSide: ["Y"],
            topSide: ["VCC"],
            bottomSide: ["GND"],
          }}
          pinLabels={{
            pin1: "OE_N",
            pin2: "A",
            pin3: "GND",
            pin4: "Y",
            pin5: "VCC",
          }}
          connections={{
            OE_N: sel.net.BUFFER_OE_N,
            A: sel.net.LED_DATA_3V3,
            GND: sel.net.GND,
            Y: sel.net.LED_DATA_5V_RAW,
            VCC: sel.net.V5_BUFFER,
          }}
        />
        <resistor
          {...at(-5.5, 2, 90)}
          name="R14"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.V5_BUFFER, pin2: sel.net.BUFFER_OE_N }}
        />
        <chip
          {...at(-5.5, -0.5)}
          name="Q2"
          manufacturerPartNumber="2N7002-7"
          datasheetUrl="https://www.diodes.com/datasheet/download/2N7002.pdf"
          footprint="sot23"
          schPinArrangement={{
            leftSide: ["G"],
            rightSide: ["D"],
            bottomSide: ["S"],
          }}
          pinLabels={{ pin1: "G", pin2: "S", pin3: "D" }}
          connections={{
            G: sel.net.BUFFER_ENABLE,
            S: sel.net.GND,
            D: sel.net.BUFFER_OE_N,
          }}
        />
        <resistor
          {...at(-5.5, -2.75, 90)}
          name="R15"
          resistance="100k"
          manufacturerPartNumber="RC0603FR-07100KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.BUFFER_ENABLE, pin2: sel.net.GND }}
        />
        <capacitor
          {...at(0.5, -2.75, 90)}
          name="C15"
          capacitance="100nF"
          manufacturerPartNumber="GRM188R71H104KA93D"
          datasheetUrl="https://www.murata.com/en-us/products/productdetail?partno=GRM188R71H104KA93D"
          maxVoltageRating="50V"
          footprint="0603"
          connections={{ pin1: sel.net.V5_BUFFER, pin2: sel.net.GND }}
        />
        <resistor
          {...at(3, 0)}
          name="R16"
          resistance="100"
          manufacturerPartNumber="RC0603FR-07100RL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{
            pin1: sel.net.LED_DATA_5V_RAW,
            pin2: sel.net.LED_DATA_OUT,
          }}
        />
        <diode
          {...at(5, -2.75, 90)}
          name="D7"
          displayName="PESD5V0S1BA"
          manufacturerPartNumber="PESD5V0S1BA,115"
          datasheetUrl="https://assets.nexperia.com/documents/data-sheet/PESD5V0S1BA.pdf"
          variant="tvs"
          footprint="sod323"
          connections={{ anode: sel.net.GND, cathode: sel.net.LED_DATA_OUT }}
        />
        <netlabel
          net="LED_DATA_OUT"
          connectsTo={tscSel.R16.pin2}
          anchorSide="top"
        />
        {/* The AHCT output is high-impedance during reset; hold the external
            WS2811 input low so the cable cannot float and create false bits. */}
        <resistor
          {...at(7, -2.75, 90)}
          name="R21"
          resistance="10k"
          manufacturerPartNumber="RC0603FR-0710KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{ pin1: sel.net.LED_DATA_OUT, pin2: sel.net.GND }}
        />

        {/* Strip output and service header. */}
        <chip
          {...at(8, 0)}
          name="J2"
          manufacturerPartNumber="1715734"
          datasheetUrl="https://www.phoenixcontact.com/en-pc/products/pcb-terminal-block-mkds-15-3-508-1715734"
          footprint="kicad:TerminalBlock_Phoenix/TerminalBlock_Phoenix_MKDS-1,5-3-5.08_1x03_P5.08mm_Horizontal"
          schPinArrangement={{ leftSide: ["V12", "DATA", "GND"] }}
          pinLabels={{ pin1: "V12", pin2: "DATA", pin3: "GND" }}
          connections={{
            V12: sel.net.V12_PROTECTED,
            DATA: sel.net.LED_DATA_OUT,
            GND: sel.net.GND,
          }}
        />
      </group>

      <group name="ServiceUartBlock" schX={-5} schY={1}>
        <schematictext
          {...at(-3.5, 4.5)}
          text="SERVICE UART HEADER"
          fontSize={1.1}
          anchor="left"
        />
        <schematictext
          {...at(-3.5, 3.5)}
          text="3.3 V recovery UART."
          fontSize={0.65}
          anchor="left"
        />
        <chip
          {...at(0, 0)}
          name="J4"
          manufacturerPartNumber="TSW-104-07-G-S"
          datasheetUrl="https://www.samtec.com/products/tsw-104-07-g-s"
          footprint="kicad:Connector_PinHeader_2.54mm/PinHeader_1x04_P2.54mm_Vertical"
          schPinArrangement={{
            leftSide: ["TX", "RX"],
            topSide: ["V3P3"],
            bottomSide: ["GND"],
          }}
          pinLabels={{ pin1: "V3P3", pin2: "GND", pin3: "TX", pin4: "RX" }}
          connections={{
            V3P3: sel.net.V3P3_ESP,
            GND: sel.net.GND,
            TX: sel.net.UART_TX,
            RX: sel.net.UART_RX,
          }}
        />
      </group>

      <group name="LocalIndicatorBlock" schX={-27} schY={-5}>
        <led
          {...at(9, -0.25, 90)}
          name="D8"
          manufacturerPartNumber="LTST-C190KGKT"
          datasheetUrl="https://optoelectronics.liteon.com/upload/download/DS22-2000-037/LTST-C190KGKT.pdf"
          color="green"
          footprint="0603"
          connections={{
            anode: sel.net.STATUS_LED_DRIVE,
            cathode: sel.net.GND,
          }}
        />
        <resistor
          {...at(6.5, -0.25)}
          name="R17"
          resistance="1k"
          manufacturerPartNumber="RC0603FR-071KL"
          datasheetUrl="https://www.yageo.com/upload/media/product/productsearch/datasheet/rchip/PYu-RC_Group_51_RoHS_L_15.pdf"
          footprint="0603"
          connections={{
            pin1: sel.net.STATUS_LED,
            pin2: sel.net.STATUS_LED_DRIVE,
          }}
        />
      </group>
    </board>
  )
}
