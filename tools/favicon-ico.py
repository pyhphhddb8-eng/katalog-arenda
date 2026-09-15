#!/usr/bin/env python3
"""Собирает docs/favicon.ico из docs/favicon.svg.

Запуск: python3 tools/favicon-ico.py

Зачем: часть сервисов и старых браузеров просит именно /favicon.ico и не
умеет запрашивать svg. Проверка Lighthouse от 14.09.2026 показала на этом
месте 404.

Как: svg рисуется headless Chrome в PNG 32×32, PNG кладётся в контейнер ICO
(такой ICO понимают все браузеры, начиная с Vista, и Safari). Внешних
зависимостей нет — ни PIL, ни ImageMagick.
"""
import pathlib
import struct
import subprocess
import tempfile

KOREN = pathlib.Path(__file__).resolve().parent.parent
SVG = KOREN / "docs" / "favicon.svg"
ICO = KOREN / "docs" / "favicon.ico"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
STORONA = 32


def png_iz_svg():
    """Отрисовать svg в PNG 32×32 с прозрачным фоном."""
    stranica = (
        "<!doctype html><meta charset=utf-8>"
        "<style>html,body{margin:0;padding:0;background:transparent}"
        f"svg{{display:block;width:{STORONA}px;height:{STORONA}px}}</style>"
        + SVG.read_text(encoding="utf-8")
    )
    with tempfile.TemporaryDirectory() as vremenno:
        vremenno = pathlib.Path(vremenno)
        istochnik = vremenno / "znachok.html"
        istochnik.write_text(stranica, encoding="utf-8")
        snimok = vremenno / "znachok.png"
        subprocess.run(
            [
                CHROME, "--headless", "--disable-gpu",
                f"--window-size={STORONA},{STORONA}",
                "--default-background-color=00000000",
                "--hide-scrollbars",
                f"--screenshot={snimok}",
                "--virtual-time-budget=2000",
                istochnik.as_uri(),
            ],
            check=True,
            capture_output=True,
        )
        return snimok.read_bytes()


def ico_iz_png(png):
    zagolovok = struct.pack("<HHH", 0, 1, 1)  # резерв, тип «икона», одна штука
    zapis = struct.pack(
        "<BBBBHHII", STORONA, STORONA, 0, 0, 1, 32, len(png), 6 + 16
    )
    return zagolovok + zapis + png


if __name__ == "__main__":
    ICO.write_bytes(ico_iz_png(png_iz_svg()))
    print(f"docs/favicon.ico готов: {ICO.stat().st_size} байт")
