#!/usr/bin/env python3
"""Slice Firefly raw sheets in design/raw/ into transparent WebP assets in public/assets/."""

from __future__ import annotations

import argparse
import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "design" / "raw"
OUT_DIR = ROOT / "public" / "assets"
REVIEW_PATH = ROOT / "design" / "review.html"
CONFIG_PATH = Path(__file__).with_name("slice-config.json")


@dataclass
class BBox:
    x0: int
    y0: int
    x1: int
    y1: int

    @property
    def w(self) -> int:
        return self.x1 - self.x0

    @property
    def h(self) -> int:
        return self.y1 - self.y0

    @property
    def area(self) -> int:
        return max(0, self.w) * max(0, self.h)

    @property
    def cx(self) -> float:
        return (self.x0 + self.x1) / 2

    @property
    def cy(self) -> float:
        return (self.y0 + self.y1) / 2

    def as_tuple(self) -> tuple[int, int, int, int]:
        return self.x0, self.y0, self.x1, self.y1


def is_near_white(rgb: tuple[int, int, int], tol: int) -> bool:
    r, g, b = rgb
    return r >= 255 - tol and g >= 255 - tol and b >= 255 - tol


def build_fg_mask(img: Image.Image, tol: int) -> list[list[bool]]:
    rgb = img.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    return [[not is_near_white(px[x, y], tol) for x in range(w)] for y in range(h)]


def connected_components(mask: list[list[bool]], min_area: int) -> list[BBox]:
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    boxes: list[BBox] = []

    for y in range(h):
        for x in range(w):
            if not mask[y][x] or seen[y][x]:
                continue
            q: deque[tuple[int, int]] = deque([(x, y)])
            seen[y][x] = True
            minx = maxx = x
            miny = maxy = y
            area = 0
            while q:
                cx, cy = q.popleft()
                area += 1
                if cx < minx:
                    minx = cx
                if cx > maxx:
                    maxx = cx
                if cy < miny:
                    miny = cy
                if cy > maxy:
                    maxy = cy
                for nx, ny in (
                    (cx - 1, cy),
                    (cx + 1, cy),
                    (cx, cy - 1),
                    (cx, cy + 1),
                ):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        q.append((nx, ny))
            if area >= min_area:
                boxes.append(BBox(minx, miny, maxx + 1, maxy + 1))
    return boxes


def suppress_contained(boxes: list[BBox], thr: float = 0.7) -> list[BBox]:
    """Drop boxes that sit mostly inside a larger box (ornaments, shadows, frames)."""
    keep = [True] * len(boxes)
    for i, a in enumerate(boxes):
        aa = max(1, a.area)
        for j, b in enumerate(boxes):
            if i == j or b.area <= a.area:
                continue
            ix0 = max(a.x0, b.x0)
            iy0 = max(a.y0, b.y0)
            ix1 = min(a.x1, b.x1)
            iy1 = min(a.y1, b.y1)
            if ix1 <= ix0 or iy1 <= iy0:
                continue
            inter = (ix1 - ix0) * (iy1 - iy0)
            if inter / aa >= thr:
                keep[i] = False
                break
    return [b for b, k in zip(boxes, keep) if k]


