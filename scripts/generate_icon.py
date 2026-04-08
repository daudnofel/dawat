#!/usr/bin/env python3
"""
Generate the Dawat app icon — dark background with radial gold glow,
centered Arabic "د" in champagne gold.

Outputs:
  assets/images/icon.png             (1024x1024 — iOS / general)
  assets/images/splash-icon.png      (1024x1024 — splash, transparent dark bg)
  assets/images/android-icon-foreground.png  (1024x1024 — adaptive foreground)
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "images"

SIZE = 1024
DARK = (13, 13, 13, 255)            # #0D0D0D
GOLD_LIGHT = (255, 223, 161)        # #FFDFA1
GOLD_MID = (230, 194, 122)          # #E6C27A
GOLD_DEEP = (201, 168, 76)          # #C9A84C

ARABIC_FONT = "/System/Library/Fonts/SFArabic.ttf"


def radial_glow(size: int) -> Image.Image:
    """Soft champagne gold radial glow on a dark background."""
    img = Image.new("RGBA", (size, size), DARK)
    cx, cy = size / 2, size / 2
    max_r = size * 0.75

    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = overlay.load()
    for y in range(size):
        for x in range(size):
            dx = (x - cx) / max_r
            dy = (y - cy) / max_r
            d = math.sqrt(dx * dx + dy * dy)
            if d >= 1:
                continue
            # ease-out falloff
            t = (1 - d) ** 2
            a = int(60 * t)  # max alpha 60 — subtle
            pixels[x, y] = (*GOLD_LIGHT, a)
    img = Image.alpha_composite(img, overlay)
    return img


def draw_dal(img: Image.Image) -> None:
    """Draw the centered Arabic dal in gold with a soft inner glow."""
    draw = ImageDraw.Draw(img)
    # Big and confident — about 65% of the canvas height
    font = ImageFont.truetype(ARABIC_FONT, int(SIZE * 0.72))
    char = "د"

    # Measure
    bbox = draw.textbbox((0, 0), char, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (SIZE - w) / 2 - bbox[0]
    y = (SIZE - h) / 2 - bbox[1] - SIZE * 0.02  # slight optical lift

    # Glow underneath — render the glyph onto a separate layer, blur, composite
    glow_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.text((x, y), char, font=font, fill=(*GOLD_LIGHT, 180))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=24))
    img.alpha_composite(glow_layer)

    # Crisp glyph on top
    draw.text((x, y), char, font=font, fill=(*GOLD_LIGHT, 255))


def make_icon() -> Image.Image:
    img = radial_glow(SIZE)
    draw_dal(img)
    return img


def make_foreground() -> Image.Image:
    """Adaptive icon foreground — transparent bg, just the dal."""
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_dal(img)
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    icon = make_icon()
    icon_path = OUT_DIR / "icon.png"
    icon.convert("RGB").save(icon_path, "PNG", optimize=True)
    print(f"wrote {icon_path}")

    splash = make_icon()
    splash_path = OUT_DIR / "splash-icon.png"
    splash.save(splash_path, "PNG", optimize=True)
    print(f"wrote {splash_path}")

    fg = make_foreground()
    fg_path = OUT_DIR / "android-icon-foreground.png"
    fg.save(fg_path, "PNG", optimize=True)
    print(f"wrote {fg_path}")


if __name__ == "__main__":
    main()
