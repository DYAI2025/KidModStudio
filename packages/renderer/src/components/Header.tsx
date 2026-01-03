import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useProjectActions } from '../hooks/useProjectActions'
import './Header.css'

const Header: FC = () => {
  const project = useSelector((state: RootState) => state.project.project)
  const filePath = useSelector((state: RootState) => state.project.filePath)
  const isDirty = useSelector((state: RootState) => state.project.isDirty)
  const { createNew, load, save } = useProjectActions()

  const handleSave = () => {
    if (project) {
      // Validate: Check if items have incomplete properties
      const incompleteItems = project.items.filter(
        item => !item.element && !item.trigger
      )

      if (incompleteItems.length > 0) {
        const itemNames = incompleteItems.map(i => i.name).join(', ')
        alert(`Bitte wähle zuerst Element oder Trigger für: ${itemNames}`)
        return
      }

      save(project, filePath)
    }
  }

  return (
    <header className="app-header">
      <h1>KidModStudio</h1>

      <div className="header-actions">
        <button onClick={createNew}>Neu</button>
        <button onClick={load}>Laden</button>
        {project && (
          <button onClick={handleSave}>
            Speichern
            {isDirty && <span className="dirty-indicator">●</span>}
          </button>
        )}
      </div>

      {project && (
        <div className="project-info">
          <span className="project-name">{project.name}</span>
          {filePath && <span className="file-path">{filePath}</span>}
        </div>
      )}
    </header>
  )
}

export default Header
