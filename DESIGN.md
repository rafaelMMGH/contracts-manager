---
name: Contratos
description: Mexican arrendamiento operations — olive forest primary, Lufga, stucco-light surfaces
colors:
  brand: "#3F5C48"
  brand-hover: "#334A3B"
  brand-deep: "#2A3D31"
  brand-soft: "#E8EEE9"
  brand-muted: "#D4DED7"
  gray: "#727272"
  black: "#000000"
  white: "#FFFFFF"
  bg: "#F3F5F4"
  border: "#D9E3DF"
  status-ok: "#3F5C48"
  status-warn: "#B45309"
  status-crit: "#B91C1C"
typography:
  display:
    fontFamily: "Lufga, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Lufga, system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Lufga, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Lufga, system-ui, sans-serif"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.white}"
---

# DESIGN.md

## Overview

Operational UI for Mexican property managers. Brand voice is **olive forest** `#3F5C48` on stucco-light surfaces, with **Lufga** as the single typeface (Regular / Medium / SemiBold / Bold). Expression lives in precise weight, color, and spacing — not decoration.

Mode: **Operate** (dashboard, CRUD, mobile shell).

## Colors

| Token | Hex | Role |
|---|---|---|
| Brand | `#3F5C48` | Primary actions, accents, active states |
| Gray | `#727272` | Secondary / muted text |
| Black | `#000000` | Primary text, high-emphasis labels |
| White | `#FFFFFF` | Surfaces, inverse text on brand |

Supporting (derived for product chrome, not on the board):

- Page background `#F3F5F4`
- Soft brand wash `#E8EEE9`
- Border `#D9E3DF`
- Workspace mesh: stucco & limestone (`#EDE8E1` / `#E2DDD4` / `#D8D2C8` on `#F6F4F0`), applied edge-to-edge on dashboard `main` (not login; not sheets/dialogs)
- Status ok / Disponible may share brand green `#3F5C48`
- Warn / crit keep amber and red for status semantics

Do not reintroduce retired primaries (`#1a7a56`, `#215A4E`, `#4A4038`, `#3F3A48`); `#3F5C48` is normative.

## Typography

**Family:** Lufga (self-hosted). Weights in use:

| Weight | CSS | Tailwind |
|---|---|---|
| Regular | 400 | `font-normal` |
| Medium | 500 | `font-medium` |
| SemiBold | 600 | `font-semibold` |
| Bold | 700 | `font-bold` |

One family only. No Outfit / Inter / system display as the brand voice. Tracking floor −0.04em; prefer −0.02em on large titles.

## Layout

Operate layouts stay dense and scannable: dashboard chrome, lists, forms. Mobile shell (`< md`) uses the floating tab bar; desktop keeps sidebar + top header.

## Elevation & Depth

Soft tinted shadows from olive forest (`rgba(63, 92, 72, …)`). Prefer one elevation signal (shadow *or* hairline border), not both stacked.

## Shapes

Cards and sheets: 12–16px. Pills only for chips and small controls. Tab bar remains near-full pill.

## Components

Primary buttons / filled accents use `{colors.brand}` on white text. Status badges: Disponible soft brand wash; Por vencer warn; Rentado muted gray.

## Do's and Don'ts

**Do**

- Use Lufga at 400/500/600/700 only
- Drive interactive color from `#3F5C48`
- Keep Spanish product copy and MXN formatting
- Keep workspace mesh in stucco / limestone family

**Don't**

- Swap in another display font for “premium”
- Use purple, cream+brass fashion meshes, or lavender/blush/peach as primary atmosphere
- Add decorative glass / gradient text
