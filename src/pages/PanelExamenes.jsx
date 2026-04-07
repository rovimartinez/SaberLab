import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check, Clock, Download, Upload, HelpCircle, ChevronRight, ClipboardList, FileText, UploadCloud, CheckCircle2, Layers, ListOrdered, Type } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';

const PanelExamenes = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEval, setEditingEval] = useState(null);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [selectedEval, setSelectedEval] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [view, setView] = useState('list');
    const [isSelectingType, setIsSelectingType] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [currentType, setCurrentType] = useState(null);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
    const [isDragging, setIsDragging] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [correctAnswerVF, setCorrectAnswerVF] = useState('Verdadero');
    const [pairOptions, setPairOptions] = useState([{ left: '', right: '' }]);
    const [textAnswer, setTextAnswer] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [visualMode, setVisualMode] = useState(false);
    const [localQuestions, setLocalQuestions] = useState([]);
    const [importPreview, setImportPreview] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        course_id: '', module_id: '', evaluation_key: '', title: '', description: '', type: 'quiz', max_score: 100, points: 100, time_limit: 30, passing_score: 70, is_published: false, instructions: ''
    });

    const questionTypes = [
        { id: 'opcion_multiple', label: 'Opción Múltiple', icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: 'verdadero_falso', label: 'Verdadero / Falso', icon: <Layers className="w-4 h-4" /> },
        { id: 'emparejar', label: 'Emparejar', icon: <HelpCircle className="w-4 h-4" /> },
        { id: 'ordenar', label: 'Ordenar', icon: <ListOrdered className="w-4 h-4" /> },
        { id: 'escribir', label: 'Escribir', icon: <Type className="w-4 h-4" /> },
    ];

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: evalsRes } = await supabase.from('evaluaciones').select('*').order('created_at', { ascending: false });
        if (evalsRes) setEvaluations(evalsRes);
        setLoading(false);
    };

    const getCourseName = (courseId) => {
        const course = COURSES_DEFINITION.find(c => c.id === courseId);
        return course?.name || `Curso ${courseId}`;
    };

    const getModulesForCourse = (courseId) => {
        const course = COURSES_DEFINITION.find(c => String(c.id) === String(courseId));
        return course?.modules || [];
    };

    const handleEdit = (evalItem) => {
        setEditingEval(evalItem);
        setFormData({
            course_id: evalItem.course_id !== undefined && evalItem.course_id !== null ? String(evalItem.course_id) : '', module_id: evalItem.module_id, evaluation_key: evalItem.evaluation_key, title: evalItem.title, description: evalItem.description || '', type: evalItem.type || 'quiz', max_score: evalItem.max_score || 100, points: evalItem.points || 100, time_limit: evalItem.time_limit || 30, passing_score: evalItem.passing_score || 70, is_published: evalItem.is_published || false, instructions: evalItem.instructions || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            course_id: formData.course_id ? Number(formData.course_id) : null,
            max_score: formData.max_score ? Number(formData.max_score) : 100,
            points: formData.points ? Number(formData.points) : 100,
            time_limit: formData.time_limit ? Number(formData.time_limit) : 30,
            passing_score: formData.passing_score ? Number(formData.passing_score) : 70,
            is_published: Boolean(formData.is_published)
        };

        let result;
        if (editingEval) {
            result = await supabase.from('evaluaciones').update(payload).eq('id', editingEval.id);
        } else {
            result = await supabase.from('evaluaciones').insert(payload);
        }

        if (result.error) {
            console.error('Error guardando evaluación:', result.error);
            alert(`No se pudo guardar la evaluación: ${result.error.message}`);
            return;
        }

        setShowModal(false);
        fetchData();
        resetEvaluationForm();
    };

    const handleDelete = async (id) => {
        if (confirm('¿Eliminar evaluación?')) {
            await supabase.from('evaluaciones').delete().eq('id', id);
            fetchData();
        }
    };

    const handlePublish = async (evalItem) => {
        await supabase.from('evaluaciones').update({ is_published: !evalItem.is_published }).eq('id', evalItem.id);
        fetchData();
    };

    const resetEvaluationForm = () => {
        setFormData({ course_id: '', module_id: '', evaluation_key: '', title: '', description: '', type: 'quiz', max_score: 100, points: 100, time_limit: 30, passing_score: 70, is_published: false, instructions: '' });
    };

    const handleSelectType = (type) => {
        setCurrentType(type);
        setIsSelectingType(false);
        setIsAdding(true);
        if (type.id === 'verdadero_falso') {
            setOptions([{ text: 'Verdadero', isCorrect: true }, { text: 'Falso', isCorrect: false }]);
            setCorrectAnswerVF('Verdadero');
        } else if (type.id === 'escribir') {
            setOptions([]);
            setTextAnswer('');
        } else if (type.id === 'emparejar') {
            setPairOptions([{ left: '', right: '' }]);
            setOptions([]);
        } else if (type.id === 'ordenar') {
            setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);
        } else {
            setOptions([{ text: '', isCorrect: false }]);
        }
    };

    const handleAddOption = () => { if (options.length < 6) setOptions([...options, { text: '', isCorrect: false }]); };
    const handleRemoveOption = (index) => { setOptions(options.filter((_, i) => i !== index)); };
    const handleOptionChange = (index, text) => { const newOptions = [...options]; newOptions[index].text = text; setOptions(newOptions); };
    const toggleCorrect = (index) => { const newOptions = options.map((opt, i) => ({ ...opt, isCorrect: i === index })); setOptions(newOptions); };
    const handleAddPair = () => { if (pairOptions.length < 6) setPairOptions([...pairOptions, { left: '', right: '' }]); };
    const handleRemovePair = (index) => { setPairOptions(pairOptions.filter((_, i) => i !== index)); };
    const handlePairChange = (index, field, value) => { const newPairs = [...pairOptions]; newPairs[index][field] = value; setPairOptions(newPairs); };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestionText.trim()) return;
        
        let correctAnswer = '';
        let optionsToSave = [];

        if (currentType.id === 'opcion_multiple') {
            correctAnswer = options.find(o => o.isCorrect)?.text || '';
            optionsToSave = options.map(o => o.text);
        } else if (currentType.id === 'verdadero_falso') {
            correctAnswer = correctAnswerVF;
            optionsToSave = ['Verdadero', 'Falso'];
        } else if (currentType.id === 'escribir') {
            correctAnswer = textAnswer;
            optionsToSave = [];
        } else if (currentType.id === 'emparejar') {
            correctAnswer = JSON.stringify(pairOptions);
            optionsToSave = pairOptions.map(p => `${p.left}|${p.right}`);
        } else if (currentType.id === 'ordenar') {
            correctAnswer = options.map(o => o.text).join('|');
            optionsToSave = options.map((o, idx) => `${idx + 1}. ${o.text}`);
        }

        let updatedQuestions = [...localQuestions];
        
        if (editingQuestion) {
            const idx = updatedQuestions.findIndex(q => q.id === editingQuestion.id);
            if (idx !== -1) {
                updatedQuestions[idx] = { ...updatedQuestions[idx], question_text: newQuestionText, question_type: currentType.id, options: optionsToSave, correct_answer: correctAnswer, points: 10, difficulty: 'medium' };
            }
        } else {
            const newQuestion = { id: Date.now().toString(), question_text: newQuestionText, question_type: currentType.id, options: optionsToSave, correct_answer: correctAnswer, points: 10, difficulty: 'medium', order_index: localQuestions.length + 1 };
            updatedQuestions.push(newQuestion);
        }

        const { error } = await supabase.from('evaluaciones').update({ questions: updatedQuestions }).eq('id', selectedEval.id);
        if (error) {
            console.error('Error guardando pregunta:', error);
            alert(`Error guardando pregunta: ${error.message}`);
            return;
        }
        setLocalQuestions(updatedQuestions);
        setQuestions(updatedQuestions);
        await fetchData(); // Refrescar lista
        resetForm();
    };

    const resetForm = () => {
        setIsAdding(false);
        setIsSelectingType(false);
        setNewQuestionText('');
        setOptions([{ text: '', isCorrect: false }]);
        setCurrentType(null);
        setView('list');
        setEditingQuestion(null);
        setCorrectAnswerVF('Verdadero');
        setPairOptions([{ left: '', right: '' }]);
        setTextAnswer('');
        resetEvaluationForm();
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setImportErrors([]);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            if (!json || json.length < 2) return;
            const headers = json[0].map(h => h.toString().trim());
            const parsedQuestions = [];
            const errors = [];
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row[0]) continue;
                const rowData = {};
                headers.forEach((h, idx) => rowData[h] = row[idx]?.toString() || '');
                if (!rowData['Pregunta']) {
                    errors.push({ row: i, message: 'Falta enunciado' });
                    continue;
                }
                const allOptions = [rowData['Opcion_A'], rowData['Opcion_B'], rowData['Opcion_C'], rowData['Opcion_D'], rowData['Opcion_E'], rowData['Opcion_F']];
                const validOptions = allOptions.filter(opt => opt && opt.trim() !== '');
                let correctAnswer = rowData['Respuesta_Correcta'];
                if (!correctAnswer || correctAnswer.trim() === '') {
                    errors.push({ row: i, message: 'Falta respuesta correcta' });
                    continue;
                }
                const questionType = rowData['Tipo'] || 'opcion_multiple';
                if (questionType === 'verdadero_falso') {
                    const optA = (rowData['Opcion_A'] || '').toLowerCase().trim();
                    const optB = (rowData['Opcion_B'] || '').toLowerCase().trim();
                    if (!validOptions || validOptions.length < 2) {
                        errors.push({ row: i, message: 'Verdadero/Falso requiere 2 opciones' });
                        continue;
                    }
                    if ((optA !== 'verdadero' && optA !== 'falso') || (optB !== 'verdadero' && optB !== 'falso') || optA === optB) {
                        errors.push({ row: i, message: 'Opciones deben ser "Verdadero" y "Falso"' });
                        continue;
                    }
                    if ((correctAnswer === 'A' || correctAnswer === 'a') && optA !== 'verdadero') {
                        errors.push({ row: i, message: 'Opción A debe ser "Verdadero" para respuesta A' });
                        continue;
                    }
                    if ((correctAnswer === 'A' || correctAnswer === 'a') && optA === 'verdadero') correctAnswer = 'Verdadero';
                    if ((correctAnswer === 'B' || correctAnswer === 'b') && optB !== 'falso') {
                        errors.push({ row: i, message: 'Opción B debe ser "Falso" para respuesta B' });
                        continue;
                    }
                    if ((correctAnswer === 'B' || correctAnswer === 'b') && optB === 'falso') correctAnswer = 'Falso';
                }
                if (questionType === 'opcion_multiple' && validOptions.length < 2) {
                    errors.push({ row: i, message: 'Mínimo 2 opciones requeridas' });
                    continue;
                }
                parsedQuestions.push({ id: Date.now().toString() + Math.random(), question_text: rowData['Pregunta'], question_type: questionType, options: validOptions, correct_answer: correctAnswer, points: parseInt(rowData['Puntos']) || 10, difficulty: 'medium', order_index: i });
            }
            if (errors.length > 0) {
                setImportErrors(errors);
            } else {
                setImportPreview(parsedQuestions);
            }
        }
    };

    const openQuestionsModal = async (evalItem) => {
        setSelectedEval(evalItem);
        setView('list');
        setIsSelectingType(false);
        setIsAdding(false);
        setVisualMode(false);
        let loadedQuestions = [];
        if (evalItem.questions && Array.isArray(evalItem.questions) && evalItem.questions.length > 0) {
            loadedQuestions = evalItem.questions;
        }
        setLocalQuestions(loadedQuestions);
        setQuestions(loadedQuestions);
        setShowQuestionsModal(true);
    };

    const updateQuestion = async (questionId, updates) => {
        const updatedQuestions = localQuestions.map(q => q.id === questionId ? { ...q, ...updates } : q);
        const { error } = await supabase.from('evaluaciones').update({ questions: updatedQuestions }).eq('id', selectedEval.id);
        if (error) {
            console.error('Error actualizando pregunta:', error);
            alert(`Error actualizando pregunta: ${error.message}`);
            return;
        }
        setLocalQuestions(updatedQuestions);
        setQuestions(updatedQuestions);
        await fetchData(); // Refrescar lista
    };

    const deleteQuestion = async (questionId) => {
        if (showDeleteConfirm === questionId) {
            const updatedQuestions = localQuestions.filter(q => q.id !== questionId);
            const { error } = await supabase.from('evaluaciones').update({ questions: updatedQuestions }).eq('id', selectedEval.id);
            if (error) {
                console.error('Error eliminando pregunta:', error);
                alert(`Error eliminando pregunta: ${error.message}`);
                return;
            }
            setLocalQuestions(updatedQuestions);
            setQuestions(updatedQuestions);
            setShowDeleteConfirm(null);
            await fetchData(); // Refrescar lista
        } else {
            setShowDeleteConfirm(questionId);
            setTimeout(() => setShowDeleteConfirm(null), 3000);
        }
    };

    const openEditQuestion = (question) => {
        setEditingQuestion(question);
        setCurrentType(questionTypes.find(t => t.id === question.question_type) || questionTypes[0]);
        setNewQuestionText(question.question_text);
        let parsedOptions = [];
        if (Array.isArray(question.options)) {
            parsedOptions = question.options;
        } else {
            try { parsedOptions = JSON.parse(question.options); } catch (e) { parsedOptions = []; }
        }
        if (question.question_type === 'verdadero_falso') {
            setOptions([{ text: 'Verdadero', isCorrect: question.correct_answer === 'Verdadero' }, { text: 'Falso', isCorrect: question.correct_answer === 'Falso' }]);
            setCorrectAnswerVF(question.correct_answer || 'Verdadero');
        } else if (question.question_type === 'escribir') {
            setOptions([]);
            setTextAnswer(question.correct_answer || '');
        } else if (question.question_type === 'emparejar') {
            try { const pairs = JSON.parse(question.correct_answer); setPairOptions(pairs); } catch (e) { setPairOptions([{ left: '', right: '' }]); }
            setOptions([]);
        } else if (question.question_type === 'ordenar') {
            const orderItems = question.correct_answer ? question.correct_answer.split('|') : [];
            setOptions(orderItems.map(text => ({ text, isCorrect: false })));
        } else {
            setOptions(parsedOptions.map((opt, idx) => ({ text: opt, isCorrect: opt === question.correct_answer })));
        }
        setIsAdding(true);
    };

    if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Cargando...</div>;

    return (
        <div className="admin-evaluations">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'white', margin: 0 }}>Evaluaciones</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        onClick={() => {
                            const data = [{ Pregunta: "¿Qué es Arduino?", Tipo: "opcion_multiple", Opcion_A: "Una marca de pizzas", Opcion_B: "Una plataforma de hardware libre", Opcion_C: "Un lenguaje de programación", Opcion_D: "Un sistema operativo", Opcion_E: "", Opcion_F: "", Respuesta_Correcta: "B", Puntos: 10 }];
                            const workbook = XLSX.utils.book_new();
                            const worksheet = XLSX.utils.json_to_sheet(data);
                            XLSX.utils.book_append_sheet(workbook, worksheet, "Preguntas");
                            XLSX.writeFile(workbook, "plantilla.xlsx");
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', color: '#a855f7', cursor: 'pointer' }}
                    >
                        <Download size={18} />
                        Plantilla
                    </button>
                    <button onClick={() => { resetEvaluationForm(); setEditingEval(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--accent-blue)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                        <Plus size={18} />
                        Nueva Evaluación
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {evaluations.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No hay evaluaciones aún</div>
                ) : (
                    evaluations.map(evalItem => (
                        <div key={evalItem.id} style={{ padding: '1rem', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{evalItem.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <span>{getCourseName(evalItem.course_id)}</span>
                                    <span>Módulo: {evalItem.module_id}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{evalItem.is_published ? <Check size={14} color="#10b981" /> : <Clock size={14} />}{evalItem.is_published ? 'Publicado' : 'Borrador'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openQuestionsModal(evalItem)} style={{ padding: '0.5rem', background: 'var(--accent-blue)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Preguntas</button>
                                <button onClick={() => handlePublish(evalItem)} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>{evalItem.is_published ? 'Despublicar' : 'Publicar'}</button>
                                <button onClick={() => handleEdit(evalItem)} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(evalItem.id)} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div style={{ width: '100%', maxWidth: '32rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.5rem', padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>{editingEval ? 'Editar Evaluación' : 'Nueva Evaluación'}</h3>
                            <button onClick={() => { setShowModal(false); resetEvaluationForm(); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', borderRadius: '9999px' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <input type="text" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} />
                            <textarea placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', minHeight: '80px' }} />
                            <textarea placeholder="Instrucciones para el estudiante" value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} style={{ padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', minHeight: '80px' }} />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Límite de tiempo (minutos)</label>
                                    <input type="number" placeholder="Minutos" value={formData.time_limit} onChange={e => setFormData({...formData, time_limit: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Puntaje mínimo aprobatorio</label>
                                    <input type="number" placeholder="70" value={formData.passing_score} onChange={e => setFormData({...formData, passing_score: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} />
                                </div>
                            </div>

                            <select value={String(formData.course_id)} onChange={e => {
                                const selectedCourse = e.target.value;
                                const modules = getModulesForCourse(selectedCourse);
                                setFormData({
                                    ...formData,
                                    course_id: selectedCourse,
                                    module_id: modules.length > 0 ? modules[0].id : ''
                                });
                            }} required style={{ padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}>
                                <option value="">Seleccionar curso</option>
                                {COURSES_DEFINITION.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                            </select>
                            <select value={String(formData.module_id)} onChange={e => setFormData({...formData, module_id: e.target.value})} required disabled={!formData.course_id} style={{ padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}>
                                <option value="">{formData.course_id ? 'Seleccionar módulo' : 'Selecciona curso primero'}</option>
                                {getModulesForCourse(formData.course_id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <button type="submit" style={{ padding: '0.75rem', background: 'var(--accent-blue)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>{editingEval ? 'Guardar cambios' : 'Crear evaluación'}</button>
                        </form>
                    </div>
                </div>
            )}

            {showQuestionsModal && selectedEval && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.5)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '3rem', height: '3rem', background: 'rgba(59,130,246,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <ClipboardList size={24} style={{ color: '#60a5fa' }} />
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em' }}>{view === 'list' ? 'Gestión de Preguntas' : 'Importar Reactivos'}</h1>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{view === 'list' ? 'Configura los reactivos de tu examen' : 'Sube tu archivo Excel o CSV'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={async () => { 
                                    const { data: evalData } = await supabase.from('evaluaciones').select('questions').eq('id', selectedEval.id).single();
                                    setQuestions(evalData?.questions || []);
                                    setLocalQuestions(evalData?.questions || []);
                                    setShowQuestionsModal(false); 
                                    resetEvaluationForm(); 
                                }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', borderRadius: '9999px', cursor: 'pointer' }}><X size={20} style={{ color: '#64748b' }} /></button>
                            </div>
                        </div>

                        <div style={{ padding: '2rem', minHeight: '460px', overflowY: 'auto' }}>
                            {visualMode ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>Editor Visual de Preguntas</h3>
                                        <button onClick={() => { setVisualMode(false); setIsSelectingType(false); setIsAdding(false); }} style={{ padding: '0.5rem 1rem', background: 'rgba(30,41,59,0.5)', border: '1px solid #334155', borderRadius: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
                                    </div>
                                    {localQuestions.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}><p>No hay preguntas. Agrega una desde el menú principal.</p></div>
                                    ) : (
                                        localQuestions.map((q, idx) => (
                                            <div key={q.id} style={{ padding: '1rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                    <div style={{ width: '2rem', height: '2rem', background: '#0f172a', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '0.875rem' }}>{idx + 1}</div>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{q.question_type}</span>
                                                    <button onClick={() => deleteQuestion(q.id)} style={{ marginLeft: 'auto', padding: '0.25rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                </div>
                                                <input type="text" value={q.question_text} onChange={(e) => { const updated = [...localQuestions]; updated[idx].question_text = e.target.value; setLocalQuestions(updated); }} onBlur={async () => { const { error } = await supabase.from('evaluaciones').update({ questions: localQuestions }).eq('id', selectedEval.id); if (error) { console.error('Error guardando cambios:', error); alert(`Error guardando cambios: ${error.message}`); } else { setQuestions(localQuestions); await fetchData(); } }} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem', marginBottom: '0.75rem' }} />
                                                {q.question_type === 'opcion_multiple' && (
                                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                        {(Array.isArray(q.options) ? q.options : []).map((opt, optIdx) => {
                                                            const letter = String.fromCharCode(65 + optIdx);
                                                            const isCorrect = q.correct_answer === letter || q.correct_answer === opt;
                                                            return (
                                                                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <button 
                                                                        onClick={async () => { 
                                                                            const updated = [...localQuestions]; 
                                                                            updated[idx].correct_answer = letter; 
                                                                            setLocalQuestions(updated); 
                                                                            const { error } = await supabase.from('evaluaciones').update({ questions: updated }).eq('id', selectedEval.id);
                                                                            if (error) {
                                                                                console.error('Error guardando cambios:', error);
                                                                                alert(`Error guardando cambios: ${error.message}`);
                                                                            } else {
                                                                                setQuestions(updated);
                                                                                await fetchData();
                                                                            }
                                                                        }}
                                                                        style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: isCorrect ? 'rgba(34,197,94,0.2)' : '#0f172a', border: `1px solid ${isCorrect ? '#22c55e' : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCorrect ? '#4ade80' : '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}
                                                                    >{letter}</button>
                                                                    <input type="text" value={opt} onChange={(e) => { const updated = [...localQuestions]; updated[idx].options[optIdx] = e.target.value; setLocalQuestions(updated); }} onBlur={async () => { const { error } = await supabase.from('evaluaciones').update({ questions: localQuestions }).eq('id', selectedEval.id); if (error) { console.error('Error guardando cambios:', error); alert(`Error guardando cambios: ${error.message}`); } else { setQuestions(localQuestions); await fetchData(); } }} style={{ flex: 1, padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', color: 'white', fontSize: '0.8rem' }} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {q.question_type === 'verdadero_falso' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={async () => { const updated = [...localQuestions]; updated[idx].correct_answer = 'Verdadero'; setLocalQuestions(updated); const { error } = await supabase.from('evaluaciones').update({ questions: updated }).eq('id', selectedEval.id); if (error) { console.error('Error guardando cambios:', error); alert(`Error guardando cambios: ${error.message}`); } else { setQuestions(updated); await fetchData(); } }} style={{ flex: 1, padding: '0.5rem', background: q.correct_answer === 'Verdadero' ? 'rgba(34,197,94,0.2)' : '#0f172a', border: `1px solid ${q.correct_answer === 'Verdadero' ? '#22c55e' : '#334155'}`, borderRadius: '0.25rem', color: q.correct_answer === 'Verdadero' ? '#4ade80' : '#64748b', cursor: 'pointer' }}>✓ Verdadero</button>
                                                        <button onClick={async () => { const updated = [...localQuestions]; updated[idx].correct_answer = 'Falso'; setLocalQuestions(updated); const { error } = await supabase.from('evaluaciones').update({ questions: updated }).eq('id', selectedEval.id); if (error) { console.error('Error guardando cambios:', error); alert(`Error guardando cambios: ${error.message}`); } else { setQuestions(updated); await fetchData(); } }} style={{ flex: 1, padding: '0.5rem', background: q.correct_answer === 'Falso' ? 'rgba(239,68,68,0.2)' : '#0f172a', border: `1px solid ${q.correct_answer === 'Falso' ? '#ef4444' : '#334155'}`, borderRadius: '0.25rem', color: q.correct_answer === 'Falso' ? '#f87171' : '#64748b', cursor: 'pointer' }}>✗ Falso</button>
                                                    </div>
                                                )}
                                                {q.question_type === 'escribir' && (
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Respuesta esperada:</label>
                                                        <input type="text" value={q.correct_answer || ''} onChange={(e) => { const updated = [...localQuestions]; updated[idx].correct_answer = e.target.value; setLocalQuestions(updated); }} onBlur={async () => { const { error } = await supabase.from('evaluaciones').update({ questions: localQuestions }).eq('id', selectedEval.id); if (error) { console.error('Error guardando cambios:', error); alert(`Error guardando cambios: ${error.message}`); } else { setQuestions(localQuestions); await fetchData(); } }} style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', color: 'white', fontSize: '0.8rem' }} />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : view === 'list' ? (
                                <>
                                    {!isSelectingType && !isAdding && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                            <button onClick={() => setIsSelectingType(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', background: '#2563eb', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: 600, cursor: 'pointer' }}><Plus size={16} />Pregunta</button>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => setView('import')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'rgba(30,41,59,0.5)', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}><Upload size={16} style={{ color: '#94a3b8' }} />Importar</button>
                                                <button onClick={() => setVisualMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}><Layers size={16} />Editor Visual</button>
                                            </div>
                                        </div>
                                    )}

                                    {isSelectingType && (
                                        <div>
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Selecciona el tipo:</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                                {questionTypes.map((type) => (
                                                    <button key={type.id} onClick={() => handleSelectType(type)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(30,41,59,0.3)', border: '1px solid #1e293b', borderRadius: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all' }}>
                                                        <div style={{ width: '2.5rem', height: '2.5rem', background: '#0f172a', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{type.icon}</div>
                                                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isAdding && (
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', marginBottom: '0.5rem' }}>
                                                {currentType?.icon}
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentType?.label}</span>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Enunciado</label>
                                                <textarea autoFocus value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} placeholder="Escribe la pregunta..." style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'white', minHeight: '100px', outline: 'none' }} />
                                            </div>

                                            {currentType?.id !== 'escribir' && currentType?.id !== 'emparejar' && currentType?.id !== 'ordenar' && currentType?.id !== 'verdadero_falso' && (
                                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Respuestas</label>
                                                        <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: options.length === 6 ? '#f97316' : '#475569' }}>{options.length} / 6 máx.</span>
                                                    </div>
                                                    {options.map((opt, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {currentType?.id === 'opcion_multiple' && (<button onClick={() => toggleCorrect(idx)} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: opt.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(30,41,59,0.4)', border: 'none', color: opt.isCorrect ? '#4ade80' : '#475569', cursor: 'pointer' }}><CheckCircle2 size={20} /></button>)}
                                                            {currentType?.id === 'ordenar' && (<div style={{ width: '2rem', height: '2rem', background: '#1e293b', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '0.875rem' }}>{idx + 1}</div>)}
                                                            <input type="text" value={opt.text} disabled={currentType?.id === 'verdadero_falso' || currentType?.id === 'ordenar'} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Opción ${idx + 1}`} style={{ flex: 1, background: 'rgba(30,41,59,0.4)', border: '1px solid #1e293b', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'white', outline: 'none' }} />
                                                            {currentType?.id !== 'verdadero_falso' && currentType?.id !== 'ordenar' && options.length > 1 && (<button onClick={() => handleRemoveOption(idx)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={16} /></button>)}
                                                        </div>
                                                    ))}
                                                    {currentType?.id === 'opcion_multiple' && options.length < 6 && (<button onClick={handleAddOption} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(59,130,246,0.7)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><Plus size={12} /> Añadir opción</button>)}
                                                </div>
                                            )}

                                            {currentType?.id === 'verdadero_falso' && (
                                                <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.3)', border: '1px solid #1e293b', borderRadius: '0.75rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>Respuesta Correcta</label>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button onClick={() => setCorrectAnswerVF('Verdadero')} style={{ flex: 1, padding: '0.75rem', background: correctAnswerVF === 'Verdadero' ? 'rgba(34,197,94,0.2)' : '#0f172a', border: `1px solid ${correctAnswerVF === 'Verdadero' ? '#22c55e' : '#1e293b'}`, borderRadius: '0.5rem', color: correctAnswerVF === 'Verdadero' ? '#4ade80' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>✓ Verdadero</button>
                                                        <button onClick={() => setCorrectAnswerVF('Falso')} style={{ flex: 1, padding: '0.75rem', background: correctAnswerVF === 'Falso' ? 'rgba(239,68,68,0.2)' : '#0f172a', border: `1px solid ${correctAnswerVF === 'Falso' ? '#ef4444' : '#1e293b'}`, borderRadius: '0.5rem', color: correctAnswerVF === 'Falso' ? '#f87171' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>✗ Falso</button>
                                                    </div>
                                                </div>
                                            )}

                                            {currentType?.id === 'escribir' && (
                                                <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.3)', border: '1px solid #1e293b', borderRadius: '0.75rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Respuesta Esperada (para corrección)</label>
                                                    <input type="text" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Escribe la respuesta correcta" style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'white', outline: 'none' }} />
                                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>El estudiante verá solo el enunciado y escribirá su respuesta.</p>
                                                </div>
                                            )}

                                            {currentType?.id === 'emparejar' && (
                                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Pares a Emparejar</label>
                                                        <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: pairOptions.length === 6 ? '#f97316' : '#475569' }}>{pairOptions.length} / 6 máx.</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                        {pairOptions.map((pair, idx) => (
                                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                                                                <input type="text" value={pair.left} onChange={(e) => handlePairChange(idx, 'left', e.target.value)} placeholder={`Item ${idx + 1}`} style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid #1e293b', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'white', outline: 'none' }} />
                                                                <ChevronRight size={20} style={{ color: '#475569' }} />
                                                                <input type="text" value={pair.right} onChange={(e) => handlePairChange(idx, 'right', e.target.value)} placeholder={`Pareja ${idx + 1}`} style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid #1e293b', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'white', outline: 'none' }} />
                                                                {pairOptions.length > 1 && (<button onClick={() => handleRemovePair(idx)} style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={14} /></button>)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {pairOptions.length < 6 && (<button onClick={handleAddPair} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(59,130,246,0.7)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><Plus size={12} /> Añadir par</button>)}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                                                <button onClick={handleSaveQuestion} style={{ flex: 1, background: '#2563eb', color: 'white', fontWeight: 700, padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}><Check size={20} /> Guardar Pregunta</button>
                                                <button onClick={resetForm} style={{ background: '#1e293b', color: '#94a3b8', fontWeight: 700, padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                                            </div>
                                        </div>
                                    )}

                                    {!isSelectingType && !isAdding && (
                                        <>
                                            {questions.length === 0 ? (
                                                <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(59,130,246,0.1)', blur: '3rem', borderRadius: '9999px' }}></div>
                                                        <HelpCircle size={64} style={{ color: '#1e293b', position: 'relative', zIndex: 10 }} />
                                                    </div>
                                                    <p style={{ color: '#64748b', maxWidth: '18rem', fontSize: '0.875rem', lineHeight: '1.5rem' }}>No hay preguntas registradas todavía.</p>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                    {questions.map((q, idx) => (
                                                        <div key={q.id} onClick={() => openEditQuestion(q)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(30,41,59,0.2)', border: '1px solid rgba(30,41,59,0.5)', borderRadius: '0.75rem', cursor: 'pointer' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <div style={{ width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#60a5fa' }}>{String(idx + 1).padStart(2, '0')}</div>
                                                                <div>
                                                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>{q.question_text}</p>
                                                                    <span style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: '0.25rem', display: 'inline-block' }}>● {q.question_type}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <button onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }} style={{ padding: '0.5rem', background: showDeleteConfirm === q.id ? '#ef4444' : 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.5rem', color: showDeleteConfirm === q.id ? 'white' : '#ef4444', cursor: 'pointer', minWidth: '60px' }}>{showDeleteConfirm === q.id ? 'Confirmar?' : <Trash2 size={16} />}</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {importPreview ? (
                                        <div style={{ background: '#1e293b', borderRadius: '0.75rem', padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ color: 'white', margin: 0 }}>Previsualización ({importPreview.length} preguntas)</h4>
                                                <button onClick={() => { setImportPreview(null); setImportErrors([]); }} style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                                            </div>
                                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                {importPreview.map((q, idx) => (
                                                    <div key={idx} style={{ padding: '0.75rem', background: '#0f172a', borderRadius: '0.5rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                            <span style={{ background: '#2563eb', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{q.question_type}</span>
                                                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{q.points} pts</span>
                                                        </div>
                                                        <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>{q.question_text}</p>
                                                        {q.options && q.options.length > 0 && (<p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>Opciones: {q.options.join(', ')}</p>)}
                                                        <p style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: '0.25rem' }}>Respuesta: {q.correct_answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                                <button onClick={async () => { 
                                                    const currentQuestions = questions || [];
                                                    const newQuestions = [...currentQuestions, ...importPreview];
                                                    const { error } = await supabase.from('evaluaciones').update({ questions: newQuestions }).eq('id', selectedEval.id);
                                                    if (error) {
                                                        console.error('Error importando preguntas:', error);
                                                        alert(`Error importando preguntas: ${error.message}`);
                                                        return;
                                                    }
                                                    setQuestions(newQuestions);
                                                    setLocalQuestions(newQuestions);
                                                    setImportPreview(null);
                                                    setView('list');
                                                    await fetchData(); // Refrescar lista
                                                }} style={{ flex: 1, padding: '0.75rem', background: '#2563eb', border: 'none', borderRadius: '0.5rem', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Importar</button>
                                                <button onClick={() => { setImportPreview(null); }} style={{ flex: 1, padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}>Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {importErrors.length > 0 && (
                                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                                    <h4 style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Errores encontrados ({importErrors.length})</h4>
                                                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                                        {importErrors.map((err, idx) => (
                                                            <div key={idx} style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', gap: '0.5rem' }}>
                                                                <span style={{ fontWeight: 600 }}>Fila {err.row}:</span>
                                                                <span>{err.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${isDragging ? '#3b82f6' : '#334155'}`, borderRadius: '1.5rem', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer', background: isDragging ? 'rgba(59,130,246,0.05)' : 'rgba(30,41,59,0.1)', transition: 'all' }}>
                                                <input type="file" ref={fileInputRef} accept=".csv,.xlsx" style={{ display: 'none' }} onChange={async (e) => { 
                                                    const file = e.target.files?.[0]; 
                                                    if (!file) return; 
                                                    const data = await file.arrayBuffer(); 
                                                    const workbook = XLSX.read(data); 
                                                    const sheet = workbook.Sheets[workbook.SheetNames[0]]; 
                                                    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); 
                                                    if (!json || json.length < 2) return; 
                                                    const headers = json[0].map(h => h.toString().trim()); 
                                                    const parsedQuestions = []; 
                                                    const errors = [];
                                                    for (let i = 1; i < json.length; i++) { 
                                                        const row = json[i]; 
                                                        if (!row[0]) continue; 
                                                        const rowData = {}; 
                                                        headers.forEach((h, idx) => rowData[h] = row[idx]?.toString() || ''); 
                                                        if (!rowData['Pregunta']) {
                                                            errors.push({ row: i, message: 'Falta enunciado' });
                                                            continue;
                                                        }
                                                        const allOptions = [rowData['Opcion_A'], rowData['Opcion_B'], rowData['Opcion_C'], rowData['Opcion_D'], rowData['Opcion_E'], rowData['Opcion_F']]; 
                                                        const validOptions = allOptions.filter(opt => opt && opt.trim() !== ''); 
                                                        let correctAnswer = rowData['Respuesta_Correcta']; 
                                                        if (!correctAnswer || correctAnswer.trim() === '') {
                                                            errors.push({ row: i, message: 'Falta respuesta correcta' });
                                                            continue;
                                                        }
                                                        const questionType = rowData['Tipo'] || 'opcion_multiple';
                                                        if (questionType === 'verdadero_falso') { 
                                                            const optA = (rowData['Opcion_A'] || '').toLowerCase().trim();
                                                            const optB = (rowData['Opcion_B'] || '').toLowerCase().trim();
                                                            if (!validOptions || validOptions.length < 2) {
                                                                errors.push({ row: i, message: 'Verdadero/Falso requiere 2 opciones' });
                                                                continue;
                                                            }
                                                            if ((optA !== 'verdadero' && optA !== 'falso') || (optB !== 'verdadero' && optB !== 'falso') || optA === optB) {
                                                                errors.push({ row: i, message: 'Opciones deben ser "Verdadero" y "Falso"' });
                                                                continue;
                                                            }
                                                            if ((correctAnswer === 'A' || correctAnswer === 'a') && optA !== 'verdadero') {
                                                                errors.push({ row: i, message: 'Opción A debe ser "Verdadero" para respuesta A' });
                                                                continue;
                                                            }
                                                            if ((correctAnswer === 'A' || correctAnswer === 'a') && optA === 'verdadero') correctAnswer = 'Verdadero';
                                                            if ((correctAnswer === 'B' || correctAnswer === 'b') && optB !== 'falso') {
                                                                errors.push({ row: i, message: 'Opción B debe ser "Falso" para respuesta B' });
                                                                continue;
                                                            }
                                                            if ((correctAnswer === 'B' || correctAnswer === 'b') && optB === 'falso') correctAnswer = 'Falso';
                                                        }
                                                        if (questionType === 'opcion_multiple' && validOptions.length < 2) {
                                                            errors.push({ row: i, message: 'Mínimo 2 opciones requeridas' });
                                                            continue;
                                                        }
                                                        parsedQuestions.push({ id: Date.now().toString() + Math.random(), question_text: rowData['Pregunta'], question_type: questionType, options: validOptions, correct_answer: correctAnswer, points: parseInt(rowData['Puntos']) || 10, difficulty: 'medium', order_index: i }); 
                                                    }
                                                    if (errors.length > 0) {
                                                        setImportErrors(errors);
                                                    } else {
                                                        setImportPreview(parsedQuestions);
                                                    }
                                                }} />
                                                <div style={{ width: '5rem', height: '5rem', background: '#1e293b', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}><UploadCloud size={40} style={{ color: isDragging ? '#3b82f6' : '#64748b' }} /></div>
                                                <div style={{ color: 'white', fontWeight: 700 }}>Arrastra tus archivos aquí</div>
                                                <div style={{ fontSize: '0.625rem', background: '#0f172a', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', color: '#64748b', border: '1px solid #1e293b', fontWeight: 700, textTransform: 'uppercase' }}>.XLSX, .CSV</div>
                                            </div>
                                            <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <FileText size={20} style={{ color: '#60a5fa' }} />
                                                    <div><h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>¿No tienes el formato?</h4><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Descarga nuestra plantilla estructurada</p></div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelExamenes;