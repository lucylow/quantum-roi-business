#!/usr/bin/env python3
"""Generate the permanent QR assets included with the GitHub release package."""

from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H

ROOT = Path(__file__).resolve().parent.parent
QR_DIR = ROOT / "qr"

ASSETS = {
    "IOS_EXPO_GO_APP_STORE_QR.png": "https://apps.apple.com/us/app/expo-go/id982107779",
    "GITHUB_REPOSITORY_QR.png": "https://github.com/lucylow/quantum-roi-business",
    "MOBILE_REDESIGN_REFERENCE_QR.png": "https://github.com/lucylow/Quantum-ROI-MobileMockupRedesign",
}


def create_qr(filename: str, value: str) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=14,
        border=4,
    )
    qr.add_data(value)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    image.save(QR_DIR / filename)


def main() -> None:
    QR_DIR.mkdir(exist_ok=True)
    for filename, value in ASSETS.items():
        create_qr(filename, value)
        (QR_DIR / f"{Path(filename).stem}.txt").write_text(f"{value}\n", encoding="utf-8")
    print(f"Generated {len(ASSETS)} QR assets in {QR_DIR}")


if __name__ == "__main__":
    main()
