require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const ExamResult = require('./src/models/ExamResult');
const AuditLog = require('./src/models/AuditLog');

const seedData = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/examination-portal';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await ExamResult.deleteMany({});
        await AuditLog.deleteMany({});
        console.log('Cleared existing data');

        // 1. Create Users
        // Super Admin
        const superAdmin = await User.create({
            email: 'superadmin@example.com',
            password: 'password123',
            role: 'superadmin',
            profile: { firstName: 'Super', lastName: 'Admin', department: 'IT', phone: '9999999999' }
        });

        // Admin
        const admin = await User.create({
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            profile: { firstName: 'System', lastName: 'Admin', department: 'Examinations', phone: '8888888888' }
        });

        // Students
        const studentsData = [
            { email: 'student1@example.com', studentId: 'STU001', firstName: 'Rahul', lastName: 'Kumar', dept: 'CSE' },
            { email: 'student2@example.com', studentId: 'STU002', firstName: 'Anita', lastName: 'Sharma', dept: 'CSE' },
            { email: 'student3@example.com', studentId: 'STU003', firstName: 'Priya', lastName: 'Singh', dept: 'ECE' },
            { email: 'student4@example.com', studentId: 'STU004', firstName: 'John', lastName: 'Doe', dept: 'MECH' },
            { email: 'student5@example.com', studentId: 'STU005', firstName: 'Jane', lastName: 'Smith', dept: 'CSE' }
        ];

        const students = [];
        for (const s of studentsData) {
            const student = await User.create({
                email: s.email,
                password: 'password123',
                role: 'student',
                studentId: s.studentId,
                profile: { firstName: s.firstName, lastName: s.lastName, department: s.dept, batchYear: 2023, phone: '7777777777' }
            });
            students.push(student);
        }

        console.log('Users created');

        // 2. Create Exam Results
        const subjects = [
            { code: 'CS101', name: 'Intro to Programming', credits: 4 },
            { code: 'CS102', name: 'Data Structures', credits: 4 },
            { code: 'MA101', name: 'Calculus I', credits: 3 },
            { code: 'PH101', name: 'Physics I', credits: 3 },
            { code: 'CS201', name: 'Algorithms', credits: 4 },
            { code: 'CS202', name: 'Operating Systems', credits: 4 },
            { code: 'DB101', name: 'Database Management', credits: 3 },
            { code: 'NET101', name: 'Computer Networks', credits: 3 }
        ];

        const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']; // Weighted towards good grades

        for (const student of students) {
            // Semester 1
            for (let i = 0; i < 4; i++) {
                const sub = subjects[i];
                const grade = grades[Math.floor(Math.random() * 4)]; // Top 4 grades
                const marks = grade === 'A+' ? 95 : grade === 'A' ? 85 : grade === 'B+' ? 78 : 72;

                await ExamResult.create({
                    studentId: student.studentId,
                    student: student._id,
                    examId: 'SEM1_DEC2023',
                    examName: 'Semester 1 Final',
                    subjectCode: sub.code,
                    subjectName: sub.name,
                    marks: { obtained: marks, maximum: 100 },
                    grade: grade,
                    credits: sub.credits,
                    semester: 1,
                    academicYear: '2023-2024',
                    examDate: new Date('2023-12-15'),
                    uploadedBy: admin._id,
                    uploadBatchId: 'BATCH001'
                });
            }

            // Semester 2
            for (let i = 4; i < 8; i++) {
                const sub = subjects[i];
                const grade = grades[Math.floor(Math.random() * 5)];
                const marks = grade === 'A+' ? 92 : grade === 'A' ? 82 : grade === 'B+' ? 75 : grade === 'B' ? 68 : 60;

                await ExamResult.create({
                    studentId: student.studentId,
                    student: student._id,
                    examId: 'SEM2_MAY2024',
                    examName: 'Semester 2 Final',
                    subjectCode: sub.code,
                    subjectName: sub.name,
                    marks: { obtained: marks, maximum: 100 },
                    grade: grade,
                    credits: sub.credits,
                    semester: 2,
                    academicYear: '2023-2024',
                    examDate: new Date('2024-05-20'),
                    uploadedBy: admin._id,
                    uploadBatchId: 'BATCH002'
                });
            }
        }
        console.log('Exam Results created');

        // 3. Create Audit Logs
        const auditActions = [
            { action: 'user_login', category: 'auth', desc: 'User logged in' },
            { action: 'results_uploaded', category: 'data', desc: 'Batch results uploaded' },
            { action: 'user_created', category: 'user', desc: 'New student registered' },
            { action: 'result_updated', category: 'data', desc: 'Grade correction' }
        ];

        for (let i = 0; i < 20; i++) {
            const randomAction = auditActions[Math.floor(Math.random() * auditActions.length)];
            const randomTime = new Date(Date.now() - Math.floor(Math.random() * 1000000000));

            await AuditLog.create({
                action: randomAction.action,
                category: randomAction.category,
                performedBy: i % 3 === 0 ? superAdmin._id : admin._id,
                performedByRole: i % 3 === 0 ? 'superadmin' : 'admin',
                details: { description: randomAction.desc },
                metadata: { ipAddress: '192.168.1.1' },
                severity: i % 10 === 0 ? 'warning' : 'info',
                createdAt: randomTime
            });
        }
        console.log('Audit Logs created');

        console.log('-----------------------------------');
        console.log('SEEDING COMPLETE');
        console.log('-----------------------------------');
        console.log('Login Credentials:');
        console.log('Super Admin: superadmin@example.com / password123');
        console.log('Admin:       admin@example.com / password123');
        console.log('Student:     student1@example.com / password123');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
