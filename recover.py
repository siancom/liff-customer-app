import json
import sys

log_path = "/Users/ittichai/.gemini/antigravity-ide/brain/cc6538ea-977f-4608-856f-2b1e2bb15cd4/.system_generated/logs/transcript.jsonl"
app_path = "src/App.jsx"

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements_applied = 0

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        if not line.strip(): continue
        try:
            data = json.loads(line)
            if data.get("type") == "PLANNER_RESPONSE" and "tool_calls" in data:
                for tc in data["tool_calls"]:
                    name = tc.get("name")
                    if name in ("default_api:multi_replace_file_content", "default_api:replace_file_content", "multi_replace_file_content", "replace_file_content"):
                        args = tc.get("args", tc.get("arguments", {}))
                        if isinstance(args, str):
                            try:
                                args = json.loads(args)
                            except:
                                continue
                        
                        target_file = args.get("TargetFile", "")
                        if "App.jsx" in target_file:
                            chunks = args.get("ReplacementChunks", [])
                            if not chunks and "TargetContent" in args:
                                chunks = [args]
                            
                            for chunk in chunks:
                                target_content = chunk.get("TargetContent", "")
                                replace_content = chunk.get("ReplacementContent", "")
                                if target_content in content:
                                    content = content.replace(target_content, replace_content)
                                    replacements_applied += 1
                                else:
                                    print("Failed to match target content")
        except Exception as e:
            pass

print(f"Applied {replacements_applied} replacements.")
with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(content)
