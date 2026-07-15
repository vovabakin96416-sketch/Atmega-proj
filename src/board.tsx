import { sel as tscSel } from "tscircuit"

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

export default function Ws2811Controller() {
  return (
    <board width="80mm" height="55mm" routingDisabled>
      {/* 12 V input, over-current, reverse-polarity and transient protection. */}
      <chip
        name="J1"
        footprint="pinrow2_p5.08_id1.5_od2.8"
        pinLabels={{ pin1: "VIN_12V", pin2: "GND" }}
        connections={{ VIN_12V: sel.net.VIN_12V_RAW, GND: sel.net.GND }}
      />
      <fuse
        name="F1"
        manufacturerPartNumber="0469005"
        datasheetUrl="https://www.littelfuse.com/de/products/fuses-overcurrent-protection/fuses/surface-mount-fuses/thin-film-chip-fuses/469/0469005"
        currentRating="5A"
        footprint="1206"
        connections={{ pin1: sel.net.VIN_12V_RAW, pin2: sel.net.VIN_12V_FUSED }}
      />
      <chip
        name="Q1"
        manufacturerPartNumber="DMP4015SSS-13"
        datasheetUrl="https://www.diodes.com/datasheet/download/DMP4015SSS.pdf"
        footprint="soic8"
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
        name="R1"
        resistance="100k"
        footprint="0603"
        connections={{ pin1: sel.net.Q1_GATE, pin2: sel.net.GND }}
      />
      <diode
        name="D1"
        variant="zener"
        footprint="sod123"
        connections={{ anode: sel.net.Q1_GATE, cathode: sel.net.V12_PROTECTED }}
      />
      <diode
        name="D2"
        manufacturerPartNumber="SMBJ15A"
        variant="tvs"
        footprint="smb"
        connections={{ anode: sel.net.GND, cathode: sel.net.V12_PROTECTED }}
      />
      <capacitor
        name="C1"
        capacitance="470uF"
        footprint="radial_cap_p5mm_d10mm"
        connections={{ pin1: sel.net.V12_PROTECTED, pin2: sel.net.GND }}
      />
      <capacitor
        name="C2"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.V12_PROTECTED, pin2: sel.net.GND }}
      />

      {/* Passive OR-ing allows programming from USB when the 12 V supply is off. */}
      <diode
        name="D3"
        variant="schottky"
        footprint="sma"
        connections={{
          anode: sel.net.V12_PROTECTED,
          cathode: sel.net.LOGIC_INPUT,
        }}
      />
      <diode
        name="D4"
        variant="schottky"
        footprint="sma"
        connections={{ anode: sel.net.USB_VBUS, cathode: sel.net.LOGIC_INPUT }}
      />

      {/* AP63203WU-7 fixed 3.3 V synchronous buck, datasheet application circuit. */}
      <chip
        name="U1"
        manufacturerPartNumber="AP63203WU-7"
        datasheetUrl="https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf"
        footprint="sot23_6"
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
        name="C3"
        capacitance="10uF"
        footprint="1206"
        connections={{ pin1: sel.net.LOGIC_INPUT, pin2: sel.net.GND }}
      />
      <capacitor
        name="C4"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.BUCK_BST, pin2: sel.net.BUCK_SW }}
      />
      <chip
        name="L1"
        displayName="3.9uH"
        manufacturerPartNumber="784787039"
        datasheetUrl="https://www.we-online.com/en/components/products/WE-PD2SA"
        pinLabels={{ pin1: "SW", pin2: "VOUT" }}
        connections={{ SW: sel.net.BUCK_SW, VOUT: sel.net.V3P3 }}
      />
      <capacitor
        name="C5"
        capacitance="22uF"
        footprint="1206"
        connections={{ pin1: sel.net.V3P3, pin2: sel.net.GND }}
      />
      <capacitor
        name="C6"
        capacitance="22uF"
        footprint="1206"
        connections={{ pin1: sel.net.V3P3, pin2: sel.net.GND }}
      />

      {/* A tiny 5 V rail is used only by the WS2811 data-level buffer. */}
      <chip
        name="U3"
        manufacturerPartNumber="TLV76050DBZR"
        datasheetUrl="https://www.ti.com/lit/ds/symlink/tlv760.pdf"
        footprint="sot23"
        pinLabels={{ pin1: "VOUT", pin2: "VIN", pin3: "GND" }}
        connections={{
          GND: sel.net.GND,
          VIN: sel.net.V12_PROTECTED,
          VOUT: sel.net.V5_LDO,
        }}
      />
      <capacitor
        name="C7"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.V12_PROTECTED, pin2: sel.net.GND }}
      />
      <capacitor
        name="C8"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.V5_LDO, pin2: sel.net.GND }}
      />
      <diode
        name="D5"
        variant="schottky"
        footprint="sod123"
        connections={{ anode: sel.net.V5_LDO, cathode: sel.net.V5_BUFFER }}
      />
      <diode
        name="D6"
        variant="schottky"
        footprint="sod123"
        connections={{ anode: sel.net.USB_VBUS, cathode: sel.net.V5_BUFFER }}
      />

      {/* ESP32-C3-MINI-1-N4X. Exact 53-pin mapping follows Espressif v2.2. */}
      <chip
        name="U2"
        manufacturerPartNumber="ESP32-C3-MINI-1-N4X"
        datasheetUrl="https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf"
        pinLabels={esp32C3Mini1PinLabels}
        noConnect={[
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
        ]}
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
        name="FB1"
        footprint="0805"
        pinLabels={{ pin1: "IN", pin2: "OUT" }}
        connections={{ IN: sel.net.V3P3, OUT: sel.net.V3P3_ESP }}
      />
      <capacitor
        name="C9"
        capacitance="10uF"
        footprint="0805"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.GND }}
      />
      <capacitor
        name="C10"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.GND }}
      />

      {/* Reset and boot straps. */}
      <resistor
        name="R2"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ESP_EN }}
      />
      <capacitor
        name="C11"
        capacitance="1uF"
        footprint="0603"
        connections={{ pin1: sel.net.ESP_EN, pin2: sel.net.GND }}
      />
      <chip
        name="SW1"
        footprint="pinrow2"
        pinLabels={{ pin1: "A", pin2: "B" }}
        connections={{ A: sel.net.ESP_EN, B: sel.net.GND }}
      />
      <resistor
        name="R3"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.STRAP_IO2 }}
      />
      <resistor
        name="R4"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.STRAP_IO8 }}
      />
      <resistor
        name="R5"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.BOOT_IO9 }}
      />
      <chip
        name="SW2"
        footprint="pinrow2"
        pinLabels={{ pin1: "A", pin2: "B" }}
        connections={{ A: sel.net.BOOT_IO9, B: sel.net.GND }}
      />

      {/* Native USB-C programming and diagnostics. */}
      <chip
        name="J3"
        manufacturerPartNumber="USB4105"
        datasheetUrl="https://gct.co/files/drawings/usb4105.pdf"
        noConnect={["A8_SBU1", "B8_SBU2"]}
        footprint="kicad:Connector_USB/USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal"
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
        name="R6"
        resistance="5.1k"
        footprint="0603"
        connections={{ pin1: sel.net.USB_CC1, pin2: sel.net.GND }}
      />
      <resistor
        name="R7"
        resistance="5.1k"
        footprint="0603"
        connections={{ pin1: sel.net.USB_CC2, pin2: sel.net.GND }}
      />
      <chip
        name="U4"
        manufacturerPartNumber="TPD2EUSB30DRTR"
        datasheetUrl="https://www.ti.com/lit/ds/symlink/tpd2eusb30a.pdf"
        pinLabels={{ pin1: "DPLUS", pin2: "GND", pin3: "DMINUS" }}
        connections={{
          DPLUS: sel.net.USB_DP_CONN,
          GND: sel.net.GND,
          DMINUS: sel.net.USB_DM_CONN,
        }}
      />
      <resistor
        name="R8"
        resistance="22"
        footprint="0603"
        connections={{ pin1: sel.net.USB_DM_CONN, pin2: sel.net.USB_DM_ESP }}
      />
      <resistor
        name="R9"
        resistance="22"
        footprint="0603"
        connections={{ pin1: sel.net.USB_DP_CONN, pin2: sel.net.USB_DP_ESP }}
      />

      {/* Encoder remains the primary local control and works without Wi-Fi. */}
      <chip
        name="ENC1"
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
      <resistor
        name="R10"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ENC_A }}
      />
      <resistor
        name="R11"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ENC_B }}
      />
      <resistor
        name="R12"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V3P3_ESP, pin2: sel.net.ENC_SW }}
      />
      <capacitor
        name="C12"
        capacitance="10nF"
        footprint="0603"
        connections={{ pin1: sel.net.ENC_A, pin2: sel.net.GND }}
      />
      <capacitor
        name="C13"
        capacitance="10nF"
        footprint="0603"
        connections={{ pin1: sel.net.ENC_B, pin2: sel.net.GND }}
      />
      <capacitor
        name="C14"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.ENC_SW, pin2: sel.net.GND }}
      />

      {/* 3.3 V to 5 V level translation is mandatory for the WS2811 VIH limit. */}
      <resistor
        name="R13"
        resistance="100k"
        footprint="0603"
        connections={{ pin1: sel.net.LED_DATA_3V3, pin2: sel.net.GND }}
      />
      <chip
        name="U5"
        manufacturerPartNumber="SN74AHCT1G125DBVR"
        datasheetUrl="https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf"
        footprint="sot23_5"
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
        name="R14"
        resistance="10k"
        footprint="0603"
        connections={{ pin1: sel.net.V5_BUFFER, pin2: sel.net.BUFFER_OE_N }}
      />
      <chip
        name="Q2"
        manufacturerPartNumber="2N7002-7"
        datasheetUrl="https://www.diodes.com/datasheet/download/2N7002.pdf"
        footprint="sot23"
        pinLabels={{ pin1: "G", pin2: "S", pin3: "D" }}
        connections={{
          G: sel.net.BUFFER_ENABLE,
          S: sel.net.GND,
          D: sel.net.BUFFER_OE_N,
        }}
      />
      <resistor
        name="R15"
        resistance="100k"
        footprint="0603"
        connections={{ pin1: sel.net.BUFFER_ENABLE, pin2: sel.net.GND }}
      />
      <capacitor
        name="C15"
        capacitance="100nF"
        footprint="0603"
        connections={{ pin1: sel.net.V5_BUFFER, pin2: sel.net.GND }}
      />
      <resistor
        name="R16"
        resistance="100"
        footprint="0603"
        connections={{
          pin1: sel.net.LED_DATA_5V_RAW,
          pin2: sel.net.LED_DATA_OUT,
        }}
      />
      <diode
        name="D7"
        manufacturerPartNumber="PESD5V0S1BA,115"
        datasheetUrl="https://assets.nexperia.com/documents/data-sheet/PESD5V0S1BA.pdf"
        variant="tvs"
        footprint="sod323"
        connections={{ anode: sel.net.GND, cathode: sel.net.LED_DATA_OUT }}
      />

      {/* Strip output and service header. */}
      <chip
        name="J2"
        footprint="pinrow3_p5.08_id1.5_od2.8"
        pinLabels={{ pin1: "V12", pin2: "DATA", pin3: "GND" }}
        connections={{
          V12: sel.net.V12_PROTECTED,
          DATA: sel.net.LED_DATA_OUT,
          GND: sel.net.GND,
        }}
      />
      <chip
        name="J4"
        footprint="pinrow4"
        pinLabels={{ pin1: "V3P3", pin2: "GND", pin3: "TX", pin4: "RX" }}
        connections={{
          V3P3: sel.net.V3P3_ESP,
          GND: sel.net.GND,
          TX: sel.net.UART_TX,
          RX: sel.net.UART_RX,
        }}
      />
      <led
        name="D8"
        color="green"
        footprint="0603"
        connections={{ anode: sel.net.STATUS_LED_DRIVE, cathode: sel.net.GND }}
      />
      <resistor
        name="R17"
        resistance="1k"
        footprint="0603"
        connections={{
          pin1: sel.net.STATUS_LED,
          pin2: sel.net.STATUS_LED_DRIVE,
        }}
      />
    </board>
  )
}
