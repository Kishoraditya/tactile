import json
import math
from dataclasses import dataclass, field
from typing import List, Dict, Any
from enum import Enum

class MotionType(Enum):
    LINEAR = "linear"
    CIRCULAR = "circular"
    WAVE = "wave"
    WIGGLE = "wiggle"
    BOUNCE = "bounce"
    EASE_IN_OUT = "ease_in_out"

@dataclass
class Keyframe:
    time: float  # 0.0 to 1.0 (normalized)
    properties: Dict[str, float]
    easing: str = "easeInOut"

@dataclass
class AnimationTrack:
    target: str  # "arm", "mouth", "body", etc.
    property: str  # "rotation", "position", "scale"
    keyframes: List[Keyframe] = field(default_factory=list)

@dataclass 
class Animation:
    name: str
    duration: float
    tracks: List[AnimationTrack] = field(default_factory=list)
    loop: bool = False
    events: List[Dict] = field(default_factory=list)  # Sound/particle triggers

class AnimationEngine:
    """
    Generates procedural animations for avatar actions.
    Outputs Lottie-compatible JSON or Three.js animation clips.
    """
    
    def __init__(self):
        self.animations: Dict[str, Animation] = {}
        self.body_parts = {
            "head": {"x": 0, "y": 100, "rotation": 0},
            "mouth": {"open": 0, "smile": 0.5},
            "tongue": {"out": 0, "x": 0},
            "left_arm": {"rotation": -30, "x": -50},
            "right_arm": {"rotation": 30, "x": 50},
            "toothbrush": {"x": 60, "y": 50, "rotation": 0, "visible": False},
            "cup": {"x": -60, "y": 40, "visible": False},
            "body": {"y": 0, "scale": 1}
        }
    
    def generate_animation(self, action_data: dict, duration: float) -> Animation:
        """
        Generate animation based on parsed action data.
        """
        primary_action = action_data.get("primary_action", "idle")
        
        # Route to specific generator
        generator_map = {
            "idle": self._gen_idle,
            "wave": self._gen_wave,
            "greeting": self._gen_wave,
            "pickup": self._gen_pickup_brush,
            "rinsing": self._gen_rinse,
            "swishing": self._gen_swish,
            "spitting": self._gen_spit,
            "applying_paste": self._gen_apply_paste,
            "openMouth": self._gen_open_mouth,
            "brushing": self._gen_brushing,
            "tongueOut": self._gen_tongue_out,
            "celebrate": self._gen_celebrate,
            "thumbsUp": self._gen_thumbs_up,
        }
        
        generator = generator_map.get(primary_action, self._gen_idle)
        animation = generator(action_data, duration)
        
        # Add sub-actions
        for sub_action in action_data.get("sub_actions", []):
            sub_gen = generator_map.get(sub_action)
            if sub_gen:
                sub_anim = sub_gen(action_data, duration * 0.3)
                animation.tracks.extend(sub_anim.tracks)
        
        return animation
    
    def _gen_idle(self, data: dict, duration: float) -> Animation:
        """Idle breathing/blinking animation."""
        anim = Animation(name="idle", duration=duration, loop=True)
        
        # Subtle body breathing
        anim.tracks.append(AnimationTrack(
            target="body",
            property="scale",
            keyframes=[
                Keyframe(0.0, {"scale": 1.0}),
                Keyframe(0.5, {"scale": 1.02}),
                Keyframe(1.0, {"scale": 1.0}),
            ]
        ))
        
        # Blinking
        anim.tracks.append(AnimationTrack(
            target="eyes",
            property="blink",
            keyframes=[
                Keyframe(0.0, {"blink": 0}),
                Keyframe(0.45, {"blink": 0}),
                Keyframe(0.5, {"blink": 1}),
                Keyframe(0.55, {"blink": 0}),
                Keyframe(1.0, {"blink": 0}),
            ]
        ))
        
        return anim
    
    def _gen_wave(self, data: dict, duration: float) -> Animation:
        """Waving greeting animation."""
        anim = Animation(name="wave", duration=duration)
        
        # Raise arm
        anim.tracks.append(AnimationTrack(
            target="right_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 30}),
                Keyframe(0.2, {"rotation": -120}),  # Arm up
                Keyframe(0.35, {"rotation": -100}),  # Wave
                Keyframe(0.5, {"rotation": -120}),
                Keyframe(0.65, {"rotation": -100}),
                Keyframe(0.8, {"rotation": -120}),
                Keyframe(1.0, {"rotation": 30}),  # Return
            ]
        ))
        
        # Happy expression
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="smile",
            keyframes=[
                Keyframe(0.0, {"smile": 0.5}),
                Keyframe(0.2, {"smile": 1.0}),
                Keyframe(0.9, {"smile": 1.0}),
                Keyframe(1.0, {"smile": 0.5}),
            ]
        ))
        
        return anim
    
    def _gen_pickup_brush(self, data: dict, duration: float) -> Animation:
        """Pick up toothbrush animation."""
        anim = Animation(name="pickup_brush", duration=duration)
        
        # Arm reaches out
        anim.tracks.append(AnimationTrack(
            target="right_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 30}),
                Keyframe(0.3, {"rotation": 60}),  # Reach
                Keyframe(0.5, {"rotation": 45}),  # Grab
                Keyframe(0.7, {"rotation": 20}),  # Pull back
                Keyframe(1.0, {"rotation": 30}),  # Hold position
            ]
        ))
        
        # Toothbrush appears
        anim.tracks.append(AnimationTrack(
            target="toothbrush",
            property="visible",
            keyframes=[
                Keyframe(0.0, {"visible": 0}),
                Keyframe(0.5, {"visible": 1}),
                Keyframe(1.0, {"visible": 1}),
            ]
        ))
        
        anim.events.append({"time": 0.5, "type": "sound", "id": "pickup_sound"})
        
        return anim
    
    def _gen_rinse(self, data: dict, duration: float) -> Animation:
        """Full rinse sequence: pickup cup, drink, swish, spit."""
        anim = Animation(name="rinsing", duration=duration)
        
        # Left arm picks up cup
        anim.tracks.append(AnimationTrack(
            target="left_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": -30}),
                Keyframe(0.1, {"rotation": -60}),   # Reach for cup
                Keyframe(0.2, {"rotation": -90}),   # Lift cup
                Keyframe(0.3, {"rotation": -120}),  # Cup to mouth
                Keyframe(0.4, {"rotation": -130}),  # Tilt to drink
                Keyframe(0.5, {"rotation": -90}),   # Lower cup (swishing)
                Keyframe(0.8, {"rotation": -60}),   # Prepare spit
                Keyframe(1.0, {"rotation": -30}),   # Return
            ]
        ))
        
        # Cup visibility
        anim.tracks.append(AnimationTrack(
            target="cup",
            property="visible",
            keyframes=[
                Keyframe(0.0, {"visible": 0}),
                Keyframe(0.1, {"visible": 1}),
                Keyframe(0.9, {"visible": 1}),
                Keyframe(1.0, {"visible": 0}),
            ]
        ))
        
        # Mouth for swishing
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="puff",
            keyframes=[
                Keyframe(0.0, {"puff": 0}),
                Keyframe(0.35, {"puff": 0}),
                Keyframe(0.4, {"puff": 1}),    # Cheeks puff
                Keyframe(0.5, {"puff": 0.5}),  # Swish left
                Keyframe(0.6, {"puff": 1}),    # Swish right
                Keyframe(0.7, {"puff": 0.5}),
                Keyframe(0.8, {"puff": 0}),    # Spit
                Keyframe(1.0, {"puff": 0}),
            ]
        ))
        
        # Head tilt during drink
        anim.tracks.append(AnimationTrack(
            target="head",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 0}),
                Keyframe(0.35, {"rotation": -15}),  # Tilt back to drink
                Keyframe(0.5, {"rotation": 0}),
                Keyframe(0.8, {"rotation": 20}),    # Lean forward to spit
                Keyframe(1.0, {"rotation": 0}),
            ]
        ))
        
        anim.events.append({"time": 0.35, "type": "sound", "id": "gulp"})
        anim.events.append({"time": 0.5, "type": "sound", "id": "swish"})
        anim.events.append({"time": 0.85, "type": "sound", "id": "spit"})
        anim.events.append({"time": 0.85, "type": "particle", "id": "water_splash"})
        
        return anim
    
    def _gen_swish(self, data: dict, duration: float) -> Animation:
        """Swishing water in mouth."""
        anim = Animation(name="swishing", duration=duration, loop=True)
        
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="puff",
            keyframes=[
                Keyframe(0.0, {"puff": 0.8, "offset_x": -10}),
                Keyframe(0.25, {"puff": 1.0, "offset_x": 10}),
                Keyframe(0.5, {"puff": 0.8, "offset_x": -10}),
                Keyframe(0.75, {"puff": 1.0, "offset_x": 10}),
                Keyframe(1.0, {"puff": 0.8, "offset_x": -10}),
            ]
        ))
        
        return anim
    
    def _gen_spit(self, data: dict, duration: float) -> Animation:
        """Spitting animation."""
        anim = Animation(name="spitting", duration=duration)
        
        # Lean forward
        anim.tracks.append(AnimationTrack(
            target="body",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 0}),
                Keyframe(0.3, {"rotation": 20}),   # Lean forward
                Keyframe(0.5, {"rotation": 25}),   # Spit
                Keyframe(1.0, {"rotation": 0}),
            ]
        ))
        
        # Mouth opens for spit
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="open",
            keyframes=[
                Keyframe(0.0, {"open": 0, "shape": "puff"}),
                Keyframe(0.4, {"open": 0.3, "shape": "o"}),
                Keyframe(0.5, {"open": 0.8, "shape": "o"}),  # Spit moment
                Keyframe(0.7, {"open": 0.2, "shape": "normal"}),
                Keyframe(1.0, {"open": 0, "shape": "smile"}),
            ]
        ))
        
        anim.events.append({"time": 0.5, "type": "particle", "id": "spit_bubbles"})
        anim.events.append({"time": 0.5, "type": "sound", "id": "spit_sound"})
        
        return anim
    
    def _gen_apply_paste(self, data: dict, duration: float) -> Animation:
        """Applying toothpaste animation."""
        anim = Animation(name="applying_paste", duration=duration)
        
        # Hold brush steady with right hand
        anim.tracks.append(AnimationTrack(
            target="right_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 30}),
                Keyframe(0.2, {"rotation": 0}),  # Hold brush out
                Keyframe(0.8, {"rotation": 0}),
                Keyframe(1.0, {"rotation": 30}),
            ]
        ))
        
        # Left hand squeezes tube
        anim.tracks.append(AnimationTrack(
            target="left_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": -30}),
                Keyframe(0.2, {"rotation": -20}),  # Approach brush
                Keyframe(0.4, {"rotation": -10}),  # Squeeze
                Keyframe(0.6, {"rotation": -15}),
                Keyframe(0.8, {"rotation": -30}),
                Keyframe(1.0, {"rotation": -30}),
            ]
        ))
        
        # Paste appears on brush
        anim.tracks.append(AnimationTrack(
            target="paste_blob",
            property="scale",
            keyframes=[
                Keyframe(0.0, {"scale": 0}),
                Keyframe(0.3, {"scale": 0}),
                Keyframe(0.5, {"scale": 0.5}),
                Keyframe(0.7, {"scale": 1}),
                Keyframe(1.0, {"scale": 1}),
            ]
        ))
        
        anim.events.append({"time": 0.5, "type": "sound", "id": "squeeze"})
        
        return anim
    
    def _gen_open_mouth(self, data: dict, duration: float) -> Animation:
        """Open mouth wide (roar) animation."""
        anim = Animation(name="openMouth", duration=duration)
        
        # Mouth opens wide
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="open",
            keyframes=[
                Keyframe(0.0, {"open": 0}),
                Keyframe(0.3, {"open": 1.0}),  # Full open
                Keyframe(0.7, {"open": 1.0}),  # Hold
                Keyframe(1.0, {"open": 0.3}),  # Partial close
            ]
        ))
        
        # Head tilts back slightly
        anim.tracks.append(AnimationTrack(
            target="head",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 0}),
                Keyframe(0.3, {"rotation": -10}),
                Keyframe(0.7, {"rotation": -10}),
                Keyframe(1.0, {"rotation": 0}),
            ]
        ))
        
        # Arms raise for "roar" effect (if playful)
        if data.get("emotion") == "playful":
            anim.tracks.append(AnimationTrack(
                target="left_arm",
                property="rotation",
                keyframes=[
                    Keyframe(0.0, {"rotation": -30}),
                    Keyframe(0.3, {"rotation": -120}),
                    Keyframe(0.7, {"rotation": -120}),
                    Keyframe(1.0, {"rotation": -30}),
                ]
            ))
        
        return anim
    
    def _gen_brushing(self, data: dict, duration: float) -> Animation:
        """Brushing teeth animation with different motion types."""
        motion = data.get("motion_type", "linear")
        sub_actions = data.get("sub_actions", [])
        
        anim = Animation(name=f"brushing_{motion}", duration=duration, loop=True)
        
        # Determine brush position based on target area
        brush_y = 50  # Default
        brush_x = 60
        
        if any("bottom" in s for s in sub_actions):
            brush_y = 30
        elif any("top" in s for s in sub_actions):
            brush_y = 70
        elif any("front" in s for s in sub_actions):
            brush_x = 40
        elif any("molar" in s for s in sub_actions):
            brush_x = 80
        
        # Motion patterns
        if motion == "circular":
            anim.tracks.append(AnimationTrack(
                target="toothbrush",
                property="position",
                keyframes=[
                    Keyframe(0.0, {"x": brush_x, "y": brush_y}),
                    Keyframe(0.25, {"x": brush_x + 5, "y": brush_y + 5}),
                    Keyframe(0.5, {"x": brush_x, "y": brush_y + 8}),
                    Keyframe(0.75, {"x": brush_x - 5, "y": brush_y + 5}),
                    Keyframe(1.0, {"x": brush_x, "y": brush_y}),
                ]
            ))
        elif motion == "wiggle":
            anim.tracks.append(AnimationTrack(
                target="toothbrush",
                property="rotation",
                keyframes=[
                    Keyframe(0.0, {"rotation": -10}),
                    Keyframe(0.25, {"rotation": 10}),
                    Keyframe(0.5, {"rotation": -10}),
                    Keyframe(0.75, {"rotation": 10}),
                    Keyframe(1.0, {"rotation": -10}),
                ]
            ))
        elif motion == "angled_45":
            anim.tracks.append(AnimationTrack(
                target="toothbrush",
                property="rotation",
                keyframes=[
                    Keyframe(0.0, {"rotation": 45}),
                    Keyframe(1.0, {"rotation": 45}),
                ]
            ))
            anim.tracks.append(AnimationTrack(
                target="right_arm",
                property="position",
                keyframes=[
                    Keyframe(0.0, {"y": 0}),
                    Keyframe(0.5, {"y": 10}),
                    Keyframe(1.0, {"y": 0}),
                ]
            ))
        else:  # linear/default up-down
            anim.tracks.append(AnimationTrack(
                target="toothbrush",
                property="position",
                keyframes=[
                    Keyframe(0.0, {"x": brush_x, "y": brush_y}),
                    Keyframe(0.5, {"x": brush_x, "y": brush_y + 15}),
                    Keyframe(1.0, {"x": brush_x, "y": brush_y}),
                ]
            ))
        
        # Arm movement synced with brush
        anim.tracks.append(AnimationTrack(
            target="right_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": -45}),
                Keyframe(0.5, {"rotation": -55}),
                Keyframe(1.0, {"rotation": -45}),
            ]
        ))
        
        anim.events.append({"time": 0.0, "type": "sound", "id": "brush_loop", "loop": True})
        
        return anim
    
    def _gen_tongue_out(self, data: dict, duration: float) -> Animation:
        """Stick tongue out animation."""
        anim = Animation(name="tongueOut", duration=duration)
        
        anim.tracks.append(AnimationTrack(
            target="tongue",
            property="out",
            keyframes=[
                Keyframe(0.0, {"out": 0}),
                Keyframe(0.2, {"out": 1}),
                Keyframe(0.8, {"out": 1}),
                Keyframe(1.0, {"out": 0}),
            ]
        ))
        
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="open",
            keyframes=[
                Keyframe(0.0, {"open": 0}),
                Keyframe(0.2, {"open": 0.5}),
                Keyframe(0.8, {"open": 0.5}),
                Keyframe(1.0, {"open": 0}),
            ]
        ))
        
        return anim
    
    def _gen_celebrate(self, data: dict, duration: float) -> Animation:
        """Celebration jump animation."""
        anim = Animation(name="celebrate", duration=duration)
        
        # Jump
        anim.tracks.append(AnimationTrack(
            target="body",
            property="position",
            keyframes=[
                Keyframe(0.0, {"y": 0}),
                Keyframe(0.2, {"y": -20}),  # Crouch
                Keyframe(0.4, {"y": 30}),   # Jump up
                Keyframe(0.6, {"y": 20}),
                Keyframe(0.8, {"y": 0}),    # Land
                Keyframe(1.0, {"y": 0}),
            ]
        ))
        
        # Arms up
        anim.tracks.append(AnimationTrack(
            target="left_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": -30}),
                Keyframe(0.3, {"rotation": -150}),
                Keyframe(0.8, {"rotation": -150}),
                Keyframe(1.0, {"rotation": -30}),
            ]
        ))
        
        anim.tracks.append(AnimationTrack(
            target="right_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 30}),
                Keyframe(0.3, {"rotation": 150}),
                Keyframe(0.8, {"rotation": 150}),
                Keyframe(1.0, {"rotation": 30}),
            ]
        ))
        
        # Big smile
        anim.tracks.append(AnimationTrack(
            target="mouth",
            property="smile",
            keyframes=[
                Keyframe(0.0, {"smile": 0.5}),
                Keyframe(0.3, {"smile": 1.0}),
                Keyframe(1.0, {"smile": 1.0}),
            ]
        ))
        
        anim.events.append({"time": 0.3, "type": "particle", "id": "confetti"})
        anim.events.append({"time": 0.3, "type": "sound", "id": "celebration"})
        
        return anim
    
    def _gen_thumbs_up(self, data: dict, duration: float) -> Animation:
        """Thumbs up gesture."""
        anim = Animation(name="thumbsUp", duration=duration)
        
        anim.tracks.append(AnimationTrack(
            target="right_arm",
            property="rotation",
            keyframes=[
                Keyframe(0.0, {"rotation": 30}),
                Keyframe(0.3, {"rotation": -60}),  # Raise
                Keyframe(0.7, {"rotation": -60}),  # Hold
                Keyframe(1.0, {"rotation": 30}),
            ]
        ))
        
        anim.tracks.append(AnimationTrack(
            target="right_hand",
            property="gesture",
            keyframes=[
                Keyframe(0.0, {"gesture": "open"}),
                Keyframe(0.25, {"gesture": "thumbsUp"}),
                Keyframe(0.85, {"gesture": "thumbsUp"}),
                Keyframe(1.0, {"gesture": "open"}),
            ]
        ))
        
        return anim
    
    def export_to_lottie(self, animation: Animation) -> dict:
        """Convert animation to Lottie JSON format."""
        fps = 30
        total_frames = int(animation.duration * fps)
        
        lottie = {
            "v": "5.7.4",
            "fr": fps,
            "ip": 0,
            "op": total_frames,
            "w": 512,
            "h": 512,
            "nm": animation.name,
            "layers": []
        }
        
        for track in animation.tracks:
            layer = {
                "nm": track.target,
                "ty": 4,  # Shape layer
                "ks": {
                    track.property: {
                        "a": 1,  # Animated
                        "k": []
                    }
                }
            }
            
            for kf in track.keyframes:
                frame = int(kf.time * total_frames)
                value = list(kf.properties.values())[0]
                layer["ks"][track.property]["k"].append({
                    "t": frame,
                    "s": [value],
                    "e": [value],
                    "i": {"x": [0.4], "y": [0]},
                    "o": {"x": [0.6], "y": [1]}
                })
            
            lottie["layers"].append(layer)
        
        return lottie
    
    def export_to_threejs(self, animation: Animation) -> dict:
        """Export to Three.js AnimationClip format."""
        clip = {
            "name": animation.name,
            "duration": animation.duration,
            "tracks": []
        }
        
        for track in animation.tracks:
            times = [kf.time * animation.duration for kf in track.keyframes]
            values = []
            for kf in track.keyframes:
                values.extend(list(kf.properties.values()))
            
            clip["tracks"].append({
                "name": f"{track.target}.{track.property}",
                "type": "number",
                "times": times,
                "values": values
            })
        
        return clip
