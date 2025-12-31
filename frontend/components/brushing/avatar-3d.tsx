'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Capsule, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
    isSpeaking: boolean;
    isBrushing?: boolean;
    animationState?: string;
    avatarId: string;
}

function ToothFace({ isSpeaking, animationState, avatarId }: AvatarProps) {
    const group = useRef<THREE.Group>(null);
    const mouthRef = useRef<THREE.Group>(null);
    const tongueRef = useRef<THREE.Mesh>(null);

    // Avatar color configs
    const configs: Record<string, { skin: string; hair: string; eyes: string }> = {
        luna: { skin: '#FFE5D9', hair: '#FFB7B2', eyes: '#6b4423' },
        captain: { skin: '#F4D35E', hair: '#1D3557', eyes: '#1D3557' },
        dr_bright: { skin: '#E8DDD0', hair: '#778DA9', eyes: '#4a6670' }
    };
    const cfg = configs[avatarId] || configs.luna;

    useFrame((state) => {
        if (!group.current || !mouthRef.current) return;
        const t = state.clock.elapsedTime;

        // Gentle floating motion
        group.current.position.y = Math.sin(t * 0.8) * 0.03;

        // Head follows mouse gently
        const { x, y } = state.mouse;
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.3, 0.05);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.15, 0.05);

        // Mouth animation based on state
        let mouthOpen = 0.1;
        if (isSpeaking) mouthOpen = 0.3 + Math.sin(t * 12) * 0.1;
        if (animationState === 'openMouth') mouthOpen = 0.6;
        if (animationState === 'spitting') mouthOpen = 0.4;
        if (animationState === 'rinsing') mouthOpen = 0.25;

        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 1 + mouthOpen, 0.15);

        // Tongue animation
        if (tongueRef.current) {
            const tongueOut = animationState === 'tongueOut' ? 0.12 : 0;
            tongueRef.current.position.z = THREE.MathUtils.lerp(tongueRef.current.position.z, tongueOut, 0.1);
        }
    });

    return (
        <group ref={group}>
            {/* FACE - Large sphere */}
            <Sphere args={[1, 32, 32]}>
                <meshStandardMaterial color={cfg.skin} roughness={0.4} />
            </Sphere>

            {/* HAIR */}
            <Sphere args={[1.02, 32, 32]} position={[0, 0.15, -0.1]} scale={[1, 0.85, 0.9]}>
                <meshStandardMaterial color={cfg.hair} />
            </Sphere>

            {/* NOSE */}
            <Sphere args={[0.12, 16, 16]} position={[0, -0.1, 0.92]}>
                <meshStandardMaterial color={cfg.skin} />
            </Sphere>

            {/* EYEBROWS */}
            <Capsule args={[0.03, 0.2, 4, 8]} position={[-0.35, 0.45, 0.8]} rotation={[0, 0, 0.15]}>
                <meshStandardMaterial color={cfg.hair} />
            </Capsule>
            <Capsule args={[0.03, 0.2, 4, 8]} position={[0.35, 0.45, 0.8]} rotation={[0, 0, -0.15]}>
                <meshStandardMaterial color={cfg.hair} />
            </Capsule>

            {/* EYES */}
            <group position={[0, 0.2, 0.85]}>
                {/* Left Eye */}
                <Sphere args={[0.18, 32, 32]} position={[-0.32, 0, 0]}>
                    <meshStandardMaterial color="white" />
                    <Sphere args={[0.1, 16, 16]} position={[0, 0, 0.15]}>
                        <meshStandardMaterial color={cfg.eyes} />
                        <Sphere args={[0.05, 8, 8]} position={[0, 0, 0.08]}>
                            <meshStandardMaterial color="black" />
                        </Sphere>
                    </Sphere>
                </Sphere>
                {/* Right Eye */}
                <Sphere args={[0.18, 32, 32]} position={[0.32, 0, 0]}>
                    <meshStandardMaterial color="white" />
                    <Sphere args={[0.1, 16, 16]} position={[0, 0, 0.15]}>
                        <meshStandardMaterial color={cfg.eyes} />
                        <Sphere args={[0.05, 8, 8]} position={[0, 0, 0.08]}>
                            <meshStandardMaterial color="black" />
                        </Sphere>
                    </Sphere>
                </Sphere>
            </group>

            {/* BLUSH */}
            <Sphere args={[0.1, 16, 16]} position={[-0.6, -0.1, 0.7]}>
                <meshStandardMaterial color="#ffb3b3" transparent opacity={0.4} />
            </Sphere>
            <Sphere args={[0.1, 16, 16]} position={[0.6, -0.1, 0.7]}>
                <meshStandardMaterial color="#ffb3b3" transparent opacity={0.4} />
            </Sphere>

            {/* MOUTH GROUP */}
            <group ref={mouthRef} position={[0, -0.4, 0.85]}>
                {/* Lips - Upper */}
                <Capsule args={[0.05, 0.35, 4, 8]} position={[0, 0.04, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color="#c44569" />
                </Capsule>
                {/* Lips - Lower */}
                <Capsule args={[0.045, 0.3, 4, 8]} position={[0, -0.04, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color="#b83b5e" />
                </Capsule>

                {/* Mouth Interior */}
                <Box args={[0.4, 0.12, 0.15]} position={[0, 0, -0.05]}>
                    <meshStandardMaterial color="#1a0505" />
                </Box>

                {/* TEETH - Upper Row */}
                <group position={[0, 0.035, 0.02]}>
                    {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
                        <Box key={`ut${i}`} args={[0.055, 0.04, 0.025]} position={[x, 0, 0]}>
                            <meshStandardMaterial color="white" />
                        </Box>
                    ))}
                </group>

                {/* TEETH - Lower Row */}
                <group position={[0, -0.035, 0.02]}>
                    {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
                        <Box key={`lt${i}`} args={[0.05, 0.035, 0.02]} position={[x, 0, 0]}>
                            <meshStandardMaterial color="#f5f5f0" />
                        </Box>
                    ))}
                </group>

                {/* TONGUE */}
                <Capsule ref={tongueRef} args={[0.06, 0.12, 4, 8]} position={[0, -0.02, 0]} rotation={[0.3, 0, 0]}>
                    <meshStandardMaterial color="#d63384" />
                </Capsule>
            </group>

            {/* EARS */}
            <Sphere args={[0.15, 16, 16]} position={[-0.95, 0.05, 0]}>
                <meshStandardMaterial color={cfg.skin} />
            </Sphere>
            <Sphere args={[0.15, 16, 16]} position={[0.95, 0.05, 0]}>
                <meshStandardMaterial color={cfg.skin} />
            </Sphere>
        </group>
    );
}

export function Avatar3D({ isSpeaking, isBrushing, animationState, avatarId }: AvatarProps) {
    return (
        <div className="w-full h-64 md:h-80">
            <Canvas camera={{ position: [0, 0, 3.5], fov: 40 }} shadows>
                <ambientLight intensity={0.7} />
                <pointLight position={[5, 5, 5]} intensity={0.8} />
                <pointLight position={[-5, 3, 3]} intensity={0.4} color="#ffe4c4" />
                <ToothFace
                    isSpeaking={isSpeaking}
                    isBrushing={isBrushing}
                    animationState={animationState}
                    avatarId={avatarId}
                />
            </Canvas>
        </div>
    );
}
