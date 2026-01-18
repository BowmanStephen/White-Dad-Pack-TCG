# Architecture Documentation - DadDeck™

This document outlines the technical architecture of DadDeck™, a satirical trading card game simulator built with Astro, Svelte, and Nanostores.

## 📖 Documentation Navigation
- 🏠 **[Project Home](./README.md)**
- 🤝 **[Contributing](./CONTRIBUTING.md)**
- 🔌 **[API Reference](./API_REFERENCE.md)**
- 🚢 **[Deployment](./DEPLOYMENT.md)**

---

## 🏗️ High-Level System Architecture

DadDeck™ follows a 4-layer architecture designed for high performance, SEO optimization, and reactive interactivity.

### The 4-Layer Model

```mermaid
graph TD
    subgraph "Layer 1: User Interface (Astro + Svelte)"
        A[Astro Pages] -->|Hydrates| B[Svelte Islands]
        B --> C[Shared Components]
        style A fill:#f9f,stroke:#333,stroke-width:2px
        style B fill:#f9f,stroke:#333,stroke-width:2px
    end

    subgraph "Layer 2: State Management (Nanostores)"
        B -->|Subscribes/Actions| D[Core Stores]
        D -->|Syncs| E[LocalStorage]
        D -->|Derives| F[Computed State]
        style D fill:#bbf,stroke:#333,stroke-width:2px
    end

    subgraph "Layer 3: Business Logic (Lib)"
        D -->|Invokes| G[Pack Generator]
        D -->|Invokes| H[Combat Engine]
        G -->|Validates| I[Security Layer]
        style G fill:#bfb,stroke:#333,stroke-width:2px
    end

    subgraph "Layer 4: Data Layer (Static JSON)"
        G -->|Reads| J[Card Database]
        H -->|Reads| J
        style J fill:#fbb,stroke:#333,stroke-width:2px
    end
```

### Component Hierarchy (Astro/Svelte Relationship)

```mermaid
graph TD
    Root[BaseLayout.astro] --> Nav[Navigation.svelte client:load]
    Root --> Main[index.astro]
    Main --> Hero[Hero.astro static]
    Main --> Opener[PackOpener.svelte client:visible]
    Opener --> Anim[PackAnimation.svelte]
    Opener --> Revealer[CardRevealer.svelte]
    Revealer --> Card[Card.svelte]
    Root --> Footer[Footer.astro static]
```

---

## 🔄 Core Data Flows

### Pack Opening Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant S as PackOpener.svelte
    participant ST as PackStore (Nanostore)
    participant G as Generator (Lib)
    participant SEC as Security (Lib)
    participant DB as Card JSON

    U->>S: Click "Open Pack"
    S->>ST: openNewPack()
    ST->>ST: Set state: 'generating'
    ST->>G: generatePack()
    G->>DB: Fetch Cards
    G-->>ST: Return Pack Object
    ST->>SEC: validatePackBeforeOpen(pack)
    SEC-->>ST: Valid: true
    ST->>ST: Set state: 'pack_animate'
    ST->>S: Reactively Trigger Animation
    S->>U: Play Pack Tear Animation
    S->>ST: completePackAnimation()
    ST->>ST: Set state: 'cards_ready'
    S->>U: Show Face-down Cards
```

---

## 🛠️ State Machine: PackState

The Pack Opener uses a robust state machine to handle the sequence. This ensures that visual effects and logic stay perfectly in sync.

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> generating : openNewPack()
    generating --> pack_animate : Success & Validated
    pack_animate --> cards_ready : completePackAnimation()
    cards_ready --> revealing : revealCard(index)
    revealing --> revealing : revealCard(index)
    revealing --> results : All Cards Revealed
    results --> idle : resetPack()
    
    generating --> idle : Error (Timeout/Security)
```

---

## 🏬 Store Communication Diagram

How data flows through the Nanostore ecosystem:

```mermaid
graph LR
    P[Pack Store] -->|Adds Cards| C[Collection Store]
    C -->|Calculates| CS[Collection Stats Store]
    C -->|Filters| FC[Filtered Cards Computed]
    D[Deck Store] -->|Reads| C
    A[Achievement Store] -->|Observes| P
    A -->|Observes| C
```

---

## 🏝️ Island Strategy & Performance

To maintain a <3s load time and 60fps animations:
- **Partial Hydration:** Only interactive elements are Svelte components. Hero sections and footers remain static Astro HTML.
- **Code Splitting:** Dependencies are split into vendor chunks (e.g., `vendor-html2canvas`).
- **Image Pipeline:** High-resolution card art is optimized to WebP/AVIF during the build process via `scripts/optimize-images.mjs`.

## 🔒 Security Architecture

Although DadDeck™ is a client-side application, we implement "Defense in Depth":
- **Input Sanitization:** All user inputs (names, deck names) are sanitized.
- **State Integrity:** Stores use deep freezing or immutable updates to prevent accidental mutation.
- **Validation Hooks:** "Stop Hooks" in the state machine prevent advancing to the "Results" state if the pack generation doesn't pass statistical checks.

---

## 🛠️ State Machine: PackState

The Pack Opener uses a robust state machine to handle the 6-stage sequence:

| State | Description | Transition |
|-------|-------------|------------|
| `idle` | Waiting for user | `openPack()` -> `generating` |
| `generating` | Background generation & validation | Success -> `pack_animate` |
| `pack_animate` | Physical pack tear animation | Complete -> `cards_ready` |
| `cards_ready` | Individual cards are face-down | `revealCard()` -> `revealing` |
| `revealing` | Specific card reveal animation | All revealed -> `results` |
| `results` | Summary view with share options | `reset()` -> `idle` |

---

**Last Updated:** January 18, 2026
