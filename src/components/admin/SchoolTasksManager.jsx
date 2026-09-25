import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check, FileText, Edit3, Calendar, Bot, Settings, Mail } from 'lucide-react';
import './SchoolTasksManager.css';

const DEFAULT_TASKS = [
  {
    id: "task-1",
    title: "Subir calificaciones del Módulo 1 de Electricidad",
    desc: "Cargar notas de laboratorios y quices de Ley de Ohm y Ley de Watt al sistema.",
    done: false,
    iconType: "doc"
  },
  {
    id: "task-2",
    title: "Revisar entregas de simulador 3D (Piezas de Ajedrez)",
    desc: "Evaluar las mallas 3D de Peón, Torre y Alfil diseñadas en Blender por los alumnos.",
    done: false,
    iconType: "sim"
  },
  {
    id: "task-3",
    title: "Publicar Examen Oficial de Cierre de Módulo",
    desc: "Programar temporizador, llaves de evaluación y habilitar la sala de espera en vivo.",
    done: false,
    iconType: "pen"
  },
  {
    id: "task-4",
    title: "Planificar salida pedagógica y talleres STEAM",
    desc: "Coordinar itinerario de visitas escolares del Semillero SIMI3D para la próxima semana.",
    done: false,
    iconType: "calendar"
  },
  {
    id: "task-5",
    title: "Aprobar solicitudes de acceso de estudiantes",
    desc: "Gestionar cola de registro pendiente y auto-inscribir alumnos a los grupos correspondientes.",
    done: false,
    iconType: "mail"
  },
  {
    id: "task-6",
    title: "Estructurar Hackatón de Inteligencia Artificial",
    desc: "Diseñar la logística y los retos de herramientas pedagógicas con IA para 9° a 11°.",
    done: false,
    iconType: "robot"
  },
  {
    id: "task-7",
    title: "Calibrar impresoras 3D y preparar carretes de PLA",
    desc: "Verificar boquillas FDM, nivelar camas y alistar consumibles en el espacio SIMI3D.",
    done: false,
    iconType: "sim"
  }
];

const STORAGE_KEY = "saberlab_school_tasks_v5";

function loadSavedTasks() {
  if (typeof window === 'undefined') return DEFAULT_TASKS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn("Error leyendo tareas de localStorage", e);
    }
  }
  const freshCopy = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(freshCopy));
  return freshCopy;
}

