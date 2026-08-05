#!/usr/bin/env python3
"""
处理拼贴工作照:
1. 去掉纯色背景
2. 按颜色检测便利贴
3. 按硬编码网格切分照片块
4. 输出到 public/media/collage/ 并生成 src/data/collage.json
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SRC = Path('/Users/worklist/.workbuddy/clipboard-images/clipboard-2026-08-04T09-01-22-748Z-5b5f1579.jpg')
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'public/media/collage'
JSON_OUT = ROOT / 'src/data/collage.json'

BG = np.array([193, 208, 211], dtype=np.float32)
DIST_BG = 45            # 背景判定距离
TILE_AREA_MIN = 1200    # 网格块最小不透明度(像素*255)
NOTE_AREA_MIN = 15000
NOTE_AREA_MAX = 80000
NOTE_ASPECT_MIN = 0.4
NOTE_ASPECT_MAX = 2.0

# 根据原图视觉手动标定的网格(4列 x 5行)
COLS = [200, 457, 653, 899, 1225]
ROWS = [316, 619, 838, 1031, 1229, 1619]


def remove_bg(img):
    arr = np.array(img.convert('RGBA'))
    dist = np.linalg.norm(arr[:, :, :3].astype(np.float32) - BG, axis=2)
    alpha = np.where(dist < DIST_BG, 0, 255).astype(np.uint8)
    arr[:, :, 3] = alpha
    return Image.fromarray(arr), alpha


def detect_notes(img, alpha):
    arr = np.array(img.convert('RGB'))
    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
    bg_mask = alpha < 128

    yellow = cv2.inRange(hsv, np.array([15, 40, 120]), np.array([60, 255, 255]))
    white = cv2.inRange(hsv, np.array([0, 0, 180]), np.array([180, 40, 255]))
    note_mask = cv2.bitwise_or(yellow, white)
    note_mask[bg_mask] = 0

    kernel = np.ones((5, 5), np.uint8)
    note_mask = cv2.morphologyEx(note_mask, cv2.MORPH_CLOSE, kernel)
    note_mask = cv2.morphologyEx(note_mask, cv2.MORPH_OPEN, kernel)

    num, labels, stats, centroids = cv2.connectedComponentsWithStats(note_mask, connectivity=8)
    notes = []
    for i in range(1, num):
        area = int(stats[i, cv2.CC_STAT_AREA])
        x = int(stats[i, cv2.CC_STAT_LEFT])
        y = int(stats[i, cv2.CC_STAT_TOP])
        w = int(stats[i, cv2.CC_STAT_WIDTH])
        h = int(stats[i, cv2.CC_STAT_HEIGHT])
        aspect = w / h if h else 999
        if not (NOTE_AREA_MIN < area < NOTE_AREA_MAX and NOTE_ASPECT_MIN < aspect < NOTE_ASPECT_MAX):
            continue
        # 计算最小外接矩形角度,用于 CSS 还原原始倾斜
        pts = np.column_stack(np.where(labels == i))
        rect = cv2.minAreaRect(pts)  # ((cx,cy), (w,h), angle)
        angle = rect[2]
        notes.append({
            'id': f'note-{len(notes) + 1}',
            'type': 'note',
            'x': x, 'y': y, 'w': w, 'h': h,
            'cx': int(centroids[i][0]),
            'cy': int(centroids[i][1]),
            'angle': round(angle, 1),
            'area': area,
        })
    return notes


def main():
    img = Image.open(SRC)
    img_w, img_h = img.size
    rgba, alpha = remove_bg(img)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    notes = detect_notes(img, alpha)
    print(f'detected {len(notes)} sticky notes')

    note_mask = np.zeros(alpha.shape, dtype=np.uint8)
    for n in notes:
        note_mask[n['y']:n['y'] + n['h'], n['x']:n['x'] + n['w']] = 255

    pieces = []

    # 照片网格块
    for r in range(len(ROWS) - 1):
        for c in range(len(COLS) - 1):
            x1, y1 = COLS[c], ROWS[r]
            x2, y2 = COLS[c + 1], ROWS[r + 1]
            cell = rgba.crop((x1, y1, x2, y2))
            cell_arr = np.array(cell)
            nm = note_mask[y1:y2, x1:x2]
            cell_arr[nm > 0] = [0, 0, 0, 0]
            if cell_arr[:, :, 3].sum() < TILE_AREA_MIN * 255:
                continue
            cell = Image.fromarray(cell_arr)
            pid = f'tile-{r}-{c}'
            cell.save(OUT_DIR / f'{pid}.png')
            pieces.append({
                'id': pid,
                'type': 'tile',
                'x': x1, 'y': y1, 'w': x2 - x1, 'h': y2 - y1,
                'cx': (x1 + x2) // 2,
                'cy': (y1 + y2) // 2,
                'angle': 0,
            })

    # 便利贴
    for n in notes:
        crop = rgba.crop((n['x'], n['y'], n['x'] + n['w'], n['y'] + n['h']))
        crop.save(OUT_DIR / f"{n['id']}.png")
        pieces.append({
            'id': n['id'],
            'type': 'note',
            'x': n['x'], 'y': n['y'], 'w': n['w'], 'h': n['h'],
            'cx': n['cx'], 'cy': n['cy'],
            'angle': n['angle'],
        })

    # 生成动画参数(从上到下、从左到右贴,便利贴稍晚)
    pieces.sort(key=lambda p: (p['y'], p['x']))
    tile_idx = 0
    note_idx = 0
    for p in pieces:
        p['relX'] = p['cx'] / img_w
        p['relY'] = p['cy'] / img_h
        if p['type'] == 'tile':
            p['delay'] = round(tile_idx * 0.045, 3)
            tile_idx += 1
        else:
            p['delay'] = round(0.35 + note_idx * 0.12, 3)
            note_idx += 1
        # 出场方向:从中心向外或从上方飘落
        dx = p['relX'] - 0.5
        dy = p['relY'] - 0.5
        p['fromX'] = round(dx * 120, 1)
        p['fromY'] = round(-60 - abs(dx) * 40, 1)
        p['fromRot'] = round(p['angle'] + (dx * 25), 1)

    data = {
        'sourceSize': {'w': img_w, 'h': img_h},
        'pieces': pieces,
    }
    JSON_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'wrote {len(pieces)} pieces ({tile_idx} tiles + {note_idx} notes) to {OUT_DIR}')
    print(f'json -> {JSON_OUT}')


if __name__ == '__main__':
    main()
