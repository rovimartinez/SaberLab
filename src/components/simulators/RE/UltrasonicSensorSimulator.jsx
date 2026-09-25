import React, { useState, useEffect, useRef } from 'react';

export default function UltrasonicSensorSimulator() {
  const FRONT_PLANE_X = 548;
  const SENSOR_REF = { x: FRONT_PLANE_X, y: 120 };

  const SCALE_PX_PER_CM = 1.25;
  const ZERO_OFFSET_PX = 38.0;

  const ANGLE_PRECISION_HALF = 7.5;
  const ANGLE_DETECTION_HALF = 15.0;
  const RAD_PREC = (ANGLE_PRECISION_HALF * Math.PI) / 180;
  const RAD_DET = (ANGLE_DETECTION_HALF * Math.PI) / 180;

  const NUM_WAVE_ARCS = 8;
  const WAVE_SPACING_PX = 4.8;

  // State
  const [target, setTarget] = useState({
    distCm: 75.0,
    angleDeg: 0.0,
    x: 416.2,
    y: 120.0,
    zone: 'precision',
    inRange: true,
    timeUs: 4373
  });

  const [isContinuous, setIsContinuous] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [cycleCount, setCycleCount] = useState(1); // 1, 2, 'live'
  const [isSerialOpen, setIsSerialOpen] = useState(false);
  const [serialLogs, setSerialLogs] = useState([
    { id: 1, text: '--- Monitor Serial iniciado @ 9600 baud ---', type: 'info' },
    { id: 2, text: 'Distancia: 75.0 cm', type: 'data' }
  ]);

  // Floating Modal Position
  const [modalPos, setModalPos] = useState({ x: 250, y: 100 });
  const isDraggingModalRef = useRef(false);
  const modalDragStartRef = useRef({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  // Refs for animation & physics state
  const isContinuousRef = useRef(isContinuous);
  const isSlowMoRef = useRef(isSlowMo);
  const cycleCountRef = useRef(cycleCount);
  const targetRef = useRef(target);
  const activePacketsRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const lastTickRef = useRef(performance.now());

  const liveTimingRef = useRef({
    active: false,
    currentScanX: 85,
    echoFinished: false,
    rxProgress: 0.0
  });

  const isDraggingCanvasRef = useRef(false);
  const svgRef = useRef(null);
  const serialTerminalRef = useRef(null);
  const continuousTimerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { isContinuousRef.current = isContinuous; }, [isContinuous]);
  useEffect(() => { isSlowMoRef.current = isSlowMo; }, [isSlowMo]);
  useEffect(() => { cycleCountRef.current = cycleCount; }, [cycleCount]);
  useEffect(() => { targetRef.current = target; }, [target]);

  // Coordinate conversion helpers
  const polarToSvgCoords = (distCm, angleDeg) => {
    const distPx = ZERO_OFFSET_PX + (distCm * SCALE_PX_PER_CM);
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: SENSOR_REF.x - (distPx * Math.cos(rad)),
      y: SENSOR_REF.y + (distPx * Math.sin(rad))
    };
  };

  const svgCoordsToPolar = (svgX, svgY) => {
    const dx = SENSOR_REF.x - svgX;
    const dy = svgY - SENSOR_REF.y;
    const totalDistPx = Math.sqrt(dx * dx + dy * dy);
    const distCm = Math.max(2.0, Math.min(400.0, (totalDistPx - ZERO_OFFSET_PX) / SCALE_PX_PER_CM));
    const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    return { distCm, angleDeg };
  };

  const updateTargetState = (newDistCm, newAngleDeg) => {
    const pos = polarToSvgCoords(newDistCm, newAngleDeg);
    const absAngle = Math.abs(newAngleDeg);

    let zone = 'out';
    let inRange = false;

    if (absAngle <= ANGLE_PRECISION_HALF && newDistCm >= 2.0 && newDistCm <= 400.0) {
      zone = 'precision';
      inRange = true;
    } else if (absAngle <= ANGLE_DETECTION_HALF && newDistCm >= 2.0 && newDistCm <= 400.0) {
      zone = 'detection';
      inRange = true;
    }

    const timeUs = inRange ? Math.round((2.0 * newDistCm) / 0.0343) : 0;

    setTarget({
      distCm: newDistCm,
      angleDeg: newAngleDeg,
      x: pos.x,
      y: pos.y,
      zone,
      inRange,
      timeUs
    });
  };

  const spawnBurstPacket = () => {
    // Glow LED T
    const glowT = document.getElementById('glow-led-t');
    if (glowT) {
      glowT.style.opacity = '0.9';
      setTimeout(() => { glowT.style.opacity = '0.0'; }, 160);
    }

    liveTimingRef.current = {
      active: true,
      currentScanX: 85,
      echoFinished: false,
      rxProgress: 0.0
    };

    activePacketsRef.current.push({
      id: Date.now() + Math.random(),
      type: 'outgoing',
      originX: SENSOR_REF.x,
      originY: SENSOR_REF.y,
      currentRadiusPx: 0.0,
      speedPxPerSec: isSlowMoRef.current ? 140 : 480,
      hasSpawnedEcho: false,
      maxRadiusPx: 660
    });
  };

  const logToSerial = (msgText, type = 'data') => {
    setSerialLogs(prev => [...prev.slice(-40), { id: Date.now() + Math.random(), text: msgText, type }]);
  };

  // Continuous timer logic
  useEffect(() => {
    if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);

    if (isContinuous) {
      const intervalMs = isSlowMo ? 3500 : 850;
      continuousTimerRef.current = setInterval(() => {
        spawnBurstPacket();
        if (targetRef.current.inRange) {
          logToSerial(`Distancia: ${targetRef.current.distCm.toFixed(1)} cm`, 'data');
        } else {
          logToSerial('Fuera de rango (Sin eco)', 'warning');
        }
      }, intervalMs);
    }

    return () => {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    };
  }, [isContinuous, isSlowMo]);

  // Main Animation Loop
  useEffect(() => {
    lastTickRef.current = performance.now();

    const renderWaveArcs = () => {
      const outLayer = document.getElementById('waves-outgoing-layer');
      const echoLayer = document.getElementById('waves-echo-layer');
      if (!outLayer || !echoLayer) return;

      let svgOut = '';
      let svgEcho = '';

      activePacketsRef.current.forEach(pkt => {
        if (pkt.type === 'outgoing') {
          const baseAngle = Math.PI;

          for (let c = 0; c < NUM_WAVE_ARCS; c++) {
            const r = pkt.currentRadiusPx - (c * WAVE_SPACING_PX);
            if (r > 5) {
              const arcSpan = Math.max(0.48, 1.15 - (r / 220));
              const a1 = baseAngle - arcSpan;
              const a2 = baseAngle + arcSpan;

              const x1 = pkt.originX + r * Math.cos(a1);
              const y1 = pkt.originY + r * Math.sin(a1);
              const x2 = pkt.originX + r * Math.cos(a2);
              const y2 = pkt.originY + r * Math.sin(a2);

              const strokeColor = (c % 2 === 0) ? '#0284c7' : '#38bdf8';
              const strokeWidth = (c === 0) ? 2.3 : 1.7;
              const fade = Math.max(0.08, 1.0 - (r / 620));

              svgOut += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}"
                               fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${fade.toFixed(2)}" />`;
            }
          }
        } else if (pkt.type === 'echo') {
          const arcSpan = 0.52;

          for (let c = 0; c < NUM_WAVE_ARCS; c++) {
            const r = pkt.currentRadiusPx - (c * WAVE_SPACING_PX);
            if (r > 3) {
              const a1 = -arcSpan;
              const a2 = arcSpan;

              const x1 = pkt.originX + r * Math.cos(a1);
              const y1 = pkt.originY + r * Math.sin(a1);
              const x2 = pkt.originX + r * Math.cos(a2);
              const y2 = pkt.originY + r * Math.sin(a2);

              const strokeColor = targetRef.current.zone === 'precision' 
                ? ((c % 2 === 0) ? '#059669' : '#34d399') 
                : ((c % 2 === 0) ? '#0284c7' : '#38bdf8');
              const strokeWidth = (c === 0) ? 2.3 : 1.7;
              const fade = Math.max(0.1, 0.9 - (r / 500));

              svgEcho += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}"
                                fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${fade.toFixed(2)}" />`;
            }
          }
        }
      });

      outLayer.innerHTML = svgOut;
      echoLayer.innerHTML = svgEcho;
    };

    const animateAcoustics = (now) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const minEchoX = 220;
      const maxEchoX = 650;
      const tEchoEnd = targetRef.current.inRange 
        ? minEchoX + ((targetRef.current.distCm - 2.0) / 398.0) * (maxEchoX - minEchoX)
        : 670;

      // Live Mode Scan Animation Logic
      if (cycleCountRef.current === 'live' && liveTimingRef.current.active) {
        const scanSpeedPxPerSec = isSlowMoRef.current ? 120 : 380;

        if (!liveTimingRef.current.echoFinished) {
          liveTimingRef.current.currentScanX += scanSpeedPxPerSec * dt;

          if (targetRef.current.inRange && liveTimingRef.current.currentScanX >= tEchoEnd) {
            liveTimingRef.current.currentScanX = tEchoEnd;
            liveTimingRef.current.echoFinished = true;
          } else if (!targetRef.current.inRange && liveTimingRef.current.currentScanX >= 680) {
            liveTimingRef.current.currentScanX = 680;
            liveTimingRef.current.echoFinished = true;
          }
        } else {
          liveTimingRef.current.rxProgress += (isSlowMoRef.current ? 12 : 32) * dt;
          if (liveTimingRef.current.rxProgress > 8.0) {
            liveTimingRef.current.rxProgress = 8.0;
            if (isContinuousRef.current) {
              liveTimingRef.current = {
                active: true,
                currentScanX: 85,
                echoFinished: false,
                rxProgress: 0.0
              };
            } else {
              liveTimingRef.current.active = false;
            }
          }
          liveTimingRef.current.currentScanX = Math.min(690, tEchoEnd + (liveTimingRef.current.rxProgress * 6.5));
        }
      }

      for (let i = activePacketsRef.current.length - 1; i >= 0; i--) {
        const pkt = activePacketsRef.current[i];
        pkt.currentRadiusPx += pkt.speedPxPerSec * dt;

        const distPhysicalTrip = SENSOR_REF.x - targetRef.current.x;

        if (pkt.type === 'outgoing' && !pkt.hasSpawnedEcho) {
          if (pkt.currentRadiusPx >= distPhysicalTrip) {
            pkt.hasSpawnedEcho = true;

            const hit = document.getElementById('target-hit-wave');
            if (hit) {
              hit.style.opacity = '0.9';
              setTimeout(() => { hit.style.opacity = '0.0'; }, 160);
            }

            if (targetRef.current.inRange) {
              activePacketsRef.current.push({
                id: Date.now() + Math.random(),
                type: 'echo',
                originX: targetRef.current.x,
                originY: targetRef.current.y,
                currentRadiusPx: 0.0,
                speedPxPerSec: pkt.speedPxPerSec,
                hasReachedReceiver: false,
                maxRadiusPx: 580
              });
            }
          }
        }

        if (pkt.type === 'echo' && !pkt.hasReachedReceiver) {
          if (pkt.currentRadiusPx >= distPhysicalTrip) {
            pkt.hasReachedReceiver = true;
            liveTimingRef.current.echoFinished = true;
            liveTimingRef.current.currentScanX = tEchoEnd;

            const glowR = document.getElementById('glow-led-r');
            if (glowR) {
              glowR.style.opacity = '0.95';
              setTimeout(() => { glowR.style.opacity = '0.0'; }, 180);
            }
          }
        }

        if (pkt.currentRadiusPx >= pkt.maxRadiusPx) {
          activePacketsRef.current.splice(i, 1);
        }
      }

      renderWaveArcs();
      animFrameIdRef.current = requestAnimationFrame(animateAcoustics);
    };

    animFrameIdRef.current = requestAnimationFrame(animateAcoustics);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Autoscroll serial terminal
  useEffect(() => {
    if (serialTerminalRef.current) {
      serialTerminalRef.current.scrollTop = serialTerminalRef.current.scrollHeight;
    }
  }, [serialLogs, isSerialOpen]);

  // Truncated Cones Generator
  const createTruncatedConePath = (rad) => {
    const rMinPx = ZERO_OFFSET_PX + (2.0 * SCALE_PX_PER_CM);
    const rMaxPx = ZERO_OFFSET_PX + (400.0 * SCALE_PX_PER_CM);

    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const xMaxT = SENSOR_REF.x - (rMaxPx * cosA);
    const yMaxT = SENSOR_REF.y - (rMaxPx * sinA);
    const xMaxB = SENSOR_REF.x - (rMaxPx * cosA);
    const yMaxB = SENSOR_REF.y + (rMaxPx * sinA);

    const xMinT = SENSOR_REF.x - (rMinPx * cosA);
    const yMinT = SENSOR_REF.y - (rMinPx * sinA);
    const xMinB = SENSOR_REF.x - (rMinPx * cosA);
    const yMinB = SENSOR_REF.y + (rMinPx * sinA);

    return `M ${xMinT.toFixed(1)} ${yMinT.toFixed(1)}
            L ${xMaxT.toFixed(1)} ${yMaxT.toFixed(1)}
            A ${rMaxPx.toFixed(1)} ${rMaxPx.toFixed(1)} 0 0 0 ${xMaxB.toFixed(1)} ${yMaxB.toFixed(1)}
            L ${xMinB.toFixed(1)} ${yMinB.toFixed(1)}
            A ${rMinPx.toFixed(1)} ${rMinPx.toFixed(1)} 0 0 1 ${xMinT.toFixed(1)} ${yMinT.toFixed(1)}
            Z`;
  };

  // SVG Canvas Drag Handlers
  const getPointerSvgCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    if (e.touches && e.touches.length > 0) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };

  const handleCanvasStart = (e) => {
    isDraggingCanvasRef.current = true;
    handleCanvasMove(e);
  };

  const handleCanvasMove = (e) => {
    if (!isDraggingCanvasRef.current) return;
    const pt = getPointerSvgCoords(e);
    const polar = svgCoordsToPolar(pt.x, pt.y);
    updateTargetState(polar.distCm, polar.angleDeg);
  };

  const handleCanvasEnd = () => {
    isDraggingCanvasRef.current = false;
  };

  // Controls UI Handlers
  const handleToggleSlowMo = () => {
    const nextSlowMo = !isSlowMo;
    setIsSlowMo(nextSlowMo);
    if (nextSlowMo && isContinuous) {
      setIsContinuous(false);
    }
    activePacketsRef.current = [];
    spawnBurstPacket();
  };

  const handleTriggerSinglePulse = () => {
    if (isContinuous) {
      setIsContinuous(false);
    }
    activePacketsRef.current = [];
    spawnBurstPacket();
  };

  const handleToggleContinuous = () => {
    const nextCont = !isContinuous;
    setIsContinuous(nextCont);
    if (nextCont) {
      spawnBurstPacket();
    }
  };

  const handleSetCycleCount = (mode) => {
    setCycleCount(mode);
    if (mode === 'live') {
      spawnBurstPacket();
    }
  };

  // Draggable Serial Monitor Modal logic
  const handleModalHeaderMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    isDraggingModalRef.current = true;
    modalDragStartRef.current = {
      startX: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      startY: e.clientY || (e.touches && e.touches[0].clientY) || 0,
      initialLeft: modalPos.x,
      initialTop: modalPos.y
    };

    const handleWindowMove = (moveEvt) => {
      if (!isDraggingModalRef.current) return;
      const clientX = moveEvt.clientX || (moveEvt.touches && moveEvt.touches[0].clientX) || 0;
      const clientY = moveEvt.clientY || (moveEvt.touches && moveEvt.touches[0].clientY) || 0;

      const dx = clientX - modalDragStartRef.current.startX;
      const dy = clientY - modalDragStartRef.current.startY;

      setModalPos({
        x: modalDragStartRef.current.initialLeft + dx,
        y: modalDragStartRef.current.initialTop + dy
      });
    };

    const handleWindowEnd = () => {
      isDraggingModalRef.current = false;
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowEnd);
      window.removeEventListener('touchmove', handleWindowMove);
      window.removeEventListener('touchend', handleWindowEnd);
    };

    window.addEventListener('mousemove', handleWindowMove);
    window.addEventListener('mouseup', handleWindowEnd);
    window.addEventListener('touchmove', handleWindowMove, { passive: false });
    window.addEventListener('touchend', handleWindowEnd);
  };

  // Timing Diagram Render logic
  const renderTimingDiagramContent = () => {
    const yTrig = 50, yEmis = 104, yRecep = 158, yEcho = 214;
    const yTrigHigh = 26, yEmisHigh = 80, yRecepHigh = 134, yEchoHigh = 186;

    if (cycleCount === 1) {
      const xStart = 85, xEnd = 690;
      const tTrigStart = 120, tTrigEnd = 128;
      const tBurstStart = 136, tBurstEnd = 188;

      const minEchoX = 220, maxEchoX = 650;
      const tEchoEnd = target.inRange 
        ? minEchoX + ((target.distCm - 2.0) / 398.0) * (maxEchoX - minEchoX)
        : 670;

      let dEmisor = `M ${xStart} ${yEmis} L ${tBurstStart} ${yEmis}`;
      for (let i = 0; i < 8; i++) {
        const px = tBurstStart + (i * 6.5);
        dEmisor += ` L ${px} ${yEmisHigh} L ${px + 3.25} ${yEmisHigh} L ${px + 3.25} ${yEmis} L ${px + 6.5} ${yEmis}`;
      }
      dEmisor += ` L ${xEnd} ${yEmis}`;

      let dRecep = `M ${xStart} ${yRecep}`;
      if (target.inRange) {
        dRecep += ` L ${tEchoEnd} ${yRecep}`;
        for (let i = 0; i < 8; i++) {
          const rx = tEchoEnd + (i * 6.5);
          dRecep += ` L ${rx} ${yRecepHigh} L ${rx + 3.25} ${yRecepHigh} L ${rx + 3.25} ${yRecep} L ${rx + 6.5} ${yRecep}`;
        }
        dRecep += ` L ${xEnd} ${yRecep}`;
      } else {
        dRecep += ` L ${xEnd} ${yRecep}`;
      }

      const dEcho = `M ${xStart} ${yEcho} L ${tBurstEnd} ${yEcho} L ${tBurstEnd} ${yEchoHigh} L ${tEchoEnd} ${yEchoHigh} L ${tEchoEnd} ${yEcho} L ${xEnd} ${yEcho}`;

      return (
        <g>
          {/* Trigger */}
          <path d={`M ${xStart} ${yTrig} L ${tTrigStart} ${yTrig} L ${tTrigStart} ${yTrigHigh} L ${tTrigEnd} ${yTrigHigh} L ${tTrigEnd} ${yTrig} L ${xEnd} ${yTrig}`} fill="none" stroke="#2563eb" strokeWidth="1.8" />
          <text x={(tTrigStart + tTrigEnd)/2} y={yTrigHigh - 6} fill="#d97706" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">&gt;10µs</text>

          {/* Emisor */}
          <path d={dEmisor} fill="none" stroke="#2563eb" strokeWidth="1.6" />
          <text x={(tBurstStart + tBurstEnd)/2 + 10} y={yEmisHigh - 6} fill="#d97706" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="600" textAnchor="middle">Onda sonora 8 pulsos a 40KHz</text>

          {/* Receptor */}
          <path d={dRecep} fill="none" stroke="#2563eb" strokeWidth="1.6" />
          {target.inRange && (
            <text x={tEchoEnd + 26} y={yRecepHigh - 6} fill="#d97706" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="600" textAnchor="middle">Llegada onda reflejada</text>
          )}

          {/* Echo */}
          <path d={dEcho} fill="none" stroke="#2563eb" strokeWidth="1.8" />
          <text x={(tBurstEnd + tEchoEnd)/2} y={yEchoHigh - 6} fill="#d97706" fontSize="10.5" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="middle">{target.inRange ? 'Tiempo de ida y vuelta' : 'Timeout (>38ms sin eco)'}</text>
          {target.inRange && (
            <line x1={tEchoEnd} y1={yRecepHigh + 4} x2={tEchoEnd} y2={yEcho} stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
          )}
        </g>
      );
    } else if (cycleCount === 2) {
      const cycleWidth = 300;
      let dTrig = `M 85 ${yTrig}`, dEmis = `M 85 ${yEmis}`, dRecep = `M 85 ${yRecep}`, dEcho = `M 85 ${yEcho}`;
      const textElements = [];

      for (let c = 0; c < 2; c++) {
        const offset = 85 + (c * cycleWidth);
        const tTrigStart = offset + 25, tTrigEnd = offset + 31;
        const tBurstStart = offset + 37, tBurstEnd = offset + 75;

        const minEchoX = offset + 95, maxEchoX = offset + 265;
        const tEchoEnd = target.inRange 
          ? minEchoX + ((target.distCm - 2.0) / 398.0) * (maxEchoX - minEchoX)
          : offset + 280;

        dTrig += ` L ${tTrigStart} ${yTrig} L ${tTrigStart} ${yTrigHigh} L ${tTrigEnd} ${yTrigHigh} L ${tTrigEnd} ${yTrig} L ${offset + cycleWidth} ${yTrig}`;
        textElements.push(<text key={`trig-${c}`} x={(tTrigStart + tTrigEnd)/2} y={yTrigHigh - 5} fill="#d97706" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">&gt;10µs</text>);

        dEmis += ` L ${tBurstStart} ${yEmis}`;
        for (let i = 0; i < 8; i++) {
          const px = tBurstStart + (i * 4.5);
          dEmis += ` L ${px} ${yEmisHigh} L ${px + 2.25} ${yEmisHigh} L ${px + 2.25} ${yEmis} L ${px + 4.5} ${yEmis}`;
        }
        dEmis += ` L ${offset + cycleWidth} ${yEmis}`;
        textElements.push(<text key={`emis-${c}`} x={(tBurstStart + tBurstEnd)/2} y={yEmisHigh - 5} fill="#d97706" fontSize="8.5" fontFamily="'Inter', sans-serif" fontWeight="600" textAnchor="middle">8 pulsos 40KHz</text>);

        if (target.inRange) {
          dRecep += ` L ${tEchoEnd} ${yRecep}`;
          for (let i = 0; i < 8; i++) {
            const rx = tEchoEnd + (i * 4.5);
            dRecep += ` L ${rx} ${yRecepHigh} L ${rx + 2.25} ${yRecepHigh} L ${rx + 2.25} ${yRecep} L ${rx + 4.5} ${yRecep}`;
          }
          dRecep += ` L ${offset + cycleWidth} ${yRecep}`;
          textElements.push(<text key={`recep-${c}`} x={tEchoEnd + 18} y={yRecepHigh - 5} fill="#d97706" fontSize="8.5" fontFamily="'Inter', sans-serif" fontWeight="600" textAnchor="end">Onda reflejada</text>);
        } else {
          dRecep += ` L ${offset + cycleWidth} ${yRecep}`;
        }

        dEcho += ` L ${tBurstEnd} ${yEcho} L ${tBurstEnd} ${yEchoHigh} L ${tEchoEnd} ${yEchoHigh} L ${tEchoEnd} ${yEcho} L ${offset + cycleWidth} ${yEcho}`;
        textElements.push(<text key={`echo-${c}`} x={(tBurstEnd + tEchoEnd)/2} y={yEchoHigh - 5} fill="#d97706" fontSize="9" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="middle">Tiempo ida y vuelta</text>);
        if (target.inRange) {
          textElements.push(<line key={`line-${c}`} x1={tEchoEnd} y1={yRecepHigh + 4} x2={tEchoEnd} y2={yEcho} stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />);
        }
      }

      return (
        <g>
          <line x1="85" y1="12" x2="385" y2="12" stroke="#d97706" strokeWidth="1.2" strokeDasharray="3,3" />
          <line x1="385" y1="12" x2="685" y2="12" stroke="#d97706" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="235" y="10" fill="#d97706" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">Periodo 1</text>
          <text x="535" y="10" fill="#d97706" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">Periodo 2</text>

          <path d={dTrig} fill="none" stroke="#2563eb" strokeWidth="1.8" />
          <path d={dEmis} fill="none" stroke="#2563eb" strokeWidth="1.6" />
          <path d={dRecep} fill="none" stroke="#2563eb" strokeWidth="1.6" />
          <path d={dEcho} fill="none" stroke="#2563eb" strokeWidth="1.8" />
          {textElements}
        </g>
      );
    } else {
      // Live Mode
      const xStart = 85, xEnd = 690;
      const tTrigStart = 120, tTrigEnd = 128;
      const tBurstStart = 136, tBurstEnd = 188;

      const minEchoX = 220, maxEchoX = 650;
      const tEchoEnd = target.inRange 
        ? minEchoX + ((target.distCm - 2.0) / 398.0) * (maxEchoX - minEchoX)
        : 670;

      const liveX = Math.min(xEnd, Math.max(xStart, liveTimingRef.current.currentScanX));

      let dTrig = `M ${xStart} ${yTrig}`;
      if (liveX >= tTrigStart) {
        dTrig += ` L ${tTrigStart} ${yTrig} L ${tTrigStart} ${yTrigHigh}`;
        if (liveX >= tTrigEnd) {
          dTrig += ` L ${tTrigEnd} ${yTrigHigh} L ${tTrigEnd} ${yTrig} L ${xEnd} ${yTrig}`;
        } else {
          dTrig += ` L ${liveX} ${yTrigHigh} L ${liveX} ${yTrig} L ${xEnd} ${yTrig}`;
        }
      } else {
        dTrig += ` L ${xEnd} ${yTrig}`;
      }

      let dEmis = `M ${xStart} ${yEmis}`;
      if (liveX >= tBurstStart) {
        dEmis += ` L ${tBurstStart} ${yEmis}`;
        const cyclesToDraw = Math.min(8, Math.floor((liveX - tBurstStart) / 6.5));
        for (let i = 0; i < cyclesToDraw; i++) {
          const px = tBurstStart + (i * 6.5);
          dEmis += ` L ${px} ${yEmisHigh} L ${px + 3.25} ${yEmisHigh} L ${px + 3.25} ${yEmis} L ${px + 6.5} ${yEmis}`;
        }
        dEmis += ` L ${xEnd} ${yEmis}`;
      } else {
        dEmis += ` L ${xEnd} ${yEmis}`;
      }

      let dRecep = `M ${xStart} ${yRecep}`;
      if (target.inRange && liveTimingRef.current.echoFinished) {
        dRecep += ` L ${tEchoEnd} ${yRecep}`;
        const rxCount = Math.floor(liveTimingRef.current.rxProgress);
        for (let i = 0; i < rxCount; i++) {
          const rx = tEchoEnd + (i * 6.5);
          dRecep += ` L ${rx} ${yRecepHigh} L ${rx + 3.25} ${yRecepHigh} L ${rx + 3.25} ${yRecep} L ${rx + 6.5} ${yRecep}`;
        }
        dRecep += ` L ${xEnd} ${yRecep}`;
      } else {
        dRecep += ` L ${xEnd} ${yRecep}`;
      }

      let dEcho = `M ${xStart} ${yEcho} L ${tBurstEnd} ${yEcho}`;
      if (liveX >= tBurstEnd) {
        if (liveTimingRef.current.echoFinished) {
          dEcho += ` L ${tBurstEnd} ${yEchoHigh} L ${tEchoEnd} ${yEchoHigh} L ${tEchoEnd} ${yEcho} L ${xEnd} ${yEcho}`;
        } else {
          dEcho += ` L ${tBurstEnd} ${yEchoHigh} L ${liveX} ${yEchoHigh} L ${liveX} ${yEcho} L ${xEnd} ${yEcho}`;
        }
      } else {
        dEcho += ` L ${xEnd} ${yEcho}`;
      }

      const textMidX = liveTimingRef.current.echoFinished ? (tBurstEnd + tEchoEnd) / 2 : (tBurstEnd + liveX) / 2;

      return (
        <g>
          <path d={dTrig} fill="none" stroke="#2563eb" strokeWidth="1.8" />
          {liveX >= tTrigEnd && (
            <text x={(tTrigStart + tTrigEnd)/2} y={yTrigHigh - 6} fill="#d97706" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">&gt;10µs</text>
          )}

          <path d={dEmis} fill="none" stroke="#2563eb" strokeWidth="1.6" />
          {liveX >= tBurstEnd && (
            <text x={(tBurstStart + tBurstEnd)/2 + 10} y={yEmisHigh - 6} fill="#d97706" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="600" textAnchor="middle">Onda sonora 8 pulsos a 40KHz</text>
          )}

          <path d={dRecep} fill="none" stroke="#2563eb" strokeWidth="1.6" />
          {target.inRange && liveTimingRef.current.echoFinished && (
            <text x={tEchoEnd + 26} y={yRecepHigh - 6} fill="#d97706" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="600" textAnchor="middle">Llegada onda reflejada</text>
          )}

          <path d={dEcho} fill="none" stroke="#2563eb" strokeWidth="1.8" />
          {liveX >= (tBurstEnd + 35) && (
            <text x={textMidX} y={yEchoHigh - 6} fill="#d97706" fontSize="10.5" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="middle">{target.inRange ? 'Tiempo de ida y vuelta' : 'Timeout (>38ms sin eco)'}</text>
          )}

          {liveTimingRef.current.echoFinished && target.inRange && (
            <line x1={tEchoEnd} y1={yRecepHigh + 4} x2={tEchoEnd} y2={yEcho} stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
          )}

          <line x1={liveX} y1="18" x2={liveX} y2="235" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.85" />
          <circle cx={liveX} cy="235" r="3.5" fill="#10b981" />
        </g>
      );
    }
  };

  const angleSign = target.angleDeg > 0 ? '+' : '';

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: '20px',
        padding: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)'
      }}
      className="w-full select-none"
    >
      {/* STRICT 2-COLUMN SIDE-BY-SIDE LAYOUT (SENSOR & DIAGRAM ON LEFT 58%, CODE ON RIGHT 40%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '1rem',
          width: '100%',
          alignItems: 'start'
        }}
      >

        {/* COLUMNA IZQUIERDA: ESPACIO ACÚSTICO (SENSOR) + DIAGRAMA DE TIEMPOS DEBAJO */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
            minWidth: 0
          }}
        >

          {/* TARJETA 1: ESPACIO ACÚSTICO (SENSOR Y PROPAGACIÓN DE ONDAS) */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#cbd5e1',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* HEADER CON TÍTULO LIMPIO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ backgroundColor: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bae6fd', fontSize: '18px', flexShrink: 0 }}>
                🛰️
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
                  PROPAGACIÓN ACÚSTICA • HC-SR04
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                  Arrastre 2D • Conos centrados • Rebote recto horizontal
                </div>
              </div>
            </div>

            {/* BARRA DE BOTONES DE ACCIÓN (CÁMARA LENTA, PULSO ÚNICO, CONTINUO) EN FILA PROPIA */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleToggleSlowMo}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: isSlowMo ? 700 : 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: '1px solid ' + (isSlowMo ? '#f59e0b' : '#cbd5e1'),
                  backgroundColor: isSlowMo ? '#fef3c7' : '#f8fafc',
                  color: isSlowMo ? '#78350f' : '#334155',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: '#f59e0b', fontSize: '11px' }}>▶</span>
                <span>Cámara Lenta</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerSinglePulse}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: '#0284c7', fontSize: '11px' }}>📢</span>
                <span>Pulso Único</span>
              </button>

              <button
                type="button"
                onClick={handleToggleContinuous}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: '1px solid ' + (isContinuous ? '#0369a1' : '#cbd5e1'),
                  backgroundColor: isContinuous ? '#0284c7' : '#f1f5f9',
                  color: isContinuous ? '#ffffff' : '#334155',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '11px' }}>🔄</span>
                <span>{isContinuous ? "Continuo" : "Pausado"}</span>
              </button>
            </div>

            {/* VIEWPORT SVG */}
            <div
              className="relative w-full h-[255px] rounded-xl border overflow-hidden flex items-center justify-center shadow-inner select-none cursor-crosshair"
              style={{
                backgroundColor: '#fafbfc',
                borderColor: '#cbd5e1',
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1.1px, transparent 1.1px)',
                backgroundSize: '18px 18px'
              }}
            >
              <svg
                ref={svgRef}
                id="acoustic-svg"
                viewBox="0 0 700 240"
                className="w-full h-full select-none"
                onMouseDown={handleCanvasStart}
                onMouseMove={handleCanvasMove}
                onMouseUp={handleCanvasEnd}
                onTouchStart={handleCanvasStart}
                onTouchMove={handleCanvasMove}
                onTouchEnd={handleCanvasEnd}
              >
                <defs>
                  <filter id="cleanShadow" x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.10" />
                  </filter>

                  {/* Cono 15° Precisión */}
                  <linearGradient id="gradientPrecBeam" x1="100%" y1="50%" x2="0%" y2="50%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
                  </linearGradient>

                  {/* Cono 30° Detección */}
                  <linearGradient id="gradientDetBeam" x1="100%" y1="50%" x2="0%" y2="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.20" />
                    <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.02" />
                  </linearGradient>

                  <linearGradient id="metalBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="35%" stopColor="#e2e8f0" />
                    <stop offset="70%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>

                  <radialGradient id="meshGrad" cx="45%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#52525b" />
                    <stop offset="60%" stopColor="#3f3f46" />
                    <stop offset="100%" stopColor="#27272a" />
                  </radialGradient>

                  <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>

                  <radialGradient id="targetGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="60%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </radialGradient>
                </defs>

                {/* HAZ ACÚSTICO CENTRADO EN Y=120 */}
                <g id="acoustic-field-layer">
                  <path id="cone-detection-path" d={createTruncatedConePath(RAD_DET)} fill="url(#gradientDetBeam)" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.85" />
                  <path id="cone-precision-path" d={createTruncatedConePath(RAD_PREC)} fill="url(#gradientPrecBeam)" stroke="#0284c7" strokeWidth="1.4" strokeDasharray="4,3" opacity="0.95" />
                  <line id="center-axis-line" x1="568" y1="120" x2="20" y2="120" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                </g>

                {/* CAPAS DINÁMICAS DE ONDAS */}
                <g id="waves-outgoing-layer"></g>
                <g id="waves-echo-layer"></g>

                {/* SENSOR HC-SR04 A LA DERECHA */}
                <g id="sensor-module-svg" transform="translate(568, 10)" filter="url(#cleanShadow)">
                  <rect x="0" y="0" width="115" height="220" rx="10" fill="#0e3d6b" stroke="#082949" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="4.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.4" />
                  <circle cx="105" cy="10" r="4.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.4" />
                  <circle cx="10" cy="210" r="4.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.4" />
                  <circle cx="105" cy="210" r="4.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.4" />

                  {/* Cristal oscilador */}
                  <g transform="translate(10, 97.5)">
                    <rect x="0" y="0" width="13" height="25" rx="6.5" fill="url(#crystalGrad)" stroke="#475569" strokeWidth="1.1" />
                    <rect x="2" y="2" width="9" height="21" rx="4.5" fill="#cbd5e1" opacity="0.65" />
                    <text x="7" y="13" fill="#1e293b" fontSize="6.2" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle" transform="rotate(-90 7 13)">4.000</text>
                  </g>

                  {/* Transductor T */}
                  <g transform="translate(46, 56)">
                    <circle cx="0" cy="0" r="32" fill="url(#metalBezel)" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="28" fill="#e2e8f0" />
                    <circle cx="0" cy="0" r="22.5" fill="#8a8d2e" stroke="#68680c" strokeWidth="1.4" />
                    <circle cx="0" cy="0" r="16.5" fill="url(#meshGrad)" stroke="#18181b" strokeWidth="1.2" />
                    <circle id="glow-led-t" cx="0" cy="0" r="13" fill="#38bdf8" opacity="0.0" />
                    <circle cx="0" cy="0" r="5" fill="#18181b" opacity="0.3" />
                  </g>
                  <text x="14" y="32" fill="#ffffff" fontSize="13" fontFamily="'Inter', sans-serif" fontWeight="800">T</text>

                  {/* Serigrafía */}
                  <g transform="translate(39, 115)">
                    <text x="0" y="0" fill="#cbd5e1" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="1" textAnchor="middle" opacity="0.88" transform="rotate(-90 0 0)">HC-SR04</text>
                  </g>

                  {/* Transductor R */}
                  <g transform="translate(46, 164)">
                    <circle cx="0" cy="0" r="32" fill="url(#metalBezel)" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="28" fill="#e2e8f0" />
                    <circle cx="0" cy="0" r="22.5" fill="#8a8d2e" stroke="#68680c" strokeWidth="1.4" />
                    <circle cx="0" cy="0" r="16.5" fill="url(#meshGrad)" stroke="#18181b" strokeWidth="1.2" />
                    <circle id="glow-led-r" cx="0" cy="0" r="13" fill="#34d399" opacity="0.0" />
                    <circle cx="0" cy="0" r="5" fill="#18181b" opacity="0.3" />
                  </g>
                  <text x="14" y="200" fill="#ffffff" fontSize="13" fontFamily="'Inter', sans-serif" fontWeight="800">R</text>

                  {/* Terminales */}
                  <g transform="translate(108, 90)">
                    <text x="-9" y="3.5" fill="#ffffff" fontSize="8" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">Vcc</text>
                    <ellipse cx="0" cy="0" rx="3.5" ry="2.6" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="3.5" y1="0" x2="32" y2="0" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <g transform="translate(108, 106)">
                    <text x="-9" y="3.5" fill="#ffffff" fontSize="8" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">TRIG</text>
                    <ellipse cx="0" cy="0" rx="3.5" ry="2.6" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="3.5" y1="0" x2="32" y2="0" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <g transform="translate(108, 122)">
                    <text x="-9" y="3.5" fill="#ffffff" fontSize="8" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">ECHO</text>
                    <ellipse cx="0" cy="0" rx="3.5" ry="2.6" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="3.5" y1="0" x2="32" y2="0" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <g transform="translate(108, 138)">
                    <text x="-9" y="3.5" fill="#ffffff" fontSize="8" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">GND</text>
                    <ellipse cx="0" cy="0" rx="3.5" ry="2.6" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="3.5" y1="0" x2="32" y2="0" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                  </g>
                </g>

                {/* OBJETIVO LIBREMENTE ARRASTRABLE EN TODO EL SVG */}
                <g id="target-anchor" transform={`translate(${target.x.toFixed(1)}, ${target.y.toFixed(1)})`} className="cursor-grab active:cursor-grabbing">
                  <circle cx="0" cy="0" r="30" fill="transparent" />
                  <circle id="target-hit-wave" cx="0" cy="0" r="16" fill="none" stroke="#0284c7" strokeWidth="2.5" opacity="0.0" />
                  <circle cx="0" cy="0" r="17" fill="#0284c7" opacity="0.18" />
                  <rect x="-14" y="-10" width="28" height="20" rx="6" fill="url(#targetGrad)" stroke="#ffffff" strokeWidth="2" filter="url(#cleanShadow)" />
                  <circle cx="0" cy="0" r="3.2" fill="#ffffff" />
                  <g id="target-tag" transform="translate(0, -18)">
                    <rect x="-32" y="-10" width="64" height="17" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" filter="url(#cleanShadow)" />
                    <text id="tag-distance-text" x="0" y="2" fill="#0369a1" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">{target.distCm.toFixed(1)} cm</text>
                  </g>
                </g>

              </svg>
            </div>

            {/* CONTROLES DESLIZANTES COMPACTOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '12px' }}>
              <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '12px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#334155', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                    ↔ Distancia (X)
                  </span>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#075985', borderColor: '#bae6fd', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    {target.distCm.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="400.0"
                  step="0.5"
                  value={target.distCm}
                  onChange={(e) => updateTargetState(parseFloat(e.target.value), target.angleDeg)}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div style={{ color: '#94a3b8', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>2.0 cm</span>
                  <span>200 cm</span>
                  <span>400.0 cm</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '12px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#334155', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                    🧭 Desviación (Y)
                  </span>
                  <span style={
                    target.zone === 'precision'
                      ? { backgroundColor: '#e0f2fe', color: '#075985', borderColor: '#bae6fd', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }
                      : target.zone === 'detection'
                        ? { backgroundColor: '#f0f9ff', color: '#0369a1', borderColor: '#7dd3fc', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '6px', border: '1px solid #7dd3fc' }
                        : { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fecdd3', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecdd3' }
                  }>
                    {angleSign}{target.angleDeg.toFixed(1)}° ({target.zone === 'precision' ? 'Precisión 15°' : target.zone === 'detection' ? 'Detección 30°' : 'Fuera de Cono'})
                  </span>
                </div>
                <input
                  type="range"
                  min="-60.0"
                  max="60.0"
                  step="0.5"
                  value={target.angleDeg}
                  onChange={(e) => updateTargetState(target.distCm, parseFloat(e.target.value))}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div style={{ color: '#94a3b8', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>-60° (Arriba)</span>
                  <span>0.0°</span>
                  <span>+60° (Abajo)</span>
                </div>
              </div>
            </div>

          </section>

          {/* TARJETA 2 DEBAJO DEL SENSOR: DIAGRAMA DE TIEMPOS (GRÁFICOS) */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#cbd5e1',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* HEADER DEL DIAGRAMA DE TIEMPOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📈</span>
                <div style={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
                  DIAGRAMA TEMPORAL DE PULSOS (TIMING DIAGRAM)
                </div>
              </div>

              {/* SELECTOR DE CICLOS & BADGES EN FILA PROPIA */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3px', padding: '3px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <button
                    type="button"
                    onClick={() => handleSetCycleCount(1)}
                    style={{
                      backgroundColor: cycleCount === 1 ? '#ffffff' : 'transparent',
                      color: cycleCount === 1 ? '#0369a1' : '#475569',
                      fontWeight: cycleCount === 1 ? 800 : 600,
                      padding: '4px 10px',
                      borderRadius: '7px',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: cycleCount === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    1 Ciclo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCycleCount(2)}
                    style={{
                      backgroundColor: cycleCount === 2 ? '#ffffff' : 'transparent',
                      color: cycleCount === 2 ? '#0369a1' : '#475569',
                      fontWeight: cycleCount === 2 ? 800 : 600,
                      padding: '4px 10px',
                      borderRadius: '7px',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: cycleCount === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    2 Ciclos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCycleCount('live')}
                    style={{
                      backgroundColor: cycleCount === 'live' ? '#ecfdf5' : 'transparent',
                      color: cycleCount === 'live' ? '#047857' : '#475569',
                      fontWeight: cycleCount === 'live' ? 800 : 600,
                      padding: '4px 10px',
                      borderRadius: '7px',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      border: cycleCount === 'live' ? '1px solid #6ee7b7' : 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                    En Vivo
                  </button>
                </div>

                <span style={{ backgroundColor: '#f0f9ff', color: '#075985', borderColor: '#bae6fd', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, padding: '4px 10px', borderRadius: '8px', border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                  Trigger • Emisor 40kHz • Receptor • Echo
                </span>
              </div>
            </div>

            {/* VIEWPORT DEL DIAGRAMA TEMPORAL */}
            <div style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '4px', overflowX: 'auto' }}>
              <svg id="timing-diagram-svg" viewBox="0 0 740 250" className="w-full h-[220px] overflow-visible">
                
                <line x1="85" y1="16" x2="85" y2="235" stroke="#d97706" strokeWidth="1.3" opacity="0.85" />
                <line x1="85" y1="235" x2="710" y2="235" stroke="#d97706" strokeWidth="1.3" opacity="0.85" />
                <polygon points="710,232 718,235 710,238" fill="#d97706" opacity="0.85" />
                <text x="722" y="238" fill="#d97706" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="700">t</text>

                <text x="75" y="48" fill="#d97706" fontSize="11.5" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">Trigger</text>
                <text x="75" y="100" fill="#d97706" fontSize="11.5" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">Emisor</text>
                <text x="75" y="154" fill="#d97706" fontSize="11.5" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">Receptor</text>
                <text x="75" y="210" fill="#d97706" fontSize="11.5" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="end">Echo</text>

                <g id="diag-dynamic-cycles">
                  {renderTimingDiagramContent()}
                </g>
              </svg>
            </div>

            <div style={{ borderColor: '#e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', fontSize: '11.5px', fontFamily: "'JetBrains Mono', monospace", paddingTop: '10px', marginTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <span style={
                target.zone === 'precision'
                  ? { color: '#075985', fontWeight: 'bold' }
                  : target.zone === 'detection'
                    ? { color: '#0369a1', fontWeight: 'bold' }
                    : { color: '#e11d48', fontWeight: 'bold' }
              }>
                {target.zone === 'precision'
                  ? "Eco Válido • Cono 15° (Alta Precisión)"
                  : target.zone === 'detection'
                    ? "Eco Periférico • Cono 30° (Detección General)"
                    : "Fuera de Rango (> 30° o Límite de Distancia)"}
              </span>
              <span style={{ color: '#64748b' }}>
                Duración ToF: <strong style={{ color: '#075985', fontWeight: 'bold' }}>{target.inRange ? `${target.timeUs} µs` : '> 38000 µs (Timeout)'}</strong> (t = 2d / 0.0343 cm/µs)
              </span>
            </div>

          </section>

        </div>

        {/* COLUMNA DERECHA: FIRMWARE ARDUINO C++ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 0
          }}
        >
          <section
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#cbd5e1',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f87171', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}></span>
                <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", marginLeft: '8px' }}>
                  💻 hcsr04_distance.ino
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsSerialOpen(prev => !prev)}
                style={{
                  backgroundColor: '#f0f9ff',
                  color: '#075985',
                  borderColor: '#7dd3fc',
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  border: '1px solid #7dd3fc',
                  cursor: 'pointer'
                }}
              >
                🖥️ Monitor Serie
              </button>
            </div>

            <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', lineHeight: '1.65', overflowX: 'auto' }}>
              <div className="space-y-0.5">
                <span className="text-slate-400">// Medición acústica Time-of-Flight</span><br />
                <span className="text-purple-600 font-bold">const int</span> pinTrig = <span className="text-amber-600 font-bold">3</span>;<br />
                <span className="text-purple-600 font-bold">const int</span> pinEcho = <span className="text-amber-600 font-bold">2</span>;<br />
                <span className="text-purple-600 font-bold">long</span> duracionUs;<br />
                <span className="text-purple-600 font-bold">float</span> distanciaCm;<br />
                <br />
                <span className="text-purple-600 font-bold">void</span> <span className="text-blue-600 font-bold">setup</span>() &#123;<br />
                &nbsp;&nbsp;<span className="text-blue-600 font-bold">pinMode</span>(pinTrig, <span className="text-cyan-600 font-bold">OUTPUT</span>);<br />
                &nbsp;&nbsp;<span className="text-blue-600 font-bold">pinMode</span>(pinEcho, <span className="text-cyan-600 font-bold">INPUT</span>);<br />
                &nbsp;&nbsp;<span className="text-blue-600 font-bold">Serial</span>.<span className="text-blue-600 font-bold">begin</span>(<span className="text-amber-600 font-bold">9600</span>);<br />
                &#125;<br />
                <br />
                <span className="text-purple-600 font-bold">void</span> <span className="text-blue-600 font-bold">loop</span>() &#123;<br />
                &nbsp;&nbsp;<span className="text-slate-400">// 1. Disparo de 10µs en TRIG</span><br />
                &nbsp;&nbsp;<span className="text-blue-600 font-bold">digitalWrite</span>(pinTrig, <span className="text-slate-500 font-bold">LOW</span>);<br />
                &nbsp;&nbsp;<span className="text-blue-600 font-bold">delayMicroseconds</span>(<span className="text-amber-600 font-bold">2</span>);<br />
                <div id="code-trig-pulse" style={{ backgroundColor: '#f0f9ff', borderColor: '#38bdf8', color: '#0369a1', padding: '4px 6px', borderRadius: '6px', borderLeft: '3px solid #38bdf8', margin: '4px 0' }}>
                  &nbsp;&nbsp;<span className="text-blue-600 font-bold">digitalWrite</span>(pinTrig, <span className="text-cyan-700 font-bold">HIGH</span>);<br />
                  &nbsp;&nbsp;<span className="text-blue-600 font-bold">delayMicroseconds</span>(<span className="text-amber-600 font-bold">10</span>);<br />
                  &nbsp;&nbsp;<span className="text-blue-600 font-bold">digitalWrite</span>(pinTrig, <span className="text-slate-500 font-bold">LOW</span>);
                </div>
                <br />
                &nbsp;&nbsp;<span className="text-slate-400">// 2. Medir duración del pulso con pulseIn()</span><br />
                <div id="code-echo-read" style={{ backgroundColor: '#ecfdf5', borderColor: '#34d399', color: '#065f46', padding: '4px 6px', borderRadius: '6px', borderLeft: '3px solid #34d399', margin: '4px 0' }}>
                  &nbsp;&nbsp;duracionUs = <span className="text-blue-600 font-bold">pulseIn</span>(pinEcho, <span className="text-cyan-700 font-bold">HIGH</span>, <span className="text-amber-600 font-bold">38000</span>);<br />
                  &nbsp;&nbsp;distanciaCm = (duracionUs * <span className="text-amber-600 font-bold">0.0343</span>) / <span className="text-amber-600 font-bold">2.0</span>;
                </div>
                <br />
                <div style={
                  target.inRange
                    ? { backgroundColor: '#ecfdf5', borderColor: '#10b981', color: '#065f46', padding: '6px 8px', borderRadius: '8px', borderLeft: '4px solid #10b981', margin: '4px 0' }
                    : { opacity: 0.35, padding: '6px 8px', margin: '4px 0' }
                }>
                  &nbsp;&nbsp;<span className="text-purple-600 font-bold">if</span> (distanciaCm &gt;= <span className="text-amber-600 font-bold">2.0</span> &amp;&amp; distanciaCm &lt;= <span className="text-amber-600 font-bold">400.0</span>) &#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600 font-bold">Serial</span>.<span className="text-blue-600 font-bold">print</span>(<span className="text-emerald-700 font-bold">"Distancia: "</span>);<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600 font-bold">Serial</span>.<span className="text-blue-600 font-bold">print</span>(distanciaCm);<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600 font-bold">Serial</span>.<span className="text-blue-600 font-bold">println</span>(<span className="text-emerald-700 font-bold">" cm"</span>);<br />
                  &nbsp;&nbsp;&#125;
                </div>
                <div style={
                  !target.inRange
                    ? { backgroundColor: '#fff1f2', borderColor: '#f43f5e', color: '#881337', padding: '6px 8px', borderRadius: '8px', borderLeft: '4px solid #f43f5e', margin: '4px 0' }
                    : { opacity: 0.35, padding: '6px 8px', margin: '4px 0' }
                }>
                  &nbsp;&nbsp;<span className="text-purple-600 font-bold">else</span> &#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600 font-bold">Serial</span>.<span className="text-blue-600 font-bold">println</span>(<span className="text-slate-400 font-bold">"Fuera de rango (Sin eco)"</span>);<br />
                  &nbsp;&nbsp;&#125;
                </div>
                &nbsp;&nbsp;<span className="text-blue-600 font-bold">delay</span>(<span className="text-amber-600 font-bold">60</span>);<br />
                &#125;
              </div>
            </div>

          </section>
        </div>

      </div>

      {/* VENTANA FLOTANTE DEL MONITOR SERIE */}
      {isSerialOpen && (
        <div
          id="floating-serial-modal" 
          className="fixed z-50 w-80 sm:w-96 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 shadow-2xl overflow-hidden font-mono text-[11px]"
          style={{ top: `${modalPos.y}px`, left: `${modalPos.x}px` }}
        >
          <div
            id="modal-drag-header" 
            onMouseDown={handleModalHeaderMouseDown}
            onTouchStart={handleModalHeaderMouseDown}
            className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between cursor-move select-none"
          >
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <span>🖥️</span>
              <span>Monitor Serie (COM3 @ 9600)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSerialLogs([])}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setIsSerialOpen(false)}
                className="text-slate-400 hover:text-rose-400 px-1 py-0.5 rounded cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            ref={serialTerminalRef}
            id="serial-terminal"
            className="p-3 h-52 overflow-y-auto space-y-1 bg-slate-950 font-mono text-[11px]"
          >
            {serialLogs.map(log => (
              <div
                key={log.id}
                className={
                  log.type === 'data'
                    ? 'text-emerald-400'
                    : log.type === 'warning'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                }
              >
                {log.text}
              </div>
            ))}
          </div>

          <div className="bg-slate-800/80 px-3 py-1.5 border-t border-slate-800 text-[9.5px] text-slate-400 flex items-center justify-between">
            <span>Autoscroll activo</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Conectado
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
