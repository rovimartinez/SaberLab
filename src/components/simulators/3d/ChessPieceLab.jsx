import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
    Target,
    Sparkles,
    CheckCircle2,
    HelpCircle,
    ChevronRight,
    Award,
    Dot,
    GitBranch,
    Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

/* ─────────────────────────────────────────────────────────────────
   CHESS PIECE LAB — Constructor didáctico de piezas de ajedrez
   Revolución de perfil (Lathe) sobre Three.js, convención Z-Up.
   Piezas: peon | torre | alfil  (M1·l3 y M1·l4 del curso MA)
   ───────────────────────────────────────────────────────────────── */

// ── Perfiles de revolución (altura y, radio r) ──
const PROFILES = {
    peon: [
        { y: 0.0, r: 0.9 },
        { y: 0.24, r: 0.9 },
        { y: 0.34, r: 0.72 },
        { y: 0.48, r: 0.52 },
        { y: 0.68, r: 0.42 },
        { y: 0.9, r: 0.4 },
        { y: 1.12, r: 0.48 },
        { y: 1.22, r: 0.62 },
        { y: 1.32, r: 0.5 },
        { y: 1.5, r: 0.68 },
        { y: 1.74, r: 0.6 },
        { y: 1.95, r: 0.0 }
    ],
    torre: [
        { y: 0.0, r: 0.95 },
        { y: 0.28, r: 0.95 },
        { y: 0.38, r: 0.7 },
        { y: 0.65, r: 0.66 },
        { y: 0.78, r: 0.8 },
        { y: 0.88, r: 0.68 },
        { y: 1.3, r: 0.72 },
        { y: 1.42, r: 0.92 },
        { y: 1.48, r: 0.92 },
        { y: 1.5, r: 0.0 }
    ],
    alfil: [
        { y: 0.0, r: 0.9 },
        { y: 0.26, r: 0.9 },
        { y: 0.36, r: 0.68 },
        { y: 0.6, r: 0.48 },
        { y: 0.85, r: 0.6 },
        { y: 0.95, r: 0.48 },
        { y: 1.12, r: 0.32 },
        { y: 1.3, r: 0.52 },
        { y: 1.5, r: 0.58 },
        { y: 1.62, r: 0.42 },
        { y: 1.74, r: 0.16 },
        { y: 1.82, r: 0.0 }
    ]
};

const PIECE_META = {
    peon: { name: 'Peón', icon: '🧩', color: '#38bdf8', extraLabel: 'Cabeza y collar detallados', extraKey: 'detailedHead', battlement: false },
    torre: { name: 'Torre', icon: '🏰', color: '#a855f7', extraLabel: 'Plataforma superior (Inset)', extraKey: 'topPlate', battlement: true },
    alfil: { name: 'Alfil', icon: '🛕', color: '#f59e0b', extraLabel: 'Collar separado (Extrude)', extraKey: 'collar', battlement: false }
};

