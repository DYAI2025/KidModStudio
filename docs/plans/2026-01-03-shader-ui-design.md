# KidModStudio Shader UI Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign KidModStudio UI with HD Shader voxel aesthetic - Minecraft raytracing look with glassmorphism panels.

**Inspiration:** Minecraft shader screenshots with sunset skies, volumetric clouds, and raytracing lighting.

---

## Farbpalette & Hintergrund

### Himmel-Gradient (von oben nach unten)
```css
background: linear-gradient(to bottom,
  #1a1a2e 0%,    /* Dunkles Nachtblau */
  #4a1942 50%,   /* Tiefes Lila */
  #ff6b35 100%   /* Warmes Sunset-Orange */
);
```

### Wolken-Animation
- 2-3 Wolken-Layer mit unterschiedlicher Geschwindigkeit
- Vorderste Wolke: 60s für eine Durchquerung
- Hintere Wolke: 90s (langsamer = Tiefeneffekt)
- Opacity: 15-25% (subtil, nicht dominant)
- Farbe: Weiß mit leichtem Orange-Tint

```css
@keyframes drift {
  from { transform: translateX(-100%); }
  to { transform: translateX(100vw); }
}

.cloud {
  animation: drift 60s linear infinite;
  opacity: 0.2;
}
```

### Glasmorphism-Werte
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}
```

### Akzentfarbe (Minecraft Emerald Green)
```css
:root {
  --accent: #50C878;
  --accent-hover: #5FD88A;
  --accent-glow: 0 0 20px rgba(80, 200, 120, 0.5);
}
```

---

## Header (Floating Glass-Bar)

```css
.app-header {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  height: 60px;
  border-radius: 16px;
  /* glassmorphism */
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.app-header h1 {
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}
```

---

## Buttons

```css
.btn {
  background: rgba(80, 200, 120, 0.2);
  border: 1px solid #50C878;
  color: #50C878;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #50C878;
  color: #1a1a2e;
  box-shadow: 0 0 20px rgba(80, 200, 120, 0.5);
  transform: translateY(-2px);
}

.dirty-indicator {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Panels (Workbench Layout)

### Allgemein
```css
.workbench {
  margin-top: 90px; /* Platz für floating Header */
  padding: 16px;
  gap: 16px;
  height: calc(100vh - 90px);
}

.workbench-left,
.workbench-center,
.workbench-right {
  /* glassmorphism */
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 20px;
}
```

### Item-Karten (Library)
```css
.item-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(80, 200, 120, 0.5);
  box-shadow: 0 0 15px rgba(80, 200, 120, 0.2);
}
```

---

## Element-Farben

| Element | Farbe | Hex |
|---------|-------|-----|
| Feuer | Rot-Orange | `#FF6B35` |
| Eis | Cyan | `#4AEDD9` |
| Wasser | Blau | `#3B82F6` |
| Gift | Lila | `#A855F7` |
| Heilung | Grün | `#22C55E` |
| Blitz | Gelb | `#FACC15` |
| Licht | Weiß | `#F5F5F5` |

```css
.element-fire { --element-color: #FF6B35; }
.element-ice { --element-color: #4AEDD9; }
.element-water { --element-color: #3B82F6; }
.element-poison { --element-color: #A855F7; }
.element-healing { --element-color: #22C55E; }
.element-lightning { --element-color: #FACC15; }
.element-light { --element-color: #F5F5F5; }

.element-btn {
  background: rgba(var(--element-color-rgb), 0.2);
  border: 1px solid var(--element-color);
  color: var(--element-color);
}

.element-btn.active {
  background: var(--element-color);
  color: #1a1a2e;
  box-shadow: 0 0 15px var(--element-color);
}
```

---

## Typografie

```css
/* Optional: Minecraft-ähnliche Pixel-Font für Überschriften */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

h1, h2, h3 {
  font-family: "Press Start 2P", system-ui, sans-serif;
  /* oder einfach bold system font */
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  color: white;
}

.text-muted {
  color: rgba(255, 255, 255, 0.6);
}
```

---

## Custom Scrollbars

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(80, 200, 120, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #50C878;
}
```

---

## Dateistruktur

Zu ändernde Dateien:
- `packages/renderer/src/index.css` - Globale Styles, Hintergrund, Variablen
- `packages/renderer/src/components/Header.css` - Floating Glass-Bar
- `packages/renderer/src/components/ItemLibraryPanel.css` - Linkes Panel
- `packages/renderer/src/components/PropertiesPanel.css` - Rechtes Panel
- `packages/renderer/src/components/Preview3D/Preview3D.css` - Center Panel (falls vorhanden)

Neue Dateien:
- `packages/renderer/src/components/CloudBackground.tsx` - Wolken-Animation
- `packages/renderer/src/components/CloudBackground.css` - Wolken-Styles
