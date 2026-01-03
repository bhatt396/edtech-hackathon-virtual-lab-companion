import { v4 as uuidv4 } from 'uuid';

export interface Classroom {
    id: string;
    name: string;
    subject: string;
    teacherId: string;
    joinCode: string; // 6-char unique code
    assignedExperimentIds: string[];
    studentIds: string[];
}

export interface StudentEnrollment {
    studentId: string;
    classroomId: string;
    joinedAt: number;
}

const CLASSROOMS_KEY = 'virtual_lab_classrooms';

// Helper to generate a random 6-character code
const generateJoinCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// --- Teacher Functions ---

export const createClassroom = (
    name: string,
    subject: string,
    teacherId: string
): Classroom => {
    const classrooms = getAllClassrooms();

    // Ensure unique join code
    let joinCode = generateJoinCode();
    while (classrooms.some(c => c.joinCode === joinCode)) {
        joinCode = generateJoinCode();
    }

    const newClassroom: Classroom = {
        id: uuidv4(),
        name,
        subject,
        teacherId,
        joinCode,
        assignedExperimentIds: [],
        studentIds: []
    };

    classrooms.push(newClassroom);
    saveClassrooms(classrooms);
    return newClassroom;
};

export const getTeacherClassrooms = (teacherId: string): Classroom[] => {
    const classrooms = getAllClassrooms();
    return classrooms.filter(c => c.teacherId === teacherId);
};

export const assignExperimentToClassroom = (
    classroomId: string,
    experimentId: string
): boolean => {
    const classrooms = getAllClassrooms();
    const classroomIndex = classrooms.findIndex(c => c.id === classroomId);

    if (classroomIndex === -1) return false;

    const classroom = classrooms[classroomIndex];
    if (!classroom.assignedExperimentIds.includes(experimentId)) {
        classroom.assignedExperimentIds.push(experimentId);
        classrooms[classroomIndex] = classroom;
        saveClassrooms(classrooms);
        return true;
    }
    return false;
};

// --- Student Functions ---

export const joinClassroom = (
    studentId: string,
    joinCode: string
): { success: boolean; message: string; classroom?: Classroom } => {
    const classrooms = getAllClassrooms();
    const classroomIndex = classrooms.findIndex(c => c.joinCode === joinCode.toUpperCase());

    if (classroomIndex === -1) {
        return { success: false, message: 'Invalid join code.' };
    }

    const classroom = classrooms[classroomIndex];

    if (classroom.studentIds.includes(studentId)) {
        return { success: false, message: 'You are already joined to this classroom.' };
    }

    // Add student
    classroom.studentIds.push(studentId);
    classrooms[classroomIndex] = classroom;
    saveClassrooms(classrooms);

    return { success: true, message: 'Successfully joined classroom!', classroom };
};

export const getStudentClassrooms = (studentId: string): Classroom[] => {
    const classrooms = getAllClassrooms();
    return classrooms.filter(c => c.studentIds.includes(studentId));
};

// --- Internal Helper Functions ---

const getAllClassrooms = (): Classroom[] => {
    const data = localStorage.getItem(CLASSROOMS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveClassrooms = (classrooms: Classroom[]) => {
    localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
};
