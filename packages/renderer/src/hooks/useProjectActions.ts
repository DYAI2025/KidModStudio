import { useDispatch } from 'react-redux'
import { projectActions } from '../store/projectSlice'
import { Project } from '@kms/shared'

export function useProjectActions() {
  const dispatch = useDispatch()

  const createNew = async () => {
    const project = await window.electronAPI.project.new('Neues Projekt')
    dispatch(projectActions.setProject(project))
    dispatch(projectActions.setFilePath(null))
  }

  const load = async () => {
    const result = await window.electronAPI.project.load()
    if (result) {
      dispatch(projectActions.setProject(result.project))
      dispatch(projectActions.setFilePath(result.filePath))
    }
  }

  const save = async (project: Project, filePath: string | null) => {
    if (filePath) {
      await window.electronAPI.project.saveAs(filePath, project)
      dispatch(projectActions.markClean())
    } else {
      const savedPath = await window.electronAPI.project.save(project)
      if (savedPath) {
        dispatch(projectActions.setFilePath(savedPath))
        dispatch(projectActions.markClean())
      }
    }
  }

  return { createNew, load, save }
}
