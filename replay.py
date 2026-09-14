import json
import os

with open("src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

applied = 0
failed = 0

for i in range(1, 88):
    patch_file = f"patch_{i}.txt"
    if not os.path.exists(patch_file): continue
    
    with open(patch_file, "r", encoding="utf-8") as f:
        try:
            chunks = json.load(f)
            if isinstance(chunks, str):
                chunks = json.loads(chunks)
        except Exception as e:
            print(f"Error parsing {patch_file}: {e}")
            continue
            
    for chunk in chunks:
        if isinstance(chunk, str):
            try: chunk = json.loads(chunk)
            except: continue
        target = chunk.get("TargetContent", "")
        replacement = chunk.get("ReplacementContent", "")
        if target in content:
            content = content.replace(target, replacement)
            applied += 1
        else:
            failed += 1

print(f"Applied {applied} patches, failed {failed} patches.")
with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(content)
