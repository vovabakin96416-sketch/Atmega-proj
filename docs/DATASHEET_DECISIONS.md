# Решения по даташитам

Документ фиксирует электрический выбор компонентов схемы ревизии A. Закупочный
перечень находится в `BOM.md`/`BOM.csv`; незакрытые footprint и испытательные
ограничения имеют явный статус `BLOCKED` в `PREORDER_VALIDATION.md`.

| Узел                   | Выбранный компонент          | Проверенные параметры и решение                                                                                                                                                                              |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MCU/Wi-Fi              | `ESP32-C3-MINI-1-N4X`        | 3,0–3,6 В; источник не менее 500 мА; Wi-Fi TX до 350 мА; N4X — Recommended. GPIO18/19 используются как USB D−/D+, GPIO2/8/9 учтены как strapping pins.                                                       |
| DC/DC 3,3 В            | `AP63203WU-7`                | 3,8–32 В, 2 А, фиксированные 3,3 В, 1,1 МГц, TSOT-26. Обвязка: 3,9 мкГн, `2 × 10 мкФ` на входе, `2 × 22 мкФ` на выходе и 100 нФ BST–SW. Второй входной MLCC добавлен как запас по DC-bias.                   |
| Дроссель               | Würth Elektronik `784787039` | 3,9 мкГн, `Irated = 3,8 А`, `Isat = 4 А`; превышает требование AP63203 иметь токовый запас не менее 35 % относительно 2 А.                                                                                   |
| LDO 5 В                | `TLV76050DBZR`               | Вход до 30 В, фиксированные 5 В, 100 мА, DBZ/SOT-23. C7/C8 приняты по 1 мкФ. Pin 1 — OUT, pin 2 — IN, pin 3 — GND. Минимум по температуре 4,75 В.                                                            |
| Mux питания буфера     | `TPS2113APWR`                | Reverse-blocking automatic highest-input mux вместо D5/D6. IN1=V5_LDO, IN2=USB_VBUS, OUT=V5_BUFFER, EN=VSNS=0, RILIM=402 Ом, STAT pull-up=100 кОм. При 2,25 мА worst VBUFFER=4,74966 В.                      |
| DATA level shift       | `SN74AHCT1G125DBVR`          | Питание 4,5–5,5 В, TTL-совместимый вход, выход ±8 мА. Прямые 3,3 В не приняты: для WS2811 `VIH(min) = 0,7 × VDD`, то есть до 3,85 В при VDD = 5,5 В.                                                         |
| Разрешение буфера      | `2N7002-7`                   | N-MOSFET SOT-23, 60 В; ток здесь только через подтяжку 10 кОм. Gate — pin 1, source — pin 2, drain — pin 3. При reset подтяжка 100 кОм закрывает MOSFET, а `OE` буфера остаётся высоким.                     |
| Reverse polarity       | `2 × DMP4015SSS-13`          | Два параллельных P-MOSFET −40 В, SO-8, `RDS(on) ≤15 мОм` при −4,5 В. Drain обращён к предохранителю/входу, source — к защищённой шине; PCB должна обеспечить симметричное деление 8 А.                       |
| Входной предохранитель | Littelfuse `0451012.MRL`     | 12 А, 65 В, very-fast, NANO2, 4,9 мОм. Ток 7,67 А равен 64% номинала; окончательное согласование time-current выполняется на прототипе, потому что пусковой ток ленты не измерен.                            |
| Gate zener             | `MMSZ5242B-7-F`              | 12 В ±5%, 500 мВт, SOD-123; ограничивает \|VGS\| Q1/Q3 ниже ±25 В absolute maximum.                                                                                                                          |
| Logic OR-ing           | `RB058LAM-40TR`              | D3/D4, Schottky 40 В/3 А, VF max 0,69 В при 3 А и IR max 2,5 мкА при 40 В/25 °C. R20=470 Ом разряжает USB VBUS; старый SS34 запрещён из-за IR до 0,5 мА/25 °C и 20 мА/100 °C. PCB polarity остаётся BLOCKED. |
| TVS 12 В               | Littelfuse `SMBJ15A`         | `VRWM = 15 В`, пробой 16,7–18,5 В, 600 Вт, DO-214AA. Ставится после защиты полярности рядом с входом.                                                                                                        |
| USB ESD                | `TPD2EUSB30DRTR`             | Два канала, 0,7 пФ, 5,5 В, DRT/SOT-9X3. Физическая нумерация: pin 1 - D+, pin 2 - D-, pin 3 - GND. Ставится максимально близко к USB-C.                                                                      |
| DATA ESD               | `PESD5V0S1BA,115`            | Одноканальный ESD, `VRWM = 5 В`, SOD-323. Ставится рядом с клеммой LED DATA.                                                                                                                                 |
| USB-C                  | GCT `USB4105-GF-A-060`       | USB 2.0, 16 контактов, top-mount. На CC1 и CC2 по отдельному 5,1 кОм к GND; D+/D− через ESD и 22 Ом к GPIO19/GPIO18. Named-pad mapping проверить перед PCB release.                                          |
| Энкодер                | `EC11E09244AQ`               | Alps Alpine, 18 detents/9 pulses, push switch, вертикальный THT, shaft 20 мм.                                                                                                                                |
| Вход/выход             | `1715721` / `1715734`        | Phoenix Contact MKDS 1,5, шаг 5,08 мм; 2-pin input и 3-pin +12V/DATA/GND output.                                                                                                                             |

