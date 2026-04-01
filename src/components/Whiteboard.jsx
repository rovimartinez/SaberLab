import { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, PenLine, Palette, Download, X, Wand2, Type, Minus, Maximize2, Minimize2, Ghost, Square, Circle, Triangle, Shapes, ArrowRight, Diamond, AppWindow, RotateCcw, MousePointer2 } from 'lucide-react';
import './Whiteboard.css';

const colors = ['#ffffff', '#a855f7', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

const getPerpendicularDistance = (point, lineStart, lineEnd) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.hypot(dx, dy);
    if (mag > 0.0) {
        return Math.abs(dx * (point.y - lineStart.y) - dy * (point.x - lineStart.x)) / mag;
    }
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
};

const RenderShapeSVG = ({ shape }) => {
    let w = Math.max(Math.abs(shape.width), 1);
    let h = Math.max(Math.abs(shape.height), 1);

    let x1 = shape.width < 0 ? w : 0;
    let y1 = shape.height < 0 ? h : 0;
    let x2 = shape.width < 0 ? 0 : w;
    let y2 = shape.height < 0 ? 0 : h;

    return (
        <svg fill="transparent" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <g stroke={shape.color} strokeWidth={shape.brushSize} fill="none" strokeLinecap="round" strokeLinejoin="round">
                {shape.type === 'rect' && <rect x={0} y={0} width={w} height={h} />}
                {shape.type === 'roundRect' && <rect x={0} y={0} width={w} height={h} rx={Math.min(w / 2, h / 2, 16)} />}
                {shape.type === 'circle' && <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} />}
                {shape.type === 'triangle' && <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} />}
                {shape.type === 'diamond' && <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} />}
                {shape.type === 'line' && <line x1={x1} y1={y1} x2={x2} y2={y2} />}
                {shape.type === 'arrow' && (() => {
                    const headlen = 20;
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    return (
                        <>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} />
                            <polyline points={`${x2 - headlen * Math.cos(angle - Math.PI / 6)},${y2 - headlen * Math.sin(angle - Math.PI / 6)} ${x2},${y2} ${x2 - headlen * Math.cos(angle + Math.PI / 6)},${y2 - headlen * Math.sin(angle + Math.PI / 6)}`} />
                        </>
                    );
                })()}
                {shape.type === 'path' && shape.points && (
                    <svg
                        viewBox={`0 0 ${shape.originalWidth || shape.width} ${shape.originalHeight || shape.height}`}
                        width="100%"
                        height="100%"
                        preserveAspectRatio="none"
                        style={{ overflow: 'visible' }}
                    >
                        <polyline points={shape.points.map(p => `${p.x},${p.y}`).join(' ')} />
                    </svg>
                )}
            </g>
        </svg>
    );
};

const simplifyDP = (pts, epsilon) => {
    if (pts.length <= 2) return pts;
    let dmax = 0;
    let index = 0;
    for (let i = 1; i < pts.length - 1; i++) {
        let d = getPerpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
        if (d > dmax) {
            index = i;
            dmax = d;
        }
    }
    if (dmax > epsilon) {
        let rec1 = simplifyDP(pts.slice(0, index + 1), epsilon);
        let rec2 = simplifyDP(pts.slice(index), epsilon);
        return rec1.slice(0, -1).concat(rec2);
    } else {
        return [pts[0], pts[pts.length - 1]];
    }
};