export const SchoolTasksManager = () => {
  const [tasks, setTasks] = useState(() => loadSavedTasks());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animatingId, setAnimatingId] = useState(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIconType, setNewIconType] = useState('doc');

  const cardsRef = useRef({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Error guardando tareas", e);
    }
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.done);
  const pendingTasks = tasks.filter(t => !t.done);
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const handleToggleTask = (id) => {
    if (animatingId) return;

    const cardEl = cardsRef.current[id];
    if (cardEl) {
      setAnimatingId(id);
      const initialRect = cardEl.getBoundingClientRect();

      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

      setTimeout(() => {
        const targetEl = cardsRef.current[id];
        if (targetEl) {
          const finalRect = targetEl.getBoundingClientRect();
          const deltaX = initialRect.left - finalRect.left;
          const deltaY = initialRect.top - finalRect.top;

          targetEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.96)`;
          targetEl.style.transition = 'none';
          targetEl.style.zIndex = '30';

          requestAnimationFrame(() => {
            targetEl.style.transition = 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)';
            targetEl.style.transform = 'translate(0px, 0px) scale(1)';

            setTimeout(() => {
              targetEl.style.transition = '';
              targetEl.style.transform = '';
              targetEl.style.zIndex = '';
              setAnimatingId(null);
            }, 420);
          });
        } else {
          setAnimatingId(null);
        }
      }, 50);
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const handleDeleteTask = (id, e) => {
    if (e) e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleRestoreDefaults = () => {
    const freshCopy = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    setTasks(freshCopy);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const newTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      title: title,
      desc: newDesc.trim() || "Sin detalles adicionales.",
      done: false,
      iconType: newIconType || "doc"
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setNewIconType('doc');
    setIsModalOpen(false);
  };

  const getTaskIcon = (type, isCompleted) => {
    const baseStyle = isCompleted 
      ? "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20" 
      : "text-sky-500 bg-sky-500/10 border border-sky-500/20";

    const containerStyle = `w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${baseStyle}`;

    switch (type) {
      case "pen":
        return (
          <div className={containerStyle}>
            <Edit3 size={17} />
          </div>
        );
      case "calendar":
        return (
          <div className={containerStyle}>
            <Calendar size={17} />
          </div>
        );
      case "robot":
        return (
          <div className={containerStyle}>
            <Bot size={17} />
          </div>
        );
      case "mail":
        return (
          <div className={containerStyle}>
            <Mail size={17} />
          </div>
        );
      case "sim":
        return (
          <div className={containerStyle}>
            <Settings size={17} />
          </div>
        );
      default:
        return (
          <div className={containerStyle}>
            <FileText size={17} />
          </div>
        );
    }
  };

  return (
    <div className="saberlab-tasks-wrapper animate-fade-in">
      {/* ── BARRA DE CONTROL SUPERIOR (SIN DUPLICACIÓN DE ENCABEZADO) ── */}
      <div className="saberlab-tasks-toolbar">
        <div className="saberlab-toolbar-left">
          <div className="saberlab-progress-info">
            <div className="saberlab-progress-label-row">
              <span>Progreso de Tareas Docentes</span>
              <span className="saberlab-progress-badge">
                {completedCount} / {totalTasks} ({progressPercent}%)
              </span>
            </div>
            <div className="saberlab-progress-track">
              <div
                className="saberlab-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="saberlab-add-task-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} strokeWidth={3} />
            <span>NUEVA TAREA</span>
          </button>
        </div>
      </div>

      {/* ── GRID DE 2 COLUMNAS ── */}
      <div className="saberlab-tasks-grid">
        {/* COLUMNA IZQUIERDA: PENDIENTES */}
        <section className="saberlab-task-column">
          <div className="saberlab-col-header">
            <div className="saberlab-col-title-group">
              <span className="saberlab-dot pending" />
              <h2 className="saberlab-col-title">TAREAS PENDIENTES</h2>
              <span className="saberlab-count-pill">{pendingCount}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary, #94a3b8)', fontWeight: 500 }}>
              Toca para completar
            </span>
          </div>

          <div className="saberlab-cards-list">
            {pendingTasks.length === 0 ? (
              <div className="saberlab-empty-box">
                <span className="saberlab-empty-icon">🎉</span>
                <p className="saberlab-empty-msg">¡No tienes tareas pendientes!</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <div
                  key={task.id}
                  ref={el => cardsRef.current[task.id] = el}
                  className="saberlab-task-card"
                  onClick={() => handleToggleTask(task.id)}
                >
                  {getTaskIcon(task.iconType, false)}

                  <div style={{ flex: 1, minWidth: 0, paddingRight: '1.25rem' }}>
                    <h3 className="saberlab-task-title">{task.title}</h3>
                    <p className="saberlab-task-desc">{task.desc}</p>
                  </div>

                  <button
                    type="button"
                    className="saberlab-card-check-btn"
                    title="Marcar como listo"
                  >
                    <Check className="saberlab-check-icon" strokeWidth={3} />
                  </button>

                  <button
                    type="button"
                    className="saberlab-card-del-btn"
                    title="Eliminar tarea"
                    onClick={(e) => handleDeleteTask(task.id, e)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* COLUMNA DERECHA: REALIZADOS */}
        <section className="saberlab-task-column">
          <div className="saberlab-col-header">
            <div className="saberlab-col-title-group">
              <span className="saberlab-dot completed" />
              <h2 className="saberlab-col-title">REALIZADOS</h2>
              <span className="saberlab-count-pill completed">{completedCount}</span>
            </div>
            <button
              type="button"
              className="saberlab-restore-link"
              onClick={handleRestoreDefaults}
              title="Restaurar lista por defecto"
            >
              Restaurar lista original
            </button>
          </div>

          <div className="saberlab-cards-list">
            {completedTasks.length === 0 ? (
              <div className="saberlab-empty-box">
                <span className="saberlab-empty-icon">⏳</span>
                <p className="saberlab-empty-msg">Las tareas completadas aparecerán aquí.</p>
              </div>
            ) : (
              completedTasks.map(task => (
                <div
                  key={task.id}
                  ref={el => cardsRef.current[task.id] = el}
                  className="saberlab-task-card-done"
                  onClick={() => handleToggleTask(task.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', width: '100%' }}>
                    <div className="saberlab-done-icon-box">
                      <Check size={18} color="#10b981" strokeWidth={3} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingRight: '1.25rem' }}>
                      <h3 className="saberlab-task-title">{task.title}</h3>
                      <p className="saberlab-task-desc">{task.desc}</p>
                    </div>

                    <button
                      type="button"
                      className="saberlab-card-del-btn"
                      title="Eliminar tarea"
                      onClick={(e) => handleDeleteTask(task.id, e)}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="saberlab-done-bar-track">
                    <div className="saberlab-done-bar-fill" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── MODAL PARA AGREGAR NUEVA TAREA ── */}
      {isModalOpen && (
        <div className="saberlab-task-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="saberlab-task-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="saberlab-task-modal-header">
              <h3 className="saberlab-task-modal-title">
                <span>📝</span> Nueva Tarea Escolar
              </h3>
              <button
                type="button"
                className="saberlab-task-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="saberlab-form-field">
                <label className="saberlab-form-label">Título del pendiente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Revisar notas de corte o entregar informe..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="saberlab-form-input"
                  autoFocus
                />
              </div>

              <div className="saberlab-form-field">
                <label className="saberlab-form-label">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Detalles de lo que debes realizar..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="saberlab-form-textarea"
                />
              </div>

              <div className="saberlab-form-field">
                <label className="saberlab-form-label">Tipo de Ícono</label>
                <select
                  value={newIconType}
                  onChange={(e) => setNewIconType(e.target.value)}
                  className="saberlab-form-select"
                >
                  <option value="doc">📄 Documentación y Notas</option>
                  <option value="pen">✏️ Redacción y Evaluaciones</option>
                  <option value="calendar">🗓️ Planificación de Clases y Salidas</option>
                  <option value="robot">🤖 Hackatón e Inteligencia Artificial</option>
                  <option value="sim">⚙️ Simulador y Laboratorios 3D</option>
                  <option value="mail">✉️ Reenvío y Solicitudes</option>
                </select>
              </div>

              <div className="saberlab-modal-actions">
                <button
                  type="button"
                  className="saberlab-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="saberlab-btn-submit">
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolTasksManager;
