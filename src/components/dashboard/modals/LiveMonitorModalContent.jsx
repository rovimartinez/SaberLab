import React from 'react';
import OnlineStudentsMonitor from '../../admin/OnlineStudentsMonitor';

export const LiveMonitorModalContent = () => {
    return (
        <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
            <OnlineStudentsMonitor />
        </div>
    );
};

export default LiveMonitorModalContent;
