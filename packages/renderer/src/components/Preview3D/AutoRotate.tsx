import { FC, useRef, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

interface AutoRotateProps {
  children: ReactNode
  speed?: number
}

const AutoRotate: FC<AutoRotateProps> = ({ children, speed = 0.5 }) => {
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed
    }
  })

  return <group ref={groupRef}>{children}</group>
}

export default AutoRotate
