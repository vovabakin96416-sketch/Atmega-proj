# Проверка перед заказом компонентов и первого прототипа

Дата: 2026-07-16. Ревизия схемы: A. Исходник: `src/board.tsx`.

## Итоговый вердикт: NOT READY

Электрическая архитектура после исправления питания буфера пригодна для перехода
к макетированию и разработке PCB, но выпуск платы/PCBA пока запрещён. ERC с нулём
нарушений подтверждает связность только в пределах модели. Он не подтверждает
полярность pad mapping, геометрию footprints, устойчивость DC/DC, USB compliance,
нагрев или работу реальной ленты.

Блокирующие проверки перед изготовлением:

1. импортировать и сверить с официальными чертежами footprints
   `ESP32-C3-MINI-1-N4X` и `784787039`, включая antenna keepout;
2. доказать соответствие source-портов tscircuit реальным pad numbers. В частности,
   встроенный diode-примитив использует `pin1=anode`, тогда как стандартные KiCad
   diode footprints обычно используют `pad 1=K`; D1/D2/D3/D4/D7 нельзя выпускать
   в PCB без явного адаптера и визуальной проверки;
3. проверить алфавитно-цифровые pads USB4105 и именованные pads энкодера против
   последовательных номеров source-компонента;
4. получить графики DC-bias выбранных C3/C5/C6 и подтвердить эффективную ёмкость;
5. измерить пусковой и установившийся ток конкретной ленты/БП и подтвердить F1;
6. спроектировать PCB, пройти DRC, 2D/3D и ручной pin-1/polarity review. PCB в этом
   этапе намеренно не разрабатывалась.

## Повторная проверка узлов

| Узел              | Результат                                                                                                                                                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Вход 12 В         | J1 `1715721`, номинальный источник 12 В/5 А. Проектный максимум 4,2 А; реальная лента ещё не измерена.                                                                                                                                                                                                                  |
| F1                | Исправлен на `0451007.MRL`, 7 А. 5 А при типовом 75% thermal derating даёт только 3,75 А и не покрывает 4,2 А; 7 А даёт 5,25 А. Финальный time-current/inrush тест остаётся BLOCKED.                                                                                                                                    |
| Переполюсовка     | Q1 `DMP4015SSS-13`: pads 1–3 source, 4 gate, 5–8 drain; drains к входу, sources к защищённой шине. D1 `MMSZ5242B-7-F` ограничивает abs(VGS) примерно 12 В.                                                                                                                                                              |
| TVS               | `SMBJ15A`: VRWM 15 В выше 13,2 В для 12 В +10%; VBR 16,7–18,5 В, типовой VCL 24,4 В. Не защищает от длительного перенапряжения; энергия импульса зависит от БП и проводки.                                                                                                                                              |
| OR-ing 3,3 В      | D3/D4 теперь точные `SS34-E3/57T`, 40 В/3 А. Они блокируют обратную подачу USB→12 В и 12 В→USB. Pad polarity остаётся PCB blocker.                                                                                                                                                                                      |
| AP63203 / 3,3 В   | U1 pin 1 FB, 2 EN, 3 VIN, 4 GND, 5 SW, 6 BST проверены. 10 uF/50 V input, 100 nF bootstrap, L=3,9 uH, 2x22 uF output соответствуют типовой схеме.                                                                                                                                                                       |
| TLV76050          | Физические pins проверены по исправленной rev A TI: 1 OUT, 2 IN, 3 GND. C7 увеличен до 1 uF/50 V, C8 до 1 uF/10 V.                                                                                                                                                                                                      |
| 5 V buffer supply | Критическая D5/D6 Schottky-схема удалена. Добавлен reverse-blocking automatic mux `TPS2113APWR`: 1 STAT, 2 EN, 3 VSNS, 4 ILIM, 5 GND, 6 IN2, 7 OUT, 8 IN1. EN=0 и VSNS=0 выбирают более высокий вход; R18=402 Ohm задаёт около 1,24 А nominal current limit. R19=100 kOhm подтягивает диагностический STAT к V5_BUFFER. |
| ESP32-C3          | Питание 3,0–3,6 В, источник ≥0,5 А. Проверены pins 3=3V3, 5=IO2, 8=EN, 22=IO8, 23=IO9, 26/27=USB D-/D+, 30/31=RX/TX и все GND/NC по module datasheet v2.2. Footprint ещё BLOCKED.                                                                                                                                       |
| EN/BOOT/strap     | EN: 10 kOhm/1 uF, tau=10 ms. GPIO2/8/9 подтянуты к 3,3 В; BOOT замыкает GPIO9 на GND, большой ёмкости на strap нет. SPI boot и download комбинации допустимы.                                                                                                                                                           |
| USB-C             | `USB4105-GF-A-060`, CC1 и CC2 имеют отдельные 5,1 kOhm Rd. D-=GPIO18, D+=GPIO19 через TPD2EUSB30 и 22 Ohm. SBU NC. USB pad mapping и impedance/layout проверяются на PCB.                                                                                                                                               |
| Энкодер/индикатор | `EC11E09244AQ`, 18 detents/9 pulses; A/B по 10 kOhm+10 nF, switch 10 kOhm+100 nF. D8 `LTST-C190KGKT` через 1 kOhm. Firmware debounce обязателен.                                                                                                                                                                        |
| DATA buffer       | `SN74AHCT1G125DBVR`: pins 1 /OE, 2 A, 3 GND, 4 Y, 5 VCC. /OE по умолчанию high; Q2 включает его только GPIO5. 100 Ohm и PESD у J2.                                                                                                                                                                                      |
| WS2811 output     | J2 `1715734`: pin 1 +12 V, pin 2 DATA, pin 3 GND. Реальную маркировку шелкографии и mating-wire order проверить в 2D/3D.                                                                                                                                                                                                |
| UART              | J4 `TSW-104-07-G-S`: 1=3V3, 2=GND, 3=TX, 4=RX. Это 3,3-вольтовый UART; внешний 5 V адаптер запрещён.                                                                                                                                                                                                                    |

