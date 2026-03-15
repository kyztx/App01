export class Input {
    constructor() {
        this.keys = [];
        
        // Define controls
        this.controlMap = {
            'ArrowUp': 'up',
            'w': 'up',
            'W': 'up',
            
            'ArrowDown': 'down',
            's': 'down',
            'S': 'down',
            
            'ArrowLeft': 'left',
            'a': 'left',
            'A': 'left',
            
            'ArrowRight': 'right',
            'd': 'right',
            'D': 'right',
            
            ' ': 'shoot'
        };

        window.addEventListener('keydown', (e) => {
            const action = this.controlMap[e.key];
            if (action && this.keys.indexOf(action) === -1) {
                this.keys.push(action);
            }
            // Prevent default scrolling for arrows and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const action = this.controlMap[e.key];
            if (action) {
                this.keys.splice(this.keys.indexOf(action), 1);
            }
        });
    }

    isPressed(action) {
        return this.keys.includes(action);
    }
}
