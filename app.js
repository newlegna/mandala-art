/**
 * Mandala Magic - Finger Tracking Art Application
 * Uses MediaPipe Hands for real-time finger tracking
 */

class MandalaApp {
    constructor() {
        // Canvas elements
        this.canvas = document.getElementById('mandala-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCanvas = document.getElementById('preview-canvas');
        this.previewCtx = this.previewCanvas.getContext('2d');

        // Video element
        this.video = document.getElementById('webcam');

        // UI elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.trackingIndicator = document.getElementById('tracking-indicator');
        this.fingerIndicator = document.getElementById('finger-indicator');
        this.instructions = document.getElementById('instructions');
        this.controlPanel = document.getElementById('control-panel');

        // Control inputs
        this.colorPicker = document.getElementById('color-picker');
        this.colorPresets = document.querySelectorAll('.color-preset');
        this.gradientMode = document.getElementById('gradient-mode');
        this.brushSize = document.getElementById('brush-size');
        this.brushSizeValue = document.getElementById('size-value');
        this.symmetry = document.getElementById('symmetry');
        this.symmetryValue = document.getElementById('symmetry-value');
        this.glowEffect = document.getElementById('glow-effect');

        // Buttons
        this.clearBtn = document.getElementById('clear-canvas');
        this.saveBtn = document.getElementById('save-image');
        this.togglePanelBtn = document.getElementById('toggle-panel');
        this.dismissInstructionsBtn = document.getElementById('dismiss-instructions');

        // Drawing state
        this.isDrawing = false;
        this.lastPos = null;
        this.currentColor = '#ff6b9d';
        this.currentSize = 4;
        this.symmetryCount = 8;
        this.useGlow = true;
        this.useGradient = false;
        this.hue = 0;

        // Tracking state
        this.isHandDetected = false;
        this.fingerPos = null;

        // Initialize
        this.init();
    }

    async init() {
        // Set up canvas sizes
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Set up event listeners
        this.setupEventListeners();

        // Initialize MediaPipe Hands
        await this.initHandTracking();

        // Start camera
        await this.startCamera();

        // Hide loading screen
        this.loadingScreen.classList.add('hidden');

        // Show tracking indicator
        setTimeout(() => {
            this.trackingIndicator.classList.add('active');
        }, 500);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Set preview canvas size
        this.previewCanvas.width = 200;
        this.previewCanvas.height = 150;
    }

    setupEventListeners() {
        // Color picker
        this.colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.updateColorPresets();
        });

