import { FC } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import './Preview3D.css'

const Preview3D: FC = () => {
  const project = useSelector((state: RootState) => state.project.project)
  const selectedItemId = useSelector((state: RootState) => state.project.selectedItemId)

  const selectedItem = project?.items.find(item => item.id === selectedItemId)

  if (!project) {
    return (
      <div className="preview-3d">
        <div className="preview-3d-placeholder">
          <p>3D Vorschau</p>
          <span className="preview-3d-hint">Erstelle ein Projekt</span>
        </div>
      </div>
    )
  }

  return (
    <div className="preview-3d">
      <div className="preview-3d-canvas">
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          {selectedItem ? (
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#4a90d9" />
            </mesh>
          ) : (
            <group>
              <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            </group>
          )}

          <OrbitControls enableRotate={false} enableZoom={true} />
          <Environment preset="city" />
        </Canvas>
      </div>
      {!selectedItem && (
        <div className="preview-3d-hint">Wähle ein Item</div>
      )}
    </div>
  )
}

export default Preview3D