## Расчёты питания и потерь

### Баланс токов

Принята консервативная неизвестная лента: `60 × 60 mA = 3,6 A` при 12 В.

| Шина              | Расчётный максимум | Примечание                                                           |
| ----------------- | -----------------: | -------------------------------------------------------------------- |
| 12 V strip        |             3,60 A | 43,2 W; подтвердить конкретной лентой                                |
| 3,3 V             |             0,50 A | требование Espressif к источнику; Wi-Fi peak около 0,35 A            |
| 5 V buffer        |            2,25 mA | AHCT worst input-related ICC + /OE/STAT pull-ups + dynamic allowance |
| 12 V logic input  |            0,162 A | `3,3×0,5/(12×0,85)`                                                  |
| Полный 12 V input |       около 3,77 A | 3,60 A + buck input + TLV input; design ceiling 4,2 A                |
| USB input         |       около 0,41 A | `3,3×0,5/(4,75×0,85)` плюс малый buffer load                         |

AP63203 рассчитан на 2 А, то есть имеет четырёхкратный запас к 0,5 А. USB-only
режим близок к 500 mA USB 2.0 budget: до enumeration прошивка должна не включать
Wi-Fi/максимальную нагрузку, либо USB-политика должна быть отдельно подтверждена.

### Дроссель AP63203

Худший допуск `Lmin=3,9 uH×0,75=2,925 uH`, `fmin=1,1 MHz×0,94=1,034 MHz`.

`DeltaI = Vout×(Vin−Vout)/(Vin×Lmin×fmin)`

- при 12 В: `DeltaI≈0,79 A p-p`, peak при 0,5 А ≈0,90 А;
- при 24,4 В TVS-клампа: `DeltaI≈0,94 A p-p`, peak ≈0,97 А;
- даже при 2 А load peak ≈2,40–2,47 А, ниже типового `Isat=4 A` и рядом, но ниже
  минимального current limit AP63203 2,5 А.

`784787039`: Irated 3,8 А, Isat typical 4 А, DCR max 20 mOhm. Электрический запас
достаточен; footprint и температура проверяются на PCB.

### Конденсаторы

- C1 35 В выше 24,4 В TVS clamp; отношение 24,4/35=70%. ESR/ripple/inrush — стенд.
- C3 изменён на 10 uF/50 В, 1210: 25 В было слишком близко к TVS clamp.
- C5/C6 22 uF/10 В X7R имеют номинальное напряжение с запасом, но их effective C
  при 3,3 В должна быть подтверждена vendor DC-bias curves.
