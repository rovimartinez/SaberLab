import React, { useState, useMemo } from 'react';
import { 
    Briefcase, Sparkles, Box, Cpu, Award, Flame, FlaskConical, 
    Layers, Wrench, AlertCircle, Rocket, Eye, EyeOff, Lock, Unlock, 
    Plus, Edit3, Trash2, CheckCircle2, MessageCircle, Calculator, 
    ChevronRight, ArrowRight, HelpCircle, ShieldCheck, Clock, Check, X
} from 'lucide-react';
import { api } from '../../lib/api';
import { SIMI_SERVICES_CATALOG } from '../../data/simiData';
import SimiQuoteModal from './SimiQuoteModal';
import '../../styles/SimiServices.css';

const ICON_MAP = {
    Box, Sparkles, Cpu, Award, Flame, FlaskConical, 
    Layers, Wrench, AlertCircle, Rocket, Briefcase
};

const CATEGORIES = [
    { id: 'all', label: 'Todos los Servicios', icon: Layers, color: '#06b6d4' },
    { id: 'capacitacion', label: '🎓 Capacitaciones STEAM', icon: Award, color: '#ec4899' },
    { id: 'fabricacion', label: '🖨️ Fabricación Digital', icon: Flame, color: '#eab308' },
    { id: 'mantenimiento', label: '🔧 Servicio Técnico', icon: Wrench, color: '#059669' }
];

