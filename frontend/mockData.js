// Extended Mock data for comprehensive testing

export const mockUsers = {
    admin: {
        _id: 'admin-001',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN',
        department: 'Administration',
        token: 'mock-token-admin-001',
    },
    teacher: {
        _id: 'teacher-001',
        name: 'Dr. Sarah Johnson',
        email: 'teacher@test.com',
        password: 'teacher123',
        role: 'TEACHER',
        department: 'Computer Science',
        subjects: ['Data Structures', 'Algorithms', 'Web Development'],
        assignedStudents: ['student-001', 'student-002', 'student-003'],
        token: 'mock-token-teacher-001'
    },
    teacher2: {
        _id: 'teacher-002',
        name: 'Prof. Michael Chen',
        email: 'michael@test.com',
        password: 'teacher123',
        role: 'TEACHER',
        department: 'Mathematics',
        subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
        assignedStudents: ['student-004', 'student-005'],
        token: 'mock-token-teacher-002'
    },
    student: {
        _id: 'student-001',
        name: 'Alice Williams',
        email: 'student@test.com',
        password: 'student123',
        role: 'STUDENT',
        department: 'Computer Science',
        year: 2,
        subjects: ['Data Structures', 'Algorithms', 'Database Systems', 'Web Development'],
        token: 'mock-token-student-001'
    },
    student2: {
        _id: 'student-002',
        name: 'Bob Martinez',
        email: 'bob@test.com',
        password: 'student123',
        role: 'STUDENT',
        department: 'Computer Science',
        year: 2,
        subjects: ['Data Structures', 'Algorithms', 'Operating Systems'],
        token: 'mock-token-student-002'
    },
    student3: {
        _id: 'student-003',
        name: 'Carol Davis',
        email: 'carol@test.com',
        password: 'student123',
        role: 'STUDENT',
        department: 'Computer Science',
        year: 3,
        subjects: ['Web Development', 'Machine Learning', 'Software Engineering'],
        token: 'mock-token-student-003'
    }
};

// All students list for easy access
export const mockStudents = [
    {
        _id: 'student-001',
        name: 'Alice Williams',
        email: 'alice@test.com',
        department: 'Computer Science',
        year: 2,
        overallGrade: 'A',
        gpa: 3.8,
        subjects: ['Data Structures', 'Algorithms', 'Database Systems', 'Web Development'],
        assignedTeacher: 'teacher-001',
        profileImage: null
    },
    {
        _id: 'student-002',
        name: 'Bob Martinez',
        email: 'bob@test.com',
        department: 'Computer Science',
        year: 2,
        overallGrade: 'B+',
        gpa: 3.5,
        subjects: ['Data Structures', 'Algorithms', 'Operating Systems'],
        assignedTeacher: 'teacher-001',
        profileImage: null
    },
    {
        _id: 'student-003',
        name: 'Carol Davis',
        email: 'carol@test.com',
        department: 'Computer Science',
        year: 3,
        overallGrade: 'A-',
        gpa: 3.7,
        subjects: ['Web Development', 'Machine Learning', 'Software Engineering'],
        assignedTeacher: 'teacher-001',
        profileImage: null
    },
    {
        _id: 'student-004',
        name: 'David Kim',
        email: 'david@test.com',
        department: 'Mathematics',
        year: 1,
        overallGrade: 'B',
        gpa: 3.2,
        subjects: ['Calculus', 'Linear Algebra'],
        assignedTeacher: 'teacher-002',
        profileImage: null
    },
    {
        _id: 'student-005',
        name: 'Emma Thompson',
        email: 'emma@test.com',
        department: 'Mathematics',
        year: 2,
        overallGrade: 'A+',
        gpa: 4.0,
        subjects: ['Calculus', 'Statistics', 'Number Theory'],
        assignedTeacher: 'teacher-002',
        profileImage: null
    }
];

// Student grades by subject
export const mockGrades = [
    // Alice Williams
    { studentId: 'student-001', subject: 'Data Structures', grade: 'A', percentage: 92, semester: 'Fall 2024' },
    { studentId: 'student-001', subject: 'Algorithms', grade: 'A-', percentage: 88, semester: 'Fall 2024' },
    { studentId: 'student-001', subject: 'Database Systems', grade: 'A', percentage: 90, semester: 'Fall 2024' },
    { studentId: 'student-001', subject: 'Web Development', grade: 'B+', percentage: 85, semester: 'Fall 2024' },

    // Bob Martinez
    { studentId: 'student-002', subject: 'Data Structures', grade: 'B+', percentage: 85, semester: 'Fall 2024' },
    { studentId: 'student-002', subject: 'Algorithms', grade: 'B', percentage: 82, semester: 'Fall 2024' },
    { studentId: 'student-002', subject: 'Operating Systems', grade: 'A-', percentage: 88, semester: 'Fall 2024' },

    // Carol Davis
    { studentId: 'student-003', subject: 'Web Development', grade: 'A', percentage: 93, semester: 'Fall 2024' },
    { studentId: 'student-003', subject: 'Machine Learning', grade: 'A-', percentage: 87, semester: 'Fall 2024' },
    { studentId: 'student-003', subject: 'Software Engineering', grade: 'A', percentage: 91, semester: 'Fall 2024' },
];

