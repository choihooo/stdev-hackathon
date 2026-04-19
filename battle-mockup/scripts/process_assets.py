import io
import os
import numpy as np
from PIL import Image
from rembg import remove

ASSETS = '/Users/choiho/coding/unicornSlayer/battle-mockup/src/assets'

SIZES = {
    'card-': 64,
    'icon-': 32,
    'enemy-': 128,
    'boss-': 128,
}

SKIP = {'hero.png', 'react.svg', 'vite.svg'}

files = sorted([f for f in os.listdir(ASSETS) if f.endswith('.png') and f not in SKIP])

for f in files:
    path = os.path.join(ASSETS, f)

    # Determine target size
    size = 64
    for prefix, s in SIZES.items():
        if f.startswith(prefix):
            size = s
            break

    print(f'Processing {f} -> {size}x{size} ...')

    try:
        inp = Image.open(path)
        if inp.mode == 'RGB':
            inp = inp.convert('RGBA')

        arr = np.array(inp)
        has_transparency = arr.shape[2] == 4 and arr[:, :, 3].min() < 128

        if not has_transparency:
            print(f'  Removing background...')
            with open(path, 'rb') as fi:
                output = remove(fi.read())
            inp = Image.open(io.BytesIO(output)).convert('RGBA')

        out = inp.resize((size, size), Image.NEAREST)
        out.save(path)
        fsize = os.path.getsize(path)
        print(f'  Done: {f} ({size}x{size}, {fsize//1024}KB)')
    except Exception as e:
        print(f'  ERROR: {e}')
