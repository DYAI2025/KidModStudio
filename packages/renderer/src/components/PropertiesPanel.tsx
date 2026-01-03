import { FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { projectActions } from '../store/projectSlice'
import { ELEMENT_TYPES, ElementType, TRIGGER_TYPES, TriggerType } from '@kms/shared'
import './PropertiesPanel.css'

const ELEMENT_LABELS: Record<ElementType, string> = {
  fire: 'Feuer',
  ice: 'Eis',
  water: 'Wasser',
  poison: 'Gift',
  healing: 'Heilung',
  lightning: 'Blitz',
  light: 'Licht'
}

const TRIGGER_LABELS: Record<TriggerType, string> = {
  use: 'Benutzen',
  hit: 'Treffen'
}

const PropertiesPanel: FC = () => {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)
  const selectedItemId = useSelector((state: RootState) => state.project.selectedItemId)

  const selectedItem = project?.items.find(item => item.id === selectedItemId)

  if (!selectedItem) {
    return (
      <div className="properties-panel">
        <h3>Eigenschaften</h3>
        <p className="empty-state">Nichts ausgewählt</p>
      </div>
    )
  }

  const handleNameChange = (name: string) => {
    dispatch(projectActions.updateItem({ id: selectedItem.id, changes: { name } }))
  }

  const handleElementChange = (type: ElementType | '') => {
    if (type === '') {
      dispatch(projectActions.updateItem({ id: selectedItem.id, changes: { element: undefined } }))
    } else {
      dispatch(projectActions.updateItem({
        id: selectedItem.id,
        changes: { element: { type, level: 1 } }
      }))
    }
  }

  const handleTriggerChange = (type: TriggerType | '') => {
    if (type === '') {
      dispatch(projectActions.updateItem({ id: selectedItem.id, changes: { trigger: undefined } }))
    } else {
      dispatch(projectActions.updateItem({
        id: selectedItem.id,
        changes: { trigger: { type } }
      }))
    }
  }

  const handleDelete = () => {
    dispatch(projectActions.removeItem(selectedItem.id))
  }

  return (
    <div className="properties-panel">
      <h3>Eigenschaften</h3>

      <div className="property-group">
        <label>Name</label>
        <input
          type="text"
          value={selectedItem.name}
          onChange={e => handleNameChange(e.target.value)}
        />
      </div>

      <div className="property-group">
        <label>Element</label>
        <div className="element-grid">
          {ELEMENT_TYPES.map(type => (
            <button
              key={type}
              className={`element-button ${selectedItem.element?.type === type ? 'selected' : ''}`}
              onClick={() => handleElementChange(selectedItem.element?.type === type ? '' : type)}
            >
              {ELEMENT_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {selectedItem.type === 'item' && (
        <div className="property-group">
          <label>Auslöser</label>
          <div className="trigger-grid">
            {TRIGGER_TYPES.map(type => (
              <button
                key={type}
                className={`trigger-button ${selectedItem.trigger?.type === type ? 'selected' : ''}`}
                onClick={() => handleTriggerChange(selectedItem.trigger?.type === type ? '' : type)}
              >
                {TRIGGER_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="property-group">
        <button className="delete-button" onClick={handleDelete}>
          Löschen
        </button>
      </div>
    </div>
  )
}

export default PropertiesPanel
