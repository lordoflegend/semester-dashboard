import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, X, Circle, CheckCircle2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

export default function Assignments() {
  const { courses, assignments, addAssignment, updateAssignment, deleteAssignment, toggleAssignmentStatus } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  const defaultDate = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    courseId: courses.length > 0 ? courses[0].id : '',
    dueDate: defaultDate,
  });

  const openAddModal = () => {
    if (courses.length === 0) {
      alert("Please add a course first before adding assignments.");
      return;
    }
    setEditingAssignment(null);
    setFormData({ title: '', courseId: courses[0].id, dueDate: defaultDate });
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAssignment) {
      updateAssignment({
        ...editingAssignment,
        title: formData.title,
        courseId: formData.courseId,
        dueDate: formData.dueDate
      });
    } else {
      addAssignment({
        id: uuidv4(),
        title: formData.title,
        courseId: formData.courseId,
        dueDate: formData.dueDate,
        completed: false
      });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      deleteAssignment(id);
    }
  };

  // Sort by date, incomplete first
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return a.completed ? 1 : -1;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h1 className="page-title">Assignments</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="glass-card empty-state">
          <h2>No assignments yet</h2>
          <p>Add one to keep track of your work.</p>
          {courses.length === 0 && (
             <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Courses First</Link>
          )}
        </div>
      ) : (
        <div className="item-list">
          {sortedAssignments.map(assignment => {
            const course = courses.find(c => c.id === assignment.courseId);
            const due = new Date(assignment.dueDate);
            due.setHours(0, 0, 0, 0);
            const isOverdue = !assignment.completed && due < today;

            return (
              <div 
                key={assignment.id} 
                className={`glass-card list-item ${assignment.completed ? 'completed' : ''}`}
                style={{ opacity: assignment.completed ? 0.6 : 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => toggleAssignmentStatus(assignment.id)}
                    style={{ color: assignment.completed ? 'var(--accent-success)' : 'var(--text-secondary)' }}
                  >
                    {assignment.completed ? <CheckCircle2 size={24} className="tick-icon tick-active" /> : <Circle size={24} className="tick-icon" />}
                  </button>
                  <div className="item-details">
                    <div className="item-title" style={{ textDecoration: assignment.completed ? 'line-through' : 'none', color: isOverdue ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                      {assignment.title}
                      {isOverdue && <AlertCircle size={16} className="text-danger" style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'text-bottom' }} />}
                    </div>
                    <div className="item-subtitle">
                      {course ? course.name : 'Unknown Course'} • Due: {assignment.dueDate}
                      {isOverdue && <span className="text-danger"> (Overdue)</span>}
                    </div>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-icon" onClick={() => openEditModal(assignment)} title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-icon text-danger" onClick={() => handleDelete(assignment.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Midterm Report"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select 
                  className="form-control" 
                  required
                  value={formData.courseId}
                  onChange={e => setFormData({...formData, courseId: e.target.value})}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required 
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
