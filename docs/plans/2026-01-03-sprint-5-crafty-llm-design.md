# Sprint 5: Crafty - Lokale LLM Voice Integration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Vollständiger Voice-Chat-Assistent für Kinder, der autonom Items erstellen und Mods bauen kann.

**Tech Stack:** RealtimeVoiceChat + Ollama + Electron IPC

---

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    KidModStudio (Electron)              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ React UI     │  │ Crafty Panel │  │ 3D Preview    │  │
│  │              │◄─┤ - Waveform   │  │               │  │
│  │              │  │ - Chat Log   │  │               │  │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  │
│                          │ WebSocket                     │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│              RealtimeVoiceChat Backend (Python)          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ RealtimeSTT │  │ Ollama API  │  │ RealtimeTTS      │  │
│  │ (Whisper)   │──►│ Qwen/Mistral│──►│ (Kokoro/Coqui)   │  │
│  └─────────────┘  └──────┬──────┘  └──────────────────┘  │
│                          │                                │
│                   ┌──────▼──────┐                         │
│                   │ Tool Router │ (Function Calling)      │
│                   └──────┬──────┘                         │
└──────────────────────────┼───────────────────────────────┘
                           │ IPC
┌──────────────────────────▼───────────────────────────────┐
│              KidModStudio Actions                         │
│  createItem() │ setElement() │ exportDatapack()          │
│  deleteItem() │ setTrigger() │ generateCode() + Review   │
└──────────────────────────────────────────────────────────┘
```

---

## Komponenten

### 1. LLM Backend
- **Server:** Ollama (localhost:11434)
- **Modelle:** Qwen 2.5, Gemma, Mistral 7B
- **Auswahl:** Automatisch oder konfigurierbar

### 2. Voice Pipeline (RealtimeVoiceChat)
- **STT:** RealtimeSTT mit Whisper
- **TTS:** RealtimeTTS (Kokoro/Coqui)
- **Streaming:** WebSocket für Low-Latency
- **VAD:** Voice Activity Detection eingebaut

### 3. Tool System (Hybrid)
**Einfache Aktionen (Function Calling):**
- `createItem(name, type)` - Neues Item erstellen
- `setElement(itemId, element, level)` - Element setzen
- `setTrigger(itemId, trigger)` - Auslöser setzen
- `deleteItem(itemId)` - Item löschen
- `renameItem(itemId, name)` - Umbenennen
- `exportDatapack()` - Export starten
- `selectItem(itemId)` - Item auswählen

**Komplexe Aktionen (Code-Generation mit Review):**
- Neue Elemente definieren
- Custom Enchantments
- Mod-Strukturen ändern
- Kind bestätigt mit "Ja/Nein" vor Ausführung

### 4. Crafty Panel UI
```
┌─────────────────────────────────┐
│ 🤖 Crafty            [─] [×]   │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  │  │  ← Waveform
│  └───────────────────────────┘  │
│  ○ Crafty hört zu...           │
├─────────────────────────────────┤
│ 🧒 "Ich will ein Feuer-Schwert"│
│ 🤖 "Ich erstelle das für dich!"│
│     [✓ Schwert erstellt]       │
├─────────────────────────────────┤
│        🎤 Sprechen              │
│        (Klicken zum Starten)   │
└─────────────────────────────────┘
```

---

## UI Zustände

| Zustand | Button | Waveform | Status-Text |
|---------|--------|----------|-------------|
| Idle | Grau | - | "Klicken zum Sprechen" |
| Listening | Grün pulsierend | Aktiv (Input) | "Crafty hört zu..." |
| Processing | Gelb Spinner | - | "Crafty denkt..." |
| Speaking | Blau | Aktiv (Output) | "Crafty spricht..." |
| Action Pending | Orange | - | "Soll ich...? (Ja/Nein)" |

---

## System Prompt für Crafty

```
Du bist Crafty, ein freundlicher Assistent in KidModStudio.
Du hilfst Kindern dabei, Minecraft-Mods zu erstellen.

