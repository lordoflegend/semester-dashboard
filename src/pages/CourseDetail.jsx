import { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, Plus, Edit2, Trash2, X, FileText, Link as LinkIcon, Calendar, BookOpen, Circle, CheckCircle2, ChevronDown, ChevronUp, Download, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { saveFile, getFile, deleteFile } from '../utils/fileStorage';

function LessonCard({ lesson, courseId, onPreviewFile, index, dragState, handlers }) {
  const { updateLesson, deleteLesson, assignments, addAssignment, toggleAssignmentStatus, deleteAssignment } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState(lesson.notes || '');

  // Local state for inputs
  const [newMaterial, setNewMaterial] = useState('');
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newProjectLink, setNewProjectLink] = useState('');
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDate, setNewAssignmentDate] = useState(new Date().toISOString().split('T')[0]);

  const lessonAssignments = assignments.filter(a => a.lessonId === lesson.id);

  const handleUpdate = (field, value) => {
    updateLesson({ ...lesson, [field]: value });
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (newMaterial.trim()) {
      const isUrl = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i.test(newMaterial.trim());
      if (newMaterialTitle.trim() || isUrl) {
         handleUpdate('materials', [...(lesson.materials || []), { 
            type: 'link', 
            url: newMaterial.trim(), 
            title: newMaterialTitle.trim()
         }]);
      } else {
         handleUpdate('materials', [...(lesson.materials || []), newMaterial.trim()]);
      }
      setNewMaterial('');
      setNewMaterialTitle('');
    }
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const id = uuidv4();
    try {
      await saveFile(id, file);
      handleUpdate('materials', [...(lesson.materials || []), { id, name: file.name, type: 'file' }]);
    } catch (err) {
      console.error('Failed to save file:', err);
      alert('Failed to save file to local storage.');
    }
    e.target.value = '';
  };

  const handlePreviewFile = async (fileId, fileName) => {
    try {
      const blob = await getFile(fileId);
      if (!blob) {
        alert("File not found in storage.");
        return;
      }
      const url = URL.createObjectURL(blob);
      onPreviewFile({ url, name: fileName, type: blob.type });
    } catch (err) {
      console.error("Preview failed", err);
      alert("Failed to retrieve file.");
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const blob = await getFile(fileId);
      if (!blob) {
        alert("File not found in storage.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to retrieve file.");
    }
  };

  const handleRemoveMaterial = (index) => {
    const updated = [...(lesson.materials || [])];
    const removed = updated.splice(index, 1)[0];

    if (removed && removed.type === 'file') {
      deleteFile(removed.id).catch(console.error);
    }

    handleUpdate('materials', updated);
  };

  const handleAddProjectLink = (e) => {
    e.preventDefault();
    if (newProjectLink.trim()) {
      handleUpdate('projectLinks', [...(lesson.projectLinks || []), newProjectLink.trim()]);
      setNewProjectLink('');
    }
  };

  const handleRemoveProjectLink = (index) => {
    const updated = [...(lesson.projectLinks || [])];
    updated.splice(index, 1);
    handleUpdate('projectLinks', updated);
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (newAssignmentTitle.trim()) {
      addAssignment({
        id: uuidv4(),
        title: newAssignmentTitle.trim(),
        courseId: courseId,
        lessonId: lesson.id,
        dueDate: newAssignmentDate,
        completed: false
      });
      setNewAssignmentTitle('');
    }
  };

  const saveNotes = () => {
    handleUpdate('notes', notesTemp);
    setEditingNotes(false);
  };

  const { isDragging, dragItem, dragOverItem } = dragState || {};
  const { onDragStart, onDragEnter, onDragEnd } = handlers || {};
  
  const isThisDragged = isDragging && dragItem?.current === index;
  const isThisDragOver = isDragging && dragOverItem?.current === index && dragItem?.current !== index;

  return (
    <div 
      className={`glass-card lesson-card ${isThisDragged ? 'dragging' : ''} ${isThisDragOver ? 'drag-over' : ''}`} 
      style={{ padding: '0', cursor: handlers ? 'grab' : 'default' }}
      draggable={!!handlers}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter && onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className={`lesson-header ${lesson.completed ? 'completed' : ''}`}
        style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          borderBottomLeftRadius: isExpanded ? '0' : '1rem',
          borderBottomRightRadius: isExpanded ? '0' : '1rem'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {handlers && <GripVertical size={20} className="text-muted" style={{ cursor: 'grab' }} />}
          <h3 style={{ margin: 0 }}>{lesson.name}</h3>
          <span className={`badge ${lesson.type === 'Lab' ? 'badge-warning' : 'badge-success'}`}>
            {lesson.type || 'Theory'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); handleUpdate('completed', !lesson.completed); }}
            title={lesson.completed ? "Mark as incomplete" : "Mark as completed"}
            style={{ color: lesson.completed ? 'var(--accent-success)' : 'var(--text-secondary)' }}
          >
            {lesson.completed ? <CheckCircle2 size={18} className="tick-icon tick-active" /> : <Circle size={18} className="tick-icon" />}
          </button>
          <button className="btn-icon text-danger" onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }} title="Delete Lesson">
            <Trash2 size={18} />
          </button>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="lesson-body" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'grid', gap: '2rem' }}>

          {/* Notes Section */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <BookOpen size={16} /> Rich Text Notes
            </h4>
            {editingNotes ? (
              <div>
                <textarea
                  className="form-control"
                  rows="4"
                  value={notesTemp}
                  onChange={e => setNotesTemp(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={saveNotes}>Save Notes</button>
                  <button className="btn" onClick={() => setEditingNotes(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div
                style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', minHeight: '60px', cursor: 'text', whiteSpace: 'pre-wrap' }}
                onClick={() => setEditingNotes(true)}
              >
                {lesson.notes ? lesson.notes : <span className="text-muted">Click to add notes...</span>}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Materials */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FileText size={16} /> Course Materials
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.5rem' }}>
                {(lesson.materials || []).map((mat, i) => {
                  const isFile = mat && mat.type === 'file';
                  const isLinkObj = mat && mat.type === 'link';
                  const isLegacy = typeof mat === 'string';

                  let displayContent = null;

                  if (isFile) {
                     displayContent = (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-all' }}>
                          <FileText size={14} className="text-secondary" />
                          <span>{mat.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                            <button className="btn-icon" style={{ padding: '0', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handlePreviewFile(mat.id, mat.name)} title="Preview file">
                              <BookOpen size={14} /> Preview
                            </button>
                            <button className="btn-icon" style={{ padding: '0', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDownloadFile(mat.id, mat.name)} title="Download file">
                              <Download size={14} /> Download
                            </button>
                          </div>
                        </div>
                     );
                  } else {
                     const url = isLinkObj ? mat.url : (isLegacy ? mat : '');
                     const title = isLinkObj ? mat.title : '';
                     const isUrl = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i.test(url);
                     
                     displayContent = (
                        <div style={{ wordBreak: 'break-all', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <LinkIcon size={14} className="text-secondary" style={{ marginTop: '0.2rem' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {title && <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{title}</span>}
                            {isUrl ? (
                              <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: title ? '0.85rem' : '1rem' }}>
                                {url}
                              </a>
                            ) : (
                               <span style={{ fontSize: title ? '0.85rem' : '1rem', color: title ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{url}</span>
                            )}
                          </div>
                        </div>
                     );
                  }

                  return (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', alignItems: 'center' }}>
                      {displayContent}
                      <button className="btn-icon text-danger" style={{ padding: 0 }} onClick={() => handleRemoveMaterial(i)}><X size={14} /></button>
                    </li>
                  );
                })}
              </ul>
              <form onSubmit={handleAddMaterial} style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-control" value={newMaterialTitle} onChange={e => setNewMaterialTitle(e.target.value)} placeholder="Title/Note (Optional)" style={{ padding: '0.4rem', flex: 1 }} />
                  <input type="text" className="form-control" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} placeholder="URL or Text" style={{ padding: '0.4rem', flex: 2 }} required />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>Add</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>OR</span>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button type="button" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => fileInputRef.current?.click()}>
                    Upload Local File
                  </button>
                </div>
              </form>
            </div>

            {/* Project Links */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <LinkIcon size={16} /> Project Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.5rem' }}>
                {(lesson.projectLinks || []).map((link, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>{link}</a>
                    <button className="btn-icon" style={{ padding: 0 }} onClick={() => handleRemoveProjectLink(i)}><X size={14} /></button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddProjectLink} style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" className="form-control" value={newProjectLink} onChange={e => setNewProjectLink(e.target.value)} placeholder="e.g. github.com/repo" style={{ padding: '0.4rem' }} />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>Add</button>
              </form>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Assignments */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} /> Lesson Assignments
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.5rem' }}>
                {lessonAssignments.map((assignment) => (
                  <li key={assignment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', opacity: assignment.completed ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="btn-icon" style={{ padding: 0 }} onClick={() => toggleAssignmentStatus(assignment.id)}>
                        {assignment.completed ? <CheckCircle2 size={16} className="tick-icon tick-active" /> : <Circle size={16} className="tick-icon" />}
                      </button>
                      <span style={{ textDecoration: assignment.completed ? 'line-through' : 'none' }}>{assignment.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      {assignment.dueDate}
                      <button className="btn-icon text-danger" style={{ padding: 0 }} onClick={() => deleteAssignment(assignment.id)}><X size={14} /></button>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="text" className="form-control" required value={newAssignmentTitle} onChange={e => setNewAssignmentTitle(e.target.value)} placeholder="Assignment title" style={{ padding: '0.4rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="date" className="form-control" required value={newAssignmentDate} onChange={e => setNewAssignmentDate(e.target.value)} style={{ padding: '0.4rem' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const { getCourse, lessons, addLesson, reorderLessons, assignments, exams, addExam, deleteExam } = useAppContext();
  const course = getCourse(courseId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Theory' });

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examFormData, setExamFormData] = useState({ title: '', date: '', lessonIds: [] });

  const [previewFile, setPreviewFile] = useState(null);

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  const courseLessons = lessons.filter(l => l.courseId === courseId);
  const courseExams = exams.filter(e => e.courseId === courseId);

  // Drag and drop for lessons
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragItem.current !== undefined && dragOverItem.current !== undefined) {
      if (dragItem.current !== dragOverItem.current) {
        reorderLessons(dragItem.current, dragOverItem.current, courseId);
      }
    }
    dragItem.current = undefined;
    dragOverItem.current = undefined;
  };

  // Progress Bar Logic: Lessons completed
  const completedCount = courseLessons.filter(l => l.completed).length;
  const totalCount = courseLessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!course) {
    return (
      <div className="courses-page">
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
      </div>
    );
  }

  const handleAddLesson = (e) => {
    e.preventDefault();
    addLesson({
      id: uuidv4(),
      courseId: courseId,
      name: formData.name,
      type: formData.type,
      completed: false,
      materials: [],
      notes: '',
      projectLinks: []
    });
    setIsModalOpen(false);
    setFormData({ name: '', type: 'Theory' });
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    addExam({
      id: uuidv4(),
      courseId: courseId,
      title: examFormData.title,
      date: examFormData.date,
      lessonIds: examFormData.lessonIds
    });
    setIsExamModalOpen(false);
    setExamFormData({ title: '', date: '', lessonIds: [] });
  };

  const toggleExamLesson = (lessonId) => {
    setExamFormData(prev => {
      const isSelected = prev.lessonIds.includes(lessonId);
      return {
        ...prev,
        lessonIds: isSelected ? prev.lessonIds.filter(id => id !== lessonId) : [...prev.lessonIds, lessonId]
      };
    });
  };

  return (
    <div className="course-detail-page">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/courses" className="btn-icon" title="Back to Courses">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="page-title">{course.name}</h1>
        </div>
        <div className="item-subtitle" style={{ fontSize: '1.1rem' }}>
          {course.creditHours} Credits • Grade: {Number(course.currentGrade).toFixed(1)}
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '500' }}>Course Lessons Progress</span>
          <span>{completedCount} / {totalCount} ({progressPercent}%)</span>
        </div>
        <div className="progress-bar-container" style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            className="progress-bar-fill"
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </div>
      </div>

      {/* Exams Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="item-title" style={{ fontSize: '1.5rem' }}>Exams</h2>
        <button className="btn btn-primary" onClick={() => setIsExamModalOpen(true)}>
          <Plus size={18} /> Add Exam
        </button>
      </div>

      {courseExams.length === 0 ? (
        <div className="glass-card empty-state" style={{ marginBottom: '2rem' }}>
          <h2>No exams scheduled</h2>
          <p>Add exams and link them to the specific lessons they cover.</p>
        </div>
      ) : (
        <div className="item-list" style={{ marginBottom: '2rem' }}>
          {courseExams.map(exam => (
            <div key={exam.id} className="glass-card list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div>
                  <div className="item-title">{exam.title}</div>
                  <div className="item-subtitle"><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> {exam.date}</div>
                </div>
                <button className="btn-icon text-danger" onClick={() => deleteExam(exam.id)} title="Delete Exam">
                  <Trash2 size={18} />
                </button>
              </div>

              {exam.lessonIds.length > 0 && (
                <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Lessons Covered:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {exam.lessonIds.map(lid => {
                      const lesson = lessons.find(l => l.id === lid);
                      return lesson ? <span key={lid} className="badge badge-warning">{lesson.name}</span> : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lessons Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="item-title" style={{ fontSize: '1.5rem' }}>Lessons</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Lesson
        </button>
      </div>

      {courseLessons.length === 0 ? (
        <div className="glass-card empty-state">
          <h2>No lessons yet</h2>
          <p>Add your first lesson to start organizing course materials and assignments.</p>
        </div>
      ) : (
        <div className="item-list">
          {courseLessons.map((lesson, index) => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              courseId={courseId} 
              onPreviewFile={setPreviewFile} 
              index={index}
              dragState={{ isDragging, dragItem, dragOverItem }}
              handlers={{ onDragStart: handleDragStart, onDragEnter: handleDragEnter, onDragEnd: handleDragEnd }}
            />
          ))}
        </div>
      )}

      {/* Add Lesson Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Lesson</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddLesson}>
              <div className="form-group">
                <label className="form-label">Lesson Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Week 1: Introduction"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Theory">Theory</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {isExamModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Exam</h2>
              <button className="btn-icon" onClick={() => setIsExamModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExam}>
              <div className="form-group">
                <label className="form-label">Exam Title</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={examFormData.title}
                  onChange={e => setExamFormData({ ...examFormData, title: e.target.value })}
                  placeholder="e.g. Midterm 1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={examFormData.date}
                  onChange={e => setExamFormData({ ...examFormData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lessons Covered</label>
                {courseLessons.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>No lessons available to link.</p>
                ) : (
                  <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    {courseLessons.map(lesson => (
                      <label key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={examFormData.lessonIds.includes(lesson.id)}
                          onChange={() => toggleExamLesson(lesson.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{lesson.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setIsExamModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">{previewFile.name}</h2>
              <button className="btn-icon" onClick={closePreview}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe src={previewFile.url} width="100%" height="100%" style={{ border: 'none' }} title={previewFile.name} />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Preview not available for this file type ({previewFile.type}).</p>
                  <a href={previewFile.url} download={previewFile.name} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Download Instead
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
