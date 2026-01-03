import { FC } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import AutoRotate from './AutoRotate'
import VoxelItem from './VoxelItem'
import ElementParticles from './ElementParticles'
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
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />

          <AutoRotate speed={0.5}>
            {selectedItem ? (
              <group>
                <VoxelItem
                  itemType={selectedItem.type}
                  elementType={selectedItem.element?.type}
                />
                {selectedItem.element && (
                  <ElementParticles element={selectedItem.element} />
                )}
              </group>
            ) : (
              <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#444" wireframe />
              </mesh>
            )}
          </AutoRotate>

          <OrbitControls
            enableRotate={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
          />
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
