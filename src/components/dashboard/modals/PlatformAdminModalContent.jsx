import React, { useState } from 'react';
import PanelPlataforma from '../../../pages/PanelPlataforma';

export const PlatformAdminModalContent = ({ initialSection = 'users' }) => {
    const [platformSubSection, setPlatformSubSection] = useState(initialSection);

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
                <button 
                    type="button" 
                    className={`admin-subnav-btn ${platformSubSection === 'ai' ? 'active' : ''}`}
                    onClick={() => setPlatformSubSection('ai')}
                >
                    🤖 Estado del Motor IA
                </button>
            </div>
            <PanelPlataforma showHeader={false} showTabs={false} section={platformSubSection} />
        </div>
    );
};

export default PlatformAdminModalContent;
