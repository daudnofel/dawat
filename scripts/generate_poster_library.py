#!/usr/bin/env python3
"""
DAW-22 Phase 3 — Generate the starter poster library.

Creates ~24 poster images (1280x1280) with Islamic motifs, organized by
event category. Each poster has:
  - A deep, rich gradient background derived from the category's palette
  - A large centered Arabic/English label
  - Geometric decorative borders

Output: assets/poster-library/{category}/{id}.jpg + {id}_thumb.jpg
"""
import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "poster-library"
SIZE = 1280
THUMB_SIZE = 320

# System fonts
ARABIC_FONT = "/System/Library/Fonts/SFArabic.ttf"
MANROPE = str(ROOT / "node_modules/@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf")

# ─── Category definitions ──────────────────────────────────────

CATEGORIES = {
    "eid": {
        "gradient": [(13, 13, 10), (42, 31, 10)],
        "accent": (240, 192, 64),
        "label_en": "Eid\nMubarak",
        "label_ar": "عيد مبارك",
        "count": 3,
    },
    "ramadan": {
        "gradient": [(10, 22, 40), (26, 39, 68)],
        "accent": (201, 168, 76),
        "label_en": "Ramadan\nKareem",
        "label_ar": "رمضان كريم",
        "count": 3,
    },
    "iftar": {
        "gradient": [(42, 21, 5), (74, 40, 16)],
        "accent": (245, 158, 11),
        "label_en": "Iftar\nGathering",
        "label_ar": "إفطار",
        "count": 2,
    },
    "nikkah": {
        "gradient": [(26, 10, 15), (58, 21, 32)],
        "accent": (232, 160, 176),
        "label_en": "Nikkah",
        "label_ar": "نكاح",
        "count": 3,
    },
    "walima": {
        "gradient": [(26, 10, 30), (45, 18, 51)],
        "accent": (212, 160, 217),
        "label_en": "Walima",
        "label_ar": "وليمة",
        "count": 2,
    },
    "halaqa": {
        "gradient": [(10, 26, 10), (15, 51, 21)],
        "accent": (129, 199, 132),
        "label_en": "Halaqa",
        "label_ar": "حلقة",
        "count": 2,
    },
    "jummah": {
        "gradient": [(10, 34, 24), (14, 68, 48)],
        "accent": (76, 175, 80),
        "label_en": "Jumu'ah",
        "label_ar": "جمعة مباركة",
        "count": 2,
    },
    "fundraiser": {
        "gradient": [(13, 13, 13), (26, 26, 26)],
        "accent": (201, 168, 76),
        "label_en": "Fundraiser",
        "label_ar": "تبرع",
        "count": 2,
    },
    "community": {
        "gradient": [(5, 10, 26), (13, 20, 50)],
        "accent": (96, 165, 250),
        "label_en": "Community\nEvent",
        "label_ar": "حدث مجتمعي",
        "count": 2,
    },
    "mehndi": {
        "gradient": [(26, 26, 8), (42, 40, 10)],
        "accent": (232, 192, 64),
        "label_en": "Mehndi",
        "label_ar": "مہندی",
        "count": 2,
    },
}