// ── Retos guiados por pieza ──
const CHALLENGES = {
    peon: [
        {
            id: 'peon-1',
            title: 'Reto 1: Tu primer Peón',
            desc: 'En Modo Edición, toda pieza de ajedrez nace de un perfil 2D que se gira alrededor del eje vertical (revolución).',
            objective: 'Selecciona la pieza "Peón" en el selector de piezas.',
            hint: 'Usa el menú desplegable de arriba y elige "Peón".',
            check: (s) => s.piece === 'peon'
        },
        {
            id: 'peon-2',
            title: 'Reto 2: Loop Cut Radial (Subdivisión)',
            desc: 'Los segmentos radiales son las "aristas" que dan suavidad al anillo del cuerpo. Más cortes = más redondez.',
            objective: 'Aumenta los Segmentos Radiales (Loop Cut) a 24 o más.',
            hint: 'Arrastra el slider gris "Segmentos radiales" hasta al menos 24.',
            check: (s) => s.segments >= 24
        },
        {
            id: 'peon-3',
            title: 'Reto 3: Vértices, Aristas y Caras (V-E-F)',
            desc: 'Observa la telemetría en vivo: la malla del peón está compuesta de vértices, aristas y caras.',
            objective: 'Activa el sombreado en alambre (Wireframe) y verifica que la telemetría supera los 200 vértices.',
            hint: 'Pulsa el botón "Wire" de la vista y revisa la caja V-E-F.',
            check: (s) => s.shading === 'wireframe' && s.vef.vertices > 200
        },
        {
            id: 'peon-4',
            title: 'Reto 4: Cabeza detallada (Extrusión)',
            desc: 'La cabeza esférica del peón se logra extruyendo el perfil hacia arriba y engrosando el radio.',
            objective: 'Activa "Cabeza y collar detallados" en el panel de técnicas.',
            hint: 'Pulsa el interruptor púrpura/azul de arriba del panel derecho.',
            check: (s) => s.extraOn === true
        },
        {
            id: 'peon-5',
            title: 'Reto 5: Vista realista (Sombreado Final)',
            desc: 'El peón queda listo al pasar de alambre/sólido a una vista renderizada con luces.',
            objective: 'Cambia la vista a "Render" para ver el peón iluminado final.',
            hint: 'Pulsa el botón "Render" en el selector de vista.',
            check: (s) => s.shading === 'rendered' && s.piece === 'peon'
        }
    ],
    torre: [
        {
            id: 'torre-1',
            title: 'Reto 1: La Torre (Castillo)',
            desc: 'La torre tiene un cuerpo cilíndrico con un borde superior grueso. Se modela girando un perfil recto.',
            objective: 'Selecciona la pieza "Torre" en el selector.',
            hint: 'Elige "Torre" en el menú desplegable.',
            check: (s) => s.piece === 'torre'
        },
        {
            id: 'torre-2',
            title: 'Reto 2: Loop Cut para el cuerpo',
            desc: 'El cuerpo de la torre necesita segmentos radiales para verse cilíndrico y no facetado.',
            objective: 'Lleva los Segmentos Radiales a 20 o más.',
            hint: 'Sube el slider "Segmentos radiales" hasta 20+.',
            check: (s) => s.segments >= 20
        },
        {
            id: 'torre-3',
            title: 'Reto 3: Plataforma superior (Inset)',
            desc: 'La herramienta Inset (I) crea un borde interior en la parte superior, base de las almenas.',
            objective: 'Activa "Plataforma superior (Inset)".',
            hint: 'Pulsa el interruptor "Plataforma superior (Inset)".',
            check: (s) => s.extraOn === true
        },
        {
            id: 'torre-4',
            title: 'Reto 4: Almenas (Extrusión múltiple)',
            desc: 'Las almenas son cajas extruidas hacia arriba en círculo sobre la plataforma (Array + Extrude).',
            objective: 'Activa el interruptor "Almenas 🏰" del panel de técnicas.',
            hint: 'Enciende "Almenas 🏰".',
            check: (s) => s.battlementOn === true
        },
        {
            id: 'torre-5',
            title: 'Reto 5: Torre final',
            desc: 'Con el sombreado Render la torre muestra los volúmenes de sus almenas correctamente.',
            objective: 'Cambia la vista a "Render" con la torre activa.',
            hint: 'Pulsa "Render" y mantén la torre seleccionada.',
            check: (s) => s.shading === 'rendered' && s.piece === 'torre' && s.battlementOn === true
        }
    ],
    alfil: [
        {
            id: 'alfil-1',
            title: 'Reto 1: El Alfil (Obispo)',
            desc: 'El alfil se distingue por su cuello fino, collar y punta de lanza. Su perfil tiene muchos puntos de control.',
            objective: 'Selecciona la pieza "Alfil".',
            hint: 'Elige "Alfil" en el selector.',
            check: (s) => s.piece === 'alfil'
        },
        {
            id: 'alfil-2',
            title: 'Reto 2: Bevel (Redondeo de aristas)',
            desc: 'El Bevel (Ctrl+B) suaviza las aristas del perfil; en revolución se traduce en más segmentos y Sombreado suave.',
            objective: 'Activa el Sombreado Suave (Bevel) del panel y sube segmentos a 28+.',
            hint: 'Enciende "Sombreado Suave" y sube segmentos a 28+.',
            check: (s) => s.smoothShading === true && s.segments >= 28
        },
        {
            id: 'alfil-3',
            title: 'Reto 3: Collar separado (Extrude)',
            desc: 'El collar del alfil se modela extruyendo un anillo separado bajo el cuello.',
            objective: 'Activa "Collar separado (Extrude)".',
            hint: 'Pulsa el interruptor "Collar separado (Extrude)".',
            check: (s) => s.extraOn === true
        },
        {
            id: 'alfil-4',
            title: 'Reto 4: Revisión V-E-F de la malla',
            desc: 'Un alfil bien construido tiene miles de caras. Revísalo en alambre.',
            objective: 'Cambia a Vista Wireframe y verifica vértices > 300 y caras > 500.',
            hint: 'Pulsa "Wire" y lee la telemetría V-E-F.',
            check: (s) => s.shading === 'wireframe' && s.vef.vertices > 300 && s.vef.faces > 500
        },
        {
            id: 'alfil-5',
            title: 'Reto 5: Alfil final',
            desc: 'El alfil listo para el set completo con sombreado renderizado.',
            objective: 'Vista "Render" con el alfil activo.',
            hint: 'Pulsa "Render" y mantén el alfil seleccionado.',
            check: (s) => s.shading === 'rendered' && s.piece === 'alfil'
        }
    ]
};

