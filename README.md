# Автономный контроллер адресной LED-ленты: TypeScript → KiCad

Проект начат на основе рабочего прототипа Arduino Nano. Текущая архитектура -
автономный контроллер трёхпроводной 12-вольтовой WS2811-ленты на
`ESP32-C3-MINI-1-N4X` с локальным энкодером, USB-C и дополнительными сетевыми
функциями. Управление лентой сохраняется при отсутствии Wi-Fi и интернета.

Текущие инженерные решения и открытые вопросы находятся в `HARDWARE.md`, подробная
концепция — в `docs/ENGINEERING_CONCEPT.md`.

Код в `src/` является источником истины. Команда генерации создаёт Circuit JSON и открываемые в KiCad файлы в `build/`. Сгенерированные файлы вручную не редактируются.

## Подготовка

```powershell
npm.cmd install
npm.cmd run verify
```

В PowerShell используется `npm.cmd`, потому что системная политика может блокировать `npm.ps1`.

## Основные команды

```powershell
npm.cmd run dev
npm.cmd run generate
npm.cmd run lint
npm.cmd test
npm.cmd run erc
npm.cmd run drc
npm.cmd run audit
npm.cmd run schematic-pdf
npm.cmd run render
npm.cmd run verify
```

`generate` создаёт:

- `build/circuit.json` — компактное машинное представление схемы и платы;
- `build/kicad/ws2811_esp32c3_controller.kicad_pro` - проект KiCad;
- `build/kicad/ws2811_esp32c3_controller.kicad_sch` - структурированная схема A2
  с восемью функциональными блоками;
- `build/kicad/ws2811_esp32c3_controller.kicad_pcb` - пустая заготовка PCB;
- `output/pdf/ws2811_esp32c3_controller-schematic.pdf` - PDF для визуального
  контроля после `npm.cmd run schematic-pdf`.

`erc` и `drc` блокируют сборку при ошибках. `audit` отдельно сохраняет также предупреждения; известные ограничения описаны в `docs/KNOWN_TOOLCHAIN_LIMITATIONS.md`.

Команды автоматически ищут `kicad-cli`. На этом компьютере используется `D:\KiCad\bin\kicad-cli.exe`. Для другого расположения можно задать переменную `KICAD_CLI`.

Правила оформления и границы учёта IPC зафиксированы в
`docs/SCHEMATIC_DRAFTING_STANDARD.md`. PCB и корпус на текущем этапе не
разрабатываются.

Перед заказом платы автоматических проверок недостаточно: схема, footprints, слои, 3D и производственные файлы должны быть просмотрены человеком.
