import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import Header from './components/Header'
import CloudBackground from './components/CloudBackground'
import ItemLibraryPanel from './components/ItemLibraryPanel'
import PropertiesPanel from './components/PropertiesPanel'
import Preview3D from './components/Preview3D'
import './App.css'

const App: FC = () => {
  const project = useSelector((state: RootState) => state.project.project)

  return (
    <div className="app">
      <CloudBackground />
      <Header />

      <main className="workbench">
        <div className="workbench-left">
          <ItemLibraryPanel />
        </div>

        <div className="workbench-center">
          {project ? (
            <Preview3D />
          ) : (
            <div className="welcome">
              <h2>Willkommen bei KidModStudio!</h2>
              <p>Erstelle ein neues Projekt oder lade ein bestehendes.</p>
            </div>
          )}
        </div>

        <div className="workbench-right">
          <PropertiesPanel />
        </div>
      </main>

      {/* No Export button - not implemented yet (No-Fake) */}
      {/* No Crafty window - not implemented yet (No-Fake) */}
    </div>
  )
}

export default App
