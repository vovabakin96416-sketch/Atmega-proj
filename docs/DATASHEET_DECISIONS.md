# Решения по даташитам

Документ фиксирует электрический выбор компонентов схемы ревизии A. Это ещё не
закупочный BOM: точные footprints сверяются с посадочными чертежами перед PCB, а
энкодер, клеммы и окончательный суффикс USB-C зависят от корпуса.

| Узел                   | Выбранный компонент          | Проверенные параметры и решение                                                                                                                                                          |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MCU/Wi-Fi              | `ESP32-C3-MINI-1-N4X`        | 3,0–3,6 В; источник не менее 500 мА; Wi-Fi TX до 350 мА; N4X — Recommended. GPIO18/19 используются как USB D−/D+, GPIO2/8/9 учтены как strapping pins.                                   |
| DC/DC 3,3 В            | `AP63203WU-7`                | 3,8–32 В, 2 А, фиксированные 3,3 В, 1,1 МГц, TSOT-26. Типовая обвязка: 3,9 мкГн, 10 мкФ на входе, `2 × 22 мкФ` на выходе и 100 нФ BST–SW.                                                |
| Дроссель               | Würth Elektronik `784787039` | 3,9 мкГн, `Irated = 3,8 А`, `Isat = 4 А`; превышает требование AP63203 иметь токовый запас не менее 35 % относительно 2 А.                                                               |
| LDO 5 В                | `TLV76050DBZR`               | Вход до 30 В, фиксированные 5 В, 100 мА, DBZ/SOT-23. Питает только малопотребляющий DATA-буфер; обязательны 100 нФ на входе и выходе. Pin 1 — OUT, pin 2 — IN, pin 3 — GND.              |
| DATA level shift       | `SN74AHCT1G125DBVR`          | Питание 4,5–5,5 В, TTL-совместимый вход, выход ±8 мА. Прямые 3,3 В не приняты: для WS2811 `VIH(min) = 0,7 × VDD`, то есть до 3,85 В при VDD = 5,5 В.                                     |
| Разрешение буфера      | `2N7002-7`                   | N-MOSFET SOT-23, 60 В; ток здесь только через подтяжку 10 кОм. Gate — pin 1, source — pin 2, drain — pin 3. При reset подтяжка 100 кОм закрывает MOSFET, а `OE` буфера остаётся высоким. |
| Reverse polarity       | `DMP4015SSS-13`              | P-MOSFET −40 В, SO-8, `RDS(on) ≤ 11 мОм` при −10 В и `≤15 мОм` при −4,5 В. Drain обращён к предохранителю/входу, source — к защищённой 12-вольтовой шине.                                |
| Входной предохранитель | Littelfuse `0469005`         | 5 А, 32 В, slow-blow, 1206. Окончательная проверка требует измерения пускового тока реальной ленты.                                                                                      |
| TVS 12 В               | Littelfuse `SMBJ15A`         | `VRWM = 15 В`, пробой 16,7–18,5 В, 600 Вт, DO-214AA. Ставится после защиты полярности рядом с входом.                                                                                    |
| USB ESD                | `TPD2EUSB30DRTR`             | Два канала, 0,7 пФ, 5,5 В, SOT-9X3; активный orderable MPN. Ставится максимально близко к USB-C.                                                                                         |
| DATA ESD               | `PESD5V0S1BA,115`            | Одноканальный ESD, `VRWM = 5 В`, SOD-323. Ставится рядом с клеммой LED DATA.                                                                                                             |
| USB-C                  | GCT `USB4105`                | USB 2.0, 16 контактов, top-mount, USB-C receptacle. На CC1 и CC2 по отдельному 5,1 кОм к GND; D+/D− идут через ESD и 22 Ом к GPIO19/GPIO18.                                              |

## Расчёт потерь защиты полярности

При проектном токе ленты 4 А и максимальном `RDS(on) = 11 мОм` при 25 °C:

`P = I² × R = 4² × 0,011 = 0,176 Вт`.

С учётом роста сопротивления горячего MOSFET примерно до 1,4–1,6 от значения при
25 °C расчётная потеря становится около 0,25–0,28 Вт. Это допустимый уровень для
SO-8 только при нормальных медных площадках; температура проверяется на прототипе.

## Официальные источники

- Espressif ESP32-C3-MINI-1 datasheet: <https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf>
- Espressif ESP32-C3 hardware design guidelines: <https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html>
- Diodes AP63200/AP63201/AP63203/AP63205 datasheet: <https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf>
- Würth Elektronik WE-PD2SA, order code 784787039: <https://www.we-online.com/en/components/products/WE-PD2SA>
- TI TLV760 datasheet: <https://www.ti.com/lit/ds/symlink/tlv760.pdf>
- TI SN74AHCT1G125 datasheet: <https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf>
- Diodes 2N7002 datasheet: <https://www.diodes.com/datasheet/download/2N7002.pdf>
- Diodes DMP4015SSS datasheet: <https://www.diodes.com/datasheet/download/DMP4015SSS.pdf>
- TI reverse-polarity application note: <https://www.ti.com/lit/an/slvae57b/slvae57b.pdf>
- Littelfuse 0469005: <https://www.littelfuse.com/de/products/fuses-overcurrent-protection/fuses/surface-mount-fuses/thin-film-chip-fuses/469/0469005>
- TI TPD2EUSB30 datasheet: <https://www.ti.com/lit/ds/symlink/tpd2eusb30a.pdf>
- Nexperia PESD5V0S1BA datasheet: <https://assets.nexperia.com/documents/data-sheet/PESD5V0S1BA.pdf>
- GCT USB4105 drawing: <https://gct.co/files/drawings/usb4105.pdf>
- WS2811 datasheet: <https://www.mouser.com/datasheet/2/737/WS2811-607752.pdf>

## Перед началом PCB

- Сверить каждую нумерацию вывода с посадочным чертежом конкретного MPN.
- Зафиксировать ordering suffix USB4105, точный энкодер и клеммы после механики.
- Назначить footprint модулю ESP32-C3 с полным antenna keepout.
- Проверить derating MLCC по постоянному напряжению и фактическую ёмкость при bias.
- Подтвердить предохранитель измеренным пусковым током ленты и данными БП.
