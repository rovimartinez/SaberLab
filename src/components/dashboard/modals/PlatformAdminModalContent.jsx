import React, { useState } from 'react';
import PanelPlataforma from '../../../pages/PanelPlataforma';

export const PlatformAdminModalContent = () => {
    const [platformSubSection, setPlatformSubSection] = useState('users');

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
            <PanelPlataforma showHeader={false} showTabs={false} section={platformSubSection} />
        </div>
    );
};

export default PlatformAdminModalContent;
