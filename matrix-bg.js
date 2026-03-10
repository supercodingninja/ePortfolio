/*
================================================================================
FILE: matrix-bg.js
PROJECT: ePortfolio PWA Refactor
AUTHOR: Frederick Thomas (The Super Coding Ninja™)
DESCRIPTION: Matrix rain + Space travel effect - traveling THROUGH the code
================================================================================
*/

(function() {
    'use strict';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    const ctx = canvas.getContext('2d');
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    hero.insertBefore(canvas, hero.firstChild);
    hero.insertBefore(document.createElement('div'), canvas.nextSibling).className = 'matrix-overlay';
    hero.insertBefore(document.createElement('div'), hero.querySelector('.matrix-overlay').nextSibling).className = 'matrix-vignette';

    let width, height, animationId, frame = 0, isActive = true;

    const binarySequences = ["11110000 10011101 10010000 10111001","11110000 10011101 10010001 10011111","11110000 10011101 10010001 10010010","11110000 10011101 10010001 10010001","11110000 10011101 10010001 10010010","11110000 10011101 10010001 10011111","11110000 10011101 10010001 10010110","11110000 10011101 10010001 10010000","11110000 10011101 10010001 10011000","00100000","11110000 10011101 10010001 10000111","11100010 10000100 10001110","11110000 10011101 10010001 10011100","11110000 10011101 10010001 10011010","11110000 10011101 10010001 10001110","11110000 10011101 10010001 10100000","00100000","01111100","00100000","11110000 10011101 10010001 10000111","11100010 10000100 10001110","11110000 10011101 10010001 10010010","00100000","11110000 10011101 10010001 10000110","11110000 10011101 10010001 10100010","11110000 10011101 10010001 10011101","11110000 10011101 10010001 10010010","11110000 10011101 10010001 10011111","00100000","11110000 10011101 10010000 10110110","11110000 10011101 10010001 10011100","11110000 10011101 10010001 10010001","11110000 10011101 10010001 10010110","11110000 10011101 10010001 10011011","11110000 10011101 10010001 10010100","00100000","11110000 10011101 10010001 10000001","11110000 10011101 10010001 10010110","11110000 10011101 10010001 10011011","11110000 10011101 10010001 10010111","11110000 10011101 10010001 10001110","11100010 10000100 10100010"];

    const colors = {
        head: '#ffffff',
        primary: '#00d4ff',
        secondary: '#6b4ee6',
        gold: '#d4af37'
    };

    const config = {
        fontSize: 16,
        columnCount: 60,
        speed: 2.5,
        perspective: 600,
        forwardSpeed: 4,
        trailLength: 25
    };

    class MatrixStream {
        constructor(x, z) {
            this.x = x;
            this.z = z;
            this.y = Math.random() * -100;
            this.speed = config.speed + Math.random() * 2;
            this.chars = binarySequences[Math.floor(Math.random() * binarySequences.length)].split('');
            this.charIndex = Math.floor(Math.random() * this.chars.length);
            this.trail = [];
            this.maxTrailLength = config.trailLength + Math.floor(Math.random() * 10);
        }

        project() {
            const scale = config.perspective / (config.perspective - this.z * 400);
            return {
                x: (this.x * width * 0.8) * scale + width / 2,
                y: this.y * scale,
                size: config.fontSize * scale,
                alpha: Math.min(1, 0.3 + this.z * 0.7)
            };
        }

        update() {
            this.z += config.forwardSpeed * 0.008;
            if (this.z > 1.2) {
                this.z = 0;
                this.x = (Math.random() - 0.5) * 2.5;
                this.y = Math.random() * -50;
                this.chars = binarySequences[Math.floor(Math.random() * binarySequences.length)].split('');
                this.trail = [];
            }
            this.y += this.speed * (0.5 + this.z * 0.5);
            if (this.y > height / this.project().scale + 50) {
                this.y = -30;
                this.charIndex = 0;
                this.trail = [];
            }
            this.trail.unshift({ char: this.chars[this.charIndex], isGold: Math.random() < 0.03 });
            if (this.trail.length > this.maxTrailLength) this.trail.pop();
            this.charIndex = (this.charIndex + 1) % this.chars.length;
        }

        draw() {
            const proj = this.project();
            this.trail.forEach((item, index) => {
                const trailY = (this.y - index * proj.size * 0.8) * proj.scale;
                const isHead = index === 0;
                let alpha = proj.alpha;
                if (!isHead) alpha *= (1 - index / this.trail.length) * 0.6;
                let color, glow = 0;
                if (isHead) { color = colors.head; glow = 20; }
                else if (item.isGold) { color = colors.gold; glow = 15; alpha = Math.min(1, alpha * 2); }
                else if (index < 4) { color = colors.primary; glow = 10; }
                else if (index < 10) { color = colors.secondary; }
                else { color = `rgba(0, 212, 255, ${alpha})`; }
                if (trailY > -50 && trailY < height + 50) {
                    ctx.font = `${isHead ? 'bold' : 'normal'} ${proj.size}px "JetBrains Mono", monospace`;
                    ctx.fillStyle = color;
                    ctx.shadowColor = item.isGold ? colors.gold : colors.primary;
                    ctx.shadowBlur = glow;
                    ctx.fillText(item.char, proj.x, trailY);
                }
            });
            ctx.shadowBlur = 0;
        }
    }

    let streams = [];

    function init() {
        const rect = hero.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        streams = [];
        for (let i = 0; i < config.columnCount; i++) {
            streams.push(new MatrixStream((Math.random() - 0.5) * 2.5, Math.random()));
        }
    }

    function animate() {
        if (!isActive) return;
        ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
        ctx.fillRect(0, 0, width, height);
        streams.sort((a, b) => a.z - b.z);
        streams.forEach(stream => { stream.update(); stream.draw(); });
        frame++;
        animationId = requestAnimationFrame(animate);
    }

    function handleVisibility() {
        isActive = !document.hidden;
        if (isActive) animate(); else cancelAnimationFrame(animationId);
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            isActive = entry.isIntersecting;
            if (isActive) animate(); else cancelAnimationFrame(animationId);
        });
    }, { threshold: 0.1 });

    init();
    window.addEventListener('resize', init);
    document.addEventListener('visibilitychange', handleVisibility);
    observer.observe(hero);
    animate();

})();
