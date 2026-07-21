import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, X, Eye, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

export default function Courses() {
  const { courses, addCourse, updateCourse, deleteCourse, reorderCourses } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    // Delay setting isDragging to avoid HTML5 drag bug where state update cancels the drag
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    if (dragItem.current !== undefined && dragOverItem.current !== undefined) {
      if (dragItem.current !== dragOverItem.current) {
        reorderCourses(dragItem.current, dragOverItem.current);
      }
    }
    dragItem.current = undefined;
    dragOverItem.current = undefined;
  };
  
  const [formData, setFormData] = useState({
    name: '',
    creditHours: '3',
    currentGrade: '4.0'
  });

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({ name: '', creditHours: '3', currentGrade: '4.0' });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      creditHours: course.creditHours.toString(),
      currentGrade: course.currentGrade.toString()
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse({
        ...editingCourse,
        name: formData.name,
        creditHours: Number(formData.creditHours),
        currentGrade: Number(formData.currentGrade)
      });
    } else {
      addCourse({
        id: uuidv4(),
        name: formData.name,
        creditHours: Number(formData.creditHours),
        currentGrade: Number(formData.currentGrade)
      });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this course? All associated assignments will also be deleted.")) {
      deleteCourse(id);
    }
  };

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1 className="page-title">Courses</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card empty-state">
          <h2>No courses yet</h2>
          <p>Add one to get started and track your GPA.</p>
        </div>
      ) : (
        <div className="item-list">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className={`glass-card list-item ${isDragging && dragItem.current === index ? 'dragging' : ''} ${isDragging && dragOverItem.current === index && dragItem.current !== index ? 'drag-over' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{ cursor: 'grab' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <GripVertical size={20} className="text-muted" style={{ cursor: 'grab' }} />
                <div className="item-details">
                  <div className="item-title">{course.name}</div>
                  <div className="item-subtitle">
                    {course.creditHours} Credits • Grade: {Number(course.currentGrade).toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="item-actions">
                <Link to={`/courses/${course.id}`} className="btn-icon" title="View Details">
                  <Eye size={18} />
                </Link>
                <button className="btn-icon" onClick={() => openEditModal(course)} title="Edit">
                  <Edit2 size={18} />
                </button>
                <button className="btn-icon text-danger" onClick={() => handleDelete(course.id)} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Credit Hours</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="0" 
                  max="6"
                  step="0.25"
                  value={formData.creditHours}
                  onChange={e => setFormData({...formData, creditHours: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Grade (0.0 - 4.0)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="0" 
                  max="4" 
                  step="0.1"
                  value={formData.currentGrade}
                  onChange={e => setFormData({...formData, currentGrade: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
