import { FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { projectActions } from '../store/projectSlice'
import './ItemLibraryPanel.css'

const ITEM_TEMPLATES = [
  { label: 'Schwert', type: 'item' as const, icon: '⚔️' },
  { label: 'Spitzhacke', type: 'item' as const, icon: '⛏️' },
  { label: 'Block', type: 'block' as const, icon: '🧱' }
]

const ItemLibraryPanel: FC = () => {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)
  const selectedItemId = useSelector((state: RootState) => state.project.selectedItemId)

  if (!project) {
    return (
      <div className="item-library-panel">
        <h3>Bibliothek</h3>
        <p className="empty-state">Kein Projekt geladen</p>
      </div>
    )
  }

  const handleAddItem = (template: typeof ITEM_TEMPLATES[0]) => {
    const id = `item-${Date.now()}`
    dispatch(projectActions.addItem({
      id,
      name: `Neues ${template.label}`,
      type: template.type
    }))
    dispatch(projectActions.selectItem(id))
  }

  const handleSelectItem = (id: string) => {
    dispatch(projectActions.selectItem(id))
  }

  return (
    <div className="item-library-panel">
      <h3>Bibliothek</h3>

      <div className="templates">
        <h4>Neu erstellen</h4>
        {ITEM_TEMPLATES.map(template => (
          <button
            key={template.label}
            className="template-button"
            onClick={() => handleAddItem(template)}
          >
            <span className="icon">{template.icon}</span>
            {template.label}
          </button>
        ))}
      </div>

      {project.items.length > 0 && (
        <div className="project-items">
          <h4>Im Projekt</h4>
          {project.items.map(item => (
            <div
              key={item.id}
              className={`library-item ${selectedItemId === item.id ? 'selected' : ''}`}
              onClick={() => handleSelectItem(item.id)}
            >
              <span className="icon">{item.type === 'item' ? '⚔️' : '🧱'}</span>
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemLibraryPanel
