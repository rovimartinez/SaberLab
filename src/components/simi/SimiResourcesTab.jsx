import { useState, useEffect, useMemo } from 'react';
import {
    Box, Layers, Flame, FlaskConical,
    Plus, X, Edit3, Trash2, Package, Save, CheckCircle2,
    Compass, Globe, ExternalLink, Search, Sparkles, Cpu, Rocket, School, Target,
    Sliders, Triangle, Thermometer, BookOpen
} from 'lucide-react';
import { INITIAL_SIMI_RESOURCES, SIMI_WEB_RESOURCES } from '../../data/simiData';
import { api } from '../../lib/api';

const WEB_ICON_MAP = {
    Box,
    Flame,
    FlaskConical,
    Cpu,
    Sparkles,
    School,
    Layers,
    Rocket,
    Target,
    Sliders,
    Triangle,
    Thermometer,
    BookOpen,
    Search,
    Globe,
    Package
};

// Componente para renderizar el logo/favicon oficial de alta resolución del recurso
function ResourceBrandLogo({ item }) {
    const [imgFailed, setImgFailed] = useState(false);
    const IconComp = WEB_ICON_MAP[item.icon] || Globe;
    const logoSrc = item.logoUrl || `https://www.google.com/s2/favicons?domain=${item.host}&sz=128`;

    return (
        <div 
            className="simi-web-card-brand-avatar"
            style={{ 
                '--brand-color': item.color
            }}
        >
            {!imgFailed ? (
                <img 
                    src={logoSrc} 
                    alt={`${item.name} logo`}
                    className="simi-web-brand-img"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    loading="lazy"
                />
            ) : (
                <div 
                    className="simi-web-brand-fallback"
                    style={{ 
                        color: item.color,
                        background: `color-mix(in srgb, ${item.color} 15%, var(--surface-card, #ffffff))`
                    }}
                >
                    <IconComp size={24} />
                </div>
            )}
            <span 
                className="simi-web-brand-badge-dot" 
                style={{ background: item.color }} 
                title={item.tag}
            />
        </div>
    );
}

// Subcomponente de Recursos e Inventario con edición y persistencia en D1
export default function SimiResourcesTab({ 
    isLeader, 
    initialResources, 
    onResourcesChange,
    initialWebResources,
    onWebResourcesChange,
    defaultSubTab = 'inventory'
}) {
    const [activeSubTab, setActiveSubTab] = useState(defaultSubTab);
    const [webCategoryFilter, setWebCategoryFilter] = useState('Todas');
    const [webSearchQuery, setWebSearchQuery] = useState('');

    useEffect(() => {
        if (defaultSubTab) {
            setActiveSubTab(defaultSubTab);
        }
    }, [defaultSubTab]);

    const [resources, setResources] = useState(() => {
        const fallback = INITIAL_SIMI_RESOURCES;
        if (initialResources && initialResources.length > 0) {
            return initialResources.map(r => {
                const seed = fallback.find(s => s.id === r.id);
                return seed ? { ...seed, ...r, imageUrl: r.imageUrl || seed.imageUrl } : r;
            });
        }
        const saved = localStorage.getItem('simi_resources_list');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                return parsed.map(r => {
                    const seed = fallback.find(s => s.id === r.id);
                    return seed ? { ...seed, ...r, imageUrl: r.imageUrl || seed.imageUrl } : r;
                });
            } catch (e) { }
        }
        return fallback;
    });

    useEffect(() => {
        if (initialResources && initialResources.length > 0) {
            const fallback = INITIAL_SIMI_RESOURCES;
            setResources(initialResources.map(r => {
                const seed = fallback.find(s => s.id === r.id);
                return seed ? { ...seed, ...r, imageUrl: r.imageUrl || seed.imageUrl } : r;
            }));
        }
    }, [initialResources]);

    // ── ESTADO REACTIVO DE FUENTES & HERRAMIENTAS WEB ──
    const [webResources, setWebResources] = useState(() => {
        const fallback = SIMI_WEB_RESOURCES;
        if (initialWebResources && initialWebResources.length > 0) {
            return initialWebResources;
        }
        const saved = localStorage.getItem('simi_web_resources_list');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) { }
        }
        return fallback;
    });

    useEffect(() => {
        if (initialWebResources && initialWebResources.length > 0) {
            setWebResources(initialWebResources);
        }
    }, [initialWebResources]);

    // Estados para persistencia y sincronización masiva en D1
    const [isSavingWebDb, setIsSavingWebDb] = useState(false);
    const [webDbSuccessMsg, setWebDbSuccessMsg] = useState('');

    // Modal de agregar / editar herramientas web
    const [isWebModalOpen, setIsWebModalOpen] = useState(false);
    const [editingWebItem, setEditingWebItem] = useState(null);
    const [webFormName, setWebFormName] = useState('');
    const [webFormUrl, setWebFormUrl] = useState('');
    const [webFormLogoUrl, setWebFormLogoUrl] = useState('');
    const [webFormCategory, setWebFormCategory] = useState('Laminadores & Slicers');
    const [webFormTag, setWebFormTag] = useState('');
    const [webFormBadge, setWebFormBadge] = useState('');
    const [webFormColor, setWebFormColor] = useState('#06b6d4');
    const [webFormDescription, setWebFormDescription] = useState('');
    const [webFormFeatured, setWebFormFeatured] = useState(true);

    const persistWebResources = (updated) => {
        setWebResources(updated);
        localStorage.setItem('simi_web_resources_list', JSON.stringify(updated));
        if (onWebResourcesChange) onWebResourcesChange(updated);
    };

    const handleSyncWebToDb = async () => {
        setIsSavingWebDb(true);
        setWebDbSuccessMsg('');
        try {
            await api('/simi', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'sync-all-web-resources',
                    items: webResources
                })
            });
            setWebDbSuccessMsg(`✓ ¡${webResources.length} páginas guardadas en D1!`);
            setTimeout(() => setWebDbSuccessMsg(''), 4500);
        } catch (err) {
            console.error('Error sincronizando recursos web con D1:', err);
            setWebDbSuccessMsg('⚠️ Guardado en caché local');
            setTimeout(() => setWebDbSuccessMsg(''), 4500);
        } finally {
            setIsSavingWebDb(false);
        }
    };

    const handleOpenAddWeb = () => {
        setEditingWebItem(null);
        setWebFormName('');
        setWebFormUrl('');
        setWebFormLogoUrl('');
        setWebFormCategory('Laminadores & Slicers');
        setWebFormTag('');
        setWebFormBadge('');
        setWebFormColor('#06b6d4');
        setWebFormDescription('');
        setWebFormFeatured(true);
        setIsWebModalOpen(true);
    };

    const handleOpenEditWeb = (item) => {
        setEditingWebItem(item);
        setWebFormName(item.name || '');
        setWebFormUrl(item.url || '');
        setWebFormLogoUrl(item.logoUrl || '');
        setWebFormCategory(item.category || 'Repositorios & Modelos');
        setWebFormTag(item.tag || '');
        setWebFormBadge(item.badge || '');
        setWebFormColor(item.color || '#06b6d4');
        setWebFormDescription(item.description || '');
        setWebFormFeatured(item.featured !== false);
        setIsWebModalOpen(true);
    };

    const handleSaveWeb = async (e) => {
        e.preventDefault();
        let extractedHost = '';
        try {
            extractedHost = new URL(webFormUrl).hostname.replace(/^www\./, '');
        } catch {
            extractedHost = webFormUrl;
        }

        const newItem = {
            id: editingWebItem ? editingWebItem.id : `web-${Date.now()}`,
            name: webFormName.trim(),
            url: webFormUrl.trim(),
            host: extractedHost,
            logoUrl: webFormLogoUrl.trim() || null,
            category: webFormCategory,
            tag: webFormTag.trim() || 'Herramienta 3D',
            badge: webFormBadge.trim() || 'Oficial',
            color: webFormColor || '#06b6d4',
            icon: editingWebItem?.icon || 'Globe',
            featured: Boolean(webFormFeatured),
            description: webFormDescription.trim()
        };

        let updatedList;
        if (editingWebItem) {
            updatedList = webResources.map(w => w.id === editingWebItem.id ? newItem : w);
        } else {
            updatedList = [newItem, ...webResources];
        }

        persistWebResources(updatedList);
        setIsWebModalOpen(false);

        // Guardar individualmente en D1 en segundo plano
        try {
            await api('/simi', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'save-web-resource',
                    ...newItem
                })
            });
        } catch (err) {
            console.error('Error guardando recurso web en D1:', err);
        }
    };

    const handleDeleteWeb = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${name}" del catálogo de herramientas?`)) return;
        const updatedList = webResources.filter(w => w.id !== id);
        persistWebResources(updatedList);

        // Eliminar en D1
        try {
            await api('/simi', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete-web-resource',
                    id
                })
            });
        } catch (err) {
            console.error('Error eliminando recurso web en D1:', err);
        }
    };

    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [detailItem, setDetailItem] = useState(null);

    // Formulario de nuevo / edición
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState('Impresora FDM');
    const [formStatus, setFormStatus] = useState('Operativa');
    const [formQuantity, setFormQuantity] = useState(1);
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formSpecs, setFormSpecs] = useState('');
    const [formLocation, setFormLocation] = useState('');

    const persistResources = (updated) => {
        setResources(updated);
        localStorage.setItem('simi_resources_list', JSON.stringify(updated));
        if (onResourcesChange) onResourcesChange(updated);
    };

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormName('');
        setFormCategory('Impresora FDM');
        setFormStatus('Operativa');
        setFormQuantity(1);
        setFormSpecs('');
        setFormLocation('');
        setFormImageUrl('');
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormName(item.name);
        setFormCategory(item.category);
        setFormStatus(item.status);
        setFormQuantity(item.quantity);
        setFormSpecs(item.specs || '');
        setFormLocation(item.location || '');
        setFormImageUrl(item.imageUrl || item.image_url || '');
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este recurso del inventario?')) {
            const updated = resources.filter(r => r.id !== id);
            persistResources(updated);
            setDetailItem(null);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'delete-resource', id }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local delete resource:', err);
            }
        }
    };

    const handleSaveForm = async (e) => {
        e.preventDefault();
        if (!formName.trim()) return;

        let color = '#06b6d4';
        if (formCategory.includes('FDM')) color = '#eab308';
        else if (formCategory.includes('SLA') || formCategory.includes('Resina')) color = '#8b5cf6';
        else if (formCategory.includes('Filamento')) color = '#38bdf8';
        else if (formCategory.includes('Insumo')) color = '#10b981';

        const resourcePayload = {
            name: formName,
            category: formCategory,
            status: formStatus,
            quantity: Number(formQuantity),
            specs: formSpecs,
            location: formLocation,
            imageUrl: formImageUrl.trim(),
            image_url: formImageUrl.trim(),
            color
        };

        if (editingItem) {
            const updated = resources.map(r => r.id === editingItem.id ? {
                ...r,
                ...resourcePayload
            } : r);
            persistResources(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-resource', id: editingItem.id, ...resourcePayload }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local save resource:', err);
            }
        } else {
            const newId = `res-${Date.now()}`;
            const newItem = {
                id: newId,
                ...resourcePayload
            };
            const updated = [newItem, ...resources];
            persistResources(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-resource', id: newId, ...resourcePayload }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local add resource:', err);
            }
        }
        setIsAddModalOpen(false);
        setDetailItem(null);
    };


    // Métricas de inventario en tiempo real
    const totalPrinters = resources
        .filter(r => r.category.includes('Impresora'))
        .reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);

    const totalFilamentSpools = resources
        .filter(r => r.category === 'Filamento')
        .reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);

    const totalResinBottles = resources
        .filter(r => r.category.includes('Resina'))
        .reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);

    const totalSupplies = resources
        .filter(r => !r.category.includes('Impresora') && r.category !== 'Filamento' && !r.category.includes('Resina'))
        .reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);

    // Filtrado de recursos por grupo de tarjeta
    const filteredResources = selectedCategoryFilter === 'Todos'
        ? resources
        : resources.filter(r => {
            if (selectedCategoryFilter === 'Impresoras') return r.category.includes('Impresora');
            if (selectedCategoryFilter === 'Filamentos') return r.category === 'Filamento';
            if (selectedCategoryFilter === 'Resinas') return r.category.includes('Resina');
            if (selectedCategoryFilter === 'Insumos') return !r.category.includes('Impresora') && r.category !== 'Filamento' && !r.category.includes('Resina');
            return true;
        });

    // Filtrado de fuentes y herramientas web
    const filteredWebResources = useMemo(() => {
        return webResources.filter(item => {
            const matchesCat = webCategoryFilter === 'Todas' || item.category === webCategoryFilter;
            const q = webSearchQuery.toLowerCase().trim();
            const matchesSearch = !q || 
                item.name.toLowerCase().includes(q) || 
                item.description.toLowerCase().includes(q) || 
                item.tag.toLowerCase().includes(q) ||
                item.host.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });
    }, [webResources, webCategoryFilter, webSearchQuery]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeSubTab === 'web' ? (
                /* ── VISTA DE FUENTES & HERRAMIENTAS WEB ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Header de Fuentes & Herramientas Web */}
                    <div className="simi-resources-header-card">
                        <div className="simi-resources-header-info">
                            <div className="simi-resources-header-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                                <Compass size={22} />
                            </div>
                            <div>
                                <h3 className="simi-resources-header-title">
                                    Ecosistema Maker, Calibración & IA 3D
                                </h3>
                                <p className="simi-resources-header-desc">
                                    Plataformas oficiales, generadores paramétricos de MakerLab, suites de calibración de alta precisión y herramientas de IA para potenciar tus proyectos.
                                </p>
                            </div>
                        </div>

                        <div className="simi-web-search-bar">
                            <Search size={16} color="#64748b" />
                            <input
                                type="text"
                                className="simi-web-search-input"
                                placeholder="Buscar herramienta, test, IA, generador..."
                                value={webSearchQuery}
                                onChange={e => setWebSearchQuery(e.target.value)}
                            />
                            {webSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setWebSearchQuery('')}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
                                    title="Limpiar búsqueda"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Botón de Agregar Recurso para Líder / Docente */}
                        {isLeader && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button 
                                    type="button" 
                                    onClick={handleOpenAddWeb}
                                    className="simi-resources-add-btn"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '7px 16px',
                                        borderRadius: '10px',
                                        fontSize: '0.84rem',
                                        fontWeight: 850,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title="Agregar Nuevo Recurso Web"
                                >
                                    <Plus size={16} /> Recurso
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Selector de Sub-Pestañas: Inventario vs Fuentes Web (debajo del encabezado) */}
                    <div className="simi-resources-nav-tabs">
                        <button
                            type="button"
                            className={`simi-resources-nav-tab ${activeSubTab === 'inventory' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('inventory')}
                        >
                            <Package size={17} />
                            <span>Inventario Físico & Taller ({resources.length})</span>
                        </button>
                        <button
                            type="button"
                            className={`simi-resources-nav-tab ${activeSubTab === 'web' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('web')}
                        >
                            <Compass size={17} />
                            <span>Fuentes & Herramientas Web ({webResources.length})</span>
                            <span className="simi-resources-nav-badge">Hub Maker & IA</span>
                        </button>
                    </div>

                    {/* Píldoras de Filtro por Categoría */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div className="simi-web-category-pills">
                            {[
                                { key: 'Todas', label: 'Todas' },
                                { key: 'Laminadores & Slicers', label: 'Laminadores' },
                                { key: 'Repositorios & Modelos', label: 'Repositorios' },
                                { key: 'Calibración & Afinación', label: 'Calibración' },
                                { key: 'Guías Técnicas & Wikis', label: 'Guías & Wikis' },
                                { key: 'MakerLab Paramétrico', label: 'MakerLab' },
                                { key: 'IA 3D', label: 'IA 3D' }
                            ].map(cat => {
                                const count = cat.key === 'Todas'
                                    ? webResources.length
                                    : webResources.filter(r => r.category === cat.key || (cat.key === 'IA 3D' && (r.category === 'IA 3D' || r.category === 'Inteligencia Artificial 3D'))).length;
                                return (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        className={`simi-web-category-pill ${webCategoryFilter === cat.key ? 'active' : ''}`}
                                        onClick={() => setWebCategoryFilter(cat.key)}
                                    >
                                        {cat.label} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', fontWeight: 700 }}>
                            Mostrando {filteredWebResources.length} de {webResources.length} herramientas
                        </span>
                    </div>

                    {/* Grid de Tarjetas de Recursos Web */}
                    {filteredWebResources.length > 0 ? (
                        <div className="simi-web-resources-grid">
                            {filteredWebResources.map(item => {
                                const IconComp = WEB_ICON_MAP[item.icon] || Globe;
                                return (
                                    <a 
                                        key={item.id} 
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="simi-web-resource-card"
                                        style={{ 
                                            '--card-color': item.color,
                                            '--card-glow': `${item.color}33`
                                        }}
                                        title={`Abrir ${item.name} (${item.host})`}
                                    >
                                        {/* Barra lateral de acento de marca */}
                                        <div className="simi-web-card-accent-pill" style={{ background: item.color }} />

                                        {/* Avatar con Logo Oficial */}
                                        <ResourceBrandLogo item={item} />

                                        {/* Acciones de Edición y Eliminación para Líder / Admin */}
                                        {isLeader && (
                                            <div 
                                                className="simi-web-card-actions" 
                                                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                                            >
                                                <button 
                                                    type="button" 
                                                    className="simi-web-card-action-btn edit"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenEditWeb(item); }}
                                                    title={`Editar ${item.name}`}
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="simi-web-card-action-btn delete"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteWeb(item.id, item.name); }}
                                                    title={`Eliminar ${item.name}`}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Contenido Central: Título, Descripción y Host */}
                                        <div className="simi-web-card-body">
                                            <div className="simi-web-card-header-row">
                                                <h4 className="simi-web-card-title">{item.name}</h4>
                                                <div className="simi-web-card-hover-indicator">
                                                    <ExternalLink size={13} />
                                                </div>
                                            </div>
                                            <p className="simi-web-card-desc">
                                                {item.description}
                                            </p>
                                            <div className="simi-web-card-footer-meta">
                                                <span className="simi-web-card-host-text">🌐 {item.host}</span>
                                                {item.badge && (
                                                    <span className="simi-web-card-micro-tag" style={{ color: item.color }}>
                                                        • {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface-card, #ffffff)', borderRadius: '16px', border: '1.5px dashed var(--border-default, #e2e8f0)' }}>
                            <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                                No se encontraron herramientas o fuentes para "{webSearchQuery}".
                            </p>
                            <button
                                type="button"
                                onClick={() => { setWebSearchQuery(''); setWebCategoryFilter('Todas'); }}
                                className="simi-cat-cta-btn"
                                style={{ margin: '0 auto' }}
                            >
                                Restablecer filtros
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* ── VISTA DE INVENTARIO FÍSICO ── */
                <>
                {/* Header del Inventario con Acciones */}
                <div className="simi-resources-header-card">
                    <div className="simi-resources-header-info">
                        <div className="simi-resources-header-icon">
                            <Package size={22} />
                        </div>
                        <div>
                            <h3 className="simi-resources-header-title">
                                Inventario Físico, Equipamiento & Insumos SIMI3D
                            </h3>
                            <p className="simi-resources-header-desc">
                                Control en tiempo real de impresoras 3D, máquinas MSLA, carretes de termoplásticos, resinas y kits de prototipado.
                            </p>
                        </div>
                    </div>

                    {isLeader && (
                        <button 
                            onClick={handleOpenAdd}
                            className="simi-desktop-add-btn simi-resources-add-btn"
                            title="Registrar Nuevo Recurso / Máquina"
                        >
                            <Plus size={16} /> Registrar Recurso / Máquina
                        </button>
                    )}
                </div>

                {/* Selector de Sub-Pestañas: Inventario vs Fuentes Web (debajo del encabezado) */}
                <div className="simi-resources-nav-tabs">
                    <button
                        type="button"
                        className={`simi-resources-nav-tab ${activeSubTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('inventory')}
                    >
                        <Package size={17} />
                        <span>Inventario Físico & Taller ({resources.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`simi-resources-nav-tab ${activeSubTab === 'web' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('web')}
                    >
                        <Compass size={17} />
                        <span>Fuentes & Herramientas Web ({webResources.length})</span>
                        <span className="simi-resources-nav-badge">Hub Maker & IA</span>
                    </button>
                </div>

            {/* 4 Tarjetas de Telemetría — 4 en la misma fila con icono en marca de agua de fondo */}
            <div className="simi-resources-metrics-grid">
                {[
                    { key: 'Impresoras', label: 'Impresoras FDM & SLA', value: totalPrinters, unit: '', color: '#eab308', dimColor: '#ca8a04', bg: 'rgba(234,179,8,0.15)', border: '#eab308', Icon: Flame },
                    { key: 'Filamentos', label: 'Filamentos (PLA/PETG)', value: totalFilamentSpools, unit: 'carretes', color: '#06b6d4', dimColor: '#0891b2', bg: 'rgba(6,182,212,0.15)', border: '#06b6d4', Icon: Box },
                    { key: 'Resinas', label: 'Resinas Fotosensibles', value: totalResinBottles, unit: 'litros', color: '#B541FA', dimColor: '#9333ea', bg: 'rgba(181,65,250,0.15)', border: '#B541FA', Icon: FlaskConical },
                    { key: 'Insumos', label: 'Insumos & Ferretería', value: totalSupplies, unit: 'items', color: '#10b981', dimColor: '#059669', bg: 'rgba(16,185,129,0.15)', border: '#10b981', Icon: Layers },
                ].map(({ key, label, value, unit, color, dimColor, bg, border, Icon }) => {
                    const isActive = selectedCategoryFilter === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedCategoryFilter(isActive ? 'Todos' : key)}
                            style={{
                                background: isActive ? `color-mix(in srgb, ${color} 12%, var(--surface-card, #fff))` : 'var(--surface-card, #ffffff)',
                                border: `2px solid ${isActive ? color : 'var(--border-default, #e2e8f0)'}`,
                                borderRadius: '14px',
                                padding: '0.65rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isActive ? `0 4px 18px -4px ${color}55` : '0 4px 14px rgba(0,0,0,0.03)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                width: '100%',
                                minWidth: 0,
                                boxSizing: 'border-box',
                                transform: isActive ? 'translateY(-2px)' : 'none'
                            }}
                        >
                            {/* Icono de Marca de Agua de Fondo */}
                            <div className="simi-resource-metric-watermark" style={{ color: dimColor }}>
                                <Icon size={44} />
                            </div>

                            <div style={{ position: 'relative', zIndex: 2, flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 950, color: dimColor, lineHeight: 1, whiteSpace: 'nowrap' }}>
                                    {value}{unit && <span style={{ fontSize: '0.72rem', fontWeight: 700, marginLeft: '3px' }}>{unit}</span>}
                                </div>
                                <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.2px', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                            </div>
                            {isActive && <span style={{ position: 'relative', zIndex: 2, marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 800, color, background: `${color}22`, padding: '2px 6px', borderRadius: '99px', whiteSpace: 'nowrap', flexShrink: 0 }}>✓</span>}
                        </button>
                    );
                })}
            </div>

            {/* Grid de Tarjetas de Recursos e Inventario Físico */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredResources.map(res => {
                    const isGood = res.status === 'Operativa' || res.status === 'En Stock' || res.status === 'Disponible';
                    return (
                        <div
                            key={res.id}
                            className="simi-resource-card simi-resource-card-clickable"
                            onClick={() => setDetailItem(res)}
                            title="Ver detalles"
                        >
                            {/* Imagen + encabezado */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                {/* Thumbnail */}
                                {res.imageUrl ? (
                                    <div style={{
                                        flexShrink: 0, width: '64px', height: '64px',
                                        borderRadius: '12px', overflow: 'hidden',
                                        border: `2px solid color-mix(in srgb, ${res.color || '#06b6d4'} 35%, transparent)`,
                                        background: '#0f172a'
                                    }}>
                                        <img
                                            src={res.imageUrl}
                                            alt={res.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-size:1.7rem">📦</span>'; }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        flexShrink: 0, width: '64px', height: '64px',
                                        borderRadius: '12px',
                                        background: `color-mix(in srgb, ${res.color || '#06b6d4'} 12%, transparent)`,
                                        border: `2px solid color-mix(in srgb, ${res.color || '#06b6d4'} 30%, transparent)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.75rem'
                                    }}>
                                        {res.category.includes('Impresora') ? '🖨️' :
                                         res.category === 'Filamento' ? '🧵' :
                                         res.category.includes('Resina') ? '🧪' :
                                         res.category.includes('Insumo') ? '🔩' : '🔧'}
                                    </div>
                                )}

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span
                                        className="simi-resource-category-tag"
                                        style={{
                                            background: `color-mix(in srgb, ${res.color || '#06b6d4'} 15%, transparent)`,
                                            color: res.color || '#06b6d4',
                                            borderColor: `color-mix(in srgb, ${res.color || '#06b6d4'} 35%, transparent)`
                                        }}
                                    >
                                        {res.category}
                                    </span>
                                    <h4 style={{ margin: '5px 0 3px 0', fontSize: '0.97rem', fontWeight: 900, color: 'var(--text-heading)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {res.name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className={`simi-resource-status-pill ${isGood ? 'good' : 'alert'}`}>
                                            {res.status}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            📦 {res.quantity} {res.category.includes('Resina') ? 'L' : res.category === 'Filamento' ? 'carretes' : 'uds.'}
                                        </span>
                                    </div>
                                </div>

                                {/* Chevron hint */}
                                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '1rem', alignSelf: 'center', flexShrink: 0 }}>›</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            </>
            )}

            {/* ── Modal de Detalle de Recurso ── */}
            {detailItem && (
                <div className="simi-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setDetailItem(null); }}>
                    <div className="simi-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="simi-modal-header">
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                {/* Imagen grande */}
                                {detailItem.imageUrl ? (
                                    <div style={{ width: '72px', height: '72px', borderRadius: '14px', overflow: 'hidden', border: `2px solid color-mix(in srgb, ${detailItem.color || '#06b6d4'} 40%, transparent)`, flexShrink: 0 }}>
                                        <img src={detailItem.imageUrl} alt={detailItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '72px', height: '72px', borderRadius: '14px', background: `color-mix(in srgb, ${detailItem.color || '#06b6d4'} 15%, transparent)`, border: `2px solid color-mix(in srgb, ${detailItem.color || '#06b6d4'} 35%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                                        {detailItem.category.includes('Impresora') ? '🖨️' : detailItem.category === 'Filamento' ? '🧵' : detailItem.category.includes('Resina') ? '🧪' : detailItem.category.includes('Insumo') ? '🔩' : '🔧'}
                                    </div>
                                )}
                                <div>
                                    <span className="simi-resource-category-tag" style={{ background: `color-mix(in srgb, ${detailItem.color || '#06b6d4'} 15%, transparent)`, color: detailItem.color || '#06b6d4', borderColor: `color-mix(in srgb, ${detailItem.color || '#06b6d4'} 35%, transparent)` }}>{detailItem.category}</span>
                                    <h3 style={{ margin: '6px 0 0 0', fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>{detailItem.name}</h3>
                                </div>
                            </div>
                            <button className="simi-modal-close-btn" onClick={() => setDetailItem(null)}><X size={18} /></button>
                        </div>

                        {/* Ficha de datos */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                                {/* Estado */}
                                <div style={{ background: 'var(--surface-hover, rgba(0,0,0,0.04))', borderRadius: '12px', padding: '0.7rem 0.9rem' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Estado</div>
                                    <span className={`simi-resource-status-pill ${detailItem.status === 'Operativa' || detailItem.status === 'En Stock' || detailItem.status === 'Disponible' ? 'good' : 'alert'}`}>{detailItem.status}</span>
                                </div>
                                {/* Cantidad */}
                                <div style={{ background: 'var(--surface-hover, rgba(0,0,0,0.04))', borderRadius: '12px', padding: '0.7rem 0.9rem' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Cantidad</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-heading)' }}>{detailItem.quantity} <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{detailItem.category.includes('Resina') ? 'Litros' : detailItem.category === 'Filamento' ? 'Carretes' : 'Unidades'}</span></div>
                                </div>
                            </div>

                            {detailItem.location && (
                                <div style={{ background: 'var(--surface-hover, rgba(0,0,0,0.04))', borderRadius: '12px', padding: '0.7rem 0.9rem' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Ubicación Física</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>📍 {detailItem.location}</div>
                                </div>
                            )}

                            {detailItem.specs && (
                                <div style={{ background: 'var(--surface-hover, rgba(0,0,0,0.04))', borderRadius: '12px', padding: '0.7rem 0.9rem' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Especificaciones Técnicas</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{detailItem.specs}</div>
                                </div>
                            )}
                        </div>

                        {/* Acciones — solo admin / líder */}
                        {isLeader && (
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.1rem', paddingTop: '0.85rem', borderTop: '1.5px solid var(--border-default, #e2e8f0)' }}>
                                <button
                                    type="button"
                                    className="simi-res-mini-btn delete"
                                    style={{ padding: '7px 14px' }}
                                    onClick={() => handleDelete(detailItem.id)}
                                >
                                    <Trash2 size={13} style={{ marginRight: '4px' }} /> Eliminar
                                </button>
                                <button
                                    type="button"
                                    className="simi-res-mini-btn edit"
                                    style={{ padding: '7px 16px' }}
                                    onClick={() => { setDetailItem(null); handleOpenEdit(detailItem); }}
                                >
                                    <Edit3 size={13} style={{ marginRight: '4px' }} /> Editar recurso
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal de Agregar / Editar Recurso ── */}
            {isAddModalOpen && (
                <div className="simi-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                    <div className="simi-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                        <div className="simi-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                    {editingItem ? '✏️ Editar Recurso SIMI3D' : '📦 Registrar Nuevo Recurso / Máquina'}
                                </h3>
                                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Gestiona impresoras, carretes de filamento, resinas y consumibles del semillero.
                                </p>
                            </div>
                            <button className="simi-modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.35rem' }}>
                            <div className="simi-form-group">
                                <label className="simi-form-label">Nombre del Recurso / Modelo:</label>
                                <input 
                                    type="text" 
                                    className="simi-form-input" 
                                    placeholder="Ej: Creality Ender-3 V3, Filamento PLA Azul..." 
                                    value={formName} 
                                    onChange={e => setFormName(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Categoría:</label>
                                    <select 
                                        className="simi-form-input" 
                                        value={formCategory} 
                                        onChange={e => setFormCategory(e.target.value)}
                                    >
                                        <option value="Impresora FDM">Impresora FDM</option>
                                        <option value="Impresora Resina SLA">Impresora Resina SLA</option>
                                        <option value="Filamento">Filamento (PLA/PETG/TPU)</option>
                                        <option value="Resina Fotosensible">Resina Fotosensible</option>
                                        <option value="Insumo / Ferretería">Insumo / Ferretería</option>
                                        <option value="Herramienta / Equipo">Herramienta / Equipo</option>
                                    </select>
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Estado Operativo:</label>
                                    <select 
                                        className="simi-form-input" 
                                        value={formStatus} 
                                        onChange={e => setFormStatus(e.target.value)}
                                    >
                                        <option value="Operativa">Operativa</option>
                                        <option value="En Stock">En Stock</option>
                                        <option value="Disponible">Disponible</option>
                                        <option value="En Mantenimiento">En Mantenimiento</option>
                                        <option value="Fuera de Servicio">Fuera de Servicio</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Cantidad:</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="simi-form-input" 
                                        value={formQuantity} 
                                        onChange={e => setFormQuantity(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Ubicación Física:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        placeholder="Ej: Laboratorio STEAM, Caja 1..." 
                                        value={formLocation} 
                                        onChange={e => setFormLocation(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">📷 URL de Imagen (opcional):</label>
                                <input 
                                    type="url" 
                                    className="simi-form-input" 
                                    placeholder="https://...jpg  (foto del equipo o insumo)" 
                                    value={formImageUrl} 
                                    onChange={e => setFormImageUrl(e.target.value)} 
                                />
                                {formImageUrl.trim() && (
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                            src={formImageUrl.trim()}
                                            alt="Vista previa"
                                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #06b6d4' }}
                                            onError={e => { e.currentTarget.style.opacity = '0.3'; }}
                                        />
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Vista previa</span>
                                    </div>
                                )}
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">Especificaciones Técnicas / Notas:</label>
                                <textarea 
                                    className="simi-form-input" 
                                    rows="2"
                                    placeholder="Ej: Cama 220x220, boquilla 0.4mm, temp 210°C..." 
                                    value={formSpecs} 
                                    onChange={e => setFormSpecs(e.target.value)} 
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
                                    {editingItem ? 'Guardar Cambios' : 'Registrar Recurso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Agregar o Editar Página / Herramienta Web */}
            {isWebModalOpen && (
                <div className="simi-modal-backdrop" onClick={() => setIsWebModalOpen(false)}>
                    <div 
                        className="simi-modal-card" 
                        onClick={e => e.stopPropagation()} 
                        style={{ maxWidth: '560px', width: '92vw' }}
                    >
                        <div className="simi-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '10px',
                                    background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Globe size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                        {editingWebItem ? 'Editar Página / Herramienta Web' : 'Nueva Página / Herramienta Web'}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {editingWebItem ? 'Actualiza los enlaces, categoría o logo oficial' : 'Agrega un repositorio, slicer, wiki o IA al catálogo del semillero'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className="simi-modal-close-btn" 
                                onClick={() => setIsWebModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveWeb} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
                            <div className="simi-form-group">
                                <label className="simi-form-label">Nombre del Recurso / Plataforma *</label>
                                <input 
                                    type="text" 
                                    required
                                    className="simi-form-input"
                                    placeholder="Ej: MakerWorld (Bambu Lab), Printables, OrcaSlicer..."
                                    value={webFormName}
                                    onChange={e => setWebFormName(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">URL del Sitio Web *</label>
                                    <input 
                                        type="url" 
                                        required
                                        className="simi-form-input"
                                        placeholder="https://..."
                                        value={webFormUrl}
                                        onChange={e => setWebFormUrl(e.target.value)}
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Categoría *</label>
                                    <select 
                                        className="simi-form-input"
                                        value={webFormCategory}
                                        onChange={e => setWebFormCategory(e.target.value)}
                                    >
                                        <option value="Laminadores & Slicers">Laminadores & Slicers</option>
                                        <option value="Repositorios & Modelos">Repositorios & Modelos</option>
                                        <option value="Calibración & Afinación">Calibración & Afinación</option>
                                        <option value="Guías Técnicas & Wikis">Guías Técnicas & Wikis</option>
                                        <option value="MakerLab Paramétrico">MakerLab Paramétrico</option>
                                        <option value="Inteligencia Artificial 3D">Inteligencia Artificial 3D</option>
                                    </select>
                                </div>
                            </div>

                            {/* URL del Logo Oficial con Previsualizador */}
                            <div className="simi-form-group">
                                <label className="simi-form-label">URL del Logo Oficial (Opcional - Imagen o WebP):</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input 
                                        type="url" 
                                        className="simi-form-input"
                                        style={{ flex: 1 }}
                                        placeholder="https://... (vacío para usar Google Favicon)"
                                        value={webFormLogoUrl}
                                        onChange={e => setWebFormLogoUrl(e.target.value)}
                                    />
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '10px',
                                        background: 'var(--surface-card, #ffffff)',
                                        border: `1.5px solid ${webFormColor}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, overflow: 'hidden', padding: '4px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                                    }}>
                                        {webFormLogoUrl.trim() ? (
                                            <img 
                                                src={webFormLogoUrl.trim()} 
                                                alt="preview" 
                                                referrerPolicy="no-referrer"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                onError={e => { e.currentTarget.style.opacity = '0.3'; }}
                                            />
                                        ) : (
                                            <Globe size={22} color={webFormColor} />
                                        )}
                                    </div>
                                </div>
                                <small style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    Si dejas el logo vacío, el sistema extraerá automáticamente el favicon del dominio en alta resolución.
                                </small>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Subtítulo / Tag:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input"
                                        placeholder="Ej: Perfiles Probados, IA 3D..."
                                        value={webFormTag}
                                        onChange={e => setWebFormTag(e.target.value)}
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <label className="simi-form-label">Badge de Acento:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input"
                                        placeholder="Ej: Prusa Hub, Descarga Oficial..."
                                        value={webFormBadge}
                                        onChange={e => setWebFormBadge(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Color de Marca:</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input 
                                            type="color" 
                                            value={webFormColor}
                                            onChange={e => setWebFormColor(e.target.value)}
                                            style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                        />
                                        <input 
                                            type="text"
                                            className="simi-form-input"
                                            value={webFormColor}
                                            onChange={e => setWebFormColor(e.target.value)}
                                            style={{ flex: 1, fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>

                                <div className="simi-form-group" style={{ justifyContent: 'center' }}>
                                    <label className="simi-form-label">Visibilidad en Home:</label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-heading)', marginTop: '6px' }}>
                                        <input 
                                            type="checkbox"
                                            checked={webFormFeatured}
                                            onChange={e => setWebFormFeatured(e.target.checked)}
                                            style={{ width: '16px', height: '16px', accentColor: '#06b6d4', cursor: 'pointer' }}
                                        />
                                        <span>Destacar en Inicio</span>
                                    </label>
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">Descripción *</label>
                                <textarea 
                                    required
                                    rows={3}
                                    className="simi-form-input"
                                    placeholder="Describe la herramienta, características clave, compatibilidad o función..."
                                    value={webFormDescription}
                                    onChange={e => setWebFormDescription(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
                                <button 
                                    type="button" 
                                    className="simi-res-mini-btn"
                                    onClick={() => setIsWebModalOpen(false)}
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
                                        boxShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.4)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Save size={15} /> {editingWebItem ? 'Guardar Cambios' : 'Agregar Recurso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
