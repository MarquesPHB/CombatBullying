---
name: Sentinela Acolhedor
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg-medium:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md-medium:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  screen-gutter: 1rem
  card-padding: 1.25rem
---

## Brand & Style

The design system establishes a safe, discreet, and comforting harbor for students confronting vulnerability, bullying, harassment, and emotional distress. It translates safety protocols into an empathetic digital space that dissolves fear, lowers reporting barriers, and fosters trust between educational communities and vulnerable youth.

### Audience & Mood
- **Target Audience:** Primary and secondary students (ages 10–18), student counselors, educators, and guardians requiring quick, private intervention.
- **Emotional Response:** Comfort, confidentiality, protective calm, non-judgmental acceptance, and clarity under stress.
- **Visual Movement:** Humanized Soft-Modernism mixed with Protective Minimalism. Interfaces avoid clinical sterile healthcare traits or punitive institutional surveillance patterns. Instead, soft organic roundedness, calm ambient lighting, non-alarming micro-interactions, and reassuring botanical teals create a protective environment. Privacy controls (e.g., quick exit, incognito masking) remain instantly discoverable yet subtle.

## Colors

The palette balances empathetic protection and legible authority. 

### Palette Architecture
- **Primary (`#0D9488` - Teal 600):** Represents security, stability, and empathetic guardianship. Used for core interactions, key actions, and affirmative brand cues.
- **Secondary (`#14B8A6` - Teal 500):** Lighter ocean emerald for interactive accents, supportive illustrations, focus rings, and secondary buttons.
- **Tertiary (`#F59E0B` - Amber 500):** Gentle, non-punitive warning tone for pending validation, cautionary alerts, and status notifications.
- **Neutral Palette:** Anchored around Slate (`#475569`), warm off-whites (`#F8FAFC` base surface, `#F1F5F9` nested surfaces), and rich text (`#0F172A`). Pure `#000000` is avoided to eliminate visual harshness.

### Semantic Status Colors
- **Em análise (Under Review):** Background `#FEF3C7`, Text `#92400E`, Border `#FCD34D` (Calm Amber).
- **Respondido (Answered):** Background `#CCFBF1`, Text `#115E59`, Border `#5EEAD4` (Reassuring Teal).
- **Concluído (Resolved):** Background `#E0F2FE`, Text `#0369A1`, Border `#BAE6FD` (Peaceful Sky).
- **Emergência / Urgente (Immediate Risk):** Background `#FEE2E2`, Text `#991B1B`, Border `#FCA5A5` (Measured, non-sensational crimson).

All interactive text combinations strictly comply with WCAG 2.1 AA standards (minimum 4.5:1 ratio) with most informational copy exceeding AAA (7:1).

## Typography

Plus Jakarta Sans delivers warm letterforms with geometric clarity and rounded terminals that avoid intimidation. 

### Implementation Rules
- **Portuguese Language Specifics:** Generous line heights accommodate Portuguese accentuation marks (á, à, â, ã, ç, é, ê) without visual clipping or dense line stacking.
- **Reading Comfort:** Critical emotional reports, instructional hints, and disclosures use `body-lg` or `body-md` set in 500 weight (`Medium`) to reduce reading fatigue during stressful moments.
- **Uppercase Usage:** Constrained strictly to abbreviated badge tags (e.g., "EM ANÁLISE") with letter spacing widened to `+0.02em`. All user headings and prompts remain in natural sentence case to preserve an informal, approachable demeanor.

## Layout & Spacing

A mobile-first 4px/8px modular rhythm provides generous tap zones and visual air, critical for users with trembling hands or elevated anxiety.

### Mobile Screen Architecture
- **Margins & Gutters:** 16px (`1rem`) default screen margin on phone widths, scaling to 24px (`1.5rem`) on compact tablets.
- **Touch Target Safeguards:** Every interactive control guarantees a minimum 48x48px interactive target area, regardless of internal visual icon size.
- **Panic Action Safe Zone:** The top application bar reserves a prominent pinned slot for the "Saída Rápida" (Quick Exit / Disguise App) button, placed comfortably outside the core report editing canvas to prevent accidental triggers while keeping emergency dismissal instantaneous.
- **Form Pacing:** Multi-step reporting forms break complexity into single-question screens with 24px–32px vertical spacing between inputs, keeping cognitive load low.

## Elevation & Depth

Visual depth utilizes soft, tinted ambient shadows and subtle hairline borders rather than stark drop shadows, conveying safety, cleanliness, and lightness.