def sort_reading_order(boxes: list[BBox], row_tol: float | None = None) -> list[BBox]:
    """Sort top-to-bottom, left-to-right by clustering into rows."""
    if not boxes:
        return []
    heights = [b.h for b in boxes]
    median_h = sorted(heights)[len(heights) // 2]
    tol = row_tol if row_tol is not None else max(40.0, median_h * 0.45)

    remaining = sorted(boxes, key=lambda b: (b.cy, b.cx))
    rows: list[list[BBox]] = []
    while remaining:
        seed = remaining.pop(0)
        row = [seed]
        seed_cy = seed.cy
        i = 0
        while i < len(remaining):
            if abs(remaining[i].cy - seed_cy) <= tol:
                row.append(remaining.pop(i))
            else:
                i += 1
        row.sort(key=lambda b: b.cx)
        rows.append(row)
    rows.sort(key=lambda row: sum(b.cy for b in row) / len(row))
    ordered: list[BBox] = []
    for row in rows:
        ordered.extend(row)
    return ordered


def flood_remove_bg(
    crop: Image.Image,
    tol: int,
    soft_px: int,
) -> Image.Image:
    """Remove near-white background by edge flood-fill only; keep interior whites."""
    rgba = crop.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()

    def near_bg(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a == 0:
            return True
        return is_near_white((r, g, b), tol)

    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if near_bg(x, y) and not visited[y][x]:
                visited[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if near_bg(x, y) and not visited[y][x]:
                visited[y][x] = True
                q.append((x, y))

    bg = [[False] * w for _ in range(h)]
    while q:
        x, y = q.popleft()
        bg[y][x] = True
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and near_bg(nx, ny):
                visited[ny][nx] = True
                q.append((nx, ny))

    # Soft alpha near bg edge
    alpha = Image.new("L", (w, h), 255)
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            if bg[y][x]:
                ap[x, y] = 0

    if soft_px > 0:
        # Distance-ish soften: blur then re-zero pure bg
        soft = alpha.filter(ImageFilter.GaussianBlur(radius=soft_px))
        sp = soft.load()
        for y in range(h):
            for x in range(w):
                if bg[y][x]:
                    sp[x, y] = 0
                elif sp[x, y] < 250:
                    # keep softened edge only near background
                    near = False
                    for dy in range(-soft_px - 1, soft_px + 2):
                        for dx in range(-soft_px - 1, soft_px + 2):
                            xx, yy = x + dx, y + dy
                            if 0 <= xx < w and 0 <= yy < h and bg[yy][xx]:
                                near = True
                                break
                        if near:
                            break
                    if not near:
                        sp[x, y] = 255
        alpha = soft

    out = rgba.copy()
    out.putalpha(alpha)
    return out


def add_padding(img: Image.Image, pad: int) -> Image.Image:
    if pad <= 0:
        return img
    w, h = img.size
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad), img if img.mode == "RGBA" else None)
    return canvas


def resize_max(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    m = max(w, h)
    if m <= max_side:
        return img
    scale = max_side / m
    nw = max(1, int(round(w * scale)))
    nh = max(1, int(round(h * scale)))
    return img.resize((nw, nh), Image.Resampling.LANCZOS)


def trim_alpha(img: Image.Image) -> Image.Image:
    if img.mode != "RGBA":
        return img
    bbox = img.split()[-1].getbbox()
    if not bbox:
        return img
    return img.crop(bbox)


def detect_neck_y(mask_rows: list[list[bool]]) -> int:
    """Find neck band: after head max-width, look for local min width."""
    h = len(mask_rows)
    if h == 0:
        return int(h * 0.42)
    widths = []
    for y in range(h):
        row = mask_rows[y]
        xs = [x for x, v in enumerate(row) if v]
        widths.append((xs[-1] - xs[0] + 1) if xs else 0)

    # Focus on top 65%
    top_n = max(2, int(h * 0.65))
    # Head peak in upper portion
    peak_y = max(range(1, top_n), key=lambda y: widths[y])
    peak_w = widths[peak_y] or 1

    search_end = min(h - 1, int(h * 0.62))
    best_y = peak_y
    best_score = 1e9
    for y in range(peak_y + 1, search_end):
        w = widths[y]
        if w <= 0:
            continue
        # Prefer narrow relative to head, not too close to peak
        score = w / peak_w + 0.002 * (y - peak_y)
        if y > peak_y + max(4, int(h * 0.08)) and score < best_score:
            best_score = score
            best_y = y

    # Fallback ratio
    if best_y <= peak_y + 2:
        best_y = int(h * 0.40)
    return best_y


def split_body_and_anchor(
    rgba: Image.Image,
    tol: int,
    neck_extra_ratio: float = 0.0,
) -> tuple[Image.Image, dict]:
    """Crop away head at neck; return body image + head anchor % relative to body.

    neck_extra_ratio: push the cut lower (into the torso) to remove chin leftovers.
    """
    w, h = rgba.size
    px = rgba.load()
    # Prefer alpha mask when available
    mask = [[px[x, y][3] > 16 for x in range(w)] for y in range(h)]

    neck_y = detect_neck_y(mask)
    if neck_extra_ratio:
        neck_y = min(h - 2, neck_y + int(h * neck_extra_ratio))
    # Head bbox above neck
    head_xs = []
    head_ys = []
    for y in range(0, neck_y):
        for x in range(w):
            if mask[y][x]:
                head_xs.append(x)
                head_ys.append(y)
    if not head_xs:
        neck_y = int(h * 0.42)
        for y in range(0, neck_y):
            for x in range(w):
                if mask[y][x]:
                    head_xs.append(x)
                    head_ys.append(y)

    body = rgba.crop((0, neck_y, w, h))
    body = trim_alpha(body)
    bw, bh = body.size

    if head_xs:
        head_cx = (min(head_xs) + max(head_xs)) / 2
        head_w = max(head_xs) - min(head_xs) + 1
        # Anchor on body image: head sits just above top of body (neck line)
        # After trim, body may have left offset
        # Recompute body content left
        bpx = body.load()
        content_x0 = 0
        for x in range(bw):
            if any(bpx[x, y][3] > 16 for y in range(bh)):
                content_x0 = x
                break
        # Original body crop left is 0 of rgba; trim may remove left padding
        # Map head center into body-trimmed coords
        # body.crop started at (0, neck_y); trim removes empty borders
        full_body = rgba.crop((0, neck_y, w, h))
        tb = full_body.split()[-1].getbbox() or (0, 0, full_body.size[0], full_body.size[1])
        ax = (head_cx - tb[0]) / max(1, bw)
        # Head center vertically sits near top of body (slightly above neck into head overlap)
        ay = -0.02  # slightly above body top; UI can place head centered on this
        # Better: store center as % of body box where head should sit — at neck top center
        ay = 0.02
        aw = head_w / max(1, bw)
    else:
        ax, ay, aw = 0.5, 0.05, 0.55

    anchor = {
        "headCenterX": round(ax, 4),
        "headCenterY": round(ay, 4),
        "headWidth": round(aw, 4),
        "neckYRatio": round(neck_y / max(1, h), 4),
    }
    return body, anchor


def save_webp(img: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=quality, method=6)


def boxes_from_manual(raw_boxes: Iterable[list[int]]) -> list[BBox]:
    out = []
    for b in raw_boxes:
        x, y, w, h = b
        out.append(BBox(x, y, x + w, y + h))
    return out


def process_sheet(
    sheet: dict,
    settings: dict,
    review_items: list[dict],
    anchors_acc: dict,
) -> list[str]:
    warnings: list[str] = []
    src_path = RAW_DIR / sheet["src"]
    if not src_path.exists():
        raise FileNotFoundError(src_path)

    img = Image.open(src_path).convert("RGBA")
    tol = settings["bgTolerance"]
    pad = settings["padding"]
    soft = settings["edgeSoftPx"]
    min_area = sheet.get("minComponentArea", settings["minComponentArea"])
    quality = settings["quality"]
    max_sizes = settings["maxSizes"]

    mode = sheet["mode"]
    outputs = sheet["outputs"]

    if mode == "full":
        out_img = img.convert("RGB")
        size_class = sheet.get("sizeClass", "bg")
        out_img = resize_max(out_img, max_sizes[size_class])
        # convert to RGBA for consistency? backgrounds stay opaque RGB->WebP
        dest = OUT_DIR / outputs[0]["dir"] / f"{outputs[0]['name']}.webp"
        save_webp(out_img, dest, quality)
        review_items.append(
            {
                "sheet": sheet["id"],
                "name": outputs[0]["name"],
                "path": str(dest.relative_to(ROOT)).replace("\\", "/"),
                "wh": list(out_img.size),
            }
        )
        print(f"  [full] {dest.relative_to(ROOT)} {out_img.size}")
        return warnings

    # auto or manual boxes
    if sheet.get("boxes"):
        boxes = boxes_from_manual(sheet["boxes"])
        method = "manual"
    else:
        mask = build_fg_mask(img, tol)
        boxes = connected_components(mask, min_area)
        boxes = suppress_contained(boxes)
        boxes = sort_reading_order(boxes)
        method = "auto"

    expected = sheet.get("expected")
    if expected is not None and len(boxes) != expected:
        if sheet.get("boxes"):
            warnings.append(
                f"{sheet['id']}: manual boxes={len(boxes)} expected={expected}"
            )
        else:
            warnings.append(
                f"{sheet['id']}: auto found {len(boxes)} objects, expected {expected}. "
                "Add 'boxes' in slice-config.json."
            )
            print(f"  ! count mismatch: got {len(boxes)} expected {expected}")
            for i, b in enumerate(boxes):
                print(f"    [{i}] {b.as_tuple()} area={b.area}")
            return warnings

    keep = sheet.get("keep")
    if keep is not None:
        selected = [boxes[i] for i in keep]
    else:
        selected = boxes

    if len(selected) != len(outputs):
        warnings.append(
            f"{sheet['id']}: selected {len(selected)} != outputs {len(outputs)}"
        )
        print(f"  ! selected/output mismatch")
        return warnings

    unify_head = sheet.get("unifyHead", False)
    head_w = settings.get("headUnifyWidth", 512)
    body_split = sheet.get("bodySplit") or {}
    size_by_index = sheet.get("sizeClassByIndex") or {}
    default_class = sheet.get("sizeClass", "character")

    for idx, (box, meta) in enumerate(zip(selected, outputs)):
        # slight expand to avoid clipping soft edges
        x0 = max(0, box.x0 - 2)
        y0 = max(0, box.y0 - 2)
        x1 = min(img.size[0], box.x1 + 2)
        y1 = min(img.size[1], box.y1 + 2)
        crop = img.crop((x0, y0, x1, y1))

        if sheet.get("removeBg", True):
            crop = flood_remove_bg(crop, tol, soft)
        crop = trim_alpha(crop)
        crop = add_padding(crop, pad)

        sc = size_by_index.get(str(idx), default_class)
        # For keep-index mapping, sizeClassByIndex keys refer to original detect index
        # Spec used original positions for icons; use output index for simplicity when keep set
        if keep is not None and str(idx) in size_by_index:
            sc = size_by_index[str(idx)]
        # Also allow keys by original box index when keep is used
        if keep is not None:
            orig_i = keep[idx]
            if str(orig_i) in size_by_index:
                sc = size_by_index[str(orig_i)]

        if unify_head:
            # scale to unified width (content width roughly)
            cw, ch = crop.size
            scale = head_w / cw
            crop = crop.resize(
                (head_w, max(1, int(round(ch * scale)))),
                Image.Resampling.LANCZOS,
            )
        else:
            crop = resize_max(crop, max_sizes[sc])

        dest = OUT_DIR / meta["dir"] / f"{meta['name']}.webp"
        save_webp(crop, dest, quality)
        review_items.append(
            {
                "sheet": sheet["id"],
                "name": meta["name"],
                "path": str(dest.relative_to(ROOT)).replace("\\", "/"),
                "wh": list(crop.size),
                "method": method,
            }
        )
        print(f"  [{method}] {dest.relative_to(ROOT)} {crop.size}")

        if body_split.get("enabled"):
            # Work from de-padded content for neck detect, then re-pad body
            body_src = trim_alpha(crop)
            body_name = meta["name"]  # daily_boy etc.
            extra_map = body_split.get("neckExtraByName") or {}
            neck_extra = float(extra_map.get(body_name, body_split.get("neckExtraRatio", 0)))
            body_img, anchor = split_body_and_anchor(body_src, tol, neck_extra_ratio=neck_extra)
            body_img = add_padding(body_img, pad)
            body_img = resize_max(body_img, max_sizes["character"])
            body_dest = OUT_DIR / body_split["bodyDir"] / f"{body_name}.webp"
            save_webp(body_img, body_dest, quality)
            # Display width for head overlay is fixed in app (~70%); store center X
            anchor["headWidth"] = 0.7
            anchors_acc[body_name] = anchor
            review_items.append(
                {
                    "sheet": sheet["id"],
                    "name": f"{body_name} (body)",
                    "path": str(body_dest.relative_to(ROOT)).replace("\\", "/"),
                    "wh": list(body_img.size),
                    "method": "bodySplit",
                }
            )
            print(f"  [body] {body_dest.relative_to(ROOT)} {body_img.size} anchor={anchor}")

    # Optional: extract girl bow accessory from daily_girl full cell
    if sheet.get("extractBow"):
        try:
            bow_path = extract_bow_accessory(img, selected, outputs, settings)
            if bow_path:
                review_items.append(
                    {
                        "sheet": sheet["id"],
                        "name": "bow (accessory)",
                        "path": str(bow_path.relative_to(ROOT)).replace("\\", "/"),
                        "wh": list(Image.open(bow_path).size),
                        "method": "bow",
                    }
                )
                print(f"  [bow] {bow_path.relative_to(ROOT)}")
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"{sheet['id']}: bow extract failed: {exc}")

    return warnings


def extract_bow_accessory(
    sheet_img: Image.Image,
    selected: list[BBox],
    outputs: list[dict],
    settings: dict,
) -> Path | None:
    """Cut a red bow from the daily_girl cell for avatar/accessory/bow.webp."""
    tol = settings["bgTolerance"]
    pad = settings["padding"]
    soft = settings["edgeSoftPx"]
    quality = settings["quality"]

    girl_idx = next((i for i, m in enumerate(outputs) if m["name"] == "daily_girl"), None)
    if girl_idx is None:
        return None
    box = selected[girl_idx]
    crop = sheet_img.crop((box.x0, box.y0, box.x1, box.y1)).convert("RGBA")
    crop = flood_remove_bg(crop, tol, soft)
    w, h = crop.size
    px = crop.load()

    # Red-ish pixels in upper 42% (ear bows), not near-white
    red_mask = [[False] * w for _ in range(h)]
    y_limit = int(h * 0.42)
    for y in range(y_limit):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 40:
                continue
            if r > 160 and r > g * 1.25 and r > b * 1.25 and (r - g) > 30:
                red_mask[y][x] = True

    blobs = connected_components(red_mask, min_area=30)
    blobs = sorted(blobs, key=lambda b: b.area, reverse=True)
    if not blobs:
        return None
    candidates = blobs[:2] if len(blobs) >= 2 and blobs[1].area > blobs[0].area * 0.35 else blobs[:1]
    best: Image.Image | None = None
    best_score = -1.0
    for b in candidates:
        x0 = max(0, b.x0 - 6)
        y0 = max(0, b.y0 - 6)
        x1 = min(w, b.x1 + 6)
        y1 = min(h, b.y1 + 6)
        piece = flood_remove_bg(crop.crop((x0, y0, x1, y1)), max(tol, 22), soft)
        piece = trim_alpha(piece)
        pp = piece.load()
        pw, ph = piece.size
        red = tot = 0
        for yy in range(ph):
            for xx in range(pw):
                r, g, b2, a = pp[xx, yy]
                if a > 40:
                    tot += 1
                    if r > 140 and r > g:
                        red += 1
        score = red / max(1, tot)
        if score > best_score:
            best_score = score
            best = piece
    if best is None:
        return None
    bow = add_padding(best, max(8, pad // 2))
    bow = resize_max(bow, 256)
    bp = bow.load()
    bw, bh = bow.size
    for y in range(bh):
        for x in range(bw):
            r, g, b2, a = bp[x, y]
            if a and r > 235 and g > 235 and b2 > 235:
                bp[x, y] = (0, 0, 0, 0)
    dest = OUT_DIR / "avatar" / "accessory" / "bow.webp"
    save_webp(bow, dest, quality)
    return dest


def avatar_composite_section(anchors: dict) -> str:
    """HTML for 13 heads × 3 outfits × 2 genders composite preview."""
    heads = [
        "rat",
        "ox",
        "tiger",
        "rabbit",
        "dragon",
        "snake",
        "horse",
        "goat",
        "monkey",
        "rooster",
        "dog",
        "pig",
        "panda",
    ]
    outfits = ["daily", "midautumn", "dragonboat"]
    genders = ["boy", "girl"]
    bow = "public/assets/avatar/accessory/bow.webp"
    cards = []
    for gender in genders:
        for outfit in outfits:
            key = f"{outfit}_{gender}"
            anchor = anchors.get(key) or {
                "headCenterX": 0.5,
                "headCenterY": 0.02,
                "headWidth": 0.7,
            }
            cx = float(anchor.get("headCenterX", 0.5)) * 100
            for head in heads:
                bow_html = ""
                if gender == "girl" and (OUT_DIR / "avatar/accessory/bow.webp").exists():
                    bow_html = f"""
            <img class="c-bow" src="../{bow}" alt="" />"""
                cards.append(
                    f"""
        <figure class="card composite">
          <div class="checker avatar-stage">
            <div class="avatar-stack" style="--cx:{cx:.2f}%">
              <img class="c-body" src="../public/assets/avatar/body/{key}.webp" alt="" />
              <img class="c-head" src="../public/assets/avatar/head/{head}.webp" alt="" />
              {bow_html}
            </div>
          </div>
          <figcaption>{head} · {outfit} · {gender}</figcaption>
        </figure>"""
                )
    return (
        "<section id='avatar-composites'>"
        "<h2>Avatar 疊合預覽 <small>(13頭 × 3衫 × 男女)</small></h2>"
        "<p class='meta'>頭闊 70%、translateX(-50%)、底邊重疊衣領約 10%；女仔加蝴蝶結</p>"
        f"<div class='grid composite-grid'>{''.join(cards)}</div>"
        "</section>"
    )


def write_review(items: list[dict], warnings: list[str], anchors: dict | None = None) -> None:
    groups: dict[str, list[dict]] = {}
    for it in items:
        groups.setdefault(it["sheet"], []).append(it)

    warn_html = ""
    if warnings:
        warn_html = (
            "<section class='warn'><h2>Warnings</h2><ul>"
            + "".join(f"<li>{w}</li>" for w in warnings)
            + "</ul></section>"
        )

    sections = []
    for sheet, arr in groups.items():
        cards = []
        for it in arr:
            cards.append(
                f"""
        <figure class="card">
          <div class="checker"><img src="../{it['path']}" alt="{it['name']}" /></div>
          <figcaption>{it['name']}<br /><span>{it['wh'][0]}×{it['wh'][1]}</span></figcaption>
        </figure>"""
            )
        sections.append(
            f"<section><h2>{sheet} <small>({len(arr)})</small></h2><div class='grid'>{''.join(cards)}</div></section>"
        )

    anchors = anchors or {}
    if not anchors:
        anchors_path = ROOT / "design" / "avatar-anchors.json"
        if anchors_path.exists():
            anchors = json.loads(anchors_path.read_text(encoding="utf-8"))
    composite = avatar_composite_section(anchors)

    html = f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>素材切圖檢查 · design/review</title>
  <style>
    :root {{
      --bg: #f3efe6;
      --ink: #2c241b;
      --muted: #7a6b5a;
      --line: #d9cfc0;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Noto Sans TC", "PingFang TC", sans-serif;
      background: linear-gradient(180deg, #f7f2e8, #ebe3d4);
      color: var(--ink);
      padding: 24px;
    }}
    h1 {{ margin: 0 0 8px; font-size: 1.6rem; }}
    .meta {{ color: var(--muted); margin-bottom: 24px; }}
    .warn {{
      background: #fff4e5;
      border: 1px solid #f0c36d;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 24px;
    }}
    section {{ margin-bottom: 36px; }}
    h2 {{ font-size: 1.15rem; margin: 0 0 12px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }}
    h2 small {{ color: var(--muted); font-weight: 500; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 14px;
    }}
    .composite-grid {{
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }}
    .card {{
      margin: 0;
      background: #fffaf2;
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
    }}
    .checker {{
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      background-color: #ddd;
      background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      padding: 10px;
    }}
    .checker img {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      image-rendering: auto;
    }}
    .avatar-stage {{
      position: relative;
      align-items: end;
    }}
    .avatar-stack {{
      position: relative;
      width: 78%;
      height: 92%;
    }}
    .c-body {{
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 62%;
      object-fit: contain;
      object-position: bottom center;
    }}
    .c-head {{
      position: absolute;
      left: var(--cx, 50%);
      bottom: 57%;
      width: 70%;
      transform: translateX(-50%);
      object-fit: contain;
      object-position: bottom center;
      z-index: 2;
    }}
    .c-bow {{
      position: absolute;
      width: 16%;
      z-index: 3;
      bottom: 82%;
      left: 72%;
      transform: translateX(-50%) rotate(8deg);
      object-fit: contain;
    }}
    figcaption {{
      padding: 8px 10px 10px;
      font-size: 0.82rem;
      line-height: 1.35;
      word-break: break-all;
    }}
    figcaption span {{ color: var(--muted); font-size: 0.75rem; }}
  </style>
</head>
<body>
  <h1>素材切圖檢查</h1>
  <p class="meta">由 <code>scripts/slice-assets.py</code> 產生 · 共 {len(items)} 張 · 格仔背景方便睇透明邊</p>
  {warn_html}
  {composite}
  {''.join(sections)}
</body>
</html>
"""
    REVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    REVIEW_PATH.write_text(html, encoding="utf-8")


def clear_generated_assets() -> None:
    """Remove previous generated webp trees but keep unrelated files if needed."""
    # Wipe known output dirs created by this pipeline; also remove old SVG placeholders
    # in the same folders so review is not confused.
    if OUT_DIR.exists():
        for p in OUT_DIR.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".webp", ".svg", ".png", ".jpg", ".jpeg"}:
                # Keep stickers theme SVGs? Spec says delete SVG placeholders — remove all svg under assets
                p.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="Slice design/raw into public/assets")
    parser.add_argument("--config", type=Path, default=CONFIG_PATH)
    parser.add_argument("--only", type=str, default="", help="Comma-separated sheet ids")
    args = parser.parse_args()

    config = json.loads(args.config.read_text(encoding="utf-8"))
    settings = config["settings"]
    sheets = config["sheets"]
    if args.only:
        only = {s.strip() for s in args.only.split(",") if s.strip()}
        sheets = [s for s in sheets if s["id"] in only]

    print(f"Raw: {RAW_DIR}")
    print(f"Out: {OUT_DIR}")
    if not args.only:
        clear_generated_assets()

    review_items: list[dict] = []
    anchors_acc: dict = {}
    all_warnings: list[str] = []

    for sheet in sheets:
        print(f"\n== {sheet['id']} ==")
        warns = process_sheet(sheet, settings, review_items, anchors_acc)
        all_warnings.extend(warns)

    anchors_path = ROOT / "design" / "avatar-anchors.json"
    for sheet in config["sheets"]:
        bs = sheet.get("bodySplit") or {}
        if bs.get("anchorsOut"):
            anchors_path = ROOT / bs["anchorsOut"]
            break

    if anchors_acc:
        # Merge into existing anchors when re-running a subset
        existing = {}
        if args.only and anchors_path.exists():
            existing = json.loads(anchors_path.read_text(encoding="utf-8"))
        existing.update(anchors_acc)
        anchors_acc = existing
        anchors_path.parent.mkdir(parents=True, exist_ok=True)
        anchors_path.write_text(
            json.dumps(anchors_acc, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"\nAnchors → {anchors_path.relative_to(ROOT)}")
    elif anchors_path.exists():
        anchors_acc = json.loads(anchors_path.read_text(encoding="utf-8"))

    if args.only:
        # Rebuild full review catalogue from disk so other sheets stay listed
        review_items = []
        for p in sorted(OUT_DIR.rglob("*.webp")):
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            sheet = str(p.parent.relative_to(OUT_DIR)).replace("\\", "/")
            with Image.open(p) as im:
                wh = list(im.size)
            review_items.append(
                {"sheet": sheet, "name": p.stem, "path": rel, "wh": wh, "method": "scan"}
            )

    write_review(review_items, all_warnings, anchors_acc)
    print(f"\nReview → {REVIEW_PATH.relative_to(ROOT)}")
    print(f"Assets written: {len(review_items)}")
    if all_warnings:
        print("\nWARNINGS:")
        for w in all_warnings:
            print(" -", w)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
