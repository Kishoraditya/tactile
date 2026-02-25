import os
import json
from pathlib import Path

def update_manifest():
    audio_dir = Path("frontend/public/audio")
    manifest_path = audio_dir / "manifest.json"
    
    # Simple mapping logic consistent with tts-service.ts
    manifest = {}
    
    for lang in ["en", "mr"]:
        lang_dir = audio_dir / lang
        if not lang_dir.exists():
            continue
            
        for root, dirs, files in os.walk(lang_dir):
            for file in files:
                if file.endswith(".mp3"):
                    # key format: filename_lang
                    key = Path(file).stem + "_" + lang
                    # path format: /audio/lang/subdir/filename
                    rel_path = "/" + Path(root).relative_to(audio_dir.parent).as_posix() + "/" + file
                    manifest[key] = rel_path
                    
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"Updated manifest with {len(manifest)} files.")

if __name__ == "__main__":
    update_manifest()
