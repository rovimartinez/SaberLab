/**
 * Efecto de Eliminación: Chasquido de Thanos (Finger Snap Particle Disintegration)
 * Basado en la implementación de Efectos/efectos_de_eliminaci_n_de_chat.html
 */

export function playFingerSnapSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const now = ctx.currentTime;

        // 1. Clic transitorio de fricción entre dedos
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.012);
        oscGain.gain.setValueAtTime(0.75, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.012);

        // 2. Golpe carnoso contra la palma (ráfaga de ruido filtrado de banda estrecha)
        const bufferSize = Math.floor(ctx.sampleRate * 0.045);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now + 0.003);
        filter.Q.setValueAtTime(3.2, now + 0.003);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.setValueAtTime(0.85, now + 0.003);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now + 0.003);
        noise.stop(now + 0.045);
    } catch {}
}

export function runThanosSnap(targetEl, onComplete) {
    if (!targetEl || typeof window === 'undefined') {
        if (onComplete) onComplete();
        return;
    }

    // 1. Reproducir sonido de chasquido de dedos
    playFingerSnapSound();

    const rect = targetEl.getBoundingClientRect();
    const extraWidth = 160;
    const extraHeight = 60;
    const offsetY = 20;

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width + extraWidth);
    canvas.height = Math.ceil(rect.height + extraHeight);
    canvas.style.position = 'fixed';
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top - offsetY}px`;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        if (canvas.parentNode) canvas.remove();
        if (onComplete) onComplete();
        return;
    }

    // 2. Destello cósmico púrpura de la Gema del Poder
    targetEl.style.transition = 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    targetEl.style.boxShadow = '0 0 35px 8px rgba(168, 85, 247, 0.8)';
    targetEl.style.borderColor = '#a855f7';

    // 3. Sistema físico de partículas de ceniza
    const particles = [];
    const particleCount = 420;
    const ashColors = ['#d8b4fe', '#c084fc', '#a855f7', '#94a3b8', '#cbd5e1', '#f1f5f9', '#64748b'];

    for (let i = 0; i < particleCount; i++) {
        const startX = Math.random() * rect.width;
        const startY = Math.random() * rect.height + offsetY;
        particles.push({
            x: startX,
            y: startY,
            size: Math.random() * 2.8 + 1.2,
            color: ashColors[Math.floor(Math.random() * ashColors.length)],
            vx: Math.random() * 3.8 + 1.4, // Dispersión hacia la derecha con el viento
            vy: (Math.random() - 0.7) * 2.2, // Flotación ascendente ligera
            alpha: 1,
            decay: Math.random() * 0.024 + 0.016, // Desvanecimiento ágil de 600-750ms
            delay: (startX / rect.width) * 12 // Disolución secuencial progresiva de izquierda a derecha
        });
    }

    // 4. Ocultar el elemento original con desenfoque de disolución
    setTimeout(() => {
        if (targetEl) {
            targetEl.style.opacity = '0';
            targetEl.style.filter = 'blur(6px)';
        }
    }, 100);

    let frame = 0;
    let animId = null;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;

        particles.forEach(p => {
            if (frame >= p.delay && p.alpha > 0) {
                activeParticles++;
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Física de viento, turbulencia ondulatoria y desintegración
                p.x += p.vx + Math.sin(frame * 0.08) * 0.6;
                p.y += p.vy;
                p.alpha -= p.decay;
            } else if (p.alpha > 0) {
                activeParticles++;
            }
        });

        frame++;
        if (activeParticles > 0) {
            animId = requestAnimationFrame(animate);
        } else {
            if (animId) cancelAnimationFrame(animId);
            if (canvas.parentNode) canvas.remove();

            // 5. Colapso suave del espacio ocupado por la fila
            targetEl.classList.add('saberlab-collapse-row');
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 250);
        }
    }
    animate();
}

/**
 * Efecto de Materialización Cósmica al Abrir el Chat (Thanos Inverse Dust / Cosmic Inflow)
 * Partículas del color temático del bot convergen hacia el marco del chat al desplegarse.
 * 
 * @param {HTMLElement} windowEl Elemento .saberlab-ai-window destino
 * @param {string} botColor Color hexadecimal o CSS temático del bot activo
 */
export function runThanosWindowDust(windowEl, botColor = '#0284c7') {
    if (!windowEl || typeof window === 'undefined') return;

    const rect = windowEl.getBoundingClientRect();
    const margin = 120;

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width + margin * 2);
    canvas.height = Math.ceil(rect.height + margin * 2);
    canvas.style.position = 'fixed';
    canvas.style.left = `${rect.left - margin}px`;
    canvas.style.top = `${rect.top - margin}px`;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99998';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        if (canvas.parentNode) canvas.remove();
        return;
    }

    const particles = [];
    const count = 140;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 120 + 80;
        const targetX = margin + Math.random() * rect.width;
        const targetY = margin + Math.random() * rect.height;

        particles.push({
            x: targetX + Math.cos(angle) * dist,
            y: targetY + Math.sin(angle) * dist,
            tx: targetX,
            ty: targetY,
            size: Math.random() * 3.5 + 1.5,
            color: botColor,
            maxAlpha: Math.random() * 0.85 + 0.35,
            progress: 0,
            speed: Math.random() * 0.04 + 0.025
        });
    }

    let animId = null;
    function animateInflow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = 0;

        particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress <= 1) {
                active++;
                // Easing cúbico hacia el destino
                const ease = Math.min(1, p.progress * p.progress * (3 - 2 * p.progress));
                const curX = p.x + (p.tx - p.x) * ease;
                const curY = p.y + (p.ty - p.y) * ease;

                const curAlpha = p.progress < 0.6 
                    ? (p.progress / 0.6) * p.maxAlpha 
                    : (1 - (p.progress - 0.6) / 0.4) * p.maxAlpha;

                ctx.save();
                ctx.globalAlpha = Math.max(0, curAlpha);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        if (active > 0) {
            animId = requestAnimationFrame(animateInflow);
        } else {
            if (animId) cancelAnimationFrame(animId);
            if (canvas.parentNode) canvas.remove();
        }
    }

    animateInflow();
}

/**
 * Efecto de Desintegración Cósmica al Cerrar la Ventana de Chat (Thanos Window Outflow)
 */
export function runThanosWindowClose(windowEl, botColor = '#0284c7', onComplete) {
    if (!windowEl || typeof window === 'undefined') {
        if (onComplete) onComplete();
        return;
    }

    const rect = windowEl.getBoundingClientRect();
    const margin = 80;

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width + margin * 2);
    canvas.height = Math.ceil(rect.height + margin * 2);
    canvas.style.position = 'fixed';
    canvas.style.left = `${rect.left - margin}px`;
    canvas.style.top = `${rect.top - margin}px`;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99998';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        if (canvas.parentNode) canvas.remove();
        if (onComplete) onComplete();
        return;
    }

    const particles = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
        const startX = margin + Math.random() * rect.width;
        const startY = margin + Math.random() * rect.height;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 80 + 40;

        particles.push({
            x: startX,
            y: startY,
            tx: startX + Math.cos(angle) * dist,
            ty: startY + Math.sin(angle) * dist,
            size: Math.random() * 3 + 1,
            color: botColor,
            maxAlpha: Math.random() * 0.8 + 0.2,
            progress: 0,
            speed: Math.random() * 0.045 + 0.03
        });
    }

    let animId = null;
    function animateOutflow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = 0;

        particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress <= 1) {
                active++;
                const ease = p.progress * p.progress;
                const curX = p.x + (p.tx - p.x) * ease;
                const curY = p.y + (p.ty - p.y) * ease;
                const curAlpha = (1 - p.progress) * p.maxAlpha;

                ctx.save();
                ctx.globalAlpha = Math.max(0, curAlpha);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        if (active > 0) {
            animId = requestAnimationFrame(animateOutflow);
        } else {
            if (animId) cancelAnimationFrame(animId);
            if (canvas.parentNode) canvas.remove();
            if (onComplete) onComplete();
        }
    }

    animateOutflow();
}
