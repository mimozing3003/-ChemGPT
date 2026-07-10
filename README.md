<div align="center">

# ⚗️ ChemGPT — The AI Chemistry Copilot & Molecular Intelligence Platform

[![Maker](https://img.shields.io/badge/Maker-Saumojit%20Roy-4edea3?style=for-the-badge&logo=github&logoColor=080810)](https://github.com/mimozing3003)
[![Live App](https://img.shields.io/badge/Live%20App-chem--gpt--ten.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://chem-gpt-ten.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffb95f?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmimozing3003%2F-ChemGPT)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-blueviolet?style=for-the-badge&logo=three.js&logoColor=white)](#)

<p align="center">
  <strong>Ask anything in chemistry. Visualize every molecule. Understand every reaction.</strong><br/>
  <em>Designed and Architected by <a href="https://github.com/mimozing3003">Saumojit Roy</a></em><br/><br/>
  <a href="https://chem-gpt-ten.vercel.app/">
    <img src="https://img.shields.io/badge/🌐_LAUNCH_LIVE_APP-chem--gpt--ten.vercel.app-4edea3?style=for-the-badge" alt="Launch Live App"/>
  </a>
</p>

---

</div>

---

## 🌟 Executive Summary & Product Vision

Traditional chemistry resources are scattered across static textbooks, clunky databases, and disconnected calculation tools. **ChemGPT** revolutionizes chemical education and research by integrating an intelligent **AI Chemistry Copilot** with real-time **3D Molecular Visualization**, an interactive **118-Element ChemVerse Encyclopedia**, and high-precision **Laboratory Calculators** into a single, breathtaking modern web application.

Whether you are a high school student learning stoichiometry, a university researcher exploring reaction mechanisms, or a professional chemist comparing elemental trends, ChemGPT serves as your **24/7 autonomous scientific lab partner**.

---

## ✨ Features & Capabilities

### 1. 🤖 Autonomous AI Chemistry Copilot (`chat.html`)
- **Scientific Natural Language Understanding**: Ask complex chemistry questions—from predicting reaction pathways to solving thermodynamics homework—and receive structured, step-by-step explanations.
- **Interactive 3D Molecular Canvas**: Embedded WebGL rendering dynamically visualizes atomic coordinates, bond angles, and resonance structures directly inside your chat workspace.
- **Quick Command Palette (`Ctrl+K` / `Cmd+K`)**: Lightning-fast keyboard navigation across tools, elements, and calculators.

---

### 2. 🌌 ChemVerse Encyclopedia (`encyclopedia.html`)
The ChemVerse turns the traditional static periodic table into an interactive exploration hub:

```
                          ┌───────────────────────────┐
                          │   ChemVerse Encyclopedia  │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  Global AI Search   │      │  Interactive Table  │      │  Element Dashboard  │
│ Elements · Formulas │      │  Category Filtering │      │ 3D Atom · Orbitals  │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

- **🔍 Global AI Search Bar**: Instant autocomplete search across all 118 chemical elements, common chemical formulas ($H_2O, C_6H_6, C_9H_8O_4$), and physical properties.
- **⚛️ Interactive Periodic Table**: Color-coded cards with instant hover tooltips and category filter tabs (*Alkali Metals, Noble Gases, Transition Metals, Lanthanides, Actinides*).
- **🔬 3D Element Dashboard Panel**: Click any element (e.g., **Carbon**, **Gold**) to open a futuristic glassmorphic side panel featuring a live **Three.js 3D Atom Viewer**, Bohr shell electron configuration, physical/chemical properties, and historical discovery data.
- **🧪 Famous Molecule Explorer**: Interactive cards for essential chemical compounds with molecular weight, structure classification, and 3D models.
- **⚖️ Side-by-Side Element Comparison Studio**: Select any two elements from the periodic table to compare density, atomic radius, electronegativity, melting/boiling points, and valence electrons side by side.

---

### 3. 🧮 Integrated Chemistry Calculator Suite
Stop memorizing formulas—ChemGPT includes interactive real-time calculators with instant unit conversions:
- **Molar Mass Calculator**: Parse chemical formulas and calculate exact molecular weights.
- **pH & pOH Calculator**: Instant conversion between $[H^+]$, $[OH^-]$, pH, and pOH.
- **Solution Dilution ($C_1V_1 = C_2V_2$)**: Precision molarity and volume calculations.
- **Ideal Gas Law ($PV = nRT$)**: Solve for Pressure, Volume, Moles, or Temperature under any state.

---

## 🏛️ System Design & Architecture

ChemGPT is engineered with a high-performance **decoupled frontend architecture** optimized for instantaneous loading, zero-latency 3D rendering, and edge deployment.

### Folder & File Structure

```text
CHEM-GPT/
├── banner.png                     # Hero banner & preview image
├── README.md                      # Detailed architectural documentation
├── vercel.json                    # Vercel zero-config routing & edge deployment
├── package.json                   # Project metadata & developer attribution
├── assets/                        # High-resolution screenshots & visual assets
│   ├── banner.png
│   ├── periodic_table.png
│   └── workspace.png
├── frontend/                      # Client-Side Application Core
│   ├── public/                    # Production Static Assets & App Pages
│   │   ├── index.html             # Homepage & Hero Showcase
│   │   ├── encyclopedia.html      # ChemVerse 118-Element Explorer & Tools
│   │   └── chat.html              # Interactive AI Laboratory Workspace
│   └── vercel.json                # Nested Vercel Edge configuration
└── backend/                       # Express / OpenAI Server API Layer
    ├── src/
    │   ├── server.ts              # Express API entrypoint
    │   └── services/              # AI & PubChem database integrations
    └── package.json
```

### Technology Stack
| Layer | Technologies Used | Design Benefits |
| :--- | :--- | :--- |
| **Frontend Structure** | HTML5, Semantic DOM | Ultra-fast load times, SEO-optimized, accessible markup. |
| **Styling & Aesthetics** | Vanilla CSS Variables, Tailwind CSS (CDN) | Brutalist dark mode (`#080810`), glassmorphism, responsive fluid layouts. |
| **3D & Graphics Engine** | **Three.js**, WebGL Canvas | GPU-accelerated 3D atom/molecule animation with zero lag. |
| **Animations** | **GSAP (GreenSock)** | Smooth scroll reveals, microinteractions, and floating UI transitions. |
| **Hosting & Routing** | **Vercel Edge Network** | Zero-config URL rewrites (`/encyclopedia`, `/chat`). |

---

## 🚀 Instant Vercel Deployment

ChemGPT is pre-configured for lightning-fast deployment on **Vercel Edge Network**:

### ⚡ 1-Click Deploy
Click the button below to instantly clone and deploy this project to your Vercel account:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmimozing3003%2F-ChemGPT)

### Manual Local Development
Run ChemGPT locally on your computer in under 10 seconds:

```bash
# 1. Clone the repository
git clone https://github.com/mimozing3003/-ChemGPT.git
cd -ChemGPT

# 2. Start the local server
npm start
# OR serve directly
npx serve frontend/public -p 3000
```
🌐 **Live Production Application**: Open **[https://chem-gpt-ten.vercel.app/](https://chem-gpt-ten.vercel.app/)** in your browser right now to begin exploring! *(Or visit http://localhost:3000 for local development)*

---

## 👨‍💻 Lead Developer & Maker Information

<div align="center">

### **Saumojit Roy**
*Lead Architect & Full-Stack AI Application Developer*

| Profile | Link |
| :--- | :--- |
| **📧 Email** | [saumojitroy40@gmail.com](mailto:saumojitroy40@gmail.com) |
| **🐙 GitHub** | [https://github.com/mimozing3003](https://github.com/mimozing3003) |
| **💼 LinkedIn** | [Saumojit Roy LinkedIn Profile](https://www.linkedin.com/in/saumojit-roy-ba9707295/) |

</div>

> *"Building state-of-the-art AI applications that turn complex scientific data into beautiful, interactive software experiences."*

---

<div align="center">
  <p>Crafted with ♥ by <strong>Saumojit Roy</strong> · © 2024 ChemGPT AI Platform</p>
</div>
