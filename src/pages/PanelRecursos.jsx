import React, { useState } from 'react';
import { FolderOpen, FileText, Video, Download, Search, Filter, ExternalLink, Book, Link as LinkIcon } from 'lucide-react';
import '../styles/PanelRecursos.css';

const PanelRecursos = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'Todos', icon: <FolderOpen size={18} />, count: 12 },
        { id: 'guides', name: 'Guías', icon: <Book size={18} />, count: 4 },
        { id: 'videos', name: 'Videos', icon: <Video size={18} />, count: 3 },
        { id: 'documents', name: 'Documentos', icon: <FileText size={18} />, count: 3 },
        { id: 'links', name: 'Enlaces', icon: <LinkIcon size={18} />, count: 2 }
    ];

    const resources = [
        {
            id: 1,
            title: 'Manual de Circuitos Básicos',
            description: 'Guía completa sobre circuitos eléctricos fundamentales',
            category: 'guides',
            subject: 'Electricidad y Electrónica Básica',
            type: 'PDF',
            size: '2.4 MB',
            downloads: 156,
            date: 'Mar 15, 2026',
            color: '#3b82f6'
        },
        {
            id: 2,
            title: 'Tutorial de Soldadura para Principiantes',
            description: 'Aprende las técnicas básicas de soldadura electrónica',
            category: 'videos',
            subject: 'Electricidad y Electrónica Básica',
            type: 'Video',
            duration: '15:30',
            downloads: 89,
            date: 'Mar 10, 2026',
            color: '#f43f5e'
        },
        {
            id: 3,
            title: 'Introducción a Arduino',
            description: 'Conceptos básicos de programación con Arduino',
            category: 'guides',
            subject: 'Robótica Educativa',
            type: 'PDF',
            size: '3.1 MB',
            downloads: 234,
            date: 'Mar 8, 2026',
            color: '#a855f7'
        },
        {
            id: 4,
            title: 'Compilador de Fórmulas Eléctricas',
            description: 'Lista completa de fórmulas para cálculos eléctricos',
            category: 'documents',
            subject: 'Electricidad y Electrónica Básica',
            type: 'PDF',
            size: '1.2 MB',
            downloads: 312,
            date: 'Mar 5, 2026',
            color: '#10b981'
        },
        {
            id: 5,
            title: 'Tutorial: Motores y Servomotores',
            description: 'Video explicativo sobre el funcionamiento de motores',
            category: 'videos',
            subject: 'Robótica Educativa',
            type: 'Video',
            duration: '22:15',
            downloads: 67,
            date: 'Mar 1, 2026',
            color: '#f43f5e'
        },
        {
            id: 6,
            title: 'Simulador de Circuitos Tinkercad',
            description: 'Enlace al simulador de circuitos online',
            category: 'links',
            subject: 'Electricidad y Electrónica Básica',
            type: 'Enlace',
            downloads: 445,
            date: 'Feb 28, 2026',
            color: '#f59e0b'
        },
        {
            id: 7,
            title: 'Hojas de Datos de Componentes',
            description: 'Datasheets de componentes electrónicos comunes',
            category: 'documents',
            subject: 'Electricidad y Electrónica Básica',
            type: 'ZIP',
            size: '15.6 MB',
            downloads: 189,
            date: 'Feb 25, 2026',
            color: '#10b981'
        },
        {
            id: 8,
            title: 'Guía de Proyecto Robot Seguidor de Línea',
            description: 'Instrucciones paso a paso para el proyecto final',
            category: 'guides',
            subject: 'Robótica Educativa',
            type: 'PDF',
            size: '4.8 MB',
            downloads: 278,
            date: 'Feb 20, 2026',
            color: '#a855f7'
        },
        {
            id: 9,
            title: 'Biblioteca de Iconos para Diagramas',
            description: 'Iconos SVG para crear diagramas de circuitos',
            category: 'documents',
            subject: 'Electricidad y Electrónica Básica',
            type: 'ZIP',
            size: '2.1 MB',
            downloads: 134,
            date: 'Feb 18, 2026',
            color: '#10b981'
        },
        {
            id: 10,
            title: 'Comunidad de Arduino en Español',
            description: 'Foro y comunidad de ayuda para proyectos Arduino',
            category: 'links',
            subject: 'Robótica Educativa',
            type: 'Enlace',
            downloads: 523,
            date: 'Feb 15, 2026',
            color: '#f59e0b'
        }
    ];

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'PDF': return <FileText size={18} />;
            case 'Video': return <Video size={18} />;
            case 'ZIP': return <FolderOpen size={18} />;
            case 'Enlace': return <ExternalLink size={18} />;
            default: return <FileText size={18} />;
        }
    };

    return (
        <div className="resources-page">
            <div className="page-header">
                <div className="header-title">
                    <FolderOpen size={28} color="#60a5fa" />
                    <h1>Recursos</h1>
                </div>
            </div>

            <div className="search-and-filter">
                <div className="search-box glass-panel">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar recursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="resources-layout">
                <aside className="categories-sidebar glass-panel">
                    <h3>Categorías</h3>
                    <nav className="categories-nav">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.icon}
                                <span>{category.name}</span>
                                <span className="category-count">{category.count}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="resources-grid-container">
                    {filteredResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Search size={48} color="#64748b" />
                            <h3>No se encontraron recursos</h3>
                            <p>Intenta con otro término de búsqueda o categoría.</p>
                        </div>
                    ) : (
                        <div className="resources-grid">
                            {filteredResources.map(resource => (
                                <div key={resource.id} className="resource-card glass-panel">
                                    <div className="resource-header">
                                        <div 
                                            className="resource-type-badge"
                                            style={{ backgroundColor: `${resource.color}20`, color: resource.color }}
                                        >
                                            {getTypeIcon(resource.type)}
                                            <span>{resource.type}</span>
                                        </div>
                                        <span className="resource-subject">{resource.subject}</span>
                                    </div>
                                    <h3 className="resource-title">{resource.title}</h3>
                                    <p className="resource-description">{resource.description}</p>
                                    <div className="resource-footer">
                                        <div className="resource-meta">
                                            {resource.size && <span>{resource.size}</span>}
                                            {resource.duration && <span>{resource.duration}</span>}
                                            <span>{resource.date}</span>
                                        </div>
                                        <div className="resource-actions">
                                            <button className="action-btn download" title="Descargar">
                                                <Download size={16} />
                                            </button>
                                            {resource.type === 'Enlace' && (
                                                <button className="action-btn external" title="Abrir enlace">
                                                    <ExternalLink size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PanelRecursos;
