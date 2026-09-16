import React from 'react';
import PanelMisCursos from '../../../pages/PanelMisCursos';

export const CoursesManagementModalContent = ({ courses = [] }) => {
    return (
        <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
            <PanelMisCursos courses={courses} showHeader={false} embedded={true} />
        </div>
    );
};

export default CoursesManagementModalContent;
