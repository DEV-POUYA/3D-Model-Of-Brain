# 3D Human Brain Explorer

An interactive, bilingual (**English LTR / Persian RTL**) 3D human brain anatomy explorer, content editor, and anatomy quiz built with **React**, **TypeScript**, **Three.js** (`@react-three/fiber`), and **Tailwind CSS**.

## Features

- **Procedural 3D Anatomy (17 Regions / 24 Sub-Meshes)**
  - **Outer Cortex & Hindbrain:** Frontal, Parietal, Temporal, and Occipital lobes with unified C-shaped hemisphere partitioning, 3D Simplex sulci/gyri folding, baked ambient occlusion, striated Cerebellum, and segmented Brainstem (Midbrain, Pons, Medulla Oblongata).
  - **Deep Internal Structures:** C-shaped Corpus Callosum, Lateral & Third Ventricles, Thalamus, Hypothalamus, Pituitary Gland, Pineal Gland, Basal Ganglia (Putamen & Caudate Nucleus), Hippocampus + Fornix arch, and Amygdala.
- **3D Inspection Controls**
  - **Cortex Opacity (X-Ray Mode):** Fade outer lobes (`8%–100%`) with click-through raycasting to inspect and select deep internal organs directly.
  - **Exploded View (`0%–100%`):** Smoothly separates all 17 regions along anatomical vectors with automatic camera framing.
  - **Isolate Part & Camera Focus:** Ghost non-selected regions into translucent wireframes and focus smoothly on any structure.
- **View, Edit & Persistence**
  - Searchable directory by English, Persian, Latin name, or anatomical category.
  - Live **Edit Mode** to customize titles, summaries, functions, clinical notes, and 3D mesh colors with automatic `localStorage` persistence plus **JSON Export / Import**.
- **Interactive Anatomy Quiz**
  - Non-repeating prompts across **All (17)**, **Outer & Stem (8)**, or **Deep Internal (9)** scopes.
  - Direct 3D mesh click evaluation, suppressed hover labels while answering, hints, answer reveal, and **Score / Accuracy / Streak** tracking.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **3D Rendering:** Three.js, `@react-three/fiber`, `@react-three/drei`

## Getting Started

```bash
npm install
npm run dev