def radial_glow(img: Image.Image, center: tuple, radius: int, color: tuple, max_alpha: int = 40):
    """Paint a soft radial glow onto an RGBA image."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    px = overlay.load()
    cx, cy = center
    for y in range(max(0, cy - radius), min(img.height, cy + radius)):
        for x in range(max(0, cx - radius), min(img.width, cx + radius)):
            dx = (x - cx) / radius
            dy = (y - cy) / radius
            d = math.sqrt(dx * dx + dy * dy)
            if d >= 1:
                continue
            t = (1 - d) ** 2
            a = int(max_alpha * t)
            px[x, y] = (*color, a)
    img.alpha_composite(overlay)


def draw_geometric_border(draw: ImageDraw.Draw, size: int, accent: tuple, alpha: int = 60):
    """Draw a subtle geometric border frame (thin lines + corner marks)."""
    inset = int(size * 0.08)
    color = (*accent, alpha)
    lw = 2

    # Outer rect
    draw.rectangle([inset, inset, size - inset, size - inset], outline=color, width=lw)

    # Inner rect
    inset2 = int(size * 0.11)
    draw.rectangle([inset2, inset2, size - inset2, size - inset2], outline=(*accent, alpha // 2), width=1)

    # Corner diamonds
    corner_size = int(size * 0.04)
    for cx, cy in [(inset, inset), (size - inset, inset), (inset, size - inset), (size - inset, size - inset)]:
        diamond = [
            (cx, cy - corner_size),
            (cx + corner_size, cy),
            (cx, cy + corner_size),
            (cx - corner_size, cy),
        ]
        draw.polygon(diamond, fill=(*accent, alpha))


def generate_poster(category: str, config: dict, variant: int) -> tuple:
    """Generate a single poster image and thumbnail. Returns (poster, thumb)."""
    img = Image.new("RGBA", (SIZE, SIZE), (*config["gradient"][0], 255))
    draw = ImageDraw.Draw(img)

    # Background gradient (vertical)
    g0, g1 = config["gradient"]
    for y in range(SIZE):
        t = y / SIZE
        r = int(g0[0] * (1 - t) + g1[0] * t)
        g = int(g0[1] * (1 - t) + g1[1] * t)
        b = int(g0[2] * (1 - t) + g1[2] * t)
        draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

    accent = config["accent"]

    # Central glow
    offset_y = int(SIZE * (0.35 + variant * 0.08))
    radial_glow(img, (SIZE // 2, offset_y), int(SIZE * 0.55), accent, max_alpha=50)

    # Geometric border
    draw = ImageDraw.Draw(img)
    draw_geometric_border(draw, SIZE, accent, alpha=50 + variant * 15)

    # Arabic text — large, centered above middle
    try:
        ar_font = ImageFont.truetype(ARABIC_FONT, int(SIZE * 0.14))
        ar_text = config["label_ar"]
        bbox = draw.textbbox((0, 0), ar_text, font=ar_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        ax = (SIZE - tw) // 2
        ay = int(SIZE * 0.28) - th // 2

        # Glow behind text
        glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.text((ax, ay), ar_text, font=ar_font, fill=(*accent, 120))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=18))
        img.alpha_composite(glow)

        draw.text((ax, ay), ar_text, font=ar_font, fill=(*accent, 230))
    except Exception:
        pass

    # English text — below Arabic
    try:
        en_font = ImageFont.truetype(MANROPE, int(SIZE * 0.09))
        en_text = config["label_en"]
        lines = en_text.split("\n")
        y_start = int(SIZE * 0.50)
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=en_font)
            tw = bbox[2] - bbox[0]
            lx = (SIZE - tw) // 2
            ly = y_start + i * int(SIZE * 0.11)
            draw.text((lx, ly), line, font=en_font, fill=(255, 255, 255, 220))
    except Exception:
        pass

    # Variant label (small, bottom)
    try:
        sm_font = ImageFont.truetype(MANROPE, int(SIZE * 0.025))
        variant_labels = ["Classic", "Elegant", "Bold"]
        vl = variant_labels[variant % len(variant_labels)]
        draw.text((SIZE // 2 - 40, int(SIZE * 0.92)), vl, font=sm_font, fill=(*accent, 100))
    except Exception:
        pass

    poster = img.convert("RGB")
    thumb = poster.copy()
    thumb.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.LANCZOS)
    return poster, thumb


def main():
    all_posters = []

    for cat, config in CATEGORIES.items():
        cat_dir = OUT_DIR / cat
        cat_dir.mkdir(parents=True, exist_ok=True)

        for v in range(config["count"]):
            poster_id = f"{cat}-{v + 1}"
            poster, thumb = generate_poster(cat, config, v)

            poster_path = cat_dir / f"{poster_id}.jpg"
            thumb_path = cat_dir / f"{poster_id}_thumb.jpg"

            poster.save(poster_path, "JPEG", quality=88)
            thumb.save(thumb_path, "JPEG", quality=80)

            all_posters.append({
                "id": poster_id,
                "category": cat,
                "storage_path": f"{cat}/{poster_id}.jpg",
                "thumbnail_path": f"{cat}/{poster_id}_thumb.jpg",
                "name": f"{config['label_en'].replace(chr(10), ' ')} {['Classic', 'Elegant', 'Bold'][v % 3]}",
            })
            print(f"  wrote {poster_path} + thumb")

    # Print SQL seed for convenience
    print(f"\n--- Generated {len(all_posters)} posters ---")
    print("\n-- SQL seed for poster_library:")
    for p in all_posters:
        print(
            f"INSERT INTO poster_library (id, category, storage_path, thumbnail_path, name, sort_order, is_active) "
            f"VALUES ('{p['id']}', '{p['category']}', '{p['storage_path']}', '{p['thumbnail_path']}', "
            f"'{p['name']}', {all_posters.index(p)}, true) ON CONFLICT (id) DO NOTHING;"
        )


if __name__ == "__main__":
    main()
