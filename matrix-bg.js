/*
================================================================================
FILE: matrix-bg.js
AUTHOR: Frederick Thomas (The Super Coding Ninja™)
================================================================================
*/

(function() {
    'use strict';

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    const ctx = canvas.getContext('2d');
    
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Insert elements
    hero.insertBefore(canvas, hero.firstChild);
    
    const overlay = document.createElement('div');
    overlay.className = 'matrix-overlay';
    hero.insertBefore(overlay, canvas.nextSibling);
    
    const vignette = document.createElement('div');
    vignette.className = 'matrix-vignette';
    hero.insertBefore(vignette, overlay.nextSibling);

    let width, height;
    let animationId;
    let frame = 0;
    let isActive = true;

    // Your binary sequences
    const binarySequences = [
        "11110000 10011101 10010000 10111001",
        "11110000 10011101 10010001 10011111",
        "11110000 10011101 10010001 10010010",
        "11110000 10011101 10010001 10010001",
        "11110000 10011101 10010001 10010010",
        "11110000 10011101 10010001 10011111",
        "11110000 10011101 10010001 10010110",
        "11110000 10011101 10010001 10010000",
        "11110000 10011101 10010001 10011000",
        "00100000",
        "11110000 10011101 10010001 10000111",
        "11100010 10000100 10001110",
        "11110000 10011101 10010001 10011100",
        "11110000 10011101 10010001 10011010",
        "11110000 10011101 10010001 10001110",
        "11110000 10011101 10010001 10100000",
        "00100000",
        "01111100",
        "00100000",
        "11110000 10011101 10010001 10000111",
        "11100010 10000100 10001110",
        "11110000 10011101 10010001 10010010",
        "00100000",
        "11110000 10011101 10010001 10000110",
        "11110000 10011101 10010001 10100010",
        "11110000 10011101 10010001 10011101",
        "11110000 10011101 10010001 10010010",
        "11110000 10011101 10010001 10011111",
        "00100000",
        "11110000 10011101 10010000 10110110",
        "11110000 10011101 10010001 10011100",
        "11110000 10011101 10010001 10010001",
        "11110000 10011101 10010001 10010110",
        "11110000 10011101 10010001 10011011",
        "11110000 10011101 10010001 10010100",
        "00100000",
        "11110000 10011101 10010001 10000001",
        "11110000 10011101 10010001 10010110",
        "11110000 10011101 10010001 10011011",
        "11110000 10011101 10010001 10010111",
        "11110000 10011101 10010001 10001110",
        "11100010 10000100 10100010"
    ];

    // Your colors
    const colors = {
        primary: '#00d4ff',
        secondary: '#6b4ee6',
        gold: '#d4af37',
        white: '#ffffff'
    };

    const config = {
        columnCount: 35,
        baseSpeed: 1.2,
        speedVariation: 0.8,
        fontSize: 12,
        perspective: 900,
        forwardSpeed: 1.5,
        shimmerChance: 0.03
    };

    class MatrixColumn {
        constructor(x, z) {
            this.x = x;
            this.z = z;
            this.y = Math.random() * -100;
            this.speed = config.baseSpeed + Math.random() * config.speedVariation;
            this.sequenceIndex = Math.floor(Math.random() * binarySequences.length);
            this.charIndex = 0;
            this.chars = binarySequences[this.sequenceIndex].split('');
            this.trail = [];
            this.maxTrailLength = 12 + Math.floor(Math.random() * 8);
            this.shimmerOffset = Math.random() * Math.PI * 2;
        }

        project() {
            const scale = (config.perspective / (config.perspective - this.z * 400)) * (0.4 + this.z * 0.6);
            const screenX = (this.x * width * 0.9) * scale + width / 2;
            const screenY = this.y * scale;
            const alpha = 0.15 + this.z * 0.85;
            const fontSize = config.fontSize * (0.4 + this.z * 1.2);
            return { x: screenX, y: screenY, scale, alpha, fontSize };
        }

        update() {
            this.z += config.forwardSpeed * 0.004;
            
            if (this.z > 1) {
                this.z = 0;
                this.x = (Math.random() - 0.5) * 2;
                this.y = Math.random() * -50;
                this.sequenceIndex = Math.floor(Math.random() * binarySequences.length);
                this.chars = binarySequences[this.sequenceIndex].split('');
            }

            this.y += this.speed * (0.6 + this.z * 0.8);

            if (this.y > height / (0.4 + this.z * 0.6) + 50) {
                this.y = -30;
                this.charIndex = 0;
                this.trail = [];
            }

            this.trail.push({ 
                char: this.chars[this.charIndex], 
                y: this.y,
                shimmer: Math.random() < config.shimmerChance
            });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }

            this.charIndex = (this.charIndex + 1) % this.chars.length;
        }

        draw() {
            const proj = this.project();
            
            this.trail.forEach((item, index) => {
                const trailY = item.y * proj.scale;
                const isHead = index === this.trail.length - 1;
                const isShimmer = item.shimmer || (frame + this.shimmerOffset) % 25 < 4;
                
                let color;
                if (isHead) {
                    color = isShimmer ? colors.white : colors.primary;
                } else if (isShimmer) {
                    color = colors.gold;
                } else {
                    const ratio = index / this.trail.length;
                    if (ratio > 0.6) {
                        color = colors.primary;
                    } else if (ratio > 0.3) {
                        color = colors.secondary;
                    } else {
                        color = `rgba(0, 212, 255, ${0.1 + ratio * 0.3})`;
                    }
                }

                ctx.font = `${isShimmer || isHead ? '600' : '400'} ${proj.fontSize}px "JetBrains Mono", monospace`;
                
                if (isHead || isShimmer) {
                    ctx.shadowColor = isShimmer ? colors.gold : colors.primary;
                    ctx.shadowBlur = isShimmer ? 12 : 8;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = color;
                ctx.fillText(item.char, proj.x, trailY);
            });

            ctx.shadowBlur = 0;
        }
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = (Math.random() - 0.5) * 2.5;
            this.y = (Math.random() - 0.5) * 2.5;
            this.z = Math.random();
            this.size = Math.random() * 1.5 + 0.5;
            this.speed = Math.random() * 0.015 + 0.008;
            this.alpha = Math.random() * 0.4 + 0.1;
        }

        update() {
            this.z += this.speed;
            if (this.z > 1) {
                this.reset();
                this.z = 0;
            }
        }

        draw() {
            const scale = (config.perspective / (config.perspective - this.z * 400));
            const screenX = (this.x * width * 0.6) * scale + width / 2;
            const screenY = (this.y * height * 0.6) * scale + height / 2;
            const size = this.size * scale;
            const alpha = this.alpha * (1 - this.z * 0.3);

            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.fill();
        }
    }

    let columns = [];
    let particles = [];

    function resize() {
        const rect = hero.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        
        columns = [];
        for (let i = 0; i < config.columnCount; i++) {
            columns.push(new MatrixColumn(
                (Math.random() - 0.5) * 2,
                Math.random()
            ));
        }

        particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        if (!isActive) return;

        ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
        ctx.fillRect(0, 0, width, height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        columns.sort((a, b) => a.z - b.z);

        columns.forEach(column => {
            column.update();
            column.draw();
        });

        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let y = (frame * 2) % 4; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1);
        }

        if (frame % 150 === 0) {
            const shimmerY = Math.random() * height;
            const gradient = ctx.createLinearGradient(0, shimmerY, width, shimmerY);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.08)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, shimmerY - 1, width, 2);
        }

        frame++;
        animationId = requestAnimationFrame(animate);
    }

    function handleVisibility() {
        if (document.hidden) {
            isActive = false;
            cancelAnimationFrame(animationId);
        } else {
            isActive = true;
            animate();
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                isActive = true;
                animate();
            } else {
                isActive = false;
                cancelAnimationFrame(animationId);
            }
        });
    }, { threshold: 0.1 });

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);
    observer.observe(hero);
    animate();

})();
