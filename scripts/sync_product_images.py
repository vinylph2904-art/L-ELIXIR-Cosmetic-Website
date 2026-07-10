import os
import re
import json

ROOT = os.path.join(os.getcwd(), 'src', 'app', 'data')
IMG_ROOT = os.path.join(os.getcwd(), 'src', 'assets', 'images')
JSON_PATH = os.path.join(ROOT, 'mock-products.json')

# list files
def list_files(folder):
    p = os.path.join(IMG_ROOT, folder)
    try:
        return [f for f in os.listdir(p) if os.path.isfile(os.path.join(p, f))]
    except FileNotFoundError:
        return []

sr_files = list_files('SRM')
kcn_files = list_files('KCN')
serum_files = list_files('Serum')

# build sr groups by prefix before dot (e.g., SP01.1.png -> SP01)
sr_groups = {}
for f in sr_files:
    m = re.match(r"(SP\d{2})\..+", f, re.IGNORECASE)
    if m:
        key = m.group(1).upper()
        sr_groups.setdefault(key, []).append(os.path.join('assets', 'images', 'SRM', f))

# sort each group's files so that .1 is first
for k, arr in sr_groups.items():
    arr.sort(key=lambda s: (0 if '.1' in s else 1, s))

# build kcn groups by number after 'kcn ' prefix
kcn_groups = {}
for f in kcn_files:
    m = re.match(r"kcn\s*(\d+)", f, re.IGNORECASE)
    if m:
        key = int(m.group(1))
        kcn_groups.setdefault(key, []).append(os.path.join('assets','images','KCN', f))
# sort groups by key
kcn_keys = sorted(kcn_groups.keys())
for k in kcn_groups:
    kcn_groups[k].sort(key=lambda s: (0 if '.1' in s.lower() else 1, s))

# build serum groups by numeric prefix after 'Serum '
serum_groups = {}
for f in serum_files:
    m = re.match(r"Serum\s*(\d+)", f, re.IGNORECASE)
    if m:
        key = int(m.group(1))
        serum_groups.setdefault(key, []).append(os.path.join('assets','images','Serum', f))
for k in serum_groups:
    # put main 'Serum X.png' first if exists
    serum_groups[k].sort(key=lambda s: (0 if re.search(r"serum\s*%d(\.|\\b)"%k, s, re.IGNORECASE) else 1, s))

# load json
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

# indexes for kcn and serum allocations
kcn_idx = 0
kcn_key_list = kcn_keys
serum_key_list = sorted(serum_groups.keys())
serum_idx = 0

for p in products:
    cat = p.get('categoryName','').lower()
    pid = p.get('productId','').upper()
    name = p.get('name','')

    if 'sữa rửa mặt' in cat or 'sữa rửa mặt' in name.lower() or 'sua rua mat' in name.lower():
        # try exact SRM group by productId
        grp = sr_groups.get(pid)
        if grp:
            p['images'] = grp[:4]
    elif 'chống nắng' in cat or 'chống nắng' in name.lower() or 'chong nang' in name.lower():
        # assign next kcn group sequentially
        if kcn_idx < len(kcn_key_list):
            key = kcn_key_list[kcn_idx]
            grp = kcn_groups.get(key, [])
            if grp:
                p['images'] = grp[:4]
            kcn_idx += 1
    elif 'serum' in cat.lower() or 'serum' in name.lower():
        # try to detect numeric in name like 'Serum X' else assign sequential
        m = re.search(r"serum\s*(\d+)", name, re.IGNORECASE)
        if m:
            key = int(m.group(1))
            grp = serum_groups.get(key)
            if grp:
                p['images'] = grp[:4]
        else:
            if serum_idx < len(serum_key_list):
                key = serum_key_list[serum_idx]
                p['images'] = serum_groups.get(key, [])[:4]
                serum_idx += 1
    # ensure cover first exists and is the .1 variant if available
    imgs = p.get('images', [])
    if imgs:
        # sort to put a file containing '.1' or ending with number+ext first
        imgs.sort(key=lambda s: (0 if re.search(r"(\.1\.|\.1\\.|1\\.|\.1\\b|1\\.") , s) else 1, s))
        p['images'] = imgs[:4]

# write back
with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print('Updated mock-products.json with image groups')
