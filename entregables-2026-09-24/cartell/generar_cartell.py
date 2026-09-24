#!/usr/bin/env python3
"""generar_cartell.py — Cartell d'ARRENCADA DE TEMPORADA 2026-27 (CB Grup Barna).

Format quadrat 1080x1080 (Instagram feed). Look pòster NBA/Nike:
color pla atrevit, tipografia condensada gegant (Anton), molt d'espai negatiu,
res de gradients. Peça tipogràfica/gràfica (sense foto de jugador/a).

Valors de marca EXACTES (sistema-visual-cbgb):
  Vermell Barna #FD030C · Negre #0A0A0A · Blanc #FFFFFF
  Display: Anton (majúscules, titular gegant) · Text: Inter

Requereix: Pillow + fonts a ./fonts (Anton, Inter). Es descarreguen de Google Fonts.
"""
import os
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------- tokens
W = H = 1080
RED = (253, 3, 12)       # #FD030C  Vermell Barna
BLACK = (10, 10, 10)     # #0A0A0A
WHITE = (255, 255, 255)  # #FFFFFF
MUTED = (150, 150, 150)  # gris secundari (neutre del sistema)

MARGIN = 80              # marge de seguretat generós (espai negatiu)

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
ANTON = os.path.join(FONTS, "Anton-Regular.ttf")
INTER = os.path.join(FONTS, "Inter-Regular.ttf")
INTER_SB = os.path.join(FONTS, "Inter-SemiBold.ttf")
INTER_B = os.path.join(FONTS, "Inter-Bold.ttf")

FONT_OK = all(os.path.isfile(p) for p in (ANTON, INTER, INTER_SB, INTER_B))
NOTE = ""
if not FONT_OK:
    # Alternativa condensada del sistema si no s'han pogut baixar les fonts.
    fallbacks = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    ANTON = INTER = INTER_SB = INTER_B = next(
        (f for f in fallbacks if os.path.isfile(f)), None)
    NOTE = "AVIS: fonts Anton/Inter no disponibles; usada condensada del sistema."


def font(path, size):
    return ImageFont.truetype(path, size)


def fit(text, path, target_w, start=260, tracking=0):
    """Troba la mida de font màxima perquè `text` càpiga en `target_w` px."""
    s = start
    while s > 8:
        f = font(path, s)
        w = text_w(text, f, tracking)
        if w <= target_w:
            return f, s
        s -= 2
    return font(path, 8), 8


def text_w(text, f, tracking=0):
    d = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    w = d.textlength(text, font=f)
    if tracking:
        w += tracking * (len(text) - 1)
    return w


def draw_tracked(d, xy, text, f, fill, tracking=0, anchor_left=True):
    """Dibuixa text amb tracking (espaiat) manual, ancorat a l'esquerra dalt."""
    x, y = xy
    if tracking == 0:
        d.text((x, y), text, font=f, fill=fill)
        return text_w(text, f)
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + tracking
    return x - xy[0]


