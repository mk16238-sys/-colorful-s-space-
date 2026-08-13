import os, sys
from PIL import Image

MEDIA = "/Users/worklist/WorkBuddy/2026-08-04-15-31-17/colorful-space/public/media"

# 各子目录的最大宽度（按实际显示尺寸估算，留 2x 余量）
MAXW = {
    "showcase": 1100,   # 照片墙单卡 ~280px,2x
    "preview": 1600,    # 灯箱大屏图,铺满
    "collage": 700,     # 拼图小块
    "posters": 900,     # 作品封面
    "lanyard": 1000,    # 3D 卡片贴图
    "": 500,            # 根目录(avatar)
}

def maxw_for(path):
    rel = os.path.relpath(path, MEDIA)
    top = rel.split(os.sep)[0] if os.sep in rel else ""
    return MAXW.get(top, 1400)

def convert(fp):
    base, ext = os.path.splitext(fp)
    out = base + ".webp"
    try:
        with Image.open(fp) as im:
            im = im.convert("RGBA") if im.mode in ("RGBA", "P", "LA") else im.convert("RGB")
            w, h = im.size
            mw = maxw_for(fp)
            if w > mw:
                nh = max(1, int(h * mw / w))
                im = im.resize((mw, nh), Image.LANCZOS)
            im.save(out, "WEBP", quality=85, method=4)
        os.remove(fp)
        return True, os.path.getsize(out)
    except Exception as e:
        return False, str(e)

total_old = total_new = 0
count = 0
for root, dirs, files in os.walk(MEDIA):
    for f in files:
        if f.lower().endswith((".png", ".jpg", ".jpeg")):
            fp = os.path.join(root, f)
            old = os.path.getsize(fp)
            ok, res = convert(fp)
            if ok:
                count += 1
                total_old += old
                total_new += res
            else:
                print("FAIL", fp, res)

print(f"\n转换 {count} 张")
print(f"原体积: {total_old/1024/1024:.1f} MB -> 新体积: {total_new/1024/1024:.1f} MB")
print(f"压缩比: {total_old/max(total_new,1):.1f}x")
