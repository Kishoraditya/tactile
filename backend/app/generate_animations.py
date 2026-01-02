import json
import os
from gemini_action_parser import GeminiActionParser
from animation_engine import AnimationEngine

class AnimationGenerator:
    def __init__(self, gemini_api_key: str = None):
        self.parser = GeminiActionParser(gemini_api_key)
        self.engine = AnimationEngine()
        self.scenes = []
        self.animations = {}
    
    def process_storyboard(self, storyboard_path: str):
        """Full pipeline: parse -> generate -> export."""
        print(f"📖 Parsing storyboard: {storyboard_path}")
        self.scenes = self.parser.parse_full_storyboard(storyboard_path)
        print(f"   Found {len(self.scenes)} scenes")
        
        print("🎬 Generating animations...")
        for scene in self.scenes:
            anim = self.engine.generate_animation(
                scene["actions"],
                scene["duration"]
            )
            anim.name = scene["id"]
            self.animations[scene["id"]] = anim
            print(f"   ✓ {scene['id']}: {scene['actions'].get('primary_action')}")
        
        return self.animations
    
    def export_all(self, output_dir: str, format: str = "lottie"):
        """Export all animations to files."""
        os.makedirs(output_dir, exist_ok=True)
        
        manifest = {
            "version": "1.0",
            "format": format,
            "animations": {}
        }
        
        for scene_id, anim in self.animations.items():
            if format == "lottie":
                data = self.engine.export_to_lottie(anim)
            else:
                data = self.engine.export_to_threejs(anim)
            
            filename = f"{scene_id}.json"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)
            
            manifest["animations"][scene_id] = {
                "file": filename,
                "duration": anim.duration,
                "loop": anim.loop
            }
        
        # Save manifest
        manifest_path = os.path.join(output_dir, "manifest.json")
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"✅ Exported {len(self.animations)} animations to {output_dir}")
        return manifest
    
    def export_combined_timeline(self, output_path: str):
        """Export a single timeline JSON for web player."""
        timeline = {
            "characters": {},
            "total_duration": 0
        }
        
        current_time = 0
        for scene in self.scenes:
            char = scene["character"]
            if char not in timeline["characters"]:
                timeline["characters"][char] = {"scenes": [], "total_duration": 0}
            
            anim_data = self.engine.export_to_threejs(self.animations[scene["id"]])
            
            timeline["characters"][char]["scenes"].append({
                "id": scene["id"],
                "step": scene["step_name"],
                "dialogue": scene["dialogue"],
                "start_time": timeline["characters"][char]["total_duration"],
                "duration": scene["duration"],
                "animation": anim_data,
                "actions": scene["actions"]
            })
            
            timeline["characters"][char]["total_duration"] += scene["duration"]
        
        with open(output_path, 'w') as f:
            json.dump(timeline, f, indent=2)
        
        print(f"✅ Exported combined timeline to {output_path}")
        return timeline


if __name__ == "__main__":
    import sys
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    
    generator = AnimationGenerator(api_key)
    
    # Paths
    script_path = "../../docs/storyboard_script.md"
    output_dir = "./assets/output/animations"
    
    # Check if storyboard exists
    if not os.path.exists(script_path):
        # Try alternate paths
        alt_paths = [
            "../docs/storyboard_script.md",
            "docs/storyboard_script.md",
            "./storyboard_script.md"
        ]
        for alt in alt_paths:
            if os.path.exists(alt):
                script_path = alt
                break
        else:
            print("❌ Could not find storyboard_script.md")
            sys.exit(1)
    
    # Run pipeline
    generator.process_storyboard(script_path)
    generator.export_all(output_dir, format="threejs")
    generator.export_combined_timeline(os.path.join(output_dir, "timeline.json"))
