#!/usr/bin/env python3
"""
Remove the HIGGSFIELD AI watermark (bottom-right corner) from keyframe images
via content-aware inpainting, then emit clean, correctly-ordered frames.

USAGE
-----
1. Put the four raw images in  hirezim-site/keyframes/originals/
   named so they sort into STORY ORDER (no-helmet → purple-eyes), e.g.:
        1-no-helmet.jpg  2-donning.jpg  3-helmet-on.jpg  4-purple-eyes.jpg

2. Install deps (pypi is reachable):
        pip install opencv-python-headless numpy

3. Run from hirezim-site/:
        python tools/remove-watermark.py

   Outputs keyframes/frame-1.jpg … frame-4.jpg (watermark inpainted).
   Then set  USE_REAL = true  in app.js.

TUNING
------
The watermark box is defined as fractions of each image's size (works at any
resolution). If a faint ghost remains, widen the box or bump --radius:
        python tools/remove-watermark.py --x0 0.72 --y0 0.88 --radius 12
Preview the mask without writing frames:
        python tools/remove-watermark.py --debug
"""
import argparse
import glob
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KEYFRAMES = os.path.normpath(os.path.join(HERE, "..", "keyframes"))
ORIGINALS = os.path.join(KEYFRAMES, "originals")


def main() -> int:
    ap = argparse.ArgumentParser(description="Inpaint the HIGGSFIELD watermark out of keyframes.")
    # Watermark bounding box, as fractions of width/height (bottom-right corner).
    ap.add_argument("--x0", type=float, default=0.745, help="left edge of watermark box (frac of W)")
    ap.add_argument("--y0", type=float, default=0.895, help="top edge of watermark box (frac of H)")
    ap.add_argument("--x1", type=float, default=0.990, help="right edge (frac of W)")
    ap.add_argument("--y1", type=float, default=0.980, help="bottom edge (frac of H)")
    ap.add_argument("--radius", type=int, default=8, help="inpaint radius in px")
    ap.add_argument("--pad", type=int, default=6, help="mask dilation padding in px")
    ap.add_argument("--quality", type=int, default=92, help="output JPEG quality")
    ap.add_argument("--src", default=ORIGINALS, help="folder of raw images (sorted = story order)")
    ap.add_argument("--debug", action="store_true", help="write *_mask.png previews, no frames")
    args = ap.parse_args()

    try:
        import cv2
        import numpy as np
    except ImportError:
        print("ERROR: need opencv + numpy.\n  pip install opencv-python-headless numpy", file=sys.stderr)
        return 2

    exts = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.JPG", "*.PNG")
    files: list[str] = []
    for e in exts:
        files.extend(glob.glob(os.path.join(args.src, e)))
    files = sorted(files)

    if not files:
        print(f"No images found in {args.src}", file=sys.stderr)
        print("Create keyframes/originals/ and drop the 4 raw images there "
              "(named 1-…, 2-…, 3-…, 4-… so they sort no-helmet → purple-eyes).", file=sys.stderr)
        return 1

    print(f"Found {len(files)} image(s):")
    for f in files:
        print("  -", os.path.basename(f))

    for idx, path in enumerate(files, start=1):
        img = cv2.imread(path, cv2.IMREAD_COLOR)
        if img is None:
            print(f"  ! skip (unreadable): {path}", file=sys.stderr)
            continue
        h, w = img.shape[:2]
        x0, y0 = int(args.x0 * w), int(args.y0 * h)
        x1, y1 = int(args.x1 * w), int(args.y1 * h)

        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
        if args.pad > 0:
            k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (args.pad * 2 + 1,) * 2)
            mask = cv2.dilate(mask, k)

        if args.debug:
            dbg = img.copy()
            cv2.rectangle(dbg, (x0, y0), (x1, y1), (0, 0, 255), 2)
            out = os.path.join(KEYFRAMES, f"debug-{idx}_mask.png")
            cv2.imwrite(out, dbg)
            print(f"  debug → {os.path.relpath(out, KEYFRAMES)}")
            continue

        # Two-pass inpaint (Telea then Navier–Stokes) for a cleaner corner fill.
        step1 = cv2.inpaint(img, mask, args.radius, cv2.INPAINT_TELEA)
        clean = cv2.inpaint(step1, mask, max(3, args.radius // 2), cv2.INPAINT_NS)

        out = os.path.join(KEYFRAMES, f"frame-{idx}.jpg")
        cv2.imwrite(out, clean, [cv2.IMWRITE_JPEG_QUALITY, args.quality])
        print(f"  ✓ frame-{idx}.jpg  ({w}x{h})  ← {os.path.basename(path)}")

    if not args.debug:
        print("\nDone. Set USE_REAL = true in app.js to load the real frames.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
