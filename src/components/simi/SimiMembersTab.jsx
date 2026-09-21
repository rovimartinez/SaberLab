import { useState } from 'react';
import { Users, Shield, Award, CheckCircle2, AlertTriangle, Search, Filter, Mail, Calendar, Sparkles, Medal, X, Check, ArrowUpRight, Flame, Layers, Image, Edit2, Save, Loader2 } from 'lucide-react';
import { SIMI_PINS_CATALOG } from '../../data/simiData';
import { api } from '../../lib/api';

export default function SimiMembersTab({ 
    members = [], 
    events = [], 
    isLeader, 
    profile,
    memberBadgesMap = {},
    catalogImageUrlsMap = {},
    onBadgeUpdate,
    onCatalogImageUpdate
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedMemberForBadges, setSelectedMemberForBadges] = useState(null);
    const [savingBadgePinId, setSavingBadgePinId] = useState(null);
    const [editingImagePinId, setEditingImagePinId] = useState(null);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [isSavingImage, setIsSavingImage] = useState(false);
    const [savedSuccessPinId, setSavedSuccessPinId] = useState(null);

    // Los miembros recibidos por props ya vienen autorizados y filtrados desde Cloudflare D1 (/api/simi),
    // conteniendo exclusivamente al Director, Líderes I+D y Estudiantes inscritos en SIMI3D / Grupo 6
    const simiOnlyMembers = Array.isArray(members) ? members : [];

    // Calcular estadísticas por miembro (asistencia a capacitaciones y visitas)
    const schoolVisits = events.filter(e => e.event_type !== 'capacitacion_tecnica');
    const technicalTrainings = events.filter(e => e.event_type === 'capacitacion_tecnica');

    const membersWithMetrics = simiOnlyMembers.map(m => {
        const memberId = m.id || m.email;

        // Asistencias confirmadas y verificadas
        const visitCount = schoolVisits.reduce((acc, evt) => {
            const hasAttended = (evt.attendees || []).some(a => a.userId === memberId && (a.attended || a.status === 'Asistiré'));
            return acc + (hasAttended ? 1 : 0);
        }, 0);

        const trainingCount = technicalTrainings.reduce((acc, evt) => {
            const hasAttended = (evt.attendees || []).some(a => a.userId === memberId && (a.attended || a.status === 'Asistiré'));
            return acc + (hasAttended ? 1 : 0);
        }, 0);

        const visitPercent = schoolVisits.length > 0 ? Math.round((visitCount / schoolVisits.length) * 100) : 0;
        const trainingPercent = technicalTrainings.length > 0 ? Math.round((trainingCount / technicalTrainings.length) * 100) : 0;
        const meetsRule = schoolVisits.length > 0 && technicalTrainings.length > 0 ? (visitPercent >= 80 && trainingPercent >= 80) : false;

        // Insignias desbloqueadas de este miembro
        const userBadges = memberBadgesMap[memberId] || {};
        const activeBadgesCount = Object.keys(userBadges).length;

        return {
            ...m,
            visitCount,
            trainingCount,
            visitPercent,
            trainingPercent,
            meetsRule,
            userBadges,
            activeBadgesCount
        };
    });

    const filteredMembers = membersWithMetrics.filter(m => {
        const matchSearch = (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (m.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;
        if (filterRole === 'leader') return m.role === 'leader' || m.role === 'lider';
        if (filterRole === 'staff') return ['admin', 'docente', 'profesor'].includes(m.role);
        if (filterRole === 'student') return !['admin', 'docente', 'profesor', 'leader', 'lider'].includes(m.role);
        return true;
    });

    // Función para asignar / cambiar o revocar grado de insignia en Cloudflare D1
    const handleSetBadgeTier = async (targetMember, pinId, tier) => {
        const targetUserId = targetMember.id || targetMember.email;
        setSavingBadgePinId(pinId);
        try {
            const tierNum = tier === 'none' ? 0 : ['I', 'II', 'III', 'IV', 'V'].indexOf(tier) + 1;
            const exp = tierNum * 100;

            // Actualización optimista inmediata en UI
            if (onBadgeUpdate) {
                onBadgeUpdate(targetUserId, pinId, tier === 'none' ? null : tier, exp);
            }

            const res = await api('/simi', {
                method: 'POST',
                body: {
                    action: 'save-badge',
                    targetUserId,
                    pinId,
                    tier: tier === 'none' ? 'none' : tier,
                    exp
                }
            });

            if (res?.data?.success) {
                if (onBadgeUpdate) {
                    onBadgeUpdate(targetUserId, pinId, tier === 'none' ? null : tier, exp);
                }
            }
        } catch (err) {
            console.error('[SIMI] Error al guardar insignia:', err);
        } finally {
            setSavingBadgePinId(null);
        }
    };

    // Función para guardar o eliminar la URL de la imagen de una insignia en D1
    const handleSaveBadgeImage = async (pinId, newUrl) => {
        setIsSavingImage(true);
        try {
            const cleanUrl = newUrl ? newUrl.trim() : '';
            if (onCatalogImageUpdate) {
                onCatalogImageUpdate(pinId, cleanUrl || null);
            }
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'save-badge-image',
                    pinId,
                    badgeImageUrl: cleanUrl
                }
            });
            
            setSavedSuccessPinId(pinId);
            setTimeout(() => {
                setSavedSuccessPinId(null);
                setEditingImagePinId(null);
                setTempImageUrl('');
            }, 2000);
        } catch (err) {
            console.error('[SIMI] Error al guardar imagen de insignia:', err);
        } finally {
            setIsSavingImage(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Cabecera del Directorio */}
            <div className="simi-members-header-card">
                <div className="simi-members-header-info">
                    <div className="simi-members-header-icon">
                        <Users size={22} />
                    </div>
                    <div>
                        <h3 className="simi-members-header-title">
                            Directorio de Miembros Activos SIMI3D
                        </h3>
                        <p className="simi-members-header-desc">
                            Equipo de investigación, condecoraciones por mérito y monitoreo de la regla de permanencia 80/80.
                        </p>
                    </div>
                </div>

                <div className="simi-members-stats-pills">
                    <span className="simi-member-stat-tag">
                        <strong>{simiOnlyMembers.length}</strong> Miembros Totales
                    </span>
                    <span className="simi-member-stat-tag green">
                        <strong>{membersWithMetrics.filter(m => m.meetsRule).length}</strong> Regla 80/80 al día
                    </span>
                </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="simi-members-toolbar">
                <div className="simi-members-search-box">
                    <Search size={16} color="#64748b" />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o correo institucional..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="simi-members-search-input"
                    />
                </div>

                <div className="simi-members-filter-group">
                    <Filter size={15} color="#06b6d4" />
                    <button 
                        className={`simi-filter-btn ${filterRole === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterRole('all')}
                    >
                        Todos ({simiOnlyMembers.length})
                    </button>
                    <button 
                        className={`simi-filter-btn ${filterRole === 'leader' ? 'active' : ''}`}
                        onClick={() => setFilterRole('leader')}
                    >
                        Líderes I+D
                    </button>
                    <button 
                        className={`simi-filter-btn ${filterRole === 'student' ? 'active' : ''}`}
                        onClick={() => setFilterRole('student')}
                    >
                        Semilleristas
                    </button>
                </div>
            </div>

            {/* Grid de Miembros */}
            <div className="simi-members-grid">
                {filteredMembers.map(member => {
                    const memberId = member.id || member.email;
                    const badges = memberBadgesMap[memberId] || {};
                    const badgeKeys = Object.keys(badges);

                    return (
                        <div key={member.id || member.email} className="simi-member-card">
                            {/* Encabezado Superior de la Tarjeta */}
                            <div className="simi-member-card-top">
                                <div className="simi-member-avatar-box">
                                    {member.avatar_url ? (
                                        <img 
                                            src={member.avatar_url} 
                                            alt={member.full_name} 
                                            referrerPolicy="no-referrer"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <Users size={24} color="#06b6d4" />
                                    )}
                                </div>

                                <div className="simi-member-basic-info">
                                    <h4 className="simi-member-name">
                                        {member.full_name || 'Semillerista SIMI3D'}
                                    </h4>
                                    <div className="simi-member-roles-row">
                                        <span className={`simi-member-role-badge ${member.role}`}>
                                            {member.role === 'leader' || member.role === 'lider' ? '🛡️ Líder SIMI' : 
                                             ['admin', 'docente', 'profesor'].includes(member.role) ? '🎓 Docente' : '⚡ Semillerista'}
                                        </span>
                                        <span className="simi-member-tier-pill">
                                            🎖️ {badgeKeys.length} {badgeKeys.length === 1 ? 'Insignia' : 'Insignias'}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de Gestión de Insignias Exclusivo para Docente / Líder en la parte superior derecha */}
                                {isLeader && (
                                    <button
                                        className="simi-member-manage-badges-btn simi-member-manage-top-right"
                                        onClick={() => setSelectedMemberForBadges(member)}
                                        title={`Gestionar y condecorar insignias a ${member.full_name}`}
                                    >
                                        <Award size={14} />
                                        <span>Condecorar</span>
                                    </button>
                                )}
                            </div>

                            {/* Cuerpo Principal en 2 Columnas Horizontales */}
                            <div className="simi-member-card-body-grid">
                                {/* Columna Izquierda: Insignias */}
                                <div className="simi-member-col-left">
                                    <div className="simi-member-badges-mini-row">
                                        {badgeKeys.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                {badgeKeys.slice(0, 6).map(pinId => {
                                                    const pin = SIMI_PINS_CATALOG.find(p => p.id === pinId);
                                                    const activeImageUrl = catalogImageUrlsMap[pinId] || pin?.badgeImageUrl;
                                                    const tier = badges[pinId]?.tier || 'I';
                                                    const TIER_RANK_NAMES = { 'I': 'Novato', 'II': 'Aprendiz', 'III': 'Junior', 'IV': 'Especialista', 'V': 'Master' };
                                                    const tierNum = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 }[tier] || 1;
                                                    const starColor = tierNum >= 5 ? '#fde047' : tierNum >= 3 ? '#e2e8f0' : '#cd7f32';
                                                    const rankName = TIER_RANK_NAMES[tier] || 'Novato';
                                                    return (
                                                        <div
                                                            key={pinId}
                                                            title={`${pin?.name || pinId} — ${rankName}`}
                                                            style={{
                                                                position: 'relative',
                                                                width: '36px',
                                                                height: '36px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {activeImageUrl ? (
                                                                <img
                                                                    src={activeImageUrl}
                                                                    alt={pin?.name || pinId}
                                                                    style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                                    background: `color-mix(in srgb, ${pin?.color || '#06b6d4'} 18%, #1e293b)`,
                                                                    border: `1.5px solid ${pin?.color || '#06b6d4'}`,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>
                                                                    <Medal size={16} color={pin?.color || '#06b6d4'} />
                                                                </div>
                                                            )}
                                                            <span style={{
                                                                position: 'absolute', bottom: '-4px', left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                background: 'rgba(0,0,0,0.6)',
                                                                borderRadius: '99px',
                                                                padding: '0px 3px',
                                                                fontSize: '0.52rem',
                                                                lineHeight: 1.4,
                                                                boxShadow: `0 0 5px ${starColor}88`,
                                                                border: `1px solid ${starColor}44`,
                                                                whiteSpace: 'nowrap',
                                                                color: starColor,
                                                                textShadow: `0 0 4px ${starColor}`,
                                                            }}>
                                                                {'★'.repeat(tierNum)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                {badgeKeys.length > 6 && (
                                                    <span className="simi-badge-more-chip">+{badgeKeys.length - 6}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="simi-member-no-badges-msg">
                                                <span>🔒 Sin insignias asignadas</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Columna Derecha: Telemetría de Asistencia Separada (80/80) */}
                                <div className="simi-member-col-right">
                                    <div className="simi-member-telemetry-box">
                                        <div className="simi-member-tel-item">
                                            <div className="simi-member-tel-header">
                                                <span>🛠️ Capacitaciones Técnicas</span>
                                                <strong style={{ color: member.trainingPercent >= 80 ? '#059669' : '#d97706' }}>
                                                    {member.trainingPercent}%
                                                </strong>
                                            </div>
                                            <div className="simi-member-tel-bar">
                                                <div 
                                                    className="simi-member-tel-bar-fill training"
                                                    style={{ width: `${Math.min(100, member.trainingPercent)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="simi-member-tel-item">
                                            <div className="simi-member-tel-header">
                                                <span>🏫 Visitas Escolares STEAM</span>
                                                <strong style={{ color: member.visitPercent >= 80 ? '#059669' : '#d97706' }}>
                                                    {member.visitPercent}%
                                                </strong>
                                            </div>
                                            <div className="simi-member-tel-bar">
                                                <div 
                                                    className="simi-member-tel-bar-fill visit"
                                                    style={{ width: `${Math.min(100, member.visitPercent)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer con Estado de la Regla del 80% */}
                            <div className="simi-member-card-footer">
                                {member.meetsRule ? (
                                    <span className="simi-rule-status-tag success">
                                        <CheckCircle2 size={13} /> Regla 80/80 Cumplida
                                    </span>
                                ) : (
                                    <span className="simi-rule-status-tag warning">
                                        <AlertTriangle size={13} /> Asistencia Pendiente
                                    </span>
                                )}
                                <span 
                                    className="simi-member-since simi-member-group-badge"
                                    title={`Grupo Activo: ${member.group_name || (['admin', 'docente', 'profesor'].includes(member.role) ? 'Dirección I+D' : member.role === 'leader' || member.role === 'lider' ? 'Líder Semillero' : 'SIMI 2026II')}`}
                                >
                                    <Users size={12} style={{ color: '#06b6d4', flexShrink: 0 }} />
                                    <span className="simi-member-group-name">
                                        {member.group_name || (['admin', 'docente', 'profesor'].includes(member.role) ? 'Dirección I+D' : member.role === 'leader' || member.role === 'lider' ? 'Líder Semillero' : 'SIMI 2026II')}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── MODAL EXCLUSIVO DOCENTE: CONDECORACIÓN Y GESTIÓN DE INSIGNIAS ── */}
            {selectedMemberForBadges && (() => {
                const targetUid = selectedMemberForBadges.id || selectedMemberForBadges.email;
                const memberBadges = memberBadgesMap[targetUid] || {};

                return (
                    <div className="simi-modal-backdrop" onClick={() => setSelectedMemberForBadges(null)}>
                        <div 
                            className="simi-modal-card simi-condecoration-modal" 
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '820px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div className="simi-modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="simi-condecoration-avatar-box">
                                        {selectedMemberForBadges.avatar_url ? (
                                            <img 
                                                src={selectedMemberForBadges.avatar_url} 
                                                alt="" 
                                                referrerPolicy="no-referrer" 
                                            />
                                        ) : (
                                            <Users size={22} color="#06b6d4" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#B541FA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Panel de Condecoraciones SIMI3D
                                            </span>
                                        </div>
                                        <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#192584' }}>
                                            {selectedMemberForBadges.full_name || 'Semillerista'}
                                        </h3>
                                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                            {selectedMemberForBadges.email}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    className="simi-modal-close-btn"
                                    onClick={() => setSelectedMemberForBadges(null)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p style={{ margin: '0.75rem 0 1.25rem 0', fontSize: '0.86rem', color: '#475569', lineHeight: 1.45 }}>
                                Como <strong>Docente / Líder de Investigación</strong>, selecciona el grado correspondiente para cada especialidad según el mérito, proyectos desarrollados o visitas escolares realizadas por el estudiante.
                            </p>

                            {/* Lista de Insignias para Asignar Grado */}
                            <div className="simi-condecoration-list">
                                {SIMI_PINS_CATALOG.map(pin => {
                                    const currentTier = memberBadges[pin.id]?.tier || 'none';
                                    const isSaving = savingBadgePinId === pin.id;
                                    const activeImageUrl = catalogImageUrlsMap[pin.id] || pin.badgeImageUrl;
                                    const isEditingThisImage = editingImagePinId === pin.id;

                                    return (
                                        <div key={pin.id} className={`simi-condecoration-item ${currentTier !== 'none' ? 'awarded' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                <div className="simi-condecoration-item-left">
                                                    <div className="simi-condecoration-badge-thumb" style={{ position: 'relative' }}>
                                                        {activeImageUrl ? (
                                                            <img src={activeImageUrl} alt={pin.name} />
                                                        ) : (
                                                            <Medal size={24} color={pin.color} />
                                                        )}
                                                    </div>
                                                    <div className="simi-condecoration-info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <strong style={{ color: '#192584', fontSize: '0.94rem' }}>{pin.name}</strong>
                                                            <span style={{ fontSize: '0.72rem', color: pin.color, fontWeight: 800, background: '#f8fafc', padding: '1px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                                {pin.category}
                                                            </span>
                                                            {isLeader && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (isEditingThisImage) {
                                                                            setEditingImagePinId(null);
                                                                        } else {
                                                                            setEditingImagePinId(pin.id);
                                                                            setTempImageUrl(activeImageUrl || '');
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        color: '#06b6d4',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        fontSize: '0.72rem',
                                                                        fontWeight: 700,
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: 'rgba(6, 182, 212, 0.08)'
                                                                    }}
                                                                    title="Editar URL de imagen de la insignia"
                                                                >
                                                                    <Edit2 size={11} /> {activeImageUrl ? 'Cambiar Insignia' : '+ Agregar Insignia'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.35 }}>
                                                            {pin.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Selector de Grados Tácticos */}
                                                <div className="simi-condecoration-tiers-selector">
                                                    <button
                                                        type="button"
                                                        disabled={isSaving}
                                                        className={`simi-tier-btn none ${currentTier === 'none' ? 'active' : ''}`}
                                                        onClick={() => handleSetBadgeTier(selectedMemberForBadges, pin.id, 'none')}
                                                        title="Sin Insignia (Bloqueada)"
                                                    >
                                                        🔒 Bloqueada
                                                    </button>

                                                    {['I', 'II', 'III', 'IV', 'V'].map(tierLevel => (
                                                        <button
                                                            key={tierLevel}
                                                            type="button"
                                                            disabled={isSaving}
                                                            className={`simi-tier-btn ${currentTier === tierLevel ? 'active' : ''}`}
                                                            onClick={() => handleSetBadgeTier(selectedMemberForBadges, pin.id, tierLevel)}
                                                            title={`Asignar Grado ${tierLevel} (${['I', 'II', 'III', 'IV', 'V'].indexOf(tierLevel) * 100 + 100} EXP)`}
                                                        >
                                                            {tierLevel}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Formulario Inline de Edición de URL de Imagen */}
                                            {isEditingThisImage && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    background: '#f8fafc',
                                                    borderRadius: '8px',
                                                    border: '1px dashed #06b6d4',
                                                    marginTop: '4px'
                                                }}>
                                                    <Image size={16} color="#06b6d4" />
                                                    <input
                                                        type="url"
                                                        placeholder="https://i.postimg.cc/xxx/insignia.png (URL directa de la imagen)"
                                                        value={tempImageUrl}
                                                        onChange={e => setTempImageUrl(e.target.value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '4px 8px',
                                                            fontSize: '0.8rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid #cbd5e1',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={isSavingImage || savedSuccessPinId === pin.id}
                                                        onClick={() => handleSaveBadgeImage(pin.id, tempImageUrl)}
                                                        style={{
                                                            padding: '4px 10px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 800,
                                                            backgroundColor: savedSuccessPinId === pin.id ? '#10b981' : '#06b6d4',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: isSavingImage ? 'wait' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        title="Guardar URL de la insignia"
                                                    >
                                                        {isSavingImage ? (
                                                            <>
                                                                <Loader2 size={13} className="simi-spin" /> Guardando...
                                                            </>
                                                        ) : savedSuccessPinId === pin.id ? (
                                                            <>
                                                                <Check size={13} /> ¡Guardado con éxito!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save size={13} /> Guardar
                                                            </>
                                                        )}
                                                    </button>
                                                    {activeImageUrl && (
                                                        <button
                                                            type="button"
                                                            disabled={isSavingImage}
                                                            onClick={() => handleSaveBadgeImage(pin.id, '')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                backgroundColor: '#ef4444',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Eliminar URL de imagen"
                                                        >
                                                            Quitar
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingImagePinId(null)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '0.75rem',
                                                            color: '#64748b',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    className="simi-btn-primary"
                                    onClick={() => setSelectedMemberForBadges(null)}
                                    style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 850 }}
                                >
                                    Cerrar y Confirmar Condecoraciones
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

