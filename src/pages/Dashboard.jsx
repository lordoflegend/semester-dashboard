import { useAppContext } from '../context/AppContext';
import { Calendar, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { courses, assignments, toggleAssignmentStatus, lessons, exams } = useAppContext();

  // GPA Calculation
  const totalCredits = courses.reduce((sum, c) => sum + Number(c.creditHours), 0);
  const totalPoints = courses.reduce((sum, c) => sum + (Number(c.currentGrade) * Number(c.creditHours)), 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  // Deadlines processing
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAssignments = assignments
    .filter(a => !a.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5); // top 5

  const getDaysDifference = (dateStr) => {
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Exams processing
  const upcomingExams = (exams || [])
    .filter(e => {
      const eDate = new Date(e.date);
      eDate.setHours(0, 0, 0, 0);
      return eDate >= today; // Only upcoming or today
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const getStatusColor = (daysDiff) => {
    if (daysDiff < 0) return 'var(--accent-danger)'; // Overdue
    if (daysDiff === 0) return 'var(--accent-warning)'; // Due today
    if (daysDiff <= 3) return 'var(--accent-warning)'; // Soon
    return 'var(--text-secondary)';
  };

  const getStatusText = (daysDiff) => {
    if (daysDiff < 0) return `Overdue by ${Math.abs(daysDiff)} day(s)`;
    if (daysDiff === 0) return 'Due Today';
    if (daysDiff === 1) return 'Due Tomorrow';
    return `Due in ${daysDiff} days`;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* GPA Widget */}
          <div className="glass-card gpa-widget">
            <h2 className="item-title text-secondary">Semester GPA</h2>
            <div className="gpa-value">{gpa}</div>
            <div className="item-subtitle">
              Based on {courses.length} courses ({totalCredits} credits)
            </div>
            {courses.length === 0 && (
              <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Add Courses
              </Link>
            )}
          </div>

          {/* Upcoming Exams Widget */}
          <div className="glass-card">
            <h2 className="item-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} />
              Upcoming Exams
            </h2>
            
            {upcomingExams.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No upcoming exams.</p>
              </div>
            ) : (
              <div className="item-list">
                {upcomingExams.map((exam) => {
                  const course = courses.find(c => c.id === exam.courseId);
                  const daysDiff = getDaysDifference(exam.date);

                  return (
                    <div key={exam.id} className="list-item" style={{ borderLeft: `4px solid ${getStatusColor(daysDiff)}`, padding: '0.75rem 1rem' }}>
                      <div className="item-details">
                        <div className="item-title">{exam.title}</div>
                        <div className="item-subtitle">
                          {course ? (
                            <Link to={`/courses/${course.id}`} className="text-secondary" style={{ textDecoration: 'none' }}>
                              {course.name}
                            </Link>
                          ) : 'Unknown Course'} • <span style={{ color: getStatusColor(daysDiff), fontWeight: '500' }}>{getStatusText(daysDiff)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Deadlines Widget */}
        <div className="glass-card">
          <h2 className="item-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            Upcoming Deadlines
          </h2>
          
          {upcomingAssignments.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={48} />
              <p>All caught up! No upcoming deadlines.</p>
            </div>
          ) : (
            <div className="item-list">
              {upcomingAssignments.map(assignment => {
                const course = courses.find(c => c.id === assignment.courseId);
                const daysDiff = getDaysDifference(assignment.dueDate);
                const isOverdue = daysDiff < 0;

                return (
                  <div key={assignment.id} className="list-item" style={{ borderLeft: `4px solid ${getStatusColor(daysDiff)}` }}>
                    <div className="item-details">
                      <div className="item-title" style={{ color: isOverdue ? 'var(--accent-danger)' : 'var(--text-primary)'}}>
                        {assignment.title}
                        {isOverdue && <AlertCircle size={16} className="text-danger" style={{ display: 'inline', marginLeft: '0.5rem', verticalAlign: 'text-bottom' }} />}
                      </div>
                      <div className="item-subtitle">
                        {course ? (
                          <Link to={`/courses/${course.id}`} className="text-secondary" style={{ textDecoration: 'none' }}>
                            {course.name}
                          </Link>
                        ) : 'Unknown Course'} • <span style={{ color: getStatusColor(daysDiff), fontWeight: '500' }}>{getStatusText(daysDiff)}</span>
                      </div>
                    </div>
                    <button 
                      className="btn-icon" 
                      onClick={() => toggleAssignmentStatus(assignment.id)}
                      title="Mark as completed"
                    >
                      <Circle size={24} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {assignments.length > 0 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/assignments" className="item-subtitle" style={{ textDecoration: 'underline' }}>View all assignments</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
