# Terminal Redesign Design Spec
**Date:** 2026-04-02
**Component:** `src/components/Terminal.astro`

---

## Summary

Rebuild the portfolio terminal component from scratch to be more readable, more harmonious with the overall site design, and easier to use as a CV. The current terminal uses a Zed One Dark theme and a single-column output layout. The redesign switches to a **Retro Green phosphor** palette, a **sidebar + output** two-column layout, and **card block** output formatting.

---

## Design Decisions

| Dimension | Choice | Rationale |
|---|---|---|
| Color palette | Retro Green (phosphor green on near-black) | Bold, memorable, unmistakably terminal — strong personality for a CV |
| Layout | Sidebar + Output (two-column) | Commands are always visible; discoverability without typing `help` |
| Sidebar style | Command + description | Non-technical visitors immediately know what each command does |
| Output style | Card blocks | Clear hierarchy (company → role → period → stack → bullets); recruiter-friendly |

---

## Color Palette

All existing Zed One Dark colors in `global.css` are replaced for the terminal with:

```
Background (main):   #050a05
Background (dark):   #030803   (sidebar, input bar, cards)
Background (hover):  #0f1f0f   (active item, dividers)
Border:              #0f1f0f
Border bright:       #142014

Text bright:         #98c379   (company names, active cmd, prompt cmd, cursor)
Text mid:            #7ab87a   (roles, secondary values)
Text dim:            #4a7a4a   (cmd names, prompt char, bullets)
Text muted:          #3a6a3a   (bullet text, general output)
Text faint:          #2a5a2a   (periods, stack labels, hint text)
Text ghost:          #1a3a1a   (section labels, dividers, input hints)
Text invisible:      #142014   (border highlights)

Cursor glow:         box-shadow: 0 0 6px rgba(152,195,121,0.5)
Card accent:         border-left: 2px solid #98c379
Active cmd accent:   border-left: 2px solid #98c379
```

---

## Structure

```
┌─────────────────────────────────────────────────────┐
│ ● ● ●  [louishuyng — fish]              louishuyng.dev │  ← Title bar (36px)
├──────────────┬──────────────────────────────────────┤
│  PROFILE     │  $ exp job moneyforward               │
│  info        │                                       │
│    about me  │  ┌─────────────────────────────────┐ │
│  links       │  │ Moneyforward                    │ │
│    social    │  │ Senior Software Engineer        │ │
│              │  │ Tokyo · 2023 – present          │ │
│  WORK        │  │ stack: Go · Ruby · React · AWS  │ │  ← Output (scrollable)
│  exp ◀ active│  │ ─────────────────────────────── │ │
│    experience│  │ → Built microservices infra...  │ │
│  certs       │  │ → Led team of 4, shipped 40%... │ │
│    certifs   │  └─────────────────────────────────┘ │
│              │                                       │
│  FILES       │  $ _                                  │
│  download    │                                       │
│    cv / ltr  │                                       │
├──────────────┴──────────────────────────────────────┤
│ $  [input]                        Tab  ↑↓  Ctrl+L   │  ← Input bar
└─────────────────────────────────────────────────────┘
```

---

## Components

### 1. Title Bar
- macOS traffic lights (red `#ff5f57`, yellow `#febc2e`, green `#28c840`) — decorative only
- Active tab: `louishuyng — fish` in `#98c379`, background `#050a05`, border `#142014`
- Right-aligned: `louishuyng.dev` in `#1a3a1a`

### 2. Sidebar (140px wide)
- Background: `#030803`
- Right border: `1px solid #0f1f0f`
- Sections: **PROFILE** (info, links), **WORK** (exp, certs), **FILES** (download)
- Section labels: `8.5px`, `letter-spacing: 1.5px`, color `#1a3a1a`
- Dividers between sections: `1px solid #0a180a`
- Each command item:
  - `cmd-name`: `11px`, color `#4a7a4a`
  - `cmd-desc`: `9px`, color `#1a3a1a`
  - Active state: background `#0f1f0f`, left border `2px solid #98c379`, name → `#98c379`, desc → `#2a5a2a`