// Learning materials
export const mockMaterials = [
    {
        _id: 'material-001',
        title: 'Introduction to Binary Search Trees',
        description: 'Comprehensive video tutorial covering BST concepts, implementation, and applications.',
        type: 'video',
        url: 'https://www.youtube.com/embed/pYT9F8_LFTM',
        thumbnailUrl: 'https://img.youtube.com/vi/pYT9F8_LFTM/mqdefault.jpg',
        uploadedBy: 'teacher-001',
        uploadedByName: 'Dr. Sarah Johnson',
        department: 'Computer Science',
        subject: 'Data Structures',
        uploadedAt: new Date('2024-02-01').toISOString(),
        views: 245,
        duration: '18:43',
        pineconeId: 'vec-001'
    },
    {
        _id: 'material-002',
        title: 'Sorting Algorithms Explained',
        description: 'Deep dive into QuickSort, MergeSort, HeapSort with visual animations and complexity analysis.',
        type: 'video',
        url: 'https://www.youtube.com/embed/kPRA0W1kECg',
        thumbnailUrl: 'https://img.youtube.com/vi/kPRA0W1kECg/mqdefault.jpg',
        uploadedBy: 'teacher-001',
        uploadedByName: 'Dr. Sarah Johnson',
        department: 'Computer Science',
        subject: 'Algorithms',
        uploadedAt: new Date('2024-02-05').toISOString(),
        views: 312,
        duration: '25:17',
        pineconeId: 'vec-002'
    },
    {
        _id: 'material-003',
        title: 'React Hooks Complete Guide',
        description: 'Learn all about useState, useEffect, useContext, and custom hooks with practical examples.',
        type: 'video',
        url: 'https://www.youtube.com/embed/TNhaISOUy6Q',
        thumbnailUrl: 'https://img.youtube.com/vi/TNhaISOUy6Q/mqdefault.jpg',
        uploadedBy: 'teacher-001',
        uploadedByName: 'Dr. Sarah Johnson',
        department: 'Computer Science',
        subject: 'Web Development',
        uploadedAt: new Date('2024-02-08').toISOString(),
        views: 189,
        duration: '33:25',
        pineconeId: 'vec-003'
    },
    {
        _id: 'material-004',
        title: 'Database Normalization Tutorial',
        description: 'Understanding 1NF, 2NF, 3NF, and BCNF with examples and exercises.',
        type: 'pdf',
        url: '/assets/database-normalization.pdf',
        thumbnailUrl: '/assets/pdf-icon.png',
        uploadedBy: 'teacher-001',
        uploadedByName: 'Dr. Sarah Johnson',
        department: 'Computer Science',
        subject: 'Database Systems',
        uploadedAt: new Date('2024-02-10').toISOString(),
        views: 156,
        pages: 24,
        pineconeId: 'vec-004'
    },
    {
        _id: 'material-005',
        title: 'Calculus Fundamentals',
        description: 'Limits, derivatives, and integrals explained with real-world applications.',
        type: 'video',
        url: 'https://www.youtube.com/embed/WUvTyaaNkzM',
        thumbnailUrl: 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg',
        uploadedBy: 'teacher-002',
        uploadedByName: 'Prof. Michael Chen',
        department: 'Mathematics',
        subject: 'Calculus',
        uploadedAt: new Date('2024-02-03').toISOString(),
        views: 278,
        duration: '42:15',
        pineconeId: 'vec-005'
    },
    {
        _id: 'material-006',
        title: 'Linear Algebra Essentials',
        description: 'Matrices, vectors, eigenvalues, and their applications in computer science.',
        type: 'video',
        url: 'https://www.youtube.com/embed/fNk_zzaMoSs',
        thumbnailUrl: 'https://img.youtube.com/vi/fNk_zzaMoSs/mqdefault.jpg',
        uploadedBy: 'teacher-002',
        uploadedByName: 'Prof. Michael Chen',
        department: 'Mathematics',
        subject: 'Linear Algebra',
        uploadedAt: new Date('2024-02-07').toISOString(),
        views: 201,
        duration: '38:52',
        pineconeId: 'vec-006'
    }
];

