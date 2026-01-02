import google.generativeai as genai
import json
import os

class GeminiActionParser:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
    
    def extract_actions_from_dialogue(self, dialogue: str, context: str = "") -> dict:
        """
        Uses Gemini to understand the dialogue and extract animation actions.
        """
        if not self.model:
            return self._fallback_extraction(dialogue)
        
        prompt = f"""
        Analyze this dialogue from a dental hygiene avatar app and extract animation instructions.
        
        Context: {context}
        Dialogue: "{dialogue}"
        
        Return a JSON object with:
        {{
            "primary_action": "main animation action",
            "sub_actions": ["list", "of", "sequential", "sub-actions"],
            "body_parts": ["mouth", "arm", "tongue", etc.],
            "motion_type": "circular|linear|wave|static",
            "emotion": "happy|excited|calm|encouraging",
            "duration_hint": "short|medium|long",
            "props": ["toothbrush", "cup", "paste", etc.],
            "mouth_sync": true/false,
            "special_effects": ["sparkles", "bubbles", etc.]
        }}
        
        Only return valid JSON, no explanation.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Clean markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            print(f"Gemini parsing failed: {e}")
            return self._fallback_extraction(dialogue)
    
    def _fallback_extraction(self, dialogue: str) -> dict:
        """Keyword-based fallback when Gemini is unavailable."""
        dialogue_lower = dialogue.lower()
        
        action_map = {
            "pick up": {"primary_action": "pickup", "props": ["toothbrush"]},
            "rinse": {"primary_action": "rinsing", "sub_actions": ["drink", "swish", "spit"]},
            "swish": {"primary_action": "swishing", "body_parts": ["cheeks", "mouth"]},
            "spit": {"primary_action": "spitting", "body_parts": ["mouth"]},
            "paste": {"primary_action": "applying_paste", "props": ["toothpaste", "toothbrush"]},
            "roar": {"primary_action": "openMouth", "emotion": "playful"},
            "open wide": {"primary_action": "openMouth", "body_parts": ["mouth"]},
            "bottom": {"primary_action": "brushing", "sub_actions": ["brush_bottom_teeth"]},
            "top": {"primary_action": "brushing", "sub_actions": ["brush_top_teeth"]},
            "front": {"primary_action": "brushing", "sub_actions": ["brush_front_teeth"]},
            "tongue": {"primary_action": "tongueOut", "sub_actions": ["brush_tongue"]},
            "molar": {"primary_action": "brushing", "sub_actions": ["brush_molars"]},
            "wiggle": {"primary_action": "brushing", "motion_type": "wiggle"},
            "circular": {"primary_action": "brushing", "motion_type": "circular"},
            "angle": {"primary_action": "brushing", "motion_type": "angled"},
            "45": {"primary_action": "brushing", "motion_type": "angled_45"},
            "celebrate": {"primary_action": "celebrate", "emotion": "excited"},
            "hooray": {"primary_action": "celebrate", "special_effects": ["sparkles"]},
            "wave": {"primary_action": "wave", "body_parts": ["arm"]},
            "morning": {"primary_action": "greeting", "emotion": "happy"},
            "night": {"primary_action": "greeting", "emotion": "calm"},
        }
        
        result = {
            "primary_action": "idle",
            "sub_actions": [],
            "body_parts": [],
            "motion_type": "static",
            "emotion": "neutral",
            "duration_hint": "medium",
            "props": [],
            "mouth_sync": True,
            "special_effects": []
        }
        
        for keyword, actions in action_map.items():
            if keyword in dialogue_lower:
                result.update(actions)
                break
        
        return result

    def parse_full_storyboard(self, filepath: str) -> list[dict]:
        """Parse entire storyboard with Gemini understanding."""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        scenes = []
        lines = content.split('\n')
        current_character = None
        current_context = ""
        
        for line in lines:
            line = line.strip()
            
            # Track character context
            if line.startswith("## "):
                if "Luna" in line:
                    current_character = "luna"
                    current_context = "gentle fairy for toddlers ages 1-4"
                elif "Captain" in line:
                    current_character = "captain"
                    current_context = "energetic hero for kids ages 5-11"
                elif "Dr." in line:
                    current_character = "dr_bright"
                    current_context = "professional doctor for teens ages 12-18"
                continue
            
            # Parse table rows
            if "|" in line and current_character:
                parts = [p.strip() for p in line.split('|') if p.strip()]
                if len(parts) >= 4:
                    try:
                        step_num = parts[0]
                        step_name = parts[1]
                        duration = parts[2]
                        animation_hint = parts[3]
                        dialogue = parts[4] if len(parts) > 4 else ""
                        
                        # Skip headers
                        if "Step" in step_num or "---" in step_num or "#" in step_num:
                            continue
                        
                        # Parse duration
                        duration_seconds = self._parse_duration(duration)
                        
                        # Get AI-powered action analysis
                        action_data = self.extract_actions_from_dialogue(
                            dialogue, 
                            context=f"{current_character}: {step_name}"
                        )
                        
                        scenes.append({
                            "id": f"{current_character}_{step_num}",
                            "character": current_character,
                            "step_name": step_name,
                            "dialogue": dialogue,
                            "animation_hint": animation_hint,
                            "duration": duration_seconds,
                            "actions": action_data,
                            "context": current_context
                        })
                    except (IndexError, ValueError):
                        continue
        
        return scenes
    
    def _parse_duration(self, duration_str: str) -> float:
        """Extract seconds from duration string like '5s' or '20s'."""
        import re
        match = re.search(r'(\d+)', duration_str)
        return float(match.group(1)) if match else 5.0
