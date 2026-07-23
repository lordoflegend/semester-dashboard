import { createContext, useContext } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { initialCourses, initialAssignments } from '../utils/initialData';
import { deleteFile } from '../utils/fileStorage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [courses, setCourses] = useLocalStorage('semester_courses', initialCourses);
  const [assignments, setAssignments] = useLocalStorage('semester_assignments', initialAssignments);
  const [lessons, setLessons] = useLocalStorage('semester_lessons', []);
  const [exams, setExams] = useLocalStorage('semester_exams', []);

  const addCourse = (course) => setCourses([...courses, course]);
  const updateCourse = (updatedCourse) => setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  const deleteCourse = (id) => {
    // Cascade delete files in IndexedDB for all lessons in this course
    const courseLessons = lessons.filter(l => l.courseId === id);
    courseLessons.forEach(lesson => {
      (lesson.materials || []).forEach(mat => {
        if (mat && mat.type === 'file') {
          deleteFile(mat.id).catch(console.error);
        }
      });
    });

    setCourses(courses.filter(c => c.id !== id));
    // Cascade delete assignments and lessons
    setAssignments(assignments.filter(a => a.courseId !== id));
    setLessons(lessons.filter(l => l.courseId !== id));
    setExams(exams.filter(e => e.courseId !== id));
  };

  const reorderCourses = (startIndex, endIndex) => {
    const result = Array.from(courses);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setCourses(result);
  };

  const addAssignment = (assignment) => setAssignments([...assignments, assignment]);
  const updateAssignment = (updatedAssignment) => setAssignments(assignments.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
  const deleteAssignment = (id) => setAssignments(assignments.filter(a => a.id !== id));
  const toggleAssignmentStatus = (id) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const getCourse = (id) => courses.find(c => c.id === id);

  const addLesson = (lesson) => setLessons([...lessons, lesson]);
  const updateLesson = (updatedLesson) => setLessons(lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  const deleteLesson = (id) => {
    // Delete files in IndexedDB for this lesson
    const lessonToDelete = lessons.find(l => l.id === id);
    if (lessonToDelete) {
      (lessonToDelete.materials || []).forEach(mat => {
        if (mat && mat.type === 'file') {
          deleteFile(mat.id).catch(console.error);
        }
      });
    }

    setLessons(lessons.filter(l => l.id !== id));
    // Cascade delete assignments linked to this lesson
    setAssignments(assignments.filter(a => a.lessonId !== id));
    // Remove lesson reference from exams
    setExams(exams.map(e => ({ ...e, lessonIds: (e.lessonIds || []).filter(lid => lid !== id) })));
  };

  const reorderLessons = (startIndex, endIndex, courseId) => {
    const courseLessons = lessons.filter(l => l.courseId === courseId);
    const otherLessons = lessons.filter(l => l.courseId !== courseId);
    
    const [removed] = courseLessons.splice(startIndex, 1);
    courseLessons.splice(endIndex, 0, removed);
    
    setLessons([...otherLessons, ...courseLessons]);
  };

  const addExam = (exam) => setExams([...exams, exam]);
  const updateExam = (updatedExam) => setExams(exams.map(e => e.id === updatedExam.id ? updatedExam : e));
  const deleteExam = (id) => setExams(exams.filter(e => e.id !== id));

  const importState = (metadata) => {
    if (metadata.courses) setCourses(metadata.courses);
    if (metadata.assignments) setAssignments(metadata.assignments);
    if (metadata.lessons) setLessons(metadata.lessons);
    if (metadata.exams) setExams(metadata.exams);
  };

  return (
    <AppContext.Provider value={{
      courses, addCourse, updateCourse, deleteCourse, reorderCourses, getCourse,
      assignments, addAssignment, updateAssignment, deleteAssignment, toggleAssignmentStatus,
      lessons, addLesson, updateLesson, deleteLesson, reorderLessons,
      exams, addExam, updateExam, deleteExam,
      importState
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
