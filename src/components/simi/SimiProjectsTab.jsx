import { useState, useEffect } from 'react';
import { Plus, X, Edit3, Trash2, Box } from 'lucide-react';
import { SIMI_PROJECTS } from '../../data/simiData';
import { api } from '../../lib/api';

// Subcomponente de Banco de Proyectos & Prototipos 3D (Editable para líder/admin)
export default function SimiProjectsTab({ isLeader, initialProjects, onProjectsChange }) {
    const [projects, setProjects] = useState(() => {
        if (initialProjects && initialProjects.length > 0) return initialProjects;
        const saved = localStorage.getItem('simi_projects_list');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return SIMI_PROJECTS;
    });

    useEffect(() => {
        if (initialProjects && initialProjects.length > 0) {
            setProjects(initialProjects);
        }
    }, [initialProjects]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Estados del formulario
    const [formTitle, setFormTitle] = useState('');
    const [formAuthor, setFormAuthor] = useState('');
    const [formStatus, setFormStatus] = useState('En Prototipado');
    const [formCadTool, setFormCadTool] = useState('Fusion 360');
    const [formMaterial, setFormMaterial] = useState('');
    const [formPrintTime, setFormPrintTime] = useState('');
    const [formWeightGrams, setFormWeightGrams] = useState(100);
    const [formDescription, setFormDescription] = useState('');

    const persistProjects = (updated) => {
        setProjects(updated);
        localStorage.setItem('simi_projects_list', JSON.stringify(updated));
        if (onProjectsChange) onProjectsChange(updated);
    };

    const handleOpenAdd = () => {
        setEditingProject(null);
        setFormTitle('');
        setFormAuthor('Semillero SIMI3D');
        setFormStatus('En Prototipado');
        setFormCadTool('Fusion 360');
        setFormMaterial('PLA+ / PETG');
        setFormPrintTime('5h 30m');
        setFormWeightGrams(120);
        setFormDescription('');
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (proj) => {
        setEditingProject(proj);
        setFormTitle(proj.title);
        setFormAuthor(proj.author || 'Semillero SIMI3D');
        setFormStatus(proj.status);
        setFormCadTool(proj.cadTool || proj.cad_tool || 'Fusion 360');
        setFormMaterial(proj.material || '');
        setFormPrintTime(proj.printTime || proj.print_time || '');
        setFormWeightGrams(proj.weightGrams || proj.weight_grams || 100);
        setFormDescription(proj.description || '');
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este proyecto del banco?')) {
            const updated = projects.filter(p => p.id !== id);
            persistProjects(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'delete-project', id }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local delete project:', err);
            }
        }
    };

    const handleSaveForm = async (e) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        const projectPayload = {
            title: formTitle,
            author: formAuthor || 'Semillero SIMI3D',
            status: formStatus,
            cadTool: formCadTool,
            cad_tool: formCadTool,
            material: formMaterial,
            printTime: formPrintTime,
            print_time: formPrintTime,
            weightGrams: Number(formWeightGrams),
            weight_grams: Number(formWeightGrams),
            description: formDescription
        };

        if (editingProject) {
            const updated = projects.map(p => p.id === editingProject.id ? {
                ...p,
                ...projectPayload
            } : p);
            persistProjects(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-project', id: editingProject.id, ...projectPayload }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local save project:', err);
            }
        } else {
            const newId = `proj-${Date.now()}`;
            const newProj = {
                id: newId,
                ...projectPayload
            };
            const updated = [newProj, ...projects];
            persistProjects(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-project', id: newId, ...projectPayload }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local add project:', err);
            }
        }

        setIsAddModalOpen(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Contenedor Superior del Banco de Proyectos */}
            <div className="simi-projects-header-card">
                <div className="simi-projects-header-info">
                    <div className="simi-projects-header-icon">
                        <Box size={22} />
                    </div>
                    <div>
                        <h3 className="simi-projects-header-title">
                            Banco de Proyectos & Prototipos 3D
                        </h3>
                        <p className="simi-projects-header-desc">
                            Modelos CAD, carcasas electrónicas, biomodelos y ensambles funcionales desarrollados en el semillero.
                        </p>
                    </div>
                </div>

                {isLeader && (
                    <button 
                        onClick={handleOpenAdd}
                        className="simi-desktop-add-btn simi-projects-add-btn"
                        title="Agregar Proyecto 3D"
                    >
                        <Plus size={16} /> Agregar Proyecto 3D
                    </button>
                )}
            </div>

            {/* Grid de Proyectos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {projects.map(proj => (
                    <div key={proj.id} className="simi-project-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span 
                                className={`simi-project-status-pill ${
                                    proj.status.includes('Completado') ? 'done' : 
                                    proj.status.includes('Ensayos') ? 'test' : 'dev'
                                }`}
                            >
                                {proj.status}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                                🛠️ {proj.cadTool}
                            </span>
                        </div>

                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                                {proj.title}
                            </h3>
                            {proj.author && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    👤 {proj.author}
                                </span>
                            )}
                        </div>

                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {proj.description}
                        </p>

                        <div className="simi-project-tech-box">
                            <div>
                                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>Material:</span>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>{proj.material}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>Peso / Tiempo:</span>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>{proj.weightGrams}g ({proj.printTime})</strong>
                            </div>
                        </div>

                        {isLeader && (
                            <div className="simi-project-footer-actions">
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    ID: <code>{proj.id}</code>
                                </span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button 
                                        className="simi-res-mini-btn edit"
                                        onClick={() => handleOpenEdit(proj)}
                                        title="Editar proyecto"
                                    >
                                        <Edit3 size={13} style={{ marginRight: '3px' }} /> Editar
                                    </button>
                                    <button 
                                        className="simi-res-mini-btn delete"
                                        onClick={() => handleDelete(proj.id)}
                                        title="Eliminar proyecto"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal para Agregar / Editar Proyecto */}
            {isAddModalOpen && (
                <div className="simi-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                    <div className="simi-modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
                        <div className="simi-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                    {editingProject ? '✏️ Editar Proyecto 3D' : '🚀 Registrar Nuevo Proyecto 3D'}
                                </h3>
                                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Ingresa los datos técnicos, software CAD y tiempos de manufactura aditiva.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="simi-modal-close-btn"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.35rem' }}>
                            <div className="simi-form-group">
                                <label className="simi-form-label">Nombre del Proyecto / Ensamble:</label>
                                <input 
                                    type="text" 
                                    className="simi-form-input" 
                                    placeholder="Ej: Brazo Robótico Articulado 4DOF..." 
                                    value={formTitle} 
                                    onChange={e => setFormTitle(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Software CAD / Herramienta:</label>
                                    <select 
                                        className="simi-form-input" 
                                        value={formCadTool} 
                                        onChange={e => setFormCadTool(e.target.value)}
                                    >
                                        <option value="Fusion 360">Fusion 360</option>
                                        <option value="Blender 4.x">Blender 4.x</option>
                                        <option value="Tinkercad">Tinkercad</option>
                                        <option value="SolidWorks">SolidWorks</option>
                                        <option value="Onshape">Onshape</option>
                                        <option value="Otro CAD">Otro CAD</option>
                                    </select>
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Estado del Proyecto:</label>
                                    <select 
                                        className="simi-form-input" 
                                        value={formStatus} 
                                        onChange={e => setFormStatus(e.target.value)}
                                    >
                                        <option value="En Prototipado">En Prototipado</option>
                                        <option value="Ensayos Mecánicos">Ensayos Mecánicos</option>
                                        <option value="Completado / Validado">Completado / Validado</option>
                                        <option value="Diseño Conceptual">Diseño Conceptual</option>
                                        <option value="Pausado">Pausado</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Responsable / Autor:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        placeholder="Ej: Línea de Robótica..." 
                                        value={formAuthor} 
                                        onChange={e => setFormAuthor(e.target.value)} 
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Material / Polímero:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        placeholder="Ej: PLA+, PETG, Resina UV..." 
                                        value={formMaterial} 
                                        onChange={e => setFormMaterial(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Tiempo de Impresión Est.:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        placeholder="Ej: 6h 30m..." 
                                        value={formPrintTime} 
                                        onChange={e => setFormPrintTime(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Peso Estimado (gramos):</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="simi-form-input" 
                                        value={formWeightGrams} 
                                        onChange={e => setFormWeightGrams(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">Descripción Técnica / Aplicación:</label>
                                <textarea 
                                    className="simi-form-input" 
                                    rows="2"
                                    placeholder="Detalles sobre rodamientos, tolerancias, inserciones roscadas..." 
                                    value={formDescription} 
                                    onChange={e => setFormDescription(e.target.value)} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
                                <button 
                                    type="button" 
                                    className="simi-res-mini-btn"
                                    onClick={() => setIsAddModalOpen(false)}
                                    style={{ padding: '8px 16px', borderRadius: '10px' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    style={{
                                        background: '#06b6d4',
                                        color: '#042f2e',
                                        border: 'none',
                                        padding: '8px 20px',
                                        borderRadius: '10px',
                                        fontWeight: 850,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.4)'
                                    }}
                                >
                                    {editingProject ? 'Guardar Cambios' : 'Registrar Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