export const mockAssessments = [
    {
        _id: 'assessment-001',
        title: 'Introduction to Photosynthesis',
        topic: 'Biology',
        questions: [
            {
                id: 'q1',
                type: 'MCQ',
                prompt: 'What is the primary product of photosynthesis?',
                options: ['Oxygen', 'Carbon Dioxide', 'Water', 'Nitrogen'],
                correctOptionIndex: 0,
                difficulty: 'Easy',
                maxPoints: 10
            },
            {
                id: 'q2',
                type: 'MCQ',
                prompt: 'Which organelle is responsible for photosynthesis?',
                options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'],
                correctOptionIndex: 1,
                difficulty: 'Medium',
                maxPoints: 10
            },
            {
                id: 'q3',
                type: 'DESCRIPTIVE',
                prompt: 'Explain the role of chlorophyll in photosynthesis.',
                difficulty: 'Medium',
                maxPoints: 15
            }
        ],
        createdBy: 'teacher-001',
        materialId: null,
        createdAt: new Date('2024-02-10').toISOString(),
        dueDate: new Date('2024-02-20').toISOString(),
        status: 'PUBLISHED'
    },
    {
        _id: 'assessment-002',
        title: 'Ancient Rome History Quiz',
        topic: 'History',
        questions: [
            {
                id: 'q1',
                type: 'MCQ',
                prompt: 'Who was the first emperor of Rome?',
                options: ['Julius Caesar', 'Augustus', 'Nero', 'Caligula'],
                correctOptionIndex: 1,
                difficulty: 'Medium',
                maxPoints: 10
            },
            {
                id: 'q2',
                type: 'MCQ',
                prompt: 'In which year did the Western Roman Empire fall?',
                options: ['476 AD', '410 AD', '509 BC', '27 BC'],
                correctOptionIndex: 0,
                difficulty: 'Hard',
                maxPoints: 15
            }
        ],
        createdBy: 'teacher-001',
        createdAt: new Date('2024-02-08').toISOString(),
        dueDate: new Date('2024-02-18').toISOString(),
        status: 'PUBLISHED'
    },
    {
        _id: 'assessment-003',
        title: 'Basic Calculus Concepts',
        topic: 'Mathematics',
        questions: [
            {
                id: 'q1',
                type: 'MCQ',
                prompt: 'What is the derivative of x²?',
                options: ['x', '2x', 'x³', '2x²'],
                correctOptionIndex: 1,
                difficulty: 'Easy',
                maxPoints: 10
            }
        ],
        createdBy: 'teacher-001',
        createdAt: new Date('2024-02-12').toISOString(),
        dueDate: new Date('2024-02-25').toISOString(),
        status: 'PUBLISHED'
    }
];

export const mockSubmissions = [
    {
        _id: 'submission-001',
        assessmentId: 'assessment-001',
        studentId: 'student-001',
        answers: {
            'q1': 'Oxygen',
            'q2': 'Chloroplast',
            'q3': 'Chlorophyll absorbs light energy to convert carbon dioxide and water into glucose and oxygen.'
        },
        score: 32,
        maxScore: 35,
        feedback: 'Excellent work! You demonstrated a strong understanding of photosynthesis. Your explanation of chlorophyll was particularly clear and comprehensive.',
        submittedAt: new Date('2024-02-11').toISOString(),
        status: 'GRADED'
    },
    {
        _id: 'submission-002',
        assessmentId: 'assessment-002',
        studentId: 'student-001',
        answers: {
            'q1': 'Augustus',
            'q2': '476 AD'
        },
        score: 25,
        maxScore: 25,
        feedback: 'Perfect score! You have excellent knowledge of Ancient Roman history. Keep up the great work!',
        submittedAt: new Date('2024-02-09').toISOString(),
        status: 'GRADED'
    }
];

// Mock authentication service
export const mockAuth = {
    login: async (email, password) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find matching user
        const user = Object.values(mockUsers).find(u =>
            u.email === email && u.password === password
        );

        if (user) {
            const userData = { ...user };
            delete userData.password; // Don't return password
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }

        throw new Error('Invalid credentials');
    },

    register: async (userData) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newUser = {
            _id: `user-${Date.now()}`,
            ...userData,
            department: userData.department || 'Computer Science',
            year: userData.role === 'STUDENT' ? 1 : undefined,
            token: `mock-token-${Date.now()}`
        };

        delete newUser.password; // Don't return password
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    }
};
