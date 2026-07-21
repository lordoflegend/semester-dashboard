import { v4 as uuidv4 } from 'uuid';

const course1Id = uuidv4();
const course2Id = uuidv4();
const course3Id = uuidv4();
const course4Id = uuidv4();

export const initialCourses = [
  {
    id: course1Id,
    name: "Data Structures",
    creditHours: 3,
    currentGrade: 4.0
  },
  {
    id: course2Id,
    name: "Object-Oriented Programming",
    creditHours: 3,
    currentGrade: 3.7
  },
  {
    id: course3Id,
    name: "Digital Logic Design",
    creditHours: 4,
    currentGrade: 3.3
  },
  {
    id: course4Id,
    name: "Discrete Mathematics",
    creditHours: 3,
    currentGrade: 3.0
  }
];

export const initialAssignments = [
  {
    id: uuidv4(),
    title: "Graph Algorithms Problem Set",
    courseId: course1Id,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in 2 days
    completed: false
  },
  {
    id: uuidv4(),
    title: "Binary Search Trees Implementation",
    courseId: course1Id,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    completed: true
  },
  {
    id: uuidv4(),
    title: "Java Inheritance Lab",
    courseId: course2Id,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
    completed: false
  },
  {
    id: uuidv4(),
    title: "Design Patterns Essay",
    courseId: course2Id,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in 10 days
    completed: false
  },
  {
    id: uuidv4(),
    title: "ALU Design Project",
    courseId: course3Id,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // yesterday
    completed: false // Overdue
  },
  {
    id: uuidv4(),
    title: "Combinational Logic Homework",
    courseId: course3Id,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: true
  },
  {
    id: uuidv4(),
    title: "Set Theory Quiz Prep",
    courseId: course4Id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in 7 days
    completed: false
  },
  {
    id: uuidv4(),
    title: "Relations Assignment",
    courseId: course4Id,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false
  }
];