- Clicking a sidebar command fires the command (same as typing it)

### 3. Output Area
- Background: `#050a05`
- Scrollable, `padding: 16px 18px`
- Custom scrollbar: 3px, thumb `#1a3a1a`, hover `#98c379`
- Each command invocation renders:
  1. **Prompt line**: `$` in `#4a7a4a` + command in `#98c379`
  2. **Result card(s)**

#### Result Card
```
background: #030803
border: 1px solid #0f1f0f
border-left: 2px solid #98c379
border-radius: 0 5px 5px 0
padding: 12px 14px
margin-bottom: 10px
```

Card anatomy:
- **Company/title**: `13px`, `#98c379`, bold
- **Role**: `10px`, `#4a7a4a`
- **Period/location**: `10px`, `#2a5a2a`
- **Stack**: `9.5px`, `#2a5a2a`, above a `1px #0a180a` divider; label in `#4a7a4a`
- **Bullets**: `10px`, `#3a6a3a`, each prefixed with `→` in `#2a5a2a`, above a `1px #0a180a` divider

### 4. Input Bar
- Background: `#030803`
- Top border: `1px solid #0f1f0f`
- Prompt char `$` in `#4a7a4a`
- Input text: `#98c379`, caret-color `#98c379`
- Placeholder: `#1a3a1a` — "type a command or click one →"
- Hints (Tab, ↑↓, Ctrl+L): `9px`, `#142014`, right-aligned
- Blinking block cursor: `7px × 13px`, `#98c379`, `box-shadow: 0 0 6px rgba(152,195,121,0.5)`, 1.1s step-end blink

---

## Commands & Output Mapping

| Command | Output |
|---|---|
| `help` | Plain list: each command name in `#98c379` + description in `#3a6a3a`, no card frame |
| `info` | Key-value card: name, role, location, years exp, email |
| `exp jobs` | List of company cards (compact: name + role + period only) |
| `exp job <company>` | Full card: company, role, period, stack, bullets |
| `exp stacks` | One card per category (backend, cloud, devops, data, frontend, mobile, tools); each card lists technologies as a comma-separated line |
| `exp years` | Timeline: year → company → role |
| `certs` | Cards: cert name, issuer, date, link |
| `links` | Cards: platform, handle, URL |
| `download` | Card with two links: cv.pdf, cover-letter.pdf |
| `clear` | Clears output area |

Sidebar active state tracks the **current command family** (e.g., any `exp` command highlights `exp` in sidebar).

---

## Interactions

- **Autocomplete**: Tab cycles through matching commands; ghost text preview in input
- **History**: ↑/↓ arrow keys navigate command history
- **Ctrl+L**: Clears terminal
- **Sidebar click**: Fires the command (e.g., clicking `exp` runs `exp jobs`)
- **Animations**: Output lines fade in with opacity + X-slide (Motion library, same easing as existing site: `[0.16,1,0.3,1]`, `duration: 0.10`)

---

## Mobile

- Sidebar **hidden** on mobile (`< 768px`); commands accessible via input only
- Status bar hints hidden on mobile
- Font sizes: output `12.5px`, input `14px`
- Tap target for input bar: full width, `min-height: 44px`
- "tap to type" hint appears on mobile when terminal is unfocused

---

## Files to Change

| File | Change |
|---|---|
| `src/components/Terminal.astro` | Full rewrite of HTML structure, inline styles → CSS classes, command rendering, sidebar logic |
| `src/styles/global.css` | Add green terminal palette variables (`.gt-*`); keep existing Zed vars for other components |

---

## Out of Scope

- Other components (LeftPanel, Hero, Experience, etc.) are unchanged
- No new commands added — same command set, better presentation
- No backend / data changes