- C7 1 uF/50 В и C8 1 uF/10 В превышают минимум TLV760 0,1 uF.
- Все 50-вольтовые 100 nF на 12 В и 10-вольтовые MLCC на 3,3/5 В имеют
  достаточный voltage rating; монтажные выбросы всё равно проверяются щупом.

### Исправление питания AHCT

Исходная цепь `TLV76050 -> D5 -> V5_BUFFER` формально не работоспособна во всём
диапазоне: LDO minimum по температуре `5,0×(1−5%)=4,75 В`, и любой Schottky drop
мог опустить VCC ниже 4,5 В AHCT.

После замены на TPS2113A:

- `V_LDO,min=4,75 В`;
- `R_ON,max=0,15 Ohm` при высокой температуре;
- `I_BUFFER,max=2,25 mA`;
- `V_BUFFER,min=4,75−0,00225×0,15=4,74966 В`;
- запас к 4,5 В равен 0,24966 В.

Для USB при гарантированных 4,75 В на J3 получается тот же нижний предел. Верхний
USB VBUS 5,5 В равен recommended operating maximum AHCT, поэтому положительного запаса
к hot-plug overshoot нет: USB VBUS и V5_BUFFER обязательно смотреть осциллографом.

### Тепло и защита

- TLV760 при 12 В, `Iout=2,25 mA`, `Ignd,max=5 mA`:
  `Pd≈12×(2,25+5)mA−5×2,25mA=75,75 mW`; при `thetaJA≈275 C/W`
  `DeltaT≈20,7 C`. При длительных >13,2 В режим не разрешён.
- Q1 при 4,2 А и горячем `RDS(on)≈11mOhm×1,6=17,6mOhm`:
  `P≈0,31 W`, drop≈74 mV. Нужна медь и thermal test.
- F1 при 4,2 А и 9 mOhm: около 0,16 W. Time-current и inrush не подтверждены.
- D3: около 0,16 А×0,5 В=0,08 W. D4 USB worst: 0,41 А×0,5 В=0,21 W.
- TPS2113A loss при 2,25 mA меньше 1 uW в switch path.
- SMBJ15A не является защитой от постоянно поданного 24 В; F1 отключит только
  источник с достаточным fault current/energy.

### DATA и энкодер

При VCC=4,5 В AHCT гарантирует `VIH<=2,0 В`; 3,3 В ESP имеет хороший входной
запас. Для лёгкой высокоомной нагрузки `VOH>=4,4 В`, а худший WS2811 threshold при
VDD=5,5 В равен `0,7×5,5=3,85 В`: DC margin 0,55 В. Гарантия `VOH=3,8 В` при
8 mA уже недостаточна, поэтому вывод относится только к входу WS2811 с малым током;
кабель, ESD capacitance и ringing проверяются осциллографом у первого пикселя.

R16=100 Ohm даёт tau около 5 ns при 50 pF и 20 ns при 200 pF. Это не мешает
800 kHz номинально, но номинал следует сделать tuneable 33/68/100 Ohm.

Encoder A/B: tau=10 kOhm×10 nF=100 us, fc≈1,59 kHz. Switch: tau=1 ms,
fc≈159 Hz. При 60 rpm и 9 pulses/rev фундаментальная частота всего 9 Hz; RC не
съедает нормальные повороты, но не гарантирует устранение contact bounce.

EN tau=10 ms; 75% уровня достигается примерно за 13,9 ms, после требуемого
strap hold порядка 3 ms.

## Физические выводы и footprints

