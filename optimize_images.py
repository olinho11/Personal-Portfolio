from pathlib import Path

from PIL import Image, ImageOps


SOURCE = Path("/private/tmp/oliver-portfolio-assets")
OUTPUT = Path("/private/tmp/oliver-portfolio-webp")
OUTPUT.mkdir(parents=True, exist_ok=True)


def save_webp(source: str, output: str, size: tuple[int, int], fit: bool = True) -> None:
    image = Image.open(SOURCE / source).convert("RGB")

    if fit:
        image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    else:
        image.thumbnail(size, Image.Resampling.LANCZOS)

    image.save(
        OUTPUT / output,
        "WEBP",
        quality=80,
        method=6,
        optimize=True,
    )


save_webp("jechacks-desktop.png", "jechacks.webp", (1440, 900))
save_webp("jechacks-mobile.png", "jechacks-mobile.webp", (390, 844))
save_webp("safewalk-mobile.raw", "safewalk.webp", (1440, 900))
save_webp("safewalk-desktop.png", "safewalk-splash.webp", (390, 244))
save_webp("three-body-desktop.png", "three-body.webp", (1440, 900))
save_webp("three-body-mobile.raw", "three-body-mobile.webp", (390, 844))
save_webp("projectpacket-desktop.raw", "projectpacket.webp", (1440, 900))
