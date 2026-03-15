export class Background {
    constructor(game) {
        this.game = game;
        this.stars = [];
        
        // Initialize stars
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.game.width,
                y: Math.random() * this.game.height,
                size: Math.random() * 2,
                speedY: Math.random() * 0.5 + 0.1, // Parallax basic
                color: `rgba(255, 255, ${Math.random()*155 + 100}, ${Math.random()})`
            });
        }
    }

    update(deltaTime) {
        this.stars.forEach(star => {
            star.y += star.speedY;
            if (star.y > this.game.height) {
                star.y = 0;
                star.x = Math.random() * this.game.width;
            }
        });
    }

    draw(context) {
        context.save();
        this.stars.forEach(star => {
            context.fillStyle = star.color;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI*2);
            context.fill();
        });
        context.restore();
    }
}
