# Автономный контроллер адресной LED-ленты: TypeScript → KiCad

Проект начат на основе рабочего прототипа Arduino Nano. Текущий этап — техническое
задание и выбор архитектуры собственной платы на ATmega328PB. До подтверждения
точного типа и напряжения LED-ленты схема в `src/board.tsx` остаётся тестовой.

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
npm.cmd run render
npm.cmd run verify
```

`generate` создаёт:

- `build/circuit.json` — компактное машинное представление схемы и платы;
- `build/kicad/template_board.kicad_pro` — проект KiCad;
- `build/kicad/template_board.kicad_sch` — схема KiCad;
- `build/kicad/template_board.kicad_pcb` — плата KiCad.

`erc` и `drc` блокируют сборку при ошибках. `audit` отдельно сохраняет также предупреждения; известные ограничения описаны в `docs/KNOWN_TOOLCHAIN_LIMITATIONS.md`.

Команды автоматически ищут `kicad-cli`. На этом компьютере используется `D:\KiCad\bin\kicad-cli.exe`. Для другого расположения можно задать переменную `KICAD_CLI`.

## Начало реального проекта

1. Скопировать эту папку и переименовать проект.
2. Заполнить `HARDWARE.md`.
3. Изменить имя проекта в `src/board.tsx`.
4. Заменить тестовые R1/D1 реальными функциональными блоками.
5. После каждого шага запускать `npm.cmd run verify`.

Перед заказом платы автоматических проверок недостаточно: схема, footprints, слои, 3D и производственные файлы должны быть просмотрены человеком.
