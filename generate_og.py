from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).parent
WIDTH, HEIGHT = 1200, 630
OUTPUT = ROOT / "assets" / "og-image-2026.jpg"
PROFILE = ROOT / "assets" / "oliver-profile.jpg"

REGULAR = "/System/Library/Fonts/HelveticaNeue.ttc"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


canvas = Image.new("RGB", (WIDTH, HEIGHT), "#030405")
pixels = canvas.load()
top = (7, 13, 16)
bottom = (2, 3, 4)

for y in range(HEIGHT):
    t = y / (HEIGHT - 1)
    color = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
    for x in range(WIDTH):
        pixels[x, y] = color

glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse((-260, -260, 690, 520), fill=(78, 130, 135, 58))
glow_draw.ellipse((850, -170, 1390, 390), fill=(155, 111, 65, 28))
glow = glow.filter(ImageFilter.GaussianBlur(105))
canvas = Image.alpha_composite(canvas.convert("RGBA"), glow)
draw = ImageDraw.Draw(canvas)

for x in range(0, WIDTH, 52):
    draw.line((x, 0, x, HEIGHT), fill=(181, 201, 207, 11), width=1)
for y in range(0, HEIGHT, 52):
    draw.line((0, y, WIDTH, y), fill=(181, 201, 207, 11), width=1)

text = "#f2efe8"
soft = "#c8ced0"
muted = "#929ca1"
line = (190, 208, 214, 34)
brand = "#8fd3c3"
warm = "#d7ad72"

small = font(BOLD, 15)
label = font(BOLD, 18)
body = font(REGULAR, 24)
headline = font(BOLD, 66)
metric = font(BOLD, 42)

draw.rectangle((0, 0, WIDTH, 76), fill=(5, 8, 10, 232))
draw.line((0, 76, WIDTH, 76), fill=line, width=1)

profile = Image.open(PROFILE).convert("RGB").resize((50, 50), Image.Resampling.LANCZOS)
mask = Image.new("L", (50, 50), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 49, 49), fill=255)
draw.ellipse((27, 12, 81, 66), outline=(143, 211, 195, 95), width=1)
canvas.paste(profile, (29, 14), mask)

draw.text((98, 27), "OLIVER UENO  /  PORTFOLIO 2026", font=small, fill=soft)
right_label = "WATERLOO, CANADA"
right_box = draw.textbbox((0, 0), right_label, font=small)
draw.text((WIDTH - 30 - (right_box[2] - right_box[0]), 27), right_label, font=small, fill=muted)

left = (28, 96, 807, 594)
right = (825, 96, 1172, 594)
draw.rounded_rectangle(left, radius=16, fill=(8, 12, 14, 224), outline=line, width=1)
draw.rounded_rectangle(right, radius=16, fill=(7, 10, 12, 230), outline=line, width=1)

draw.text((54, 123), "01  /  PROFILE", font=small, fill=soft)
draw.text((851, 123), "02  /  PROOF OF WORK", font=small, fill=soft)

portrait_size = 126
portrait = Image.open(PROFILE).convert("RGB").resize((portrait_size, portrait_size), Image.Resampling.LANCZOS)
portrait_mask = Image.new("L", (portrait_size, portrait_size), 0)
ImageDraw.Draw(portrait_mask).ellipse((0, 0, portrait_size - 1, portrait_size - 1), fill=255)
draw.ellipse((53, 211, 185, 343), outline=(143, 211, 195, 110), width=2)
canvas.paste(portrait, (56, 214), portrait_mask)

draw.text((216, 206), "14-YEAR-OLD HIGH SCHOOL STUDENT  •  IB PROGRAMME", font=small, fill=warm)
draw.text((216, 238), "Oliver Ueno.", font=headline, fill=text)

draw.text((216, 325), "I turn ideas into useful products, student-led events,", font=body, fill=soft)
draw.text((216, 360), "and ambitious projects with other students.", font=body, fill=soft)

draw.line((54, 457, 781, 457), fill=line, width=1)
draw.text((54, 481), "FOCUSED ON", font=small, fill=brand)
draw.text((54, 511), "Full-stack products  •  Community  •  Entrepreneurship", font=label, fill=soft)
draw.text((54, 554), "oliverueno.site", font=small, fill=text)

metrics = [
    ("$5.3K+", "FUNDING SECURED", warm),
    ("120+", "STUDENT ENTRANTS", brand),
    ("5", "PROJECTS SHIPPED", "#829bd0"),
]

for index, (value, title, accent) in enumerate(metrics):
    top_y = 178 + index * 127
    draw.line((851, top_y - 20, 1146, top_y - 20), fill=line, width=1)
    draw.rectangle((851, top_y - 20, 854, top_y + 73), fill=accent)
    draw.text((872, top_y), value, font=metric, fill=text)
    draw.text((872, top_y + 54), title, font=small, fill=soft)

draw.text((851, 552), "SELECTED WORK  •  LIFE BEYOND CODING", font=small, fill=brand)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
canvas.convert("RGB").save(OUTPUT, "JPEG", quality=90, optimize=True, progressive=True)
