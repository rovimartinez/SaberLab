import React from 'react';
import PanelExamenes from '../../../pages/PanelExamenes';

export const ExamsManagementModalContent = () => {
    return (
        <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
            <PanelExamenes />
        </div>
    );
};

export default ExamsManagementModalContent;
