import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Orb({ mode = 'idle', audioLevel = 0, mouse, clicked, position = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef(null)
  const innerMeshRef = useRef(null)

  const modeColors = {
    idle: new THREE.Color('#22d3ee'),
    listening: new THREE.Color('#38bdf8'),
    thinking: new THREE.Color('#8b5cf6'),
    speaking: new THREE.Color('#60a5fa'),
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const targetColor = modeColors[mode] || modeColors.idle

    if (meshRef.current) {
      // Rotation based on time and mouse Proximity
      const mx = mouse?.current?.x || 0
      const my = mouse?.current?.y || 0
      meshRef.current.rotation.y = t * 0.4 + mx * 0.5
      meshRef.current.rotation.x = t * 0.2 + my * 0.5

      // Dynamic scale pulse based on audio level & mode
      const baseScale = clicked ? 1.35 : 1.2
      const pulse = mode === 'listening' ? Math.sin(t * 8) * 0.08 + audioLevel * 0.4 : mode === 'speaking' ? Math.sin(t * 6) * 0.1 : 0
      const s = (baseScale + pulse) * scale
      meshRef.current.scale.set(s, s, s)

      // Smooth color interpolation
      if (meshRef.current.material) {
        meshRef.current.material.color.lerp(targetColor, 0.05)
      }
    }

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.z = -t * 0.8
      innerMeshRef.current.rotation.y = -t * 0.5
    }
  })

  return (
    <group position={position}>
      {/* Outer Glowing Wireframe Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Metallic Core Sphere */}
      <mesh ref={innerMeshRef} scale={[0.8, 0.8, 0.8]}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          roughness={0.2}
          metalness={0.9}
          transmission={0.6}
          thickness={0.5}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}
