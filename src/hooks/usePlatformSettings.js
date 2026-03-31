import { useState, useEffect } from 'react';

// Valores por defecto para la primera vez
const DEFAULT_INSTITUTIONS = ['Colegio San José', 'Universidad Nacional', 'Instituto Técnico'];
const DEFAULT_SPECIALTIES = ['Educación Primaria', 'Educación Secundaria', 'Tecnología e Informática', 'Química y Biología', 'Matemáticas y Física', 'Lengua y Literatura'];

export const usePlatformSettings = () => {
    // Inicializar desde localStorage o usar valores por defecto
    const [institutions, setInstitutions] = useState(() => {
        const saved = localStorage.getItem('saberlab_institutions');
        return saved ? JSON.parse(saved) : DEFAULT_INSTITUTIONS;
    });

    const [specialties, setSpecialties] = useState(() => {
        const saved = localStorage.getItem('saberlab_specialties');
        return saved ? JSON.parse(saved) : DEFAULT_SPECIALTIES;
    });

    // Guardar en localStorage cada vez que cambian
    useEffect(() => {
        localStorage.setItem('saberlab_institutions', JSON.stringify(institutions));
    }, [institutions]);

    useEffect(() => {
        localStorage.setItem('saberlab_specialties', JSON.stringify(specialties));
    }, [specialties]);

    // Funciones de utilidad para agregar/eliminar
    const addInstitution = (name) => {
        if (name && !institutions.includes(name)) {
            setInstitutions([...institutions, name]);
        }
    };

    const removeInstitution = (name) => {
        setInstitutions(institutions.filter(i => i !== name));
    };

    const updateInstitution = (oldName, newName) => {
        if (newName && !institutions.includes(newName)) {
            setInstitutions(institutions.map(i => i === oldName ? newName : i));
        }
    };

    const addSpecialty = (name) => {
        if (name && !specialties.includes(name)) {
            setSpecialties([...specialties, name]);
        }
    };

    const removeSpecialty = (name) => {
        setSpecialties(specialties.filter(s => s !== name));
    };

    const updateSpecialty = (oldName, newName) => {
        if (newName && !specialties.includes(newName)) {
            setSpecialties(specialties.map(s => s === oldName ? newName : s));
        }
    };

    return {
        institutions,
        addInstitution,
        removeInstitution,
        updateInstitution,
        specialties,
        addSpecialty,
        removeSpecialty,
        updateSpecialty
    };
};
