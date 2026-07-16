# Карта проекта

- `src/board.tsx` — исходник схемы контроллера ESP32-C3: питание, защита, USB-C,
  энкодер, DATA-буфер и внешние разъёмы; PCB-разводка на этом этапе отключена.
- `src/generate.tsx` — генерация Circuit JSON и файлов KiCad.
- `src/board.test.tsx` — базовые проверки результата генерации.
- `src/logic.sim.test.ts` — эквивалентная модель quadrature/RC/reset/DATA timing.
- `scripts/kicad-check.mjs` — запуск ERC, DRC, PDF-экспорта схемы и 3D-рендера через KiCad CLI.
- `scripts/run-ngspice.py` — воспроизводимый запуск power-path SPICE через KiCad ngspice DLL.
- `docs/KNOWN_TOOLCHAIN_LIMITATIONS.md` — известные предупреждения и границы автоматизации.
- `docs/ENGINEERING_CONCEPT.md` — архитектура, расчёты, риски, типичные ошибки и план испытаний контроллера.
- `docs/DATASHEET_DECISIONS.md` — выбранные MPN, проверенные параметры и официальные даташиты.
- `docs/BOM.md` и `docs/BOM.csv` — окончательный human/machine-readable BOM со статусами заказа.
- `docs/PREORDER_VALIDATION.md` — расчёты, pin/footprint audit, риски и verdict.
- `docs/BRINGUP_CHECKLIST.md` — безопасная последовательность первого включения.
- `simulations/` — SPICE netlist, результат и явные ограничения моделей.
- `docs/SCHEMATIC_DRAFTING_STANDARD.md` — правила оформления, границы учёта IPC и выпускные проверки.
- `output/pdf/` — итоговый PDF схемы для визуального контроля; создаётся командой `npm run schematic-pdf`.
- `build/` — автоматически созданные файлы; вручную не редактировать.
- `AGENTS.md` — обязательные правила работы над аппаратным проектом.
- `HARDWARE.md` — техническое задание, ограничения и проверка компонентов.
- `ROADMAP.md` — этапы и текущий статус.
- `README.md` — команды и быстрый старт.
