---
name: Contratos
description: Mexican arrendamiento operations — forest green, Lufga, light operational surfaces
colors:
  brand: "#215A4E"
  brand-hover: "#1A4A40"
  brand-deep: "#163F37"
  brand-soft: "#E8F0ED"
  brand-muted: "#D3E2DD"
  gray: "#727272"
  black: "#000000"
  white: "#FFFFFF"
  bg: "#F3F5F4"
  border: "#D9E3DF"
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

Operational UI for Mexican property managers. Brand voice is calm forest green on light surfaces, with **Lufga** as the single typeface (Regular / Medium / SemiBold / Bold). Expression lives in precise weight, color, and spacing — not decoration.

Mode: **Operate** (dashboard, CRUD, mobile shell).

## Colors

| Token | Hex | Role |
|---|---|---|
| Brand | `#215A4E` | Primary actions, accents, active states |
| Gray | `#727272` | Secondary / muted text |
| Black | `#000000` | Primary text, high-emphasis labels |
| White | `#FFFFFF` | Surfaces, inverse text on brand |

Supporting (derived for product chrome, not on the board):

- Page background `#F3F5F4`
- Soft brand wash `#E8F0ED`
- Border `#D9E3DF`
- Warn / crit keep amber and red for status semantics

Do not reintroduce the previous `#1a7a56` green; `#215A4E` is normative.

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

Soft tinted shadows from brand green (`rgba(33, 90, 78, …)`). Prefer one elevation signal (shadow *or* hairline border), not both stacked.

## Shapes

Cards and sheets: 12–16px. Pills only for chips and small controls. Tab bar remains near-full pill.

## Components

Primary buttons / filled accents use `{colors.brand}` on white text. Status badges: Disponible soft brand wash; Por vencer warn; Rentado muted gray.

## Do's and Don'ts

**Do**

- Use Lufga at 400/500/600/700 only
- Drive interactive color from `#215A4E`
- Keep Spanish product copy and MXN formatting

**Don't**

- Swap in another display font for “premium”
- Use purple, cream+brass, or the retired `#1a7a56` as primary
- Add decorative glass / gradient text