export default function SimiServicesTab({
    isLeader = false,
    profile = null,
    initialServices = [],
    onServicesChange = () => {},
    isManageModeActive = false,
    onToggleManageMode
}) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [servicesList, setServicesList] = useState(() => {
        if (initialServices && initialServices.length > 0) return initialServices;
        const saved = localStorage.getItem('simi_services_list');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return SIMI_SERVICES_CATALOG;
    });

    // Sincronizar cambios entrantes si initialServices se actualiza desde backend
    React.useEffect(() => {
        if (initialServices && initialServices.length > 0) {
            setServicesList(initialServices);
        }
    }, [initialServices]);

    // Modal de Cotización Integral (Impresión 3D & Capacitaciones STEAM)
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [defaultQuoteTab, setDefaultQuoteTab] = useState('fabricacion'); // 'fabricacion' | 'capacitacion'

    // Modal de Detalles / Cotización / Acciones (Al dar clic en la tarjeta)
    const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);

    // Modal de Edición / Creación (Formulario para Docente / Líder)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Calculadora / Mini-Cotizador de Impresión 3D
    const [calcGrams, setCalcGrams] = useState(60);
    const [calcMaterial, setCalcMaterial] = useState('pla'); // 'pla', 'petg', 'tpu', 'resina'
    const [calcInfill, setCalcInfill] = useState(20);

    const MATERIAL_COSTS = {
        pla: { name: 'PLA+ Estándar', pricePerGram: 80, minOrder: 10000, tech: 'FDM' },
        petg: { name: 'PETG Mecánico', pricePerGram: 100, minOrder: 12000, tech: 'FDM' },
        tpu: { name: 'TPU Flexible 95A', pricePerGram: 140, minOrder: 15000, tech: 'FDM' },
        resina: { name: 'Resina Fotosensible UV 4K', pricePerGram: 180, minOrder: 20000, tech: 'SLA' }
    };

    const calculatedEstPrice = useMemo(() => {
        const mat = MATERIAL_COSTS[calcMaterial] || MATERIAL_COSTS.pla;
        const baseCost = calcGrams * mat.pricePerGram;
        return Math.max(mat.minOrder, Math.round(baseCost / 1000) * 1000);
    }, [calcGrams, calcMaterial]);

    // Ciclo de 3 Estados (Visible -> Bloqueado -> Oculto)
    const cycleServiceVisibility = async (serviceId, e) => {
        if (e) e.stopPropagation();
        const currentService = servicesList.find(s => s.id === serviceId);
        if (!currentService) return;

        const currentStatus = currentService.status || 'active';
        let nextStatus = 'active';
        if (currentStatus === 'active') nextStatus = 'locked';
        else if (currentStatus === 'locked') nextStatus = 'hidden';
        else if (currentStatus === 'hidden') nextStatus = 'active';

        const updated = servicesList.map(s => s.id === serviceId ? { 
            ...s, 
            status: nextStatus,
            isLocked: nextStatus === 'locked',
            isHidden: nextStatus === 'hidden'
        } : s);

        setServicesList(updated);
        localStorage.setItem('simi_services_list', JSON.stringify(updated));
        onServicesChange(updated);

        if (selectedServiceDetail && selectedServiceDetail.id === serviceId) {
            setSelectedServiceDetail(prev => ({ ...prev, status: nextStatus, isLocked: nextStatus === 'locked', isHidden: nextStatus === 'hidden' }));
        }

        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'toggle-service-status',
                    id: serviceId,
                    nextStatus
                }
            });
        } catch (err) {
            console.error('[SIMI Services] Error al cambiar estado en D1:', err);
        }
    };

    // Eliminar servicio
    const handleDeleteService = async (serviceId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('¿Estás seguro de eliminar este servicio del catálogo?')) return;

        const updated = servicesList.filter(s => s.id !== serviceId);
        setServicesList(updated);
        localStorage.setItem('simi_services_list', JSON.stringify(updated));
        onServicesChange(updated);
        setSelectedServiceDetail(null);

        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'delete-service',
                    id: serviceId
                }
            });
        } catch (err) {
            console.error('[SIMI Services] Error al eliminar servicio en D1:', err);
        }
    };

    // Abrir modal de edición/creación
    const handleOpenEditModal = (service = null, e = null) => {
        if (e) e.stopPropagation();
        if (service) {
            setEditingService({
                id: service.id,
                category: service.category || 'capacitacion',
                categoryLabel: service.categoryLabel || service.category_label || 'Capacitación STEAM',
                title: service.title || '',
                targetAudience: service.targetAudience || service.target_audience || '',
                description: service.description || '',
                features: Array.isArray(service.features) ? service.features : [],
                pricingInfo: service.pricingInfo || service.pricing_info || 'Cotización a convenir',
                status: service.status || 'active',
                iconKey: service.iconKey || service.icon_key || 'Box',
                color: service.color || '#06b6d4',
                badge: service.badge || '',
                featuresText: Array.isArray(service.features) ? service.features.join('\n') : ''
            });
        } else {
            setEditingService({
                id: `serv-${Date.now()}`,
                category: activeCategory !== 'all' ? activeCategory : 'capacitacion',
                categoryLabel: activeCategory === 'fabricacion' ? 'Fabricación Digital' : activeCategory === 'mantenimiento' ? 'Servicio Técnico' : 'Capacitación STEAM',
                title: '',
                targetAudience: '',
                description: '',
                features: [],
                pricingInfo: 'Cotización a convenir',
                status: 'active',
                iconKey: 'Box',
                color: '#06b6d4',
                badge: 'Nuevo Servicio',
                featuresText: 'Módulo formativo práctico\nMaterial y guías incluidas\nCertificado de participación'
            });
        }
        setIsEditModalOpen(true);
    };

    // Guardar servicio en D1
    const handleSaveService = async (e) => {
        e.preventDefault();
        if (!editingService.title.trim()) return;

        setIsSaving(true);
        const parsedFeatures = editingService.featuresText
            .split('\n')
            .map(f => f.trim())
            .filter(Boolean);

        const newServiceObj = {
            ...editingService,
            features: parsedFeatures,
            isLocked: editingService.status === 'locked',
            isHidden: editingService.status === 'hidden'
        };

        const exists = servicesList.some(s => s.id === newServiceObj.id);
        const updatedList = exists 
            ? servicesList.map(s => s.id === newServiceObj.id ? newServiceObj : s)
            : [newServiceObj, ...servicesList];

        setServicesList(updatedList);
        localStorage.setItem('simi_services_list', JSON.stringify(updatedList));
        onServicesChange(updatedList);

        if (selectedServiceDetail && selectedServiceDetail.id === newServiceObj.id) {
            setSelectedServiceDetail(newServiceObj);
        }

        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'save-service',
                    ...newServiceObj
                }
            });
        } catch (err) {
            console.error('[SIMI Services] Error al guardar en D1:', err);
        } finally {
            setIsSaving(false);
            setIsEditModalOpen(false);
            setEditingService(null);
        }
    };

    // Sincronizar catálogo inicial completo a D1 si está vacío
    const handleSyncCatalogToD1 = async () => {
        if (!window.confirm('¿Deseas restaurar y sincronizar todo el catálogo maestro a la base de datos D1?')) return;
        setIsSaving(true);
        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'sync-all-services',
                    items: SIMI_SERVICES_CATALOG
                }
            });
            setServicesList(SIMI_SERVICES_CATALOG);
            localStorage.setItem('simi_services_list', JSON.stringify(SIMI_SERVICES_CATALOG));
            onServicesChange(SIMI_SERVICES_CATALOG);
        } catch (err) {
            console.error('[SIMI Services] Error al sincronizar catálogo:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Generar enlace directo de solicitud a WhatsApp
    const generateWhatsAppLink = (service) => {
        const userName = profile?.full_name || profile?.name || 'Maker';
        const userEmail = profile?.email || '';
        const msg = encodeURIComponent(
            `👋 *¡Hola Semillero SIMI3D!*\n` +
            `Me interesa solicitar información sobre el servicio de *${service.title}*.\n\n` +
            `📌 *Categoría:* ${service.categoryLabel || service.category}\n` +
            `👤 *Solicitante:* ${userName} (${userEmail})\n` +
            `🎯 *Público / Proyecto:* ${service.targetAudience || service.target_audience || 'A definir'}\n\n` +
            `¿Podrían indicarme disponibilidad y pasos para coordinar la cotización / agenda? ¡Muchas gracias!`
        );
        return `https://wa.me/573000000000?text=${msg}`;
    };

    const generateCotizadorWhatsAppLink = () => {
        const mat = MATERIAL_COSTS[calcMaterial] || MATERIAL_COSTS.pla;
        const userName = profile?.full_name || profile?.name || 'Maker';
        const msg = encodeURIComponent(
            `👋 *¡Hola Semillero SIMI3D!*\n` +
            `Deseo cotizar un servicio de *Fabricación / Impresión 3D*:\n\n` +
            `⚙️ *Material:* ${mat.name} (${mat.tech})\n` +
            `⚖️ *Gramos Estimados:* ~${calcGrams}g\n` +
            `📊 *Relleno (Infill):* ${calcInfill}%\n` +
            `💰 *Presupuesto Estimado:* $${calculatedEstPrice.toLocaleString()} COP\n` +
            `👤 *Solicitante:* ${userName}\n\n` +
            `Adjunto mi archivo .STL / .STEP para confirmar cotización definitiva.`
        );
        return `https://wa.me/573000000000?text=${msg}`;
    };

    // Filtrar servicios visibles según rol y categoría
    const filteredServices = useMemo(() => {
        return servicesList
            .filter(srv => {
                if (srv.status === 'hidden' && !isLeader) {
                    return false;
                }
                if (activeCategory !== 'all' && srv.category !== activeCategory) {
                    return false;
                }
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchTitle = (srv.title || '').toLowerCase().includes(q);
                    const matchDesc = (srv.description || '').toLowerCase().includes(q);
                    const matchAudience = (srv.targetAudience || srv.target_audience || '').toLowerCase().includes(q);
                    if (!matchTitle && !matchDesc && !matchAudience) return false;
                }
                return true;
            })
            .sort((a, b) => {
                const order = { 'active': 1, 'locked': 2, 'hidden': 3 };
                return (order[a.status] || 1) - (order[b.status] || 1);
            });
    }, [servicesList, activeCategory, searchQuery, isLeader]);

    return (
        <div className="simi-services-tab-container animate-fade-in">
            {/* ── HEADER HORIZONTAL DEL PORTAFOLIO ── */}
            <div className="simi-services-header-card">
                <div className="simi-services-header-left">
                    <div className="simi-services-header-icon">
                        <Briefcase size={22} />
                    </div>
                    <div>
                        <h3 className="simi-services-header-title">
                            Catálogo de Servicios & Portafolio SIMI3D
                        </h3>
                        <p className="simi-services-header-desc">
                            Capacitaciones STEAM, Manufactura Aditiva FDM/SLA y Mantenimiento Técnico de Impresoras 3D.
                        </p>
                    </div>
                </div>

                <div className="simi-services-header-actions">
                    {/* Botón Lápiz de Gestión de Visibilidad (Estilo idéntico a otras pestañas) */}
                    {isLeader && (
                        <button 
                            className={`simi-home-admin-edit-btn ${isManageModeActive ? 'active-manage-mode' : ''}`}
                            onClick={onToggleManageMode}
                            title={isManageModeActive ? "Modo Gestión Activo: Haz clic para salir" : "Activar Gestión de Visibilidad y Bloqueo (Solo Docente/Líder)"}
                            style={{ position: 'static' }}
                        >
                            <Edit3 size={18} />
                            {isManageModeActive && <span className="simi-manage-badge-dot" />}
                        </button>
                    )}

                    {isLeader && (
                        <button 
                            onClick={() => handleOpenEditModal(null)}
                            className="simi-desktop-add-btn simi-events-add-btn"
                            title="Registrar Nuevo Servicio"
                        >
                            <Plus size={16} /> Nuevo Servicio
                        </button>
                    )}
                </div>
            </div>

            {/* ── BARRA DE FILTROS RÁPIDOS ── */}
            <div className="simi-services-filters-row">
                <div className="simi-services-category-pills">
                    {CATEGORIES.map(cat => {
                        const IconComp = cat.icon;
                        const isCatActive = activeCategory === cat.id;
                        const count = cat.id === 'all' 
                            ? (isLeader ? servicesList.length : servicesList.filter(s => s.status !== 'hidden').length)
                            : servicesList.filter(s => s.category === cat.id && (isLeader || s.status !== 'hidden')).length;

                        return (
                            <button
                                key={cat.id}
                                className={`simi-services-pill-btn ${isCatActive ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    '--pill-color': cat.color
                                }}
                            >
                                <IconComp size={14} />
                                <span>{cat.label}</span>
                                <span className="simi-services-pill-count">{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="simi-services-search-wrapper">
                    <input 
                        type="text"
                        placeholder="Buscar servicio o tecnología..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="simi-services-search-input"
                    />
                    {searchQuery && (
                        <button className="simi-services-search-clear" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── LISTA / GRID HORIZONTAL PANORÁMICO DE SERVICIOS ── */}
            <div className="simi-services-list-panoramic">
                {filteredServices.map(service => {
                    const IconComp = ICON_MAP[service.iconKey || service.icon_key] || Box;
                    const isHidden = service.status === 'hidden';
                    const isLocked = service.status === 'locked';
                    const effectiveLocked = !isLeader && isLocked;
                    const features = Array.isArray(service.features) ? service.features : [];

                    return (
                        <div 
                            key={service.id} 
                            className={`simi-service-card-horizontal ${isLocked ? 'simi-item-locked' : ''} ${isHidden ? 'simi-item-hidden' : ''}`}
                            onClick={() => {
                                if (effectiveLocked) return;
                                setSelectedServiceDetail(service);
                            }}
                            style={{
                                '--card-accent': service.color || '#06b6d4',
                                opacity: isHidden ? 0.42 : isLocked ? (isLeader ? 0.78 : 0.55) : 1,
                                filter: isHidden ? 'grayscale(0.9) opacity(0.55)' : isLocked && !isLeader ? 'grayscale(0.6)' : 'none',
                                cursor: effectiveLocked ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {/* Botón Circular Superior Derecho de 3 Estados (Visible / Bloqueado / Oculto) con el Lápiz Activo */}
                            {isLeader && isManageModeActive && (
                                <button
                                    type="button"
                                    className={`simi-service-corner-toggle-btn is-state-${service.status}`}
                                    onClick={(e) => cycleServiceVisibility(service.id, e)}
                                    title={`Estado: ${service.status === 'active' ? 'Visible' : service.status === 'locked' ? 'Bloqueado' : 'Oculto'} (Toca para alternar)`}
                                >
                                    {service.status === 'active' && <Eye size={16} />}
                                    {service.status === 'locked' && <Lock size={16} />}
                                    {service.status === 'hidden' && <EyeOff size={16} />}
                                    <span className="simi-service-corner-toggle-pill">
                                        {service.status === 'active' ? 'Visible' : service.status === 'locked' ? 'Bloqueado' : 'Oculto'}
                                    </span>
                                </button>
                            )}

                            {/* Overlay de Bloqueado para Estudiantes */}
                            {effectiveLocked && (
                                <div className="simi-service-student-blocked-overlay">
                                    <div className="simi-student-lock-icon-circle-sm">
                                        <Lock size={20} />
                                    </div>
                                    <span className="simi-student-lock-title-sm">Servicio Bloqueado</span>
                                    <span className="simi-student-lock-desc-sm">Disponible próximamente</span>
                                </div>
                            )}

                            {/* Columna Izquierda: Icono + Categoría */}
                            <div className="simi-service-col-icon">
                                <div className="simi-service-icon-box-panoramic">
                                    <IconComp size={22} />
                                </div>
                                <span className="simi-service-cat-tag">
                                    {service.categoryLabel || service.category_label || service.category}
                                </span>
                            </div>

                            {/* Columna Central: Información Principal Compacta */}
                            <div className="simi-service-col-info">
                                <div className="simi-service-title-row">
                                    <h4 className="simi-service-panoramic-title">
                                        {service.title}
                                    </h4>
                                    {service.badge && (
                                        <span className="simi-service-highlight-pill">
                                            {service.badge}
                                        </span>
                                    )}
                                    {isLocked && isLeader && (
                                        <span className="simi-service-state-tag locked">
                                            <Lock size={11} /> Bloqueado
                                        </span>
                                    )}
                                    {isHidden && isLeader && (
                                        <span className="simi-service-state-tag hidden">
                                            <EyeOff size={11} /> Oculto
                                        </span>
                                    )}
                                </div>

                                <p className="simi-service-panoramic-desc">
                                    {service.description}
                                </p>

                                {(service.targetAudience || service.target_audience) && (
                                    <div className="simi-service-audience-pill">
                                        <ShieldCheck size={13} color="var(--card-accent)" />
                                        <span><strong>Dirigido a:</strong> {service.targetAudience || service.target_audience}</span>
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha: Tarifa + Botón de Ver / Cotizar */}
                            <div className="simi-service-col-action">
                                <span className="simi-service-panoramic-price">
                                    {service.pricingInfo || service.pricing_info || 'Cotización a convenir'}
                                </span>

                                <div className="simi-service-panoramic-btn-group">
                                    {isLocked ? (
                                        <button className="simi-service-btn-disabled" disabled>
                                            <Lock size={14} /> Próximamente
                                        </button>
                                    ) : (
                                        <button 
                                            className="simi-service-btn-view"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedServiceDetail(service);
                                            }}
                                        >
                                            <span>Ver & Cotizar</span>
                                            <ChevronRight size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Estado Vacío */}
            {filteredServices.length === 0 && (
                <div className="simi-services-empty-state animate-fade-in">
                    <div className="simi-services-empty-icon">
                        <Layers size={36} />
                    </div>
                    <h3>No se encontraron servicios en esta categoría</h3>
                    <p>Prueba cambiando el filtro de categoría o ajustando la caja de búsqueda.</p>
                </div>
            )}

            {/* ── BANNER / ACCESO RÁPIDO AL COTIZADOR MULTI-SERVICIO (MODAL COMPACTO) ── */}
            <div className="simi-services-quote-cta-banner animate-fade-in" style={{ marginTop: '0.5rem' }}>
                <div className="simi-services-quote-cta-actions-compact">
                    <button 
                        type="button"
                        className="simi-services-quote-cta-btn secondary"
                        onClick={() => {
                            setDefaultQuoteTab('capacitacion');
                            setIsQuoteModalOpen(true);
                        }}
                    >
                        <Award size={18} style={{ flexShrink: 0 }} />
                        <span>Cotizar Taller STEAM</span>
                    </button>
                    <button 
                        type="button"
                        className="simi-services-quote-cta-btn primary"
                        onClick={() => {
                            setDefaultQuoteTab('fabricacion');
                            setIsQuoteModalOpen(true);
                        }}
                    >
                        <Calculator size={18} style={{ flexShrink: 0 }} />
                        <span>Cotizador de Impresión 3D</span>
                    </button>
                </div>
            </div>

            {/* ── MODAL INTEGRAL DE COTIZACIÓN (FABRICACIÓN + CAPACITACIONES) ── */}
            <SimiQuoteModal 
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                profile={profile}
                defaultTab={defaultQuoteTab}
            />

            {/* ── MODAL DE DETALLE Y COTIZACIÓN AL DAR CLIC EN LA TARJETA ── */}
            {selectedServiceDetail && (
                <div className="simi-modal-backdrop" onClick={() => setSelectedServiceDetail(null)}>
                    <div 
                        className="simi-modal-card simi-services-detail-modal" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="simi-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div 
                                    className="simi-service-icon-wrapper" 
                                    style={{ 
                                        width: '46px', height: '46px', 
                                        background: `color-mix(in srgb, ${selectedServiceDetail.color || '#06b6d4'} 15%, transparent)`,
                                        color: selectedServiceDetail.color || '#06b6d4',
                                        border: `1.5px solid ${selectedServiceDetail.color || '#06b6d4'}`
                                    }}
                                >
                                    {(() => {
                                        const DetailIcon = ICON_MAP[selectedServiceDetail.iconKey || selectedServiceDetail.icon_key] || Box;
                                        return <DetailIcon size={22} />;
                                    })()}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: selectedServiceDetail.color || '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            {selectedServiceDetail.categoryLabel || selectedServiceDetail.category_label || selectedServiceDetail.category}
                                        </span>
                                        {selectedServiceDetail.badge && (
                                            <span className="simi-service-highlight-pill">
                                                {selectedServiceDetail.badge}
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                        {selectedServiceDetail.title}
                                    </h3>
                                </div>
                            </div>
                            <button className="simi-modal-close-btn" onClick={() => setSelectedServiceDetail(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="simi-services-detail-body">
                            {/* Información de Público */}
                            {(selectedServiceDetail.targetAudience || selectedServiceDetail.target_audience) && (
                                <div className="simi-detail-target-box">
                                    <ShieldCheck size={16} color="#06b6d4" />
                                    <div>
                                        <strong>Público y Perfil Recomendado:</strong>
                                        <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-body)' }}>
                                            {selectedServiceDetail.targetAudience || selectedServiceDetail.target_audience}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Descripción Completa */}
                            <div className="simi-detail-desc-box">
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                    Descripción del Servicio:
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.55 }}>
                                    {selectedServiceDetail.description}
                                </p>
                            </div>

                            {/* Especificaciones y entregables */}
                            {Array.isArray(selectedServiceDetail.features) && selectedServiceDetail.features.length > 0 && (
                                <div className="simi-detail-features-box">
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                        Especificaciones, Entregables y Módulos:
                                    </h4>
                                    <ul className="simi-detail-features-list">
                                        {selectedServiceDetail.features.map((feat, idx) => (
                                            <li key={idx} className="simi-detail-feature-item">
                                                <CheckCircle2 size={15} color="#10b981" className="feature-check-icon" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tarifa / Modalidad */}
                            <div className="simi-detail-price-banner">
                                <div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Modalidad / Cotización:</span>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#06b6d4' }}>
                                        {selectedServiceDetail.pricingInfo || selectedServiceDetail.pricing_info || 'Cotización a convenir'}
                                    </div>
                                </div>

                                <a 
                                    href={generateWhatsAppLink(selectedServiceDetail)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="simi-detail-whatsapp-btn"
                                >
                                    <MessageCircle size={17} />
                                    <span>Solicitar por WhatsApp</span>
                                </a>
                            </div>

                            {/* Acciones de Edición / Eliminación Exclusivas para Líder / Docente dentro del Modal */}
                            {isLeader && (
                                <div className="simi-detail-admin-actions">
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                        Herramientas de Administración:
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button 
                                            className="simi-detail-admin-btn edit"
                                            onClick={(e) => {
                                                setSelectedServiceDetail(null);
                                                handleOpenEditModal(selectedServiceDetail, e);
                                            }}
                                        >
                                            <Edit3 size={14} /> Editar Servicio
                                        </button>
                                        <button 
                                            className="simi-detail-admin-btn delete"
                                            onClick={(e) => handleDeleteService(selectedServiceDetail.id, e)}
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL DE CREACIÓN / EDICIÓN DE SERVICIO (FORMULARIO) ── */}
            {isEditModalOpen && editingService && (
                <div className="simi-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
                    <div 
                        className="simi-modal-card simi-services-edit-modal" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="simi-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="simi-service-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                        {editingService.id && servicesList.some(s => s.id === editingService.id) ? 'Editar Servicio' : 'Nuevo Servicio SIMI3D'}
                                    </h3>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        Configuración de visibilidad, público y características
                                    </span>
                                </div>
                            </div>
                            <button className="simi-modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveService} className="simi-services-form-grid">
                            <div className="simi-form-row-2">
                                <div className="simi-form-group">
                                    <label>Título del Servicio *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editingService.title}
                                        onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                        placeholder="Ej. Taller STEAM Bachillerato con Blender"
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label>Categoría</label>
                                    <select
                                        value={editingService.category}
                                        onChange={e => {
                                            const catVal = e.target.value;
                                            const label = catVal === 'fabricacion' ? 'Fabricación Digital' : catVal === 'mantenimiento' ? 'Servicio Técnico' : 'Capacitación STEAM';
                                            setEditingService({ ...editingService, category: catVal, categoryLabel: label });
                                        }}
                                    >
                                        <option value="capacitacion">🎓 Capacitaciones STEAM</option>
                                        <option value="fabricacion">🖨️ Fabricación Digital</option>
                                        <option value="mantenimiento">🔧 Servicio Técnico</option>
                                    </select>
                                </div>
                            </div>

                            <div className="simi-form-row-2">
                                <div className="simi-form-group">
                                    <label>Público Objetivo / Audiencia</label>
                                    <input 
                                        type="text" 
                                        value={editingService.targetAudience}
                                        onChange={e => setEditingService({ ...editingService, targetAudience: e.target.value })}
                                        placeholder="Ej. Estudiantes de Bachillerato (12 a 17 años)"
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label>Badge Destacado</label>
                                    <input 
                                        type="text" 
                                        value={editingService.badge}
                                        onChange={e => setEditingService({ ...editingService, badge: e.target.value })}
                                        placeholder="Ej. Junior Makers, Ultra Precisión"
                                    />
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label>Descripción del Servicio</label>
                                <textarea 
                                    rows={3}
                                    value={editingService.description}
                                    onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                    placeholder="Describe la metodología, software, materiales y objetivos..."
                                />
                            </div>

                            <div className="simi-form-group">
                                <label>Características / Especificaciones (Una por línea)</label>
                                <textarea 
                                    rows={4}
                                    value={editingService.featuresText}
                                    onChange={e => setEditingService({ ...editingService, featuresText: e.target.value })}
                                    placeholder="Software didáctico: Tinkercad 3D&#10;Creación de llaveros personalizados&#10;Certificado digital"
                                />
                            </div>

                            <div className="simi-form-row-2">
                                <div className="simi-form-group">
                                    <label>Información de Costos / Cotización</label>
                                    <input 
                                        type="text" 
                                        value={editingService.pricingInfo}
                                        onChange={e => setEditingService({ ...editingService, pricingInfo: e.target.value })}
                                        placeholder="Ej. Cotización por gramo / tiempo"
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label>Estado Inicial de Visibilidad</label>
                                    <select
                                        value={editingService.status}
                                        onChange={e => setEditingService({ ...editingService, status: e.target.value })}
                                    >
                                        <option value="active">🟢 Visible / Disponible</option>
                                        <option value="locked">🔒 Bloqueado con Candado</option>
                                        <option value="hidden">🟡 Oculto (Solo Staff / Líder)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="simi-modal-actions" style={{ marginTop: '1.25rem' }}>
                                <button 
                                    type="button" 
                                    className="simi-services-btn-outline" 
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="simi-services-btn-primary"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Guardando en D1...' : 'Guardar Servicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
