"""Run the repository SPICE deck through KiCad's bundled ngspice shared library."""

from __future__ import annotations

import ctypes
import os
import pathlib
import shutil
import sys
import tempfile


ROOT = pathlib.Path(__file__).resolve().parents[1]
NETLIST = ROOT / "simulations" / "power_path.cir"
RESULT = ROOT / "simulations" / "power_path_results.txt"
KICAD_BIN = pathlib.Path(r"D:\KiCad\bin")
NGSPICE = KICAD_BIN / "ngspice.dll"


def main() -> int:
    if not NGSPICE.exists():
        print(f"BLOCKED: KiCad ngspice library not found at {NGSPICE}", file=sys.stderr)
        return 2

    os.add_dll_directory(str(KICAD_BIN))
    library = ctypes.CDLL(str(NGSPICE))
    messages: list[str] = []

    send_char_type = ctypes.CFUNCTYPE(
        ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_void_p
    )
    send_stat_type = ctypes.CFUNCTYPE(
        ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_void_p
    )
    exit_type = ctypes.CFUNCTYPE(
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_bool,
        ctypes.c_bool,
        ctypes.c_int,
        ctypes.c_void_p,
    )
    bg_type = ctypes.CFUNCTYPE(
        ctypes.c_int, ctypes.c_bool, ctypes.c_int, ctypes.c_void_p
    )

    @send_char_type
    def send_char(text: bytes, _identifier: int, _user: int) -> int:
        messages.append(text.decode("utf-8", errors="replace"))
        return 0

    @send_stat_type
    def send_stat(text: bytes, _identifier: int, _user: int) -> int:
        messages.append(text.decode("utf-8", errors="replace"))
        return 0

    @exit_type
    def controlled_exit(
        status: int,
        immediate: bool,
        quit_exit: bool,
        _identifier: int,
        _user: int,
    ) -> int:
        messages.append(
            f"controlled_exit status={status} immediate={immediate} quit={quit_exit}"
        )
        return 0

    @bg_type
    def background(_running: bool, _identifier: int, _user: int) -> int:
        return 0

    library.ngSpice_Init.argtypes = [
        send_char_type,
        send_stat_type,
        exit_type,
        ctypes.c_void_p,
        ctypes.c_void_p,
        bg_type,
        ctypes.c_void_p,
    ]
    library.ngSpice_Init.restype = ctypes.c_int
    library.ngSpice_Command.argtypes = [ctypes.c_char_p]
    library.ngSpice_Command.restype = ctypes.c_int

    status = library.ngSpice_Init(
        send_char, send_stat, controlled_exit, None, None, background, None
    )
    if status != 0:
        print(f"ngSpice_Init failed: {status}", file=sys.stderr)
        return status

    # ngspice's Windows command parser does not reliably decode the Cyrillic
    # OneDrive path, so the immutable input deck is copied to a temporary ASCII
    # path before it is sourced.
    with tempfile.TemporaryDirectory(prefix="ws2811_spice_") as temporary:
        temporary_netlist = pathlib.Path(temporary) / "power_path.cir"
        shutil.copyfile(NETLIST, temporary_netlist)
        for command in (f"source {temporary_netlist.as_posix()}", "run"):
            status = library.ngSpice_Command(command.encode("ascii"))
            if status != 0:
                print(
                    f"ngspice command failed ({status}): {command}", file=sys.stderr
                )
                print("\n".join(messages), file=sys.stderr)
                return status

    output = "\n".join(messages) + "\n"
    RESULT.write_text(output, encoding="utf-8")
    print(output)
    required = (
        "v3_min_usb",
        "v5_min_usb",
        "v5_min_12v",
        "reverse_rail_max",
        "reverse_input_current_max",
        "tvs_clamp_max",
    )
    return 0 if all(name in output for name in required) else 3


if __name__ == "__main__":
    raise SystemExit(main())