def main():
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img)

    inner = W - 2 * MARGIN  # amplada útil = 920

    # ---------------------------------------------------- 1. CAPÇALERA
    # Wordmark del club (esquerra) + placeholder de logo (dreta).
    f_word = font(ANTON, 46)
    d.text((MARGIN, 66), "CB GRUP BARNA", font=f_word, fill=WHITE)
    f_tag = font(INTER_SB, 19)
    draw_tracked(d, (MARGIN + 2, 124),
                 "CLUB DE BÀSQUET · EL CLOT — SANT MARTÍ · BARCELONA",
                 f_tag, MUTED, tracking=1)

    # Placeholder de logo del club (quadrat amb contorn, etiquetat).
    box = 112
    bx1 = W - MARGIN - box
    by1 = 60
    d.rectangle([bx1, by1, bx1 + box, by1 + box], outline=RED, width=3)
    f_ph = font(INTER_SB, 15)
    d.text((bx1 + box / 2, by1 + box / 2 - 10), "LOGO", font=font(ANTON, 26),
           fill=WHITE, anchor="mm")
    d.text((bx1 + box / 2, by1 + box / 2 + 20), "CLUB", font=f_ph,
           fill=MUTED, anchor="mm")

    # Filet vermell separador
    d.rectangle([MARGIN, 210, W - MARGIN, 218], fill=RED)

    # ---------------------------------------------------- 2. KICKER
    f_kick = font(INTER_B, 24)
    draw_tracked(d, (MARGIN, 262), "PRESENTACIÓ D'EQUIPS", f_kick, RED, tracking=6)

    # ---------------------------------------------------- 3. TITULAR GEGANT
    # "COMENÇA LA" (blanc) / "TEMPORADA" (vermell) — Anton, majúscules, gegant.
    # Bloc compacte i AÏLLAT (sense solapaments): la jerarquia mana.
    line1 = "COMENÇA LA"
    line2 = "TEMPORADA"
    s = min(fit(line1, ANTON, inner, start=185)[1],
            fit(line2, ANTON, inner, start=185)[1], 178)
    f1 = font(ANTON, s)
    lead = int(s * 0.96)  # interlineat ajustat però amb aire per a la ç
    y1 = 304
    d.text((MARGIN - 4, y1), line1, font=f1, fill=WHITE)
    d.text((MARGIN - 4, y1 + lead), line2, font=f1, fill=RED)

    # ---------------------------------------------------- 4. BANDA DIAGONAL + ANY
    # Element de sistema (energia Bulls): slab vermell angulat amb l'any en negre.
    # Situat SOTA el titular, sense tocar-lo.
    band_h = 176
    band_cy = 786          # centre vertical de la banda
    slope = 30
    poly = [(0, band_cy - band_h // 2 + slope),
            (W, band_cy - band_h // 2 - slope),
            (W, band_cy + band_h // 2 - slope),
            (0, band_cy + band_h // 2 + slope)]
    d.polygon(poly, fill=RED)

    # Any de temporada com a DADA protagonista (negre sobre vermell, alt contrast).
    f_year = font(ANTON, 138)
    year = "2026·27"
    yw = text_w(year, f_year)
    d.text(((W - yw) / 2, band_cy), year, font=f_year, fill=BLACK, anchor="mm")

    # ---------------------------------------------------- 5. SUBTÍTOL
    f_sub = font(INTER_SB, 21)
    draw_tracked(d, (MARGIN, 916),
                 "+450 FAMÍLIES · MASCULÍ I FEMENÍ · LF2",
                 f_sub, WHITE, tracking=2)

    # ---------------------------------------------------- 6. CARTELA SPONSORS
    # Zona placeholder etiquetada (sense logos inventats).
    strip_y = 972
    d.rectangle([MARGIN, strip_y, W - MARGIN, strip_y + 62],
                outline=MUTED, width=2)
    f_lbl = font(INTER_B, 14)
    draw_tracked(d, (MARGIN + 16, strip_y + 9),
                 "ESPAI RESERVAT · PARTNERS & SPONSORS", f_lbl, MUTED, tracking=3)
    # 4 caixes buides de patrocinador (retícula de pes òptic igual)
    n = 4
    gap = 14
    slot_area = inner - 32
    sw = (slot_area - gap * (n - 1)) / n
    sx = MARGIN + 16
    sy = strip_y + 33
    for i in range(n):
        d.rectangle([sx, sy, sx + sw, sy + 20], outline=MUTED, width=1)
        sx += sw + gap

    img.save(os.path.join(HERE, "cartell_arrencada_2026-27_1080x1080.png"))
    print("OK -> cartell_arrencada_2026-27_1080x1080.png (1080x1080)")
    print(f"titular {s}px | {NOTE or 'fonts Anton + Inter OK'}")


if __name__ == "__main__":
    main()