const Whiteboard = ({ onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, text: '' });
    const inputRef = useRef(null);

    // Estados del modelo Vector/Raster (SVG Overlays)
    const [shapes, setShapes] = useState([]);
    const [tempShape, setTempShape] = useState(null);
    const [selectedShapeId, setSelectedShapeId] = useState(null);
    const [dragState, setDragState] = useState(null);

    const [autoShape, setAutoShape] = useState(false); // Varita mágica (formas)
    const magicText = true; // Texto Mágico (suavizado) siempre activo
    const [isMaximized, setIsMaximized] = useState(false); // Default false para mejor UX
    const [isMinimized, setIsMinimized] = useState(false);
    const [isInvisible, setIsInvisible] = useState(false); // Transparente
    const [insertShape, setInsertShape] = useState(null); // 'rect', 'circle', 'triangle'
    const [activeMenu, setActiveMenu] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    // 'shapes', 'colors', 'size'

    const subMenuStyle = {
        position: 'absolute',
        left: 'calc(100% + 14px)',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(15px)',
        padding: '10px 14px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '3px 10px 30px rgba(0,0,0,0.6)',
        zIndex: 1000,
        width: 'max-content',
        alignItems: 'center'
    };

    const customCursorRef = useRef(null);

    // Referencias para Auto-Forma y Suavizado
    const currentStroke = useRef([]);
    const savedCanvasState = useRef(null);

    // Arrastro y posición
    const [position, setPosition] = useState({ x: Math.max(0, window.innerWidth / 2 - 430), y: Math.max(0, window.innerHeight / 2 - 300) });
    const [isDraggingHeader, setIsDraggingHeader] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, isDragging: false });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!dragRef.current.isDragging) return;
            setPosition({
                x: dragRef.current.initialX + (e.clientX - dragRef.current.startX),
                y: dragRef.current.initialY + (e.clientY - dragRef.current.startY)
            });
        };

        const handleMouseUp = () => {
            if (dragRef.current.isDragging) {
                dragRef.current.isDragging = false;
                setIsDraggingHeader(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleHeaderMouseDown = (e) => {
        if (isMaximized) return;
        if (e.target.closest('button') || e.target.closest('input')) return;
        e.preventDefault();
        setIsDraggingHeader(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y,
            isDragging: true
        };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        const resizeObserver = new ResizeObserver(() => {
            const ctx = canvas.getContext('2d');
            let tempCanvas = null;

            if (canvas.width > 0 && canvas.height > 0) {
                tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
            }

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (tempCanvas) {
                ctx.drawImage(tempCanvas, 0, 0);
            }

            ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
            ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color;
            ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [color, brushSize, isEraser]);

    // Set brush context before drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
        ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color;
        ctx.lineWidth = isEraser ? brushSize * 3 : brushSize; // Make eraser bigger

        // Sincronizar estilo si hay una figura seleccionada
        if (selectedShapeId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShapes(prev => prev.map(s => s.id === selectedShapeId ? { ...s, color, brushSize } : s));
        }
    }, [color, brushSize, isEraser, selectedShapeId]);

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (!dragState) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            setShapes(prev => prev.map(shape => {
                if (shape.id !== dragState.initialShape.id) return shape;
                let newShape = { ...shape };

                if (dragState.handle === 'center') {
                    newShape.x = dragState.initialShape.x + dx;
                    newShape.y = dragState.initialShape.y + dy;
                } else if (dragState.handle === 'rotate') {
                    const currentAngle = Math.atan2(e.clientY - dragState.cy, e.clientX - dragState.cx);
                    let angleDiff = (currentAngle - dragState.startAngle) * 180 / Math.PI;
                    // Normalizar diferencia para evitar saltos (shortest path)
                    while (angleDiff > 180) angleDiff -= 360;
                    while (angleDiff < -180) angleDiff += 360;
                    newShape.rotation = (dragState.initialShape.rotation || 0) + angleDiff;
                } else if (dragState.handle === 'se') {
                    newShape.width = dragState.initialShape.width + dx;
                    newShape.height = dragState.initialShape.height + dy;
                } else if (dragState.handle === 'nw') {
                    newShape.x = dragState.initialShape.x + dx;
                    newShape.y = dragState.initialShape.y + dy;
                    newShape.width = dragState.initialShape.width - dx;
                    newShape.height = dragState.initialShape.height - dy;
                } else if (dragState.handle === 'ne') {
                    newShape.y = dragState.initialShape.y + dy;
                    newShape.width = dragState.initialShape.width + dx;
                    newShape.height = dragState.initialShape.height - dy;
                } else if (dragState.handle === 'sw') {
                    newShape.x = dragState.initialShape.x + dx;
                    newShape.width = dragState.initialShape.width - dx;
                    newShape.height = dragState.initialShape.height + dy;
                } else if (dragState.handle === 'n') {
                    newShape.y = dragState.initialShape.y + dy;
                    newShape.height = dragState.initialShape.height - dy;
                } else if (dragState.handle === 's') {
                    newShape.height = dragState.initialShape.height + dy;
                } else if (dragState.handle === 'w') {
                    newShape.x = dragState.initialShape.x + dx;
                    newShape.width = dragState.initialShape.width - dx;
                } else if (dragState.handle === 'e') {
                    newShape.width = dragState.initialShape.width + dx;
                }
                return newShape;
            }));
        };

        const handleGlobalMouseUp = () => setDragState(null);

        if (dragState) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [dragState]);

    const intersectsEraser = (shape, x, y, radius) => {
        const minX = Math.min(shape.x, shape.x + shape.width) - radius;
        const maxX = Math.max(shape.x, shape.x + shape.width) + radius;
        const minY = Math.min(shape.y, shape.y + shape.height) - radius;
        const maxY = Math.max(shape.y, shape.y + shape.height) + radius;

        if (shape.type === 'path' && shape.points?.length) {
            return shape.points.some((point) => {
                const px = shape.x + point.x;
                const py = shape.y + point.y;
                return Math.hypot(px - x, py - y) <= radius;
            });
        }

        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    };

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        if (isSelectMode) {
            setSelectedShapeId(null);
            return;
        }

        setSelectedShapeId(null);

        if (isTextMode) {
            setTextInput({ visible: true, x: offsetX, y: offsetY, text: '' });
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        const ctx = canvasRef.current.getContext('2d');

        if (insertShape) {
            setTempShape({
                type: insertShape,
                x: offsetX,
                y: offsetY,
                width: 0,
                height: 0,
                color,
                brushSize
            });
            setIsDrawing(true);
            return;
        }

        if (!isEraser) {
            currentStroke.current = [{ x: offsetX, y: offsetY }];
            savedCanvasState.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');

        if (insertShape && tempShape) {
            setTempShape({
                ...tempShape,
                width: offsetX - tempShape.x,
                height: offsetY - tempShape.y
            });
            return;
        }

        if (!isEraser && currentStroke.current) {
            currentStroke.current.push({ x: offsetX, y: offsetY });

            if (magicText) {
                // Redibujar trazo suavizado con curvas cuadráticas
                ctx.putImageData(savedCanvasState.current, 0, 0);
                ctx.beginPath();
                const pts = currentStroke.current;
                ctx.moveTo(pts[0].x, pts[0].y);

                if (pts.length < 3) {
                    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
                } else {
                    for (let i = 1; i < pts.length - 2; i++) {
                        const xc = (pts[i].x + pts[i + 1].x) / 2;
                        const yc = (pts[i].y + pts[i + 1].y) / 2;
                        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
                    }
                    ctx.quadraticCurveTo(
                        pts[pts.length - 2].x, pts[pts.length - 2].y,
                        pts[pts.length - 1].x, pts[pts.length - 1].y
                    );
                }
                ctx.stroke();
                return; // Evita el lineTo normal
            }
        }

        if (isEraser) {
            const eraseRadius = Math.max(10, brushSize * 2.2);
            setShapes((prev) => prev.filter((shape) => !intersectsEraser(shape, offsetX, offsetY, eraseRadius)));
        }

        // Dibujo normal sin suavizado
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
        const commitRecognizedShape = (shape) => {
            ctx.putImageData(savedCanvasState.current, 0, 0);
            setShapes(prev => [...prev, { id: Date.now(), rotation: 0, color, brushSize, ...shape }]);
        };

        if (insertShape && tempShape) {
            if (Math.abs(tempShape.width) > 5 || Math.abs(tempShape.height) > 5) {
                const newShape = { ...tempShape, id: Date.now(), rotation: 0 };
                setShapes(prev => [...prev, newShape]);
            }
            setTempShape(null);
            return;
        }

        if (autoShape && !isEraser && Array.isArray(currentStroke.current) && currentStroke.current.length > 10) {
            const points = currentStroke.current;
            const start = points[0];
            const end = points[points.length - 1];

            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });

            const width = maxX - minX;
            const height = maxY - minY;
            const isClosed = Math.hypot(start.x - end.x, start.y - end.y) < 60;

            let recognized = false;

            if (isClosed && width > 20 && height > 20) {
                const centerX = minX + width / 2;
                const centerY = minY + height / 2;
                const radius = (width + height) / 4;

                let circleError = 0;
                let rectError = 0;
                let simplified = [];

                points.forEach(p => {
                    circleError += Math.abs(Math.hypot(p.x - centerX, p.y - centerY) - radius);
                    rectError += Math.min(
                        Math.abs(p.x - minX), Math.abs(p.x - maxX),
                        Math.abs(p.y - minY), Math.abs(p.y - maxY)
                    );
                });

                circleError /= points.length;
                rectError /= points.length;

                for (let factor = 0.06; factor <= 0.25; factor += 0.02) {
                    const epsilon = Math.max(width, height) * factor;
                    simplified = simplifyDP(points, epsilon);
                    if (simplified.length >= 4 && simplified.length <= 6) {
                        break;
                    }
                }

                const rawPolygon = isClosed ? simplified.slice(0, -1) : simplified;
                const polygonVertices = rawPolygon.filter((point, index, arr) => {
                    if (index === 0) return true;
                    const prev = arr[index - 1];
                    return Math.hypot(point.x - prev.x, point.y - prev.y) > Math.max(width, height) * 0.12;
                });
                const polygonPoints = polygonVertices.length;
                const topVertices = polygonVertices.filter(p => p.y <= minY + height * 0.38).length;
                const bottomVertices = polygonVertices.filter(p => p.y >= minY + height * 0.55).length;
                const looksLikeTriangle =
                    polygonPoints >= 3 &&
                    polygonPoints <= 5 &&
                    topVertices >= 1 &&
                    topVertices <= 2 &&
                    bottomVertices >= 2 &&
                    rectError >= Math.min(width, height) * 0.08;

                if (circleError < radius * 0.25 && circleError < rectError) {
                    commitRecognizedShape({
                        type: 'circle',
                        x: centerX - radius,
                        y: centerY - radius,
                        width: radius * 2,
                        height: radius * 2
                    });
                    recognized = true;
                } else if (looksLikeTriangle) {
                    commitRecognizedShape({ type: 'triangle', x: minX, y: minY, width, height });
                    recognized = true;
                } else if (polygonPoints === 4 && rectError >= Math.min(width, height) * 0.18) {
                    commitRecognizedShape({ type: 'diamond', x: minX, y: minY, width, height });
                    recognized = true;
                } else if (rectError < Math.min(width, height) * 0.18) {
                    commitRecognizedShape({
                        type: 'rect',
                        x: minX,
                        y: minY,
                        width,
                        height
                    });
                    recognized = true;
                }

                if (!recognized) {
                    // Intento de polígono generico (Triángulo, rombo, etc)
                    let simplified = [];
                    // Incrementamos epsilon iterativamente para encontrar la forma más simple posible (3-6 lados)
                    for (let factor = 0.06; factor <= 0.25; factor += 0.02) {
                        const epsilon = Math.max(width, height) * factor;
                        simplified = simplifyDP(points, epsilon);
                        // Si se simplificó a un polígono básico (ej: triángulo = 4 ptos considerando inicio y fin)
                        if (simplified.length >= 4 && simplified.length <= 6) {
                            break;
                        }
                    }

                    if (simplified.length >= 3 && simplified.length <= 8) {



                        // Si es cerrado, ignoramos el último punto superpuesto para que el closePath haga un cierre perfecto
                        const numPoints = isClosed ? simplified.length - 1 : simplified.length;

                        if (numPoints === 3) {
                            commitRecognizedShape({ type: 'triangle', x: minX, y: minY, width, height });
                            recognized = true;
                        } else if (numPoints === 4) {
                            commitRecognizedShape({ type: 'diamond', x: minX, y: minY, width, height });
                            recognized = true;
                        } else {
                            ctx.putImageData(savedCanvasState.current, 0, 0);
                            ctx.beginPath();
                            ctx.moveTo(simplified[0].x, simplified[0].y);
                            for (let i = 1; i < numPoints; i++) {
                                ctx.lineTo(simplified[i].x, simplified[i].y);
                            }
                            ctx.closePath();
                            ctx.stroke();
                            recognized = true;
                        }
                    }
                }
            } else if (!isClosed && Math.max(width, height) > 40) {
                // Probar línea recta
                const lineLen = Math.hypot(end.x - start.x, end.y - start.y);
                let lineError = 0;
                const den = Math.hypot(end.y - start.y, end.x - start.x);
                if (den > 0) {
                    points.forEach(p => {
                        lineError += Math.abs((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x) / den;
                    });
                    lineError /= points.length;

                    if (lineError < lineLen * 0.1) {
                        commitRecognizedShape({
                            type: 'line',
                            x: start.x,
                            y: start.y,
                            width: end.x - start.x,
                            height: end.y - start.y
                        });
                        recognized = true;
                    }
                }
            }
            if (recognized) return;
        }

        // Si no se reconoció como forma (o autoShape apagado), convertir trazo en objeto 'path'
        if (!isEraser && currentStroke.current && currentStroke.current.length > 2) {
            const points = currentStroke.current;
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });

            const width = maxX - minX;
            const height = maxY - minY;

            // Normalizar puntos relativos al bounding box
            const normalizedPoints = points.map(p => ({
                x: p.x - minX,
                y: p.y - minY
            }));

            // Limpiamos el canvas temporal (solo se usó para feedback)
            ctx.putImageData(savedCanvasState.current, 0, 0);

            const newShape = {
                id: Date.now(),
                type: 'path',
                x: minX,
                y: minY,
                width: width,
                height: height,
                originalWidth: width,
                originalHeight: height,
                points: normalizedPoints,
                color,
                brushSize,
                rotation: 0
            };

            setShapes(prev => [...prev, newShape]);
        }
        currentStroke.current = [];
    };

    const handleTextSubmit = () => {
        if (textInput.text.trim()) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.font = `500 ${brushSize * 6 + 10}px Inter`;
            ctx.fillStyle = color;
            ctx.textBaseline = 'top';
            ctx.fillText(textInput.text, textInput.x, textInput.y);
        }
        setTextInput({ visible: false, x: 0, y: 0, text: '' });
    };

    const clearCanvas = () => {
        setShowClearConfirm(true);
    };

    const confirmClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setShapes([]);
        setSelectedShapeId(null);
        setShowClearConfirm(false);
    };


    const getCoordinates = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: (e.clientX || e.nativeEvent.clientX) - rect.left,
            offsetY: (e.clientY || e.nativeEvent.clientY) - rect.top
        };
    };

    const downloadBoard = () => {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvasRef.current.width;
        exportCanvas.height = canvasRef.current.height;
        const ctx = exportCanvas.getContext('2d');

        // Exportar capas: Figuras primero, luego el lienzo (para que el lápiz esté encima)
        shapes.forEach(shape => {
            ctx.save();
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.brushSize;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();

            const w = Math.abs(shape.width);
            const h = Math.abs(shape.height);
            const minX = Math.min(shape.x, shape.x + shape.width);
            const minY = Math.min(shape.y, shape.y + shape.height);

            const cx = minX + w / 2;
            const cy = minY + h / 2;
            ctx.translate(cx, cy);
            ctx.rotate((shape.rotation || 0) * Math.PI / 180);
            ctx.translate(-cx, -cy);

            if (shape.type === 'rect') {
                ctx.rect(minX, minY, w, h);
            } else if (shape.type === 'circle') {
                ctx.ellipse(minX + w / 2, minY + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            } else if (shape.type === 'triangle') {
                ctx.moveTo(minX + w / 2, minY);
                ctx.lineTo(minX + w, minY + h);
                ctx.lineTo(minX, minY + h);
                ctx.closePath();
            } else if (shape.type === 'roundRect') {
                const radius = Math.min(w / 2, h / 2, 16);
                ctx.roundRect(minX, minY, w, h, radius);
            } else if (shape.type === 'diamond') {
                ctx.moveTo(minX + w / 2, minY);
                ctx.lineTo(minX + w, minY + h / 2);
                ctx.lineTo(minX + w / 2, minY + h);
                ctx.lineTo(minX, minY + h / 2);
                ctx.closePath();
            } else if (shape.type === 'line') {
                ctx.moveTo(shape.x, shape.y);
                ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            } else if (shape.type === 'arrow') {
                const headlen = 20;
                const ex = shape.x + shape.width, ey = shape.y + shape.height;
                const angle = Math.atan2(shape.height, shape.width);
                ctx.moveTo(shape.x, shape.y);
                ctx.lineTo(ex, ey);
                ctx.lineTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(ex, ey);
                ctx.lineTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
            } else if (shape.type === 'path' && shape.points) {
                ctx.moveTo(shape.x + shape.points[0].x, shape.y + shape.points[0].y);
                shape.points.forEach(p => {
                    ctx.lineTo(shape.x + p.x, shape.y + p.y);
                });
            }
            ctx.stroke();
            ctx.restore();
        });

        ctx.drawImage(canvasRef.current, 0, 0); // Dibuja el contenido del lienzo (trazos de lápiz) encima de las formas

        const url = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'pizarra-magica.png';
        link.href = url;
        link.click();
    };

    return (
        <div
            className={`whiteboard-container glass-panel ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''} ${isInvisible ? 'invisible-mode' : ''}`}
            style={isMaximized ? undefined : { left: position.x, top: position.y }}
        >
            <div
                className="whiteboard-header"
                onMouseDown={handleHeaderMouseDown}
                style={{ cursor: isDraggingHeader ? 'grabbing' : 'grab' }}
            >
                <div className="whiteboard-title-wrap">
                    <span className="whiteboard-title-icon" aria-hidden="true">
                        <PenLine size={22} className="whiteboard-title-icon-layer base" />
                        <PenLine size={22} className="whiteboard-title-icon-layer pink" />
                        <PenLine size={22} className="whiteboard-title-icon-layer blue" />
                    </span>
                    <h2 className="whiteboard-title text-gradient">Pizarra Mágica</h2>
                </div>

                <div className="window-controls" style={{ display: 'flex', gap: '6px', zIndex: 60, marginLeft: 'auto' }}>
                    <button className={`tool-btn ${isInvisible ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setIsInvisible(!isInvisible); }} title={isInvisible ? "Desactivar Fondo Transparente" : "Modo Transparente"}>
                        <Ghost size={16} />
                    </button>
                    <button className="tool-btn" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); setIsMaximized(false); }} title={isMinimized ? "Restaurar" : "Minimizar"}>
                        <Minus size={16} />
                    </button>
                    <button className="tool-btn" onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); setIsMinimized(false); }} title={isMaximized ? "Restaurar" : "Maximizar"}>
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button className="tool-btn danger" onClick={(e) => { e.stopPropagation(); onClose(); }} title="Cerrar Pizarra">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <div className="content-row">
                    <div className="toolbar">
                        <div className="tool-group">
                            <button
                                className={`tool-btn ${autoShape ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(false); setAutoShape(!autoShape); setActiveMenu(null); }}
                                title="Varita Mágica (Auto-Formas)"
                                style={{ color: autoShape ? '#f59e0b' : 'inherit' }}
                            >
                                <Wand2 size={18} />
                            </button>
                        </div>

                        <div className="tool-group">
                            <button
                                className={`tool-btn ${isSelectMode ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(true); setIsEraser(false); setIsTextMode(false); setInsertShape(null); setActiveMenu(null); }}
                                title="Seleccionar"
                            >
                                <MousePointer2 size={18} />
                            </button>
                            <button
                                className={`tool-btn ${!isSelectMode && !isEraser && !isTextMode && !insertShape ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(false); setIsEraser(false); setIsTextMode(false); setInsertShape(null); setActiveMenu(null); }}
                                title="Lápiz"
                            >
                                <PenLine size={18} />
                            </button>
                            <button
                                className={`tool-btn ${isEraser ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(false); setIsEraser(true); setIsTextMode(false); setInsertShape(null); setActiveMenu(null); }}
                                title="Borrador"
                            >
                                <Eraser size={18} />
                            </button>
                            <button
                                className={`tool-btn ${isTextMode ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(false); setIsTextMode(true); setIsEraser(false); setInsertShape(null); setActiveMenu(null); }}
                                title="Texto"
                            >
                                <Type size={18} />
                            </button>
                        </div>

                        <div className="tool-group" style={{ position: 'relative' }}>
                            <button
                                className={`tool-btn ${insertShape || activeMenu === 'shapes' ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(false); setActiveMenu(activeMenu === 'shapes' ? null : 'shapes'); }}
                                title="Formas Geométricas"
                            >
                                {insertShape === 'rect' ? <Square size={18} /> :
                                    insertShape === 'circle' ? <Circle size={18} /> :
                                        insertShape === 'triangle' ? <Triangle size={18} /> :
                                            insertShape === 'arrow' ? <ArrowRight size={18} /> :
                                                insertShape === 'line' ? <Minus size={18} /> :
                                                    insertShape === 'roundRect' ? <AppWindow size={18} /> :
                                                        insertShape === 'diamond' ? <Diamond size={18} /> :
                                                            <Shapes size={18} />}
                            </button>

                            {activeMenu === 'shapes' && (
                                <div className="sub-menu" style={subMenuStyle}>
                                    <button className={`tool-btn ${insertShape === 'rect' ? 'active' : ''}`} onClick={() => { setInsertShape('rect'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Rectángulo"><Square size={16} /></button>
                                    <button className={`tool-btn ${insertShape === 'roundRect' ? 'active' : ''}`} onClick={() => { setInsertShape('roundRect'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Rect. Redondeado"><AppWindow size={16} /></button>
                                    <button className={`tool-btn ${insertShape === 'circle' ? 'active' : ''}`} onClick={() => { setInsertShape('circle'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Círculo"><Circle size={16} /></button>
                                    <button className={`tool-btn ${insertShape === 'triangle' ? 'active' : ''}`} onClick={() => { setInsertShape('triangle'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Triángulo"><Triangle size={16} /></button>
                                    <button className={`tool-btn ${insertShape === 'diamond' ? 'active' : ''}`} onClick={() => { setInsertShape('diamond'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Rombo"><Diamond size={16} /></button>
                                    <button className={`tool-btn ${insertShape === 'arrow' ? 'active' : ''}`} onClick={() => { setInsertShape('arrow'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Flecha"><ArrowRight size={16} /></button>
                                    <button className={`tool-btn ${insertShape === 'line' ? 'active' : ''}`} onClick={() => { setInsertShape('line'); setActiveMenu(null); setIsEraser(false); setIsTextMode(false); }} title="Línea"><Minus size={16} /></button>
                                </div>
                            )}
                        </div>

                        <>
                            <div className="tool-group" style={{ position: 'relative', alignItems: 'center' }}>
                                <button
                                    className={`tool-btn ${activeMenu === 'colors' ? 'active' : ''} ${isEraser ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if (isEraser) return;
                                        setIsSelectMode(false);
                                        setActiveMenu(activeMenu === 'colors' ? null : 'colors');
                                    }}
                                    title={isEraser ? 'Color deshabilitado mientras usas borrador' : 'Color'}
                                    aria-disabled={isEraser}
                                >
                                    <Palette size={18} color={isEraser ? 'rgba(148,163,184,0.55)' : color !== '#ffffff' ? color : 'var(--text-secondary)'} />
                                </button>
                                {!isEraser && activeMenu === 'colors' && (
                                    <div className="sub-menu" style={subMenuStyle}>
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                className={`color-btn ${color === c ? 'selected' : ''}`}
                                                style={{ background: c }}
                                                onClick={() => { setColor(c); setActiveMenu(null); }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>

                        <div className="tool-group" style={{ position: 'relative', alignItems: 'center' }}>
                            <button
                                className={`tool-btn ${activeMenu === 'size' ? 'active' : ''}`}
                                onClick={() => { setIsSelectMode(false); setActiveMenu(activeMenu === 'size' ? null : 'size'); }}
                                title="Grosor"
                            >
                                <div style={{
                                    width: `${Math.min(brushSize, 18)}px`,
                                    height: `${Math.min(brushSize, 18)}px`,
                                    borderRadius: '50%',
                                    backgroundColor: isEraser ? 'white' : color,
                                    border: '1px solid #ccc'
                                }} />
                            </button>
                            {activeMenu === 'size' && (
                                <div className="sub-menu" style={subMenuStyle}>
                                    <div className="brush-slider-container">
                                        <div className="brush-slider">
                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                value={brushSize}
                                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="tool-separator"></div>

                        <div className="tool-group">
                            <button className="tool-btn danger" onClick={clearCanvas} title="Limpiar todo">
                                <Trash2 size={18} />
                            </button>
                            <button className="tool-btn" onClick={downloadBoard} title="Descargar como imagen">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    <div
                        className="canvas-wrapper"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{ position: 'relative', flex: 1, overflow: 'hidden', cursor: isSelectMode ? 'default' : isTextMode ? 'text' : 'crosshair' }}
                    >
                        {/* DOM Overlays para shapes - Debajo del canvas visualmente pero con pointer-events: auto */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                            {shapes.map((shape) => {
                                const isSelected = selectedShapeId === shape.id;
                                const minX = Math.min(shape.x, shape.x + shape.width);
                                const minY = Math.min(shape.y, shape.y + shape.height);
                                const w = Math.abs(shape.width);
                                const h = Math.abs(shape.height);
                                const isActuallyDrawing = isDrawing && tempShape;
                                const canSelectShapes = isSelectMode && !isActuallyDrawing;

                                return (
                                    <div
                                        key={shape.id}
                                        style={{
                                            position: 'absolute',
                                            left: minX,
                                            top: minY,
                                            width: w,
                                            height: h,
                                            outline: isSelected ? '2px solid #3b82f6' : 'none',
                                            transform: `rotate(${shape.rotation || 0}deg)`,
                                            transformOrigin: 'center center',
                                            cursor: canSelectShapes ? 'move' : 'default',
                                            pointerEvents: canSelectShapes ? 'auto' : 'none'
                                        }}

                                        onDoubleClick={(e) => {
                                            if (!canSelectShapes) return;
                                            e.stopPropagation();
                                            setSelectedShapeId(shape.id);
                                        }}
                                        onMouseDown={(e) => {
                                            if (!canSelectShapes) return;
                                            e.stopPropagation();
                                            if (!isSelected) {
                                                setSelectedShapeId(shape.id);
                                                return;
                                            }
                                            e.stopPropagation();
                                            setDragState({
                                                handle: 'center',
                                                startX: e.clientX,
                                                startY: e.clientY,
                                                initialShape: { ...shape }
                                            });
                                        }}
                                    >
                                        <RenderShapeSVG shape={shape} />

                                        {isSelected && (
                                            <>
                                                {/* Resize Handles (8 points) */}
                                                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((pos) => (
                                                    <div
                                                        key={pos}
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                            setDragState({
                                                                handle: pos,
                                                                startX: e.clientX,
                                                                startY: e.clientY,
                                                                initialShape: { ...shape }
                                                            });
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            width: '10px',
                                                            height: '10px',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #3b82f6',
                                                            borderRadius: '50%',
                                                            left: pos.includes('e') ? '100%' : pos.includes('w') ? '0' : '50%',
                                                            top: pos.includes('s') ? '100%' : pos.includes('n') ? '0' : '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            cursor: pos.length === 1 ? (pos === 'n' || pos === 's' ? 'ns-resize' : 'ew-resize') : `${pos}-resize`,
                                                            zIndex: 12
                                                        }}
                                                    />
                                                ))}

                                                {/* Microsoft Style Rotation Handle */}
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        const boxRect = e.currentTarget.parentElement.getBoundingClientRect();
                                                        const cx = boxRect.left + boxRect.width / 2;
                                                        const cy = boxRect.top + boxRect.height / 2;
                                                        const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);

                                                        setDragState({
                                                            handle: 'rotate',
                                                            cx: cx,
                                                            cy: cy,
                                                            startAngle: startAngle,
                                                            initialShape: { ...shape }
                                                        });
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        width: '24px',
                                                        height: '24px',
                                                        backgroundColor: 'white',
                                                        border: '1px solid #3b82f6',
                                                        color: '#3b82f6',
                                                        borderRadius: '50%',
                                                        left: '50%',
                                                        top: '-35px',
                                                        transform: `translate(-50%, -50%) rotate(${-shape.rotation || 0}deg)`,
                                                        cursor: 'grab',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        zIndex: 11,
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    <RotateCcw size={14} />
                                                    {/* Connector line */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '22px',
                                                        left: '50%',
                                                        width: '2px',
                                                        height: '14px',
                                                        backgroundColor: '#3b82f6',
                                                        transform: 'translateX(-50%)',
                                                        pointerEvents: 'none'
                                                    }} />
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShapes(shapes.filter(s => s.id !== shape.id));
                                                        setSelectedShapeId(null);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-15px',
                                                        right: '-15px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        zIndex: 10,
                                                        transform: `rotate(${-shape.rotation || 0}deg)`
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* El lienzo principal está ENCIMA de las figuras pero es transparente a eventos
                    Esto permite que los trazos de lápiz sean visibles sobre las figuras. */}
                        <canvas
                            ref={canvasRef}
                            className={isTextMode ? 'text-cursor' : isSelectMode ? '' : 'hide-cursor'}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                touchAction: 'none',
                                pointerEvents: 'none',
                                zIndex: 2
                            }}
                        />

                        {!isTextMode && (
                            <div
                                ref={customCursorRef}
                                className="custom-brush-cursor"
                                style={{
                                    width: `${isEraser ? brushSize * 3 : brushSize}px`,
                                    height: `${isEraser ? brushSize * 3 : brushSize}px`,
                                    borderColor: isEraser ? 'white' : color,
                                    backgroundColor: isEraser ? 'rgba(255,255,255,0.8)' : 'transparent',
                                }}
                            />
                        )}

                        {textInput.visible && (
                            <input
                                ref={inputRef}
                                type="text"
                                value={textInput.text}
                                onChange={e => setTextInput({ ...textInput, text: e.target.value })}
                                onBlur={handleTextSubmit}
                                onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                                style={{
                                    position: 'absolute',
                                    left: textInput.x,
                                    top: textInput.y,
                                    background: 'transparent',
                                    border: '1px dashed rgba(255,255,255,0.3)',
                                    color: color,
                                    font: `500 ${brushSize * 6 + 10}px Inter`,
                                    outline: 'none',
                                    zIndex: 10,
                                    padding: 0,
                                    margin: 0
                                }}
                            />
                        )}

                        {/* Renderizar forma temporal cuando el usuario está arrastrando para insertarla */}
                        {tempShape && isDrawing && insertShape && (
                            <div style={{
                                position: 'absolute',
                                left: Math.min(tempShape.x, tempShape.x + tempShape.width),
                                top: Math.min(tempShape.y, tempShape.y + tempShape.height),
                                width: Math.max(Math.abs(tempShape.width), 1),
                                height: Math.max(Math.abs(tempShape.height), 1),
                                transform: `rotate(${tempShape.rotation || 0}deg)`,
                                transformOrigin: 'center center',
                                pointerEvents: 'none',
                                zIndex: 4
                            }}>
                                <RenderShapeSVG shape={tempShape} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Borrar Todo */}
            {showClearConfirm && (
                <div className="whiteboard-modal-overlay">
                    <div className="whiteboard-modal glass-panel">
                        <Trash2 size={40} className="text-gradient" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                        <h3>¿Borrar todo el lienzo?</h3>
                        <p>Esta acción eliminará todos los dibujos y figuras permanentemente.</p>
                        <div className="modal-actions">
                            <button className="tool-btn danger" onClick={confirmClear}>Borrar Todo</button>
                            <button className="tool-btn" onClick={() => setShowClearConfirm(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Whiteboard;