// ── Cálculo de la malla V-E-F exacta ──
function computeVEF(geometry) {
    const indexAttr = geometry.index;
    const posAttr = geometry.attributes.position;
    if (!posAttr) return { vertices: 0, edges: 0, faces: 0 };
    const vertices = posAttr.count / 3;
    if (!indexAttr) {
        // Malla no indexada (fallback): cada triángulo = 3 vértices únicos
        const faces = vertices / 3;
        return { vertices, edges: Math.round(vertices * 1.5), faces };
    }
    const faces = indexAttr.count / 3;
    const edgeSet = new Set();
    const arr = indexAttr.array;
    for (let i = 0; i < arr.length; i += 3) {
        const a = arr[i], b = arr[i + 1], c = arr[i + 2];
        const push = (x, y) => { if (x < y) edgeSet.add(`${x}-${y}`); else edgeSet.add(`${y}-${x}`); };
        push(a, b); push(b, c); push(c, a);
    }
    return { vertices, edges: edgeSet.size, faces };
}

export default function ChessPieceLab() {
    const lessonId = 'ma-m1-l3'; // progreso compartido con l3
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const pieceGroupRef = useRef(null);
    const rafRef = useRef(null);

    const [activeTab, setActiveTab] = useState('challenges');
    const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState({});

    // Estado de la pieza
    const [piece, setPiece] = useState('peon');
    const [segments, setSegments] = useState(12);
    const [shading, setShading] = useState('solid'); // wireframe | solid | rendered
    const [smoothShading, setSmoothShading] = useState(false);
    const [extraOn, setExtraOn] = useState(false);
    const [battlementOn, setBattlementOn] = useState(false);
    const [vef, setVef] = useState({ vertices: 0, edges: 0, faces: 0 });

    const stateRef = useRef({});
    stateRef.current = { piece, segments, shading, smoothShading, extraOn, battlementOn, vef };

    // Cargar progreso
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`practical_progress_${lessonId}`);
            if (saved) setCompletedChallenges(JSON.parse(saved));
        } catch (e) { /* ignore */ }
    }, [lessonId]);

    // ── Escena Three.js (una sola vez) ──
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0b1220);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(3.2, 3.4, 4.2);
        camera.lookAt(0, 0, 0.9);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Luces
        const hemi = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(3, 5, 4);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x38bdf8, 0.5);
        rim.position.set(-3, 2, -3);
        scene.add(rim);

        // Rejilla de piso (Z-Up: GridHelper está en XZ → plano y=0)
        const grid = new THREE.GridHelper(7, 14, 0x334155, 0x1e293b);
        grid.position.y = 0;
        scene.add(grid);
        const disc = new THREE.Mesh(
            new THREE.CircleGeometry(3.5, 48),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 })
        );
        disc.rotation.x = -Math.PI / 2;
        disc.position.y = -0.001;
        scene.add(disc);

        const group = new THREE.Group();
        scene.add(group);
        pieceGroupRef.current = group;

        // Animación orbital ligera cuando no hay interacción (evita distraer)
        let dragging = false, lastX = 0, lastY = 0;
        const pointerDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
        const pointerMove = (e) => {
            if (!dragging) return;
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;
            const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(new THREE.Vector3(0, 0, 0.9)));
            spherical.theta -= dx * 0.01;
            spherical.phi -= dy * 0.01;
            spherical.phi = Math.max(0.15, Math.min(Math.PI - 0.15, spherical.phi));
            camera.position.setFromSpherical(spherical).add(new THREE.Vector3(0, 0, 0.9));
            camera.lookAt(0, 0, 0.9);
        };
        const pointerUp = () => { dragging = false; };
        const wheel = (e) => {
            e.preventDefault();
            const dir = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(0, 0, 0.9));
            const len = dir.length() + e.deltaY * 0.005;
            const clamped = Math.max(1.5, Math.min(14, len));
            dir.setLength(clamped);
            camera.position.copy(new THREE.Vector3(0, 0, 0.9).add(dir));
            camera.lookAt(0, 0, 0.9);
        };
        mount.addEventListener('pointerdown', pointerDown);
        window.addEventListener('pointermove', pointerMove);
        window.addEventListener('pointerup', pointerUp);
        mount.addEventListener('wheel', wheel, { passive: false });

        const resize = () => {
            if (!mount) return;
            const w = mount.clientWidth, h = mount.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            window.removeEventListener('pointermove', pointerMove);
            window.removeEventListener('pointerup', pointerUp);
            mount.removeEventListener('pointerdown', pointerDown);
            mount.removeEventListener('wheel', wheel);
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    // ── Construir la pieza según estado ──
    useEffect(() => {
        const group = pieceGroupRef.current;
        if (!group || !sceneRef.current) return;

        // Limpiar grupo
        while (group.children.length) {
            const child = group.children[0];
            group.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        const baseProfile = PROFILES[piece] || PROFILES.peon;
        // Añadir detalle "extra" según pieza
        let profile = [...baseProfile];
        if (extraOn) {
            if (piece === 'peon') {
                // cabeza más esférica: insertar punto extra de ensanchamiento
                profile = profile.map(p => (Math.abs(p.y - 1.5) < 0.05 ? { ...p, r: p.r + 0.08 } : p));
            } else if (piece === 'alfil') {
                // collar: agrandar anillo bajo el cuello
                profile = profile.map(p => (Math.abs(p.y - 0.9) < 0.08 ? { ...p, r: p.r + 0.12 } : p));
            } else if (piece === 'torre') {
                // plataforma superior: ensanchar borde
                profile = profile.map(p => (Math.abs(p.y - 1.44) < 0.1 ? { ...p, r: p.r + 0.1 } : p));
            }
        }

        const points = profile.map(p => new THREE.Vector2(p.r, p.y));
        const geometry = new THREE.LatheGeometry(points, segments);
        geometry.rotateX(-Math.PI / 2); // Y-up → Z-up

        const material = shading === 'wireframe'
            ? new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
            : new THREE.MeshStandardMaterial({
                color: shading === 'rendered' ? 0xf8fafc : 0x94a3b8,
                metalness: 0.25,
                roughness: 0.35,
                flatShading: !smoothShading
            });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // Almenas para la torre
        if (battlementOn && piece === 'torre') {
            const battlementMat = new THREE.MeshStandardMaterial({
                color: shading === 'rendered' ? 0xf8fafc : 0x94a3b8,
                metalness: 0.25,
                roughness: 0.35,
                flatShading: !smoothShading
            });
            const n = 8;
            for (let i = 0; i < n; i++) {
                const angle = (i / n) * Math.PI * 2;
                const bx = Math.cos(angle) * 0.82;
                const by = Math.sin(angle) * 0.82;
                const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.42), battlementMat);
                b.position.set(bx, by, 1.7);
                b.rotation.z = angle;
                b.castShadow = true;
                group.add(b);
            }
        }

        // Wireframe overlay sobre sólido (educativo)
        if (shading === 'solid' && smoothShading) {
            const wire = new THREE.Mesh(
                geometry.clone(),
                new THREE.MeshBasicMaterial({ color: 0x0b1220, wireframe: true, transparent: true, opacity: 0.18 })
            );
            group.add(wire);
        }

        setVef(computeVEF(geometry));
    }, [piece, segments, shading, smoothShading, extraOn, battlementOn]);

    // ── Validación de retos ──
    const currentChallenge = CHALLENGES[piece]?.[currentChallengeIdx] || CHALLENGES.peon[0];
    const currentList = CHALLENGES[piece] || CHALLENGES.peon;

    const markCompleted = (challengeId) => {
        setCompletedChallenges(prev => {
            const next = { ...prev, [challengeId]: true };
            try { localStorage.setItem(`practical_progress_${lessonId}`, JSON.stringify(next)); } catch (e) { /* noop */ }
            return next;
        });
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    };

    const handleValidate = () => {
        const c = currentChallenge;
        if (c && !completedChallenges[c.id] && c.check(stateRef.current)) {
            markCompleted(c.id);
        }
    };

    // Auto-validar cambios
    useEffect(() => {
        const c = currentList[currentChallengeIdx];
        if (c && !completedChallenges[c.id] && c.check(stateRef.current)) {
            markCompleted(c.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [piece, segments, shading, smoothShading, extraOn, battlementOn, vef, currentChallengeIdx, currentList.length]);

    const completedCount = Object.keys(completedChallenges).length;
    const progressPercent = Math.round((completedCount / Object.keys(CHALLENGES).reduce((a, k) => a + CHALLENGES[k].length, 0)) * 100);

    const shadingBtn = (label, value) => (
        <button
            onClick={() => setShading(value)}
            style={{
                background: shading === value ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.05)',
                color: shading === value ? '#f8fafc' : '#94a3b8',
                border: `1px solid ${shading === value ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
            }}
        >
            {label}
        </button>
    );

    const togglePill = (label, value, setter, color = '#38bdf8') => (
        <button
            onClick={() => setter(!value)}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between',
                background: '#0f172a', border: `1px solid ${value ? color : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: value ? '#f8fafc' : '#94a3b8'
            }}
        >
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{label}</span>
            <span style={{
                width: '34px', height: '20px', borderRadius: '10px', background: value ? color : '#334155', position: 'relative', transition: 'background 0.2s', flexShrink: 0
            }}>
                <span style={{
                    position: 'absolute', top: '2px', left: value ? '16px' : '2px', width: '16px', height: '16px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s'
                }} />
            </span>
        </button>
    );

    return (
        <div style={{ width: '100%', maxWidth: '1150px', margin: '0 auto', color: '#f8fafc' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1.5px solid rgba(236, 72, 153, 0.4)', borderRadius: '20px', padding: '1.4rem 1.5rem',
                marginBottom: '1.4rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '10px', borderRadius: '12px', color: '#ec4899' }}>
                            <Award size={28} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                                Laboratorio: Set de Ajedrez 3D ♟️
                            </h3>
                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                Construye piezas de ajedrez girando perfiles 2D (revolución), aplicando Loop Cut, Inset, Extrude y Bevel como en Blender.
                            </p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '190px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Retos Completados:</span>
                            <strong style={{ color: '#ec4899' }}>{completedCount}/15 ({progressPercent}%)</strong>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #ec4899 0%, #38bdf8 100%)', transition: 'width 0.4s ease' }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.9rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        style={{
                            background: activeTab === 'challenges' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'challenges' ? '#f8fafc' : '#94a3b8',
                            border: `1px solid ${activeTab === 'challenges' ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Target size={15} /> Retos de Modelado (15)
                    </button>
                    <button
                        onClick={() => setActiveTab('sandbox')}
                        style={{
                            background: activeTab === 'sandbox' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'sandbox' ? '#f8fafc' : '#94a3b8',
                            border: `1px solid ${activeTab === 'sandbox' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Sparkles size={15} /> Sandbox Libre de Piezas
                    </button>
                </div>
            </div>

            {/* Panel principal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem', alignItems: 'start' }}>
                {/* Columna 3D + controles */}
                <div>
                    {/* Selector de pieza */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {Object.entries(PIECE_META).map(([key, meta]) => (
                            <button
                                key={key}
                                onClick={() => setPiece(key)}
                                style={{
                                    flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', gap: '8px',
                                    background: piece === key ? `rgba(236, 72, 153, 0.2)` : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${piece === key ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '12px', padding: '9px 12px', cursor: 'pointer', color: '#f8fafc',
                                    fontSize: '0.86rem', fontWeight: piece === key ? 800 : 600
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span> {meta.name}
                            </button>
                        ))}
                    </div>

                    {/* Viewport */}
                    <div
                        ref={mountRef}
                        style={{ width: '100%', height: '460px', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid rgba(236, 72, 153, 0.35)', background: '#0b1220', position: 'relative', cursor: 'grab' }}
                    />

                    {/* Controles técnicos */}
                    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            {/* Slider segmentos */}
                            <div style={{ flex: 1, minWidth: '220px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <GitBranch size={13} style={{ color: '#38bdf8' }} /> Segmentos radiales (Loop Cut): <strong style={{ color: '#38bdf8' }}>{segments}</strong>
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>8–48</span>
                                </div>
                                <input
                                    type="range" min={8} max={48} value={segments}
                                    onChange={(e) => setSegments(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                                />
                            </div>
                            {/* Vistas */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {shadingBtn('Wire', 'wireframe')}
                                {shadingBtn('Solid', 'solid')}
                                {shadingBtn('Render', 'rendered')}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                            {togglePill('Sombreado Suave (Bevel)', smoothShading, setSmoothShading, '#34d399')}
                            {togglePill(PIECE_META[piece].extraLabel, extraOn, setExtraOn, '#f59e0b')}
                            {PIECE_META[piece].battlement && togglePill('Almenas 🏰 (Extrusión)', battlementOn, setBattlementOn, '#a855f7')}
                        </div>
                    </div>

                    {/* Telemetría V-E-F */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>
                                <Dot size={14} /> Vértices
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>{vef.vertices.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#4ade80', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>
                                <GitBranch size={14} /> Aristas
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>{vef.edges.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#ec4899', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>
                                <Layers size={14} /> Caras
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>{vef.faces.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Columna de retos / hoja de ruta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeTab === 'sandbox' ? (
                        <>
                            <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(30, 41, 59, 0.95) 100%)', border: '1.5px solid rgba(56, 189, 248, 0.45)', borderRadius: '16px', padding: '1.2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Sparkles size={18} style={{ color: '#38bdf8' }} />
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                                        Sandbox Libre de Piezas
                                    </span>
                                </div>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1.02rem', color: '#f8fafc', fontWeight: 800 }}>
                                    Experimenta sin límites 🎨
                                </h4>
                                <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6 }}>
                                    Combina libremente el selector de pieza, los segmentos radiales, el sombreado suave, el detalle extra y las almenas. Observa cómo cambia la telemetría V-E-F en tiempo real.
                                </p>
                                <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '3px solid #38bdf8', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#7dd3fc' }}>
                                    💡 <strong>Idea de reto personal:</strong> intenta reproducir el <strong>trencito de juguete 🚂</strong> (combina torre con almenas pequeñas) o un <strong>jarrón 🏺</strong> (peón con más detalle extra y segmentos altos).
                                </div>
                            </div>
                            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
                                    Hoja de Ruta · {PIECE_META[piece].name} (Retos)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {currentList.map((ch, idx) => (
                                        <div
                                            key={ch.id}
                                            onClick={() => { setActiveTab('challenges'); setCurrentChallengeIdx(idx); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px',
                                                background: completedChallenges[ch.id] ? 'rgba(34, 197, 94, 0.08)' : idx === currentChallengeIdx ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                                                border: `1px solid ${completedChallenges[ch.id] ? 'rgba(34, 197, 94, 0.25)' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.15s'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.76rem', color: completedChallenges[ch.id] ? '#4ade80' : '#94a3b8', fontWeight: 600 }}>
                                                {idx + 1}. {ch.title.split(':')[1] || ch.title}
                                            </span>
                                            {completedChallenges[ch.id] ? (
                                                <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                                            ) : (
                                                <ChevronRight size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {Object.entries(PIECE_META).map(([key, meta]) => (
                                            <button
                                                key={key}
                                                onClick={() => { setPiece(key); setCurrentChallengeIdx(0); }}
                                                style={{
                                                    background: piece === key ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                                                    color: '#cbd5e1', border: `1px solid ${piece === key ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '8px', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer'
                                                }}
                                            >
                                                {meta.icon} {meta.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                    <div style={{ background: '#1e293b', border: '1.5px solid rgba(236, 72, 153, 0.4)', borderRadius: '16px', padding: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase' }}>
                                Misión Activa · {PIECE_META[piece].name} ({currentChallengeIdx + 1}/{currentList.length})
                            </span>
                            {completedChallenges[currentChallenge.id] && (
                                <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={12} /> Completado
                                </span>
                            )}
                        </div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '1.02rem', color: '#f8fafc', fontWeight: 800 }}>
                            {currentChallenge.title}
                        </h4>
                        <p style={{ margin: '0 0 10px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.55 }}>
                            {currentChallenge.desc}
                        </p>
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #38bdf8', padding: '8px 10px', borderRadius: '4px', marginBottom: '10px' }}>
                            <strong style={{ color: '#38bdf8', fontSize: '0.78rem', display: 'block', marginBottom: '2px' }}>Objetivo:</strong>
                            <span style={{ color: '#f8fafc', fontSize: '0.8rem' }}>{currentChallenge.objective}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.74rem', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                            <HelpCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <span>{currentChallenge.hint}</span>
                        </div>
                        <button
                            onClick={handleValidate}
                            style={{
                                width: '100%', marginTop: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
                                border: '1px solid #38bdf8', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            Validar Reto {currentChallengeIdx + 1}
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                            <button
                                disabled={currentChallengeIdx === 0}
                                onClick={() => setCurrentChallengeIdx(prev => prev - 1)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)', color: currentChallengeIdx === 0 ? '#64748b' : '#cbd5e1',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', cursor: currentChallengeIdx === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Anterior
                            </button>
                            <button
                                disabled={currentChallengeIdx === currentList.length - 1}
                                onClick={() => setCurrentChallengeIdx(prev => prev + 1)}
                                style={{
                                    background: 'rgba(236, 72, 153, 0.2)', color: currentChallengeIdx === currentList.length - 1 ? '#64748b' : '#f8fafc',
                                    border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700,
                                    cursor: currentChallengeIdx === currentList.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                Siguiente <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Hoja de ruta por pieza */}
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
                            Hoja de Ruta · {PIECE_META[piece].name}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {currentList.map((ch, idx) => (
                                <div
                                    key={ch.id}
                                    onClick={() => setCurrentChallengeIdx(idx)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px',
                                        background: idx === currentChallengeIdx ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                                        border: `1px solid ${idx === currentChallengeIdx ? 'rgba(236, 72, 153, 0.4)' : 'transparent'}`,
                                        cursor: 'pointer', transition: 'all 0.15s'
                                    }}
                                >
                                    <span style={{ fontSize: '0.76rem', color: idx === currentChallengeIdx ? '#f8fafc' : '#94a3b8', fontWeight: idx === currentChallengeIdx ? 700 : 500 }}>
                                        {idx + 1}. {ch.title.split(':')[1] || ch.title}
                                    </span>
                                    {completedChallenges[ch.id] ? (
                                        <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Switch de pieza en sandbox */}
                        <div style={{ marginTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {Object.entries(PIECE_META).map(([key, meta]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setPiece(key); setCurrentChallengeIdx(0); }}
                                        style={{
                                            background: piece === key ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                                            color: '#cbd5e1', border: `1px solid ${piece === key ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '8px', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer'
                                        }}
                                    >
                                        {meta.icon} {meta.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}