WICHTIG:
- Sprich einfach und kindgerecht (8-12 Jahre)
- Sei enthusiastisch und ermutigend
- Erkläre was du tust
- Frage nach wenn unklar

VERFÜGBARE AKTIONEN:
- createItem(name, type): Erstelle Item oder Block
- setElement(itemId, element, level): Setze Element (fire, ice, water, poison, healing, lightning, light) mit Level 1-3
- setTrigger(itemId, trigger): Setze Auslöser (use, hit)
- deleteItem(itemId): Lösche Item
- exportDatapack(): Exportiere als Minecraft Datapack

ELEMENT-ERKLÄRUNGEN:
- fire: Feuerschaden, brennt Gegner
- ice: Verlangsamt Gegner
- water: Knockback-Effekt
- poison: Gift über Zeit
- healing: Heilt den Spieler
- lightning: Blitzschlag
- light: Leuchtet und macht stärker

Wenn ein Kind etwas Komplexes will, erkläre die Möglichkeiten und frage was es bevorzugt.
```

---

## Dateistruktur

### Neue Dateien
```
packages/
├── crafty/                          # Neues Package
│   ├── package.json
│   ├── src/
│   │   ├── index.ts                 # Export
│   │   ├── CraftyService.ts         # WebSocket Client
│   │   ├── ToolRouter.ts            # Function Calling Handler
│   │   └── tools/
│   │       ├── itemTools.ts         # Item-Aktionen
│   │       └── projectTools.ts      # Projekt-Aktionen
│   └── tsconfig.json
│
├── renderer/src/
│   ├── components/
│   │   ├── CraftyPanel/
│   │   │   ├── CraftyPanel.tsx      # Haupt-Komponente
│   │   │   ├── CraftyPanel.css      # Glassmorphism Styles
│   │   │   ├── Waveform.tsx         # Audio-Visualisierung
│   │   │   ├── ChatHistory.tsx      # Nachrichten-Liste
│   │   │   └── MicButton.tsx        # Toggle-Button
│   │   └── index.ts
│   └── hooks/
│       └── useCrafty.ts             # WebSocket Hook

external/
└── RealtimeVoiceChat/               # Submodule oder Copy
    └── (angepasst für KidModStudio)
```

### Zu ändernde Dateien
- `packages/renderer/src/App.tsx` - CraftyPanel einbinden
- `packages/main/src/index.ts` - Python-Backend starten
- `package.json` - Scripts für Backend

---

## Kommunikation

### WebSocket Messages (Electron ↔ Python)

**Client → Server:**
```json
{ "type": "audio_chunk", "data": "<base64>" }
{ "type": "toggle_listening", "active": true }
{ "type": "tool_result", "id": "123", "result": {...} }
{ "type": "user_confirmation", "approved": true }
```

**Server → Client:**
```json
{ "type": "transcript", "text": "Ich will ein Schwert", "final": true }
{ "type": "response_chunk", "text": "Cool!" }
{ "type": "audio_chunk", "data": "<base64>" }
{ "type": "tool_call", "id": "123", "name": "createItem", "args": {...} }
{ "type": "confirmation_request", "action": "Code ausführen?", "code": "..." }
{ "type": "status", "state": "listening|processing|speaking" }
```

---

## Sicherheit

1. **Sandbox für Code-Ausführung** - Generierter Code läuft isoliert
2. **Kind-Bestätigung** - Komplexe Aktionen brauchen "Ja"
3. **Rate Limiting** - Max 1 Tool-Call pro Sekunde
4. **Logging** - Alle Aktionen werden protokolliert
5. **Keine externen Netzwerk-Calls** - Alles lokal

---

## Implementierungs-Reihenfolge

1. **Task 1:** CraftyPanel UI-Komponente (ohne Funktionalität)
2. **Task 2:** WebSocket-Hook für Kommunikation
3. **Task 3:** RealtimeVoiceChat Backend anpassen
4. **Task 4:** Tool-Router mit Item-Funktionen
5. **Task 5:** Waveform-Visualisierung
6. **Task 6:** Integration & Testing
7. **Task 7:** System-Prompt Feintuning
