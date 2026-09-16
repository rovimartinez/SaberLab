import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
    Maximize2,
    RotateCcw,
    Eye,
    Grid,
    Box as BoxIcon,
    Compass,
    Move,
    RotateCw,
    Maximize,
    Sun,
    Layers,
    Sliders
} from 'lucide-react';

/**
 * BlenderViewport
 * Viewport 3D interactivo en WebGL (Three.js) optimizado para React 19.
 * Emula la navegación, sombreado y atajos de teclado de Blender 4.x:
 * - Atajos: G (Grab), R (Rotate), S (Scale), X/Y/Z (Restricción de eje)
 * - Navegación: Orbit (Drag), Pan (Shift + Drag / Botón derecho), Zoom (Rueda / Pinch)
 * - Vistas: Perspectiva vs Ortográfica, Frontal, Lateral, Superior
 * - Modos de Sombreado: Wireframe, Solid, Material/Luz
 */
export default function BlenderViewport({
    initialPrimitive = 'cube',
    showControls = true,
    showTransformGizmo = true,
    height = '480px',
    onTransformChange = null
}) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const orthoCameraRef = useRef(null);
    const rendererRef = useRef(null);
    const meshRef = useRef(null);
    const gridRef = useRef(null);
    const axesRef = useRef(null);

    // Estados de interfaz y visualización
    const [primitive, setPrimitive] = useState(initialPrimitive);
    const [shadingMode, setShadingMode] = useState('solid'); // 'wireframe' | 'solid' | 'rendered'
    const [isOrtho, setIsOrtho] = useState(false);
    const [transformMode, setTransformMode] = useState('none'); // 'none' | 'translate' | 'rotate' | 'scale'
    const [axisConstraint, setAxisConstraint] = useState(null); // null | 'x' | 'y' | 'z'

    // Telemetría del objeto activo
    const [transformData, setTransformData] = useState({
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    });

    // Estado de cámara orbital
    const cameraState = useRef({
        theta: Math.PI / 4, // Azimuth
        phi: Math.PI / 4,   // Elevación
        radius: 6,
        target: new THREE.Vector3(0, 0, 0),
        isDragging: false,
        isPanning: false,
        lastMouseX: 0,
        lastMouseY: 0
    });

    // Actualizar posición de la cámara según coordenadas esféricas
    const updateCameraPosition = useCallback(() => {
        const { theta, phi, radius, target } = cameraState.current;
        const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
        const y = target.y + radius * Math.cos(phi);
        const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

        if (cameraRef.current) {
            cameraRef.current.position.set(x, y, z);
            cameraRef.current.lookAt(target);
        }

        if (orthoCameraRef.current) {
            const aspect = mountRef.current ? mountRef.current.clientWidth / mountRef.current.clientHeight : 1;
            const frustumSize = radius * 1.4;
            orthoCameraRef.current.left = -frustumSize * aspect / 2;
            orthoCameraRef.current.right = frustumSize * aspect / 2;
            orthoCameraRef.current.top = frustumSize / 2;
            orthoCameraRef.current.bottom = -frustumSize / 2;
            orthoCameraRef.current.updateProjectionMatrix();
            orthoCameraRef.current.position.set(x, y, z);
            orthoCameraRef.current.lookAt(target);
        }
    }, []);

    // Crear la malla según la primitiva seleccionada
    const buildPrimitiveMesh = useCallback((type, mode) => {
        let geometry;
        switch (type) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 16);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(1, 2, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.8, 0.3, 16, 48);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(2.5, 2.5);
                geometry.rotateX(-Math.PI / 2);
                break;
            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
                break;
        }

        let material;
        if (mode === 'wireframe') {
            material = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                wireframe: true
            });
        } else if (mode === 'solid') {
            // Estilo MatCap / Sólido de Blender
            material = new THREE.MeshStandardMaterial({
                color: 0x94a3b8,
                roughness: 0.45,
                metalness: 0.15,
                flatShading: false
            });
        } else {
            // Modo Rendered / PBR
            material = new THREE.MeshStandardMaterial({
                color: 0xec4899,
                roughness: 0.25,
                metalness: 0.4
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Añadir bordes resaltados tipo Blender
        if (mode !== 'wireframe') {
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 1.5 }));
            mesh.add(line);
        }

        return mesh;
    }, []);

    // Inicializar la escena de Three.js
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const heightPx = container.clientHeight || 480;

        // 1. Escena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a); // Fondo oscuro estilo SaberLab/Blender
        sceneRef.current = scene;

        // 2. Cámaras
        const aspect = width / heightPx;
        const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        cameraRef.current = camera;

        const frustumSize = 8;
        const orthoCamera = new THREE.OrthographicCamera(
            -frustumSize * aspect / 2, frustumSize * aspect / 2,
            frustumSize / 2, -frustumSize / 2,
            0.1, 100
        );
        orthoCameraRef.current = orthoCamera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, heightPx);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        // 4. Luces (Estudio de 3 puntos)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(5, 8, 4);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
        fillLight.position.set(-5, 3, -4);
        scene.add(fillLight);

        // 5. Rejilla de piso (Floor Grid de Blender)
        const grid = new THREE.GridHelper(12, 24, 0x334155, 0x1e293b);
        grid.position.y = -0.8;
        scene.add(grid);
        gridRef.current = grid;

        // 6. Ejes de coordenadas estándar de Blender 4.x (Convención Z-Up estricta)
        // Rojo = X (Ancho / Horizontal)
        // Verde = Y (Profundidad / Plano del piso)
        // Azul = Z (Altura / Vertical hacia ARRIBA)
        const axesGroup = new THREE.Group();
        axesGroup.position.set(0, -0.79, 0);

        // Helper para crear sprites de texto legibles tipo Blender
        const createAxisBadge = (text, colorHex) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = colorHex;
            ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.65, 0.65, 1);
            return sprite;
        };

        // --- Eje X: Rojo (Ancho / Horizontal) ---
        const xMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
        const xGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-6, 0.002, 0),
            new THREE.Vector3(6, 0.002, 0)
        ]);
        axesGroup.add(new THREE.Line(xGeo, xMat));

        const xCone = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.35, 16),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        xCone.position.set(3.8, 0.002, 0);
        xCone.rotation.z = -Math.PI / 2;
        axesGroup.add(xCone);

        const xBadge = createAxisBadge('+X', '#ef4444');
        xBadge.position.set(4.4, 0.25, 0);
        axesGroup.add(xBadge);

        // --- Eje Y: Verde (Profundidad / Adelante-Atrás en el piso de Blender) ---
        const yMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 });
        const yGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.002, -6),
            new THREE.Vector3(0, 0.002, 6)
        ]);
        axesGroup.add(new THREE.Line(yGeo, yMat));

        const yCone = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.35, 16),
            new THREE.MeshBasicMaterial({ color: 0x22c55e })
        );
        yCone.position.set(0, 0.002, 3.8);
        yCone.rotation.x = Math.PI / 2;
        axesGroup.add(yCone);

        const yBadge = createAxisBadge('+Y', '#22c55e');
        yBadge.position.set(0, 0.25, 4.4);
        axesGroup.add(yBadge);

        // --- Eje Z: Azul (Altura / Convención Z-Up -> ¡APUNTA DIRECTAMENTE HACIA ARRIBA!) ---
        const zMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2.5 });
        const zGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.002, 0),
            new THREE.Vector3(0, 4.2, 0)
        ]);
        axesGroup.add(new THREE.Line(zGeo, zMat));

        const zCone = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.35, 16),
            new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
        );
        zCone.position.set(0, 4.2, 0);
        axesGroup.add(zCone);

        const zBadge = createAxisBadge('+Z', '#3b82f6');
        zBadge.position.set(0, 4.7, 0);
        axesGroup.add(zBadge);

        scene.add(axesGroup);
        axesRef.current = axesGroup;

        // 7. Malla inicial
        const mesh = buildPrimitiveMesh(primitive, shadingMode);
        scene.add(mesh);
        meshRef.current = mesh;

        updateCameraPosition();

        // 8. Bucle de animación
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const activeCam = isOrtho ? orthoCameraRef.current : cameraRef.current;
            if (renderer && scene && activeCam) {
                renderer.render(scene, activeCam);
            }
        };
        animate();

        // Manejo de redimensionamiento
        const handleResize = () => {
            if (!container || !rendererRef.current) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            const asp = w / h;

            if (cameraRef.current) {
                cameraRef.current.aspect = asp;
                cameraRef.current.updateProjectionMatrix();
            }

            if (orthoCameraRef.current) {
                const fs = cameraState.current.radius * 1.4;
                orthoCameraRef.current.left = -fs * asp / 2;
                orthoCameraRef.current.right = fs * asp / 2;
                orthoCameraRef.current.top = fs / 2;
                orthoCameraRef.current.bottom = -fs / 2;
                orthoCameraRef.current.updateProjectionMatrix();
            }

            rendererRef.current.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // 9. Manejo de Zoom con rueda del ratón (Passive: false para EVITAR scroll en la página)
        const handleNativeWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY * 0.005;
            cameraState.current.radius = Math.max(1.5, Math.min(25, cameraState.current.radius + delta));
            updateCameraPosition();
        };

        container.addEventListener('wheel', handleNativeWheel, { passive: false });

        // Cleanup al desmontar
        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('wheel', handleNativeWheel);
            cancelAnimationFrame(animationFrameId);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Actualizar la primitiva o el modo de sombreado cuando cambien
    useEffect(() => {
        if (!sceneRef.current) return;
        if (meshRef.current) {
            sceneRef.current.remove(meshRef.current);
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            if (meshRef.current.material) {
                if (Array.isArray(meshRef.current.material)) {
                    meshRef.current.material.forEach(m => m.dispose());
                } else {
                    meshRef.current.material.dispose();
                }
            }
        }
        const newMesh = buildPrimitiveMesh(primitive, shadingMode);
        // En Blender: X = Ancho, Y = Profundidad, Z = Altura (Z-Up)
        // Mapeo a Three.js: X -> X, Z (Altura) -> Y, Y (Profundidad) -> Z
        newMesh.position.set(transformData.pos.x, transformData.pos.z, transformData.pos.y);
        newMesh.rotation.set(
            THREE.MathUtils.degToRad(transformData.rot.x),
            THREE.MathUtils.degToRad(transformData.rot.z),
            THREE.MathUtils.degToRad(transformData.rot.y)
        );
        newMesh.scale.set(transformData.scale.x, transformData.scale.z, transformData.scale.y);

        sceneRef.current.add(newMesh);
        meshRef.current = newMesh;
    }, [primitive, shadingMode, buildPrimitiveMesh]);

    // Gestión de eventos del ratón para rotación orbital, pan y zoom
    const handleMouseDown = (e) => {
        e.preventDefault();
        const isRightButton = e.button === 2;
        const isMiddleButton = e.button === 1;
        const hasShift = e.shiftKey;

        cameraState.current.isPanning = isRightButton || (hasShift && (e.button === 0 || isMiddleButton));
        cameraState.current.isDragging = !cameraState.current.isPanning && (e.button === 0 || isMiddleButton);
        cameraState.current.lastMouseX = e.clientX;
        cameraState.current.lastMouseY = e.clientY;
    };

    const handleMouseMove = (e) => {
        const { isDragging, isPanning, lastMouseX, lastMouseY, radius } = cameraState.current;
        if (!isDragging && !isPanning) return;

        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        cameraState.current.lastMouseX = e.clientX;
        cameraState.current.lastMouseY = e.clientY;

        if (isDragging) {
            // Órbita
            cameraState.current.theta -= deltaX * 0.008;
            cameraState.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cameraState.current.phi - deltaY * 0.008));
            updateCameraPosition();
        } else if (isPanning) {
            // Desplazamiento lateral (Pan)
            const factor = (radius / 500);
            cameraState.current.target.x -= deltaX * factor * Math.cos(cameraState.current.theta);
            cameraState.current.target.z += deltaX * factor * Math.sin(cameraState.current.theta);
            cameraState.current.target.y += deltaY * factor;
            updateCameraPosition();
        }
    };

    const handleMouseUp = () => {
        cameraState.current.isDragging = false;
        cameraState.current.isPanning = false;
    };

    // Vistas fijas ortográficas de Blender (Frontal, Lateral, Superior)
    const setViewAngle = (view) => {
        switch (view) {
            case 'front': // Numpad 1
                cameraState.current.theta = 0;
                cameraState.current.phi = Math.PI / 2;
                break;
            case 'right': // Numpad 3
                cameraState.current.theta = Math.PI / 2;
                cameraState.current.phi = Math.PI / 2;
                break;
            case 'top': // Numpad 7
                cameraState.current.theta = 0;
                cameraState.current.phi = 0.001;
                break;
            case 'iso': // Perspectiva isométrica estándar
            default:
                cameraState.current.theta = Math.PI / 4;
                cameraState.current.phi = Math.PI / 4;
                break;
        }
        updateCameraPosition();
    };

    // Resetear transformaciones del objeto (Alt + G, Alt + R, Alt + S)
    const resetTransform = () => {
        const resetData = {
            pos: { x: 0, y: 0, z: 0 },
            rot: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };
        setTransformData(resetData);
        if (meshRef.current) {
            meshRef.current.position.set(0, 0, 0);
            meshRef.current.rotation.set(0, 0, 0);
            meshRef.current.scale.set(1, 1, 1);
        }
        if (onTransformChange) onTransformChange(resetData);
    };

    // Aplicar transformación incremental manual
    const applyTransform = (type, axis, value) => {
        setTransformData(prev => {
            const next = { ...prev };
            if (type === 'pos') next.pos = { ...next.pos, [axis]: parseFloat((next.pos[axis] + value).toFixed(2)) };
            if (type === 'rot') next.rot = { ...next.rot, [axis]: (next.rot[axis] + value) % 360 };
            if (type === 'scale') next.scale = { ...next.scale, [axis]: Math.max(0.1, parseFloat((next.scale[axis] + value).toFixed(2))) };

            if (meshRef.current) {
                // Blender (X=Ancho, Y=Profundidad, Z=Altura) -> Three.js (X=pos.x, Y=pos.z, Z=pos.y)
                meshRef.current.position.set(next.pos.x, next.pos.z, next.pos.y);
                meshRef.current.rotation.set(
                    THREE.MathUtils.degToRad(next.rot.x),
                    THREE.MathUtils.degToRad(next.rot.z),
                    THREE.MathUtils.degToRad(next.rot.y)
                );
                meshRef.current.scale.set(next.scale.x, next.scale.z, next.scale.y);
            }
            if (onTransformChange) onTransformChange(next);
            return next;
        });
    };

    // Atajos de teclado estilo Blender dentro del viewport
    const handleKeyDown = (e) => {
        const key = e.key.toUpperCase();
        if (key === 'G') {
            setTransformMode(prev => prev === 'translate' ? 'none' : 'translate');
        } else if (key === 'R') {
            setTransformMode(prev => prev === 'rotate' ? 'none' : 'rotate');
        } else if (key === 'S') {
            setTransformMode(prev => prev === 'scale' ? 'none' : 'scale');
        } else if (key === 'X') {
            setAxisConstraint(prev => prev === 'x' ? null : 'x');
        } else if (key === 'Y') {
            setAxisConstraint(prev => prev === 'y' ? null : 'y');
        } else if (key === 'Z') {
            setAxisConstraint(prev => prev === 'z' ? null : 'z');
        } else if (key === 'ESCAPE') {
            setTransformMode('none');
            setAxisConstraint(null);
        } else if (key === '1') {
            setViewAngle('front');
        } else if (key === '3') {
            setViewAngle('right');
        } else if (key === '7') {
            setViewAngle('top');
        } else if (key === '5') {
            setIsOrtho(prev => !prev);
        }
    };

    return (
        <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={{
                position: 'relative',
                width: '100%',
                height,
                background: '#090d16',
                borderRadius: '16px',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                overflow: 'hidden',
                outline: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                touchAction: 'none',
                overscrollBehavior: 'contain'
            }}
        >
            {/* Header / Barra de herramientas superior estilo Blender */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '8px 12px',
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    flexWrap: 'wrap',
                    gap: '8px'
                }}
            >
                {/* Selector de Primitivas */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Blender 3D Viewport
                    </span>
                    <div style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
                    <select
                        value={primitive}
                        onChange={(e) => setPrimitive(e.target.value)}
                        style={{
                            background: '#1e293b',
                            color: '#f8fafc',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <option value="cube">Cubo (Default)</option>
                        <option value="sphere">Esfera UV</option>
                        <option value="cylinder">Cilindro</option>
                        <option value="cone">Cono</option>
                        <option value="torus">Toroide (Dona)</option>
                        <option value="plane">Plano</option>
                    </select>
                </div>

                {/* Vistas Ortográficas / Perspectiva */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        title="Perspectiva / Ortográfica (Tecla 5)"
                        onClick={() => setIsOrtho(!isOrtho)}
                        style={{
                            background: isOrtho ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: isOrtho ? '#ec4899' : '#94a3b8',
                            border: `1px solid ${isOrtho ? '#ec4899' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Eye size={13} /> {isOrtho ? 'Orto' : 'Persp'}
                    </button>
                    <button
                        title="Vista Frontal (Tecla 1)"
                        onClick={() => setViewAngle('front')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                        }}
                    >
                        Frente
                    </button>
                    <button
                        title="Vista Superior (Tecla 7)"
                        onClick={() => setViewAngle('top')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                        }}
                    >
                        Arriba
                    </button>
                    <button
                        title="Vista Isométrica Libre"
                        onClick={() => setViewAngle('iso')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                        }}
                    >
                        Órbita
                    </button>
                </div>

                {/* Modos de Sombreado (Wireframe, Solid, Rendered) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        title="Wireframe (Alambre)"
                        onClick={() => setShadingMode('wireframe')}
                        style={{
                            background: shadingMode === 'wireframe' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: shadingMode === 'wireframe' ? '#38bdf8' : '#94a3b8',
                            border: `1px solid ${shadingMode === 'wireframe' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Grid size={13} /> Wire
                    </button>
                    <button
                        title="Solid (Sólido de Trabajo)"
                        onClick={() => setShadingMode('solid')}
                        style={{
                            background: shadingMode === 'solid' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: shadingMode === 'solid' ? '#f8fafc' : '#94a3b8',
                            border: `1px solid ${shadingMode === 'solid' ? '#f8fafc' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <BoxIcon size={13} /> Solid
                    </button>
                    <button
                        title="Rendered (Material / Shading PBR)"
                        onClick={() => setShadingMode('rendered')}
                        style={{
                            background: shadingMode === 'rendered' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: shadingMode === 'rendered' ? '#ec4899' : '#94a3b8',
                            border: `1px solid ${shadingMode === 'rendered' ? '#ec4899' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Sun size={13} /> Render
                    </button>
                </div>
            </div>

            {/* Canvas WebGL interactivo */}
            <div
                ref={mountRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: cameraState.current.isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none'
                }}
            />

            {/* Gizmo de Transformación e información de atajos (Inferior Izquierda) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    background: 'rgba(15, 23, 42, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    maxWidth: '320px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>Atajos de Transformación:</span>
                    <button
                        onClick={resetTransform}
                        title="Restablecer posición, rotación y escala a 0"
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                        }}
                    >
                        <RotateCcw size={10} /> Reset
                    </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.7rem' }}>
                    <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <strong style={{ color: '#ec4899' }}>G:</strong> Grab/Mover
                    </span>
                    <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <strong style={{ color: '#ec4899' }}>R:</strong> Rotar
                    </span>
                    <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <strong style={{ color: '#ec4899' }}>S:</strong> Escalar
                    </span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.68rem', color: '#94a3b8' }}>
                    💡 <em>Haz clic aquí y presiona <strong style={{ color: '#38bdf8' }}>G, R o S</strong> en tu teclado, o usa los controles a la derecha.</em>
                </div>
            </div>

            {/* Panel de Telemetría Numérica X, Y, Z (Inferior Derecha) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    background: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.72rem',
                    color: '#f8fafc',
                    zIndex: 10,
                    minWidth: '210px'
                }}
            >
                <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Coordenadas del Objeto:</span>
                    <span style={{ color: isOrtho ? '#ec4899' : '#38bdf8' }}>{isOrtho ? 'Ortográfica' : 'Perspectiva'}</span>
                </div>

                {/* Posición X, Y, Z */}
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr', gap: '4px', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Pos (G):</span>
                    <button onClick={() => applyTransform('pos', 'x', 0.5)} style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        X: {transformData.pos.x}
                    </button>
                    <button onClick={() => applyTransform('pos', 'y', 0.5)} style={{ background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        Y: {transformData.pos.y}
                    </button>
                    <button onClick={() => applyTransform('pos', 'z', 0.5)} style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        Z: {transformData.pos.z}
                    </button>
                </div>

                {/* Rotación X, Y, Z */}
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr', gap: '4px', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Rot (R):</span>
                    <button onClick={() => applyTransform('rot', 'x', 45)} style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        {transformData.rot.x}°
                    </button>
                    <button onClick={() => applyTransform('rot', 'y', 45)} style={{ background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        {transformData.rot.y}°
                    </button>
                    <button onClick={() => applyTransform('rot', 'z', 45)} style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        {transformData.rot.z}°
                    </button>
                </div>

                {/* Escala X, Y, Z */}
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr', gap: '4px', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Scl (S):</span>
                    <button onClick={() => applyTransform('scale', 'x', 0.2)} style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        {transformData.scale.x}×
                    </button>
                    <button onClick={() => applyTransform('scale', 'y', 0.2)} style={{ background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        {transformData.scale.y}×
                    </button>
                    <button onClick={() => applyTransform('scale', 'z', 0.2)} style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa', border: 'none', borderRadius: '3px', padding: '1px 2px', cursor: 'pointer' }}>
                        {transformData.scale.z}×
                    </button>
                </div>
            </div>
        </div>
    );
}
