class TouchHandler {
    constructor() {
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchControls = document.getElementById('touchControls');
        this.leftTouchArea = document.getElementById('leftTouchArea');
        this.rightTouchArea = document.getElementById('rightTouchArea');
        
        this.leftTouching = false;
        this.rightTouching = false;
        this.leftTouchY = 0;
        this.rightTouchY = 0;
        this.leftLastY = 0;
        this.rightLastY = 0;
        
        this.onLeftMove = null;
        this.onRightMove = null;
        
        this.init();
    }
    
    init() {
        if (this.isTouchDevice) {
            this.showTouchControls();
            this.setupTouchEvents();
        }
    }
    
    showTouchControls() {
        this.touchControls.classList.remove('hidden');
    }
    
    hideTouchControls() {
        this.touchControls.classList.add('hidden');
    }
    
    disableRightTouchArea() {
        if (this.rightTouchArea) {
            this.rightTouchArea.style.opacity = '0.3';
            this.rightTouchArea.style.pointerEvents = 'none';
        }
    }
    
    enableRightTouchArea() {
        if (this.rightTouchArea) {
            this.rightTouchArea.style.opacity = '1';
            this.rightTouchArea.style.pointerEvents = 'all';
        }
    }
    
    setupTouchEvents() {
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
        
        // Left touch area events
        this.leftTouchArea.addEventListener('touchstart', (e) => {
            this.handleLeftTouchStart(e);
        });
        
        this.leftTouchArea.addEventListener('touchmove', (e) => {
            this.handleLeftTouchMove(e);
        });
        
        this.leftTouchArea.addEventListener('touchend', (e) => {
            this.handleLeftTouchEnd(e);
        });
        
        // Right touch area events
        this.rightTouchArea.addEventListener('touchstart', (e) => {
            this.handleRightTouchStart(e);
        });
        
        this.rightTouchArea.addEventListener('touchmove', (e) => {
            this.handleRightTouchMove(e);
        });
        
        this.rightTouchArea.addEventListener('touchend', (e) => {
            this.handleRightTouchEnd(e);
        });
    }
    
    handleLeftTouchStart(e) {
        e.preventDefault();
        this.leftTouching = true;
        const touch = e.touches[0];
        this.leftTouchY = touch.clientY;
        this.leftLastY = touch.clientY;
    }
    
    handleLeftTouchMove(e) {
        if (!this.leftTouching) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const currentY = touch.clientY;
        const deltaY = currentY - this.leftLastY;
        
        if (this.onLeftMove) {
            this.onLeftMove(deltaY);
        }
        
        this.leftLastY = currentY;
    }
    
    handleLeftTouchEnd(e) {
        e.preventDefault();
        this.leftTouching = false;
    }
    
    handleRightTouchStart(e) {
        e.preventDefault();
        this.rightTouching = true;
        const touch = e.touches[0];
        this.rightTouchY = touch.clientY;
        this.rightLastY = touch.clientY;
    }
    
    handleRightTouchMove(e) {
        if (!this.rightTouching) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const currentY = touch.clientY;
        const deltaY = currentY - this.rightLastY;
        
        if (this.onRightMove) {
            this.onRightMove(deltaY);
        }
        
        this.rightLastY = currentY;
    }
    
    handleRightTouchEnd(e) {
        e.preventDefault();
        this.rightTouching = false;
    }
    
    setLeftMoveCallback(callback) {
        this.onLeftMove = callback;
    }
    
    setRightMoveCallback(callback) {
        this.onRightMove = callback;
    }
    
    isTouch() {
        return this.isTouchDevice;
    }
}
