# ✨ Mandala Magic - Finger Tracking Art

Create beautiful mandala art by moving your finger in front of your webcam! This app uses real-time hand tracking to let you draw symmetric patterns in the air.

![Mandala Magic Demo](https://img.shields.io/badge/Made%20with-MediaPipe-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🎨 Features

- **Real-time Hand Tracking** - Uses MediaPipe Hands to detect your index finger
- **Symmetric Drawing** - Configurable 2-24 fold mandala symmetry
- **Color Controls** - Color picker with preset palette + Rainbow mode
- **Glow Effects** - Neon-style strokes with bloom effect
- **Save Your Art** - Export creations as PNG images

## 🚀 Quick Start

1. Clone this repository
2. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open http://localhost:8080
4. Allow camera access when prompted
5. Raise your index finger and start drawing!

## 🎮 Controls

| Control | Description |
|---------|-------------|
| Color Picker | Choose your brush color |
| Rainbow Mode 🌈 | Auto-cycling colors |
| Brush Size | Stroke thickness (1-20px) |
| Symmetry Folds | Number of mirror reflections (2-24) |
| Glow Effect ✨ | Toggle neon glow on strokes |
| Clear | Reset the canvas |
| Save | Download as PNG |

## 💡 Tips

- Move your finger near the **center** for traditional mandala patterns
- Use **Rainbow Mode** for psychedelic effects
- Try **high symmetry** (16-24) for intricate designs
- Hold your finger **down** (below your hand) to pause drawing

## 🛠️ Technology

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) - Hand tracking
- Vanilla JavaScript - No frameworks needed
- HTML5 Canvas - Drawing engine

## 📄 License

MIT License - Feel free to use and modify!