### Elevation Hierarchy
- **Level 0 (Base Surface):** `#F8FAFC`. The foundational canvas. Flat, neutral, grounding.
- **Level 1 (Default Cards & Containers):** `#FFFFFF` surface with a subtle 1px border (`#E2E8F0`) and an ambient teal-tinted shadow: `0 2px 8px -2px rgba(15, 118, 110, 0.04), 0 1px 4px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Interactive Active Cards & Bottom Sheets):** `#FFFFFF` with `0 8px 24px -4px rgba(15, 118, 110, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Emergency Floating Modals & Toasts):** `0 16px 36px -6px rgba(13, 148, 136, 0.16), 0 6px 16px -4px rgba(15, 23, 42, 0.06)`.
- **Discreet Veil (Privacy Shield Overlay):** A rapid-activation backdrop filter (`backdrop-filter: blur(12px)`) with a gentle white wash (`rgba(248, 250, 252, 0.94)`) to obscure on-screen data when switching apps or toggling privacy mode.

## Shapes

The design system adopts Level 2 (Rounded) with specific expansions to Level 3 on action buttons, badges, and conversational bubbles to cultivate approachability.

### Radius System
- **Cards & Modals:** `rounded-xl` (`1.5rem` / 24px) on top containers and alert dialogs, delivering comforting, pillowy geometry.
- **Form Controls & Inputs:** `rounded-lg` (`1rem` / 16px) ensuring form boundaries appear soft and welcoming rather than technical.
- **Pills, Badges & Primary Buttons:** Fully rounded / pill (`9999px`) to reinforce tactile friendliness and eliminate sharp corners across key touchpoints.

## Components

### 1. Status Badges (Emblemas de Status)
- **Structure:** Pill shape, height 28px, horizontal padding 12px. Icon size 14px leading the text. Typography: `label-sm`.
- **Estados:**
  - *Em análise:* Background `#FEF3C7`, Icon/Text `#92400E`, Border `1px solid #FCD34D`. Copy: `Em análise`.
  - *Respondido:* Background `#CCFBF1`, Icon/Text `#115E59`, Border `1px solid #5EEAD4`. Copy: `Respondido`.
  - *Concluído:* Background `#E0F2FE`, Icon/Text `#0369A1`, Border `1px solid #BAE6FD`. Copy: `Concluído`.

### 2. Action Buttons (Botões de Ação)
- **Primary ("Enviar Relato Seguro"):** Background `#0D9488`, Text `#FFFFFF`, height 52px, pill-shaped (`9999px`), active press scale `0.98`. Focus ring `3px solid rgba(20, 184, 166, 0.35)`.
- **Secondary ("Salvar como Rascunho"):** Background `#F0FDFA`, Text `#0F766E`, border `1px solid #99F6E4`, height 52px.
- **Safety Emergency ("Saída Rápida"):** Background `#F1F5F9`, Text `#475569`, border `1px solid #CBD5E1`, pill shape, height 36px, icon of a book or neutral calculator to simulate an instant educational app switch when tapped.

### 3. Reporting Cards (Cartões de Denúncia e Apoio)
- White background (`#FFFFFF`), 20px padding, rounded-2xl (`20px`), subtle 1px outline (`#F1F5F9`), Level 1 ambient teal drop shadow.
- Header contains category icon enclosed in a soft mint circle (`#CCFBF1`), followed by the title and timestamp, with the status badge aligned top-right.

### 4. Input Fields & Text Areas (Campos de Texto)
- Background `#FFFFFF` (idle) and `#F8FAFC` (fill state), border `1.5px solid #E2E8F0`, 16px border-radius.
- Placeholder text in `#94A3B8` with reassuring, guided prompts (e.g., *"Você pode escrever com calma. Ninguém além da equipe de acolhimento lerá isso."*).
- Active/focus state shifts border to `#0D9488` with a soft mint outer glow.

### 5. Anonymous Reporting Toggle (Chave de Anonimato)
- Prominent toggle card with a shield icon. Off state displays "Identificado (Apenas orientador saberá)", On state switches background to `#F0FDFA` with green checkmark and "100% Anônimo (Nenhum dado pessoal vinculado)".

### 6. Quick Emotional Check-in Selector (Escala de Sentimento)
- A horizontal scroll of rounded tactile pills featuring friendly, neutral emotional icons (Calmo, Preocupado, Assustado, Triste, Preciso de Ajuda) with gentle feedback upon selection, avoiding exaggerated cartoonish visuals.