import React, { useState } from 'react';
import PanelPlataforma from '../../../pages/PanelPlataforma';

export const PlatformAdminModalContent = ({ initialSection = 'users' }) => {
    const [platformSubSection, setPlatformSubSection] = useState(initialSection === 'ai' ? 'users' : initialSection);

    // Si la aplicación solicitada es 'ai' (Estado de la IA), se muestra únicamente la telemetría del Motor IA sin controles ni pestañas de Plataforma
    if (initialSection === 'ai') {
        return (
            <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
                <PanelPlataforma showHeader={false} showTabs={false} section="ai" />
            </div>
        );
    }

    // Para la app de Plataforma, se muestran únicamente la Gestión de Usuarios y Catálogos (sin la pestaña de IA)
    return (
        <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
            <div className="admin-modal-subnav">
                <button 
                    type="button" 
                    className={`admin-subnav-btn ${platformSubSection === 'users' ? 'active' : ''}`}
                    onClick={() => setPlatformSubSection('users')}
                >
                    👥 Gestión de Usuarios
                </button>
                <button 
                    type="button" 
                    className={`admin-subnav-btn ${platformSubSection === 'settings' ? 'active' : ''}`}
                    onClick={() => setPlatformSubSection('settings')}
                >
                    ⚙️ Catálogos & Ajustes
                </button>
            </div>
            <PanelPlataforma showHeader={false} showTabs={false} section={platformSubSection === 'ai' ? 'users' : platformSubSection} />
        </div>
    );
};

export default PlatformAdminModalContent;
