import React from 'react';
import CourseInviteManager from '../../admin/CourseInviteManager';

export const InviteLinksModalContent = () => {
    return (
        <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
            <CourseInviteManager />
        </div>
    );
};

export default InviteLinksModalContent;
