import React from 'react';
import SchoolTasksManager from '../../admin/SchoolTasksManager';

class TasksErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('SchoolTasksModal error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-heading)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <h3>Ocurrió un error al cargar Mis Pendientes</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        {this.state.error?.message || 'Error inesperado de renderizado.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            background: '#3478f6',
                            color: '#fff',
                            border: 'none',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export const SchoolTasksModalContent = () => {
    return (
        <div className="admin-modal-tool-wrap animate-fade-in" style={{ width: '100%' }}>
            <TasksErrorBoundary>
                <SchoolTasksManager />
            </TasksErrorBoundary>
        </div>
    );
};

export default SchoolTasksModalContent;