## Расчёт потерь защиты полярности

При полном расчётном входном токе 7,67 А и двух MOSFET для каждого принят
худший горячий `RDS(on) = 15 мОм × 1,6 = 24 мОм`:

`P_each = (7,67/2)² × 0,024 = 0,353 Вт`.

Суммарная потеря около 0,706 Вт, падение около 92 мВ. Это допустимо для двух SO-8
только при симметричных медных площадках и равных токовых путях; температура и
деление тока проверяются на прототипе.

## Официальные источники

- Espressif ESP32-C3-MINI-1 datasheet: <https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf>
- Espressif ESP32-C3 hardware design guidelines: <https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html>
- Diodes AP63200/AP63201/AP63203/AP63205 datasheet: <https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf>
- Würth Elektronik WE-PD2SA, order code 784787039: <https://www.we-online.com/en/components/products/WE-PD2SA>
- TI TLV760 datasheet: <https://www.ti.com/lit/ds/symlink/tlv760.pdf>
- TI TPS2113A datasheet: <https://www.ti.com/lit/ds/symlink/tps2113a.pdf>
- TI SN74AHCT1G125 datasheet: <https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf>
- Diodes 2N7002 datasheet: <https://www.diodes.com/datasheet/download/2N7002.pdf>
- Diodes DMP4015SSS datasheet: <https://www.diodes.com/datasheet/download/DMP4015SSS.pdf>
- TI reverse-polarity application note: <https://www.ti.com/lit/an/slvae57b/slvae57b.pdf>
- Littelfuse 0451012: <https://www.littelfuse.com/products/fuses-overcurrent-protection/fuses/surface-mount-fuses/nano-2-fuses/451/0451012>
- TI TPD2EUSB30 datasheet: <https://www.ti.com/lit/ds/symlink/tpd2eusb30a.pdf>
- Nexperia PESD5V0S1BA datasheet: <https://assets.nexperia.com/documents/data-sheet/PESD5V0S1BA.pdf>
- GCT USB4105 drawing: <https://gct.co/files/drawings/usb4105.pdf>
- ROHM RB058LAM-40 datasheet: <https://www.rohm.com/products/diodes/schottky-barrier-diodes/ultra-low-ir/rb058lam-40-product>
- Diodes MMSZ5242B datasheet: <https://www.diodes.com/assets/Datasheets/ds18010.pdf>
- Worldsemi WS2811 manufacturer family page: <https://www.world-semi.com/>. Точный
  контроллер купленной ленты и его ревизия пока не подтверждены, поэтому пороги
  и ток обязательно проверяются по документации/измерению конкретной ленты.

## Перед началом PCB

- Сверить каждую нумерацию вывода с посадочным чертежом конкретного MPN.
- Назначить footprint модулю ESP32-C3 с полным antenna keepout.
- Импортировать официальный vendor footprint 784787039 и сравнить с кандидатом KiCad.
- Явно сопоставить anode/cathode source-порты с K/A pads D1/D2/D3/D4/D7 и LED D8.
- Проверить named-pad mapping USB4105 и EC11E09244AQ.
- Проверить derating MLCC по постоянному напряжению и фактическую ёмкость при bias.
- Подтвердить предохранитель пусковым и тепловым тестом прототипа; до него владелец
  не имеет возможности измерить ток ленты.
- Проверить допустимую нагрузку и пусковой ток USB VBUS по применимой версии USB.
- Для C1 использовать номинал не менее 35 В: 25 В находится слишком близко к
  максимальному ограничению выбранного SMBJ15A и не даёт приемлемого derating.