        // Color presets
        this.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                this.currentColor = preset.dataset.color;
                this.colorPicker.value = this.currentColor;
                this.updateColorPresets();
            });
        });

        // Gradient mode
        this.gradientMode.addEventListener('change', (e) => {
            this.useGradient = e.target.checked;
        });

        // Brush size
        this.brushSize.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.brushSizeValue.textContent = this.currentSize;
        });

        // Symmetry
        this.symmetry.addEventListener('input', (e) => {
            this.symmetryCount = parseInt(e.target.value);
            this.symmetryValue.textContent = this.symmetryCount;
        });

        // Glow effect
        this.glowEffect.addEventListener('change', (e) => {
            this.useGlow = e.target.checked;
        });

        // Clear canvas
        this.clearBtn.addEventListener('click', () => this.clearCanvas());

        // Save image
        this.saveBtn.addEventListener('click', () => this.saveImage());

        // Toggle panel
        this.togglePanelBtn.addEventListener('click', () => {
            this.controlPanel.classList.toggle('collapsed');
        });

        // Dismiss instructions
        this.dismissInstructionsBtn.addEventListener('click', () => {
            this.instructions.classList.add('hidden');
        });

        // Initial color preset highlight
        this.updateColorPresets();
    }

    updateColorPresets() {
        this.colorPresets.forEach(preset => {
            if (preset.dataset.color.toLowerCase() === this.currentColor.toLowerCase()) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
    }

    async initHandTracking() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => this.onHandResults(results));
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            this.video.srcObject = stream;
            await this.video.play();

            // Start processing frames
            this.processFrame();
        } catch (error) {
            console.error('Camera access error:', error);
            this.loadingScreen.querySelector('p').textContent =
                'Camera access denied. Please allow camera access and refresh.';
        }
    }

    async processFrame() {
        if (this.video.readyState >= 2) {
            await this.hands.send({ image: this.video });

            // Draw preview
            this.previewCtx.save();
            this.previewCtx.scale(-1, 1);
            this.previewCtx.drawImage(
                this.video,
                -this.previewCanvas.width, 0,
                this.previewCanvas.width,
                this.previewCanvas.height
            );
            this.previewCtx.restore();
        }

        requestAnimationFrame(() => this.processFrame());
    }

    onHandResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Get index finger tip (landmark 8)
            const indexTip = landmarks[8];

            // Convert to canvas coordinates (mirror the x coordinate)
            const x = (1 - indexTip.x) * this.canvas.width;
            const y = indexTip.y * this.canvas.height;

            // Update finger indicator in preview
            this.updateFingerIndicator(indexTip);

            // Check if finger is up (compare tip to dip)
            const indexDip = landmarks[6];
            const isFingerUp = indexTip.y < indexDip.y;

            if (isFingerUp) {
                // Draw at position
                if (this.lastPos) {
                    this.drawMandalaLine(this.lastPos.x, this.lastPos.y, x, y);
                }
                this.lastPos = { x, y };
                this.isDrawing = true;
            } else {
                // Finger is down, stop drawing
                this.lastPos = null;
                this.isDrawing = false;
            }

            this.isHandDetected = true;
        } else {
            // No hand detected
            this.lastPos = null;
            this.isDrawing = false;
            this.isHandDetected = false;
            this.fingerIndicator.style.opacity = '0';
        }
    }

    updateFingerIndicator(indexTip) {
        // Position in preview canvas coordinates
        const previewWidth = 200;
        const previewHeight = 150;
        const x = indexTip.x * previewWidth;
        const y = indexTip.y * previewHeight;

        this.fingerIndicator.style.left = x + 'px';
        this.fingerIndicator.style.top = y + 'px';
        this.fingerIndicator.style.opacity = '1';
    }

    drawMandalaLine(x1, y1, x2, y2) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Calculate position relative to center
        const dx1 = x1 - centerX;
        const dy1 = y1 - centerY;
        const dx2 = x2 - centerX;
        const dy2 = y2 - centerY;

        // Get color (gradient or solid)
        const color = this.useGradient ? this.getGradientColor() : this.currentColor;

        // Set up drawing style
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.currentSize;
        this.ctx.strokeStyle = color;

        if (this.useGlow) {
            this.ctx.shadowBlur = this.currentSize * 3;
            this.ctx.shadowColor = color;
        } else {
            this.ctx.shadowBlur = 0;
        }

        // Draw symmetric lines
        const angleStep = (Math.PI * 2) / this.symmetryCount;

        for (let i = 0; i < this.symmetryCount; i++) {
            const angle = angleStep * i;

            // Rotate points
            const rx1 = dx1 * Math.cos(angle) - dy1 * Math.sin(angle);
            const ry1 = dx1 * Math.sin(angle) + dy1 * Math.cos(angle);
            const rx2 = dx2 * Math.cos(angle) - dy2 * Math.sin(angle);
            const ry2 = dx2 * Math.sin(angle) + dy2 * Math.cos(angle);

            // Draw the line
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + rx1, centerY + ry1);
            this.ctx.lineTo(centerX + rx2, centerY + ry2);
            this.ctx.stroke();

            // Draw mirrored line for more symmetry
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - rx1, centerY + ry1);
            this.ctx.lineTo(centerX - rx2, centerY + ry2);
            this.ctx.stroke();
        }

        // Update hue for gradient mode
        if (this.useGradient) {
            this.hue = (this.hue + 1) % 360;
        }
    }

    getGradientColor() {
        return `hsl(${this.hue}, 85%, 60%)`;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.lastPos = null;
    }

    saveImage() {
        // Create a temporary link
        const link = document.createElement('a');
        link.download = `mandala-${Date.now()}.png`;

        // Create a copy of the canvas with a background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw background gradient
        const gradient = tempCtx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0f');
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the mandala
        tempCtx.drawImage(this.canvas, 0, 0);

        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MandalaApp();
});