| Компонент      | Проверено по package drawing                             | PCB release                                           |
| -------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| Q1 SO-8        | 1–3 S, 4 G, 5–8 D                                        | готово после copper/thermal layout                    |
| U1 TSOT-26     | 1 FB, 2 EN, 3 VIN, 4 GND, 5 SW, 6 BST                    | numeric pads совпадают                                |
| U3 DBZ         | 1 OUT, 2 IN, 3 GND                                       | numeric pads совпадают                                |
| U6 TSSOP-8     | 1 STAT, 2 EN, 3 VSNS, 4 ILIM, 5 GND, 6 IN2, 7 OUT, 8 IN1 | numeric pads совпадают                                |
| U5 DBV         | 1 /OE, 2 A, 3 GND, 4 Y, 5 VCC                            | numeric pads совпадают                                |
| Q2 SOT-23      | 1 G, 2 S, 3 D                                            | numeric pads совпадают                                |
| U4 DRT         | 1 D+, 2 D-, 3 GND                                        | machine test added                                    |
| U2 module      | pins 1..53 сверены с v2.2                                | BLOCKED: official land pattern/keepout import         |
| L1             | body 7,8x7,0 мм; electrical terminals non-polar          | BLOCKED: vendor CAD import                            |
| J1/J2/J4       | numeric pin order checked                                | silkscreen/mating review remains                      |
| J3/ENC1        | logical contacts checked                                 | BLOCKED: named-pad adapter/visual review              |
| D1/D2/D3/D4/D7 | electrical anode/cathode checked                         | BLOCKED: tscircuit anode pin1 vs KiCad K pad1 mapping |

## Моделирование

`simulations/power_path.cir` выполнена KiCad ngspice 46 через
`scripts/run-ngspice.py`. Результаты в `power_path_results.txt`:

- 3,3 В в USB интервале: minimum 3,260 В при модельной нагрузке 0,5 А;
- V5_BUFFER от USB: minimum 4,938 В в номинальной 5 В модели;
- V5_BUFFER от worst-case LDO: 4,74966 В;
- reverse-polarity protected rail около 0 В, source current только численная утечка;
- приближённый 25 А/200 us импульс: максимум около 21,1 В.

AP63203 и TPS2113A представлены behavioral/averaged blocks, SS34/SMBJ —
приближёнными моделями. Поэтому симуляция не подтверждает loop stability, EMI,
реальную surge energy, USB compliance, inrush, hot-plug ringing или температуру.

`src/logic.sim.test.ts` — эквивалент Wokwi для quadrature-state, RC, reset-time
tri-state и WS2811 timing/level margins. Это не модель кремния ESP32/WS2811 и не
проверка будущей прошивки.

## Результаты автоматических проверок

- `npm run lint`: PASS;
- `npm test -- --run`: PASS, 10/10 tests;
- `npm run generate`: PASS;
- `npm run erc`: PASS, 0 violations в свежем KiCad 10.0.4 JSON report;
- `npm run verify`: lint/tests/generate/ERC проходят, затем команда ожидаемо
  останавливается на DRC: 28 violations и 70 unconnected items, потому что PCB
  намеренно не разработана и `routingDisabled`. DRC не подавлен и остаётся
  обязательным BLOCKED-критерием этапа PCB.

## Что можно проверить только прототипом

- реальный peak/average ток ленты и пусковой ток C1+ленты;
- температура F1, Q1, клемм, дорожек, L1, U1 и TLV760;
- DC/DC startup/overshoot/ripple/loop behavior и RF/EMI;
- USB enumeration, pre-enumeration current и hot-plug waveform;
- EN/strap уровни на реальном power ramp;
- DATA waveform на J2 и у первого WS2811 с реальным кабелем;
- debounce энкодера, RF-дальность и влияние корпуса/силовой проводки.

## Рекомендации для будущей PCB

Предусмотреть test points: `VIN_RAW`, `VIN_FUSED`, `V12_PROTECTED`, `LOGIC_INPUT`,
`3V3`, `3V3_ESP`, `5V_LDO`, `5V_BUFFER`, `EN`, `GPIO9_BOOT`, `USB_D+`, `USB_D-`,
`DATA_3V3`, `DATA_5V_RAW`, `DATA_OUT`, `UART_TX`, `UART_RX` и несколько GND рядом
со щупами. USB test pads делать минимальными и без длинных stubs.

Предусмотреть опции: R16 как 33/68/100 Ohm populate-to-tune; 0 Ohm разрыв питания
ESP для измерения тока; 0 Ohm link между USB shield и GND с возможностью замены на
RC/EMI network. Не ставить перемычки, обходящие F1, Q1, TVS или OR-ing.

## Разрешённый заказ

Разрешён малый sample-order позиций `ORDER_SAMPLE` из `BOM.csv`, а также несколько
U2/L1 для механического макета. Запрещены финальный объём F1/MLCC, заказ PCB/PCBA,
панелизация, трафарет и production reels до закрытия всех BLOCKED-пунктов.
