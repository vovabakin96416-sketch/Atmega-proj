# Окончательный BOM электрической схемы rev A

Дата ревью: 2026-07-16. Главный исходник — `src/board.tsx`. Полная
машиночитаемая таблица с рабочими напряжениями/токами, допусками, температурой,
поставщиком, допустимой заменой, DNP, статусом и официальной ссылкой находится в
[`BOM.csv`](BOM.csv). Ни одна позиция текущей схемы не является DNP.

Статусы:

- `ORDER_SAMPLE` — точный MPN можно покупать малыми количествами для первой сборки;
- `BLOCKED_*` — MPN определён, но финальная закупка/PCBA заблокирована указанной
  проверкой. Это не неопределённая позиция и не разрешение выбрать аналог на месте.

| RefDes                      | Кол-во | Номинал / точный MPN                  | Производитель; корпус            | KiCad footprint                                  | Статус                   |
| --------------------------- | -----: | ------------------------------------- | -------------------------------- | ------------------------------------------------ | ------------------------ |
| J1                          |      1 | 12 V input; `1715721`                 | Phoenix Contact; MKDS 1.5/2-5.08 | `TerminalBlock_Phoenix_MKDS-1,5-2-5.08_1x02...`  | ORDER_SAMPLE             |
| F1                          |      1 | 7 A; `0451007.MRL`                    | Littelfuse; NANO2 451            | `Fuse_Littelfuse-NANO2-451_453`                  | BLOCKED_FINAL_RATING     |
| Q1                          |      1 | P-MOS 40 V; `DMP4015SSS-13`           | Diodes; SO-8                     | `SOIC-8_3.9x4.9mm_P1.27mm`                       | ORDER_SAMPLE             |
| R1 R13 R15 R19              |      4 | 100 kOhm 1%; `RC0603FR-07100KL`       | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |
| D1                          |      1 | zener 12 V; `MMSZ5242B-7-F`           | Diodes; SOD-123                  | `D_SOD-123`                                      | ORDER_SAMPLE             |
| D2                          |      1 | TVS 15 V; `SMBJ15A`                   | Littelfuse; SMB                  | `D_SMB`                                          | ORDER_SAMPLE             |
| C1                          |      1 | 470 uF 35 V; `EEU-FR1V471B`           | Panasonic; radial 10 mm          | `CP_Radial_D10.0mm_P5.00mm`                      | ORDER_SAMPLE             |
| C2 C4 C10 C14 C15           |      5 | 100 nF 50 V X7R; `GRM188R71H104KA93D` | Murata; 0603                     | `C_0603_1608Metric`                              | ORDER_SAMPLE             |
| D3 D4                       |      2 | Schottky 3 A 40 V; `SS34-E3/57T`      | Vishay; SMA                      | `D_SMA`                                          | BLOCKED_PAD_MAPPING      |
| U1                          |      1 | 3.3 V/2 A buck; `AP63203WU-7`         | Diodes; TSOT-26                  | `TSOT-23-6`                                      | ORDER_SAMPLE             |
| C3                          |      1 | 10 uF 50 V X7R; `GRM32ER71H106KA12L`  | Murata; 1210                     | `C_1210_3225Metric`                              | BLOCKED_DC_BIAS          |
| L1                          |      1 | 3.9 uH; `784787039`                   | Würth; WE-PD2SA 7850             | vendor CAD required                              | BLOCKED_VENDOR_FOOTPRINT |
| C5 C6                       |      2 | 22 uF 10 V X7R; `GRM31CR71A226KE15L`  | Murata; 1206                     | `C_1206_3216Metric`                              | BLOCKED_DC_BIAS          |
| U3                          |      1 | 5 V/100 mA LDO; `TLV76050DBZR`        | TI; SOT-23-3                     | `SOT-23`                                         | ORDER_SAMPLE             |
| C7                          |      1 | 1 uF 50 V X7R; `GRM21BR71H105KA12L`   | Murata; 0805                     | `C_0805_2012Metric`                              | ORDER_SAMPLE             |
| C8 C11 C16 C17              |      4 | 1 uF 10 V X7R; `GRM188R71A105KA61D`   | Murata; 0603                     | `C_0603_1608Metric`                              | ORDER_SAMPLE             |
| U6                          |      1 | power mux; `TPS2113APWR`              | TI; TSSOP-8                      | `TSSOP-8_4.4x3mm_P0.65mm`                        | ORDER_SAMPLE             |
| R18                         |      1 | 402 Ohm 1%; `RC0603FR-07402RL`        | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |
| U2                          |      1 | ESP32-C3, 4 MB; `ESP32-C3-MINI-1-N4X` | Espressif; 53-pad module         | custom official v2.2 land pattern                | BLOCKED_CUSTOM_FOOTPRINT |
| FB1                         |      1 | 220 Ohm@100 MHz; `BLM21PG221SN1D`     | Murata; 0805                     | `L_0805_2012Metric`                              | ORDER_SAMPLE             |
| C9                          |      1 | 10 uF 10 V X7R; `GRM21BR71A106KE51L`  | Murata; 0805                     | `C_0805_2012Metric`                              | ORDER_SAMPLE             |
| R2 R3 R4 R5 R10 R11 R12 R14 |      8 | 10 kOhm 1%; `RC0603FR-0710KL`         | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |
| SW1 SW2                     |      2 | tactile; `B3F-1000`                   | Omron; 6x6 mm THT                | `SW_TH_Tactile_Omron_B3F-100x`                   | ORDER_SAMPLE             |
| J3                          |      1 | USB-C; `USB4105-GF-A-060`             | GCT; 16-pin top-mount            | `USB_C_Receptacle_GCT_USB4105-xx-A_16P...`       | ORDER_SAMPLE             |
| R6 R7                       |      2 | 5.1 kOhm 1%; `RC0603FR-075K1L`        | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |
| U4                          |      1 | USB ESD; `TPD2EUSB30DRTR`             | TI; DRT-3                        | `Texas_DRT-3`                                    | ORDER_SAMPLE             |
| R8 R9                       |      2 | 22 Ohm 1%; `RC0603FR-0722RL`          | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |
| ENC1                        |      1 | 18 detent/9 pulse; `EC11E09244AQ`     | Alps; vertical THT               | `RotaryEncoder_Alps_EC11E-Switch_Vertical_H20mm` | ORDER_SAMPLE             |
| C12 C13                     |      2 | 10 nF 50 V X7R; `GRM188R71H103KA01D`  | Murata; 0603                     | `C_0603_1608Metric`                              | ORDER_SAMPLE             |
| U5                          |      1 | AHCT tri-state; `SN74AHCT1G125DBVR`   | TI; SOT-23-5                     | `SOT-23-5`                                       | ORDER_SAMPLE             |
| Q2                          |      1 | N-MOS; `2N7002-7`                     | Diodes; SOT-23                   | `SOT-23`                                         | ORDER_SAMPLE             |
| R16                         |      1 | 100 Ohm 1%; `RC0603FR-07100RL`        | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |
| D7                          |      1 | DATA ESD; `PESD5V0S1BA,115`           | Nexperia; SOD-323                | `D_SOD-323`                                      | BLOCKED_PAD_MAPPING      |
| J2                          |      1 | WS2811 output; `1715734`              | Phoenix Contact; MKDS 1.5/3-5.08 | `TerminalBlock_Phoenix_MKDS-1,5-3-5.08_1x03...`  | ORDER_SAMPLE             |
| J4                          |      1 | UART 1x4; `TSW-104-07-G-S`            | Samtec; 2.54 mm THT              | `PinHeader_1x04_P2.54mm_Vertical`                | ORDER_SAMPLE             |
| D8                          |      1 | green LED; `LTST-C190KGKT`            | Lite-On; 0603                    | `LED_0603_1608Metric`                            | ORDER_SAMPLE             |
| R17                         |      1 | 1 kOhm 1%; `RC0603FR-071KL`           | Yageo; 0603                      | `R_0603_1608Metric`                              | ORDER_SAMPLE             |

## Закупочное решение

Можно заказать по 3–10 штук позиций `ORDER_SAMPLE`, а также по несколько U2 и L1
для макетирования, понимая, что их PCB footprints ещё заблокированы. Нельзя
размещать полный заказ на F1, C3, C5/C6 или заказывать собранные платы до закрытия
соответствующих `BLOCKED_*`. Замена любого полупроводника требует нового ревью
даташита и физической нумерации.
