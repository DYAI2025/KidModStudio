import { FC } from 'react'

const App: FC = () => {
  return (
    <div className="app">
      <header>
        <h1>KidModStudio</h1>
      </header>

      <main className="workbench">
        <div className="workbench-left">
          {/* Item Library - Sprint 1 */}
        </div>

        <div className="workbench-center">
          {/* 3D Preview - Sprint 2 */}
        </div>

        <div className="workbench-right">
          {/* Properties Panel - Sprint 1 */}
        </div>
      </main>

      {/* No Export button - not implemented yet (No-Fake) */}
      {/* No Crafty window - not implemented yet (No-Fake) */}
    </div>
  )
}

export default App
