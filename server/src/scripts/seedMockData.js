const mongoose = require('mongoose');
const User = require('../models/User');
const ExamResult = require('../models/ExamResult');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DEPARTMENTS = [
    "AGRICULTURAL ENGINEERING",
    "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
    "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
    "BIOMEDICAL ENGINEERING",
    "BIOTECHNOLOGY",
    "CHEMISTRY",
    "CIVIL ENGINEERING",
    "COMPUTER SCIENCE AND BUSINESS SYSTEMS",
    "COMPUTER SCIENCE AND DESIGN",
    "COMPUTER SCIENCE AND ENGINEERING",
    "COMPUTER TECHNOLOGY",
    "ELECTRICAL AND ELECTRONICS ENGINEERING",
    "ELECTRONICS AND COMMUNICATION ENGINEERING",
    "ELECTRONICS AND INSTRUMENTATION ENGINEERING",
    "FASHION TECHNOLOGY",
    "FOOD TECHNOLOGY",
    "HUMANITIES",
    "INFORMATION SCIENCE AND ENGINEERING",
    "INFORMATION TECHNOLOGY",
    "MATHEMATICS",
    "MECHANICAL ENGINEERING",
    "MECHATRONICS ENGINEERING",
    "PHYSICAL EDUCATION",
    "PHYSICS",
    "SCHOOL OF MANAGEMENT STUDIES",
    "TEXTILE TECHNOLOGY"
];

const DEPARTMENT_CODES = {
    "AGRICULTURAL ENGINEERING": "AGRI",
    "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE": "AI&DS",
    "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING": "AI&ML",
    "BIOMEDICAL ENGINEERING": "BME",
    "BIOTECHNOLOGY": "BT",
    "CHEMISTRY": "CHEM",
    "CIVIL ENGINEERING": "CIVIL",
    "COMPUTER SCIENCE AND BUSINESS SYSTEMS": "CSBS",
    "COMPUTER SCIENCE AND DESIGN": "CSD",
    "COMPUTER SCIENCE AND ENGINEERING": "CSE",
    "COMPUTER TECHNOLOGY": "CT",
    "ELECTRICAL AND ELECTRONICS ENGINEERING": "EEE",
    "ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
    "ELECTRONICS AND INSTRUMENTATION ENGINEERING": "EIE",
    "FASHION TECHNOLOGY": "FT",
    "FOOD TECHNOLOGY": "FTCH",
    "HUMANITIES": "HUM",
    "INFORMATION SCIENCE AND ENGINEERING": "ISE",
    "INFORMATION TECHNOLOGY": "IT",
    "MATHEMATICS": "MATH",
    "MECHANICAL ENGINEERING": "MECH",
    "MECHATRONICS ENGINEERING": "MCT",
    "PHYSICAL EDUCATION": "PE",
    "PHYSICS": "PHY",
    "SCHOOL OF MANAGEMENT STUDIES": "SMS",
    "TEXTILE TECHNOLOGY": "TT"
};

const FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Rohan", "Ishaan", "Krishna", "Dhruv", "Aryan",
    "Aadhya", "Ananya", "Diya", "Isha", "Kavya", "Priya", "Saanvi", "Sara", "Tanvi", "Zara",
    "Rahul", "Karthik", "Nikhil", "Pranav", "Varun", "Akash", "Harsha", "Manoj", "Suresh", "Vijay",
    "Divya", "Lakshmi", "Meera", "Nisha", "Pooja", "Riya", "Sneha", "Swati", "Uma", "Vidya"
];

const LAST_NAMES = [
    "Kumar", "Sharma", "Reddy", "Patel", "Singh", "Gupta", "Rao", "Nair", "Iyer", "Menon",
    "Verma", "Joshi", "Desai", "Kulkarni", "Mehta", "Shah", "Agarwal", "Chopra", "Malhotra", "Kapoor"
];

const SUBJECTS = {
    "CSE": [
        { code: "CS101", name: "Data Structures and Algorithms" },
        { code: "CS102", name: "Database Management Systems" },
        { code: "CS103", name: "Operating Systems" },
        { code: "CS104", name: "Computer Networks" },
        { code: "CS105", name: "Software Engineering" },
        { code: "CS106", name: "Web Technologies" },
        { code: "CS107", name: "Machine Learning" },
        { code: "CS108", name: "Artificial Intelligence" }
    ],
    "ECE": [
        { code: "EC101", name: "Digital Electronics" },
        { code: "EC102", name: "Signals and Systems" },
        { code: "EC103", name: "Communication Systems" },
        { code: "EC104", name: "Microprocessors" },
        { code: "EC105", name: "VLSI Design" },
        { code: "EC106", name: "Embedded Systems" }
    ],
    "MECH": [
        { code: "ME101", name: "Thermodynamics" },
        { code: "ME102", name: "Fluid Mechanics" },
        { code: "ME103", name: "Manufacturing Processes" },
        { code: "ME104", name: "Machine Design" },
        { code: "ME105", name: "Heat Transfer" },
        { code: "ME106", name: "Automobile Engineering" }
    ],
    "CIVIL": [
        { code: "CE101", name: "Structural Analysis" },
        { code: "CE102", name: "Concrete Technology" },
        { code: "CE103", name: "Geotechnical Engineering" },
        { code: "CE104", name: "Transportation Engineering" },
        { code: "CE105", name: "Environmental Engineering" }
    ],
    "EEE": [
        { code: "EE101", name: "Power Systems" },
        { code: "EE102", name: "Electrical Machines" },
        { code: "EE103", name: "Control Systems" },
        { code: "EE104", name: "Power Electronics" },
        { code: "EE105", name: "Renewable Energy Systems" }
    ],
    "COMMON": [
        { code: "MA101", name: "Engineering Mathematics I" },
        { code: "MA102", name: "Engineering Mathematics II" },
        { code: "PH101", name: "Engineering Physics" },
        { code: "CH101", name: "Engineering Chemistry" },
        { code: "HU101", name: "Professional Communication" }
    ]
};

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
const GRADE_POINTS = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };

// Helper function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate random marks based on grade
const getMarksForGrade = (grade) => {
    const ranges = {
        'A+': [90, 100],
        'A': [80, 89],
        'B+': [70, 79],
        'B': [60, 69],
        'C+': [50, 59],
        'C': [40, 49],
        'D': [35, 39],
        'F': [0, 34]
    };
    const [min, max] = ranges[grade];
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate weighted random grade (more A's and B's)
const getWeightedGrade = () => {
    const rand = Math.random();
    if (rand < 0.25) return 'A+';
    if (rand < 0.45) return 'A';
    if (rand < 0.65) return 'B+';
    if (rand < 0.80) return 'B';
    if (rand < 0.90) return 'C+';
    if (rand < 0.95) return 'C';
    if (rand < 0.98) return 'D';
    return 'F';
};

// Generate students
const generateStudents = async (count = 200) => {
    const students = [];
    const currentYear = new Date().getFullYear();
    const batchYears = [2021, 2022, 2023, 2024];

    // Pre-hash password for performance
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (let i = 0; i < count; i++) {
        const department = getRandomElement(DEPARTMENTS);
        const deptCode = DEPARTMENT_CODES[department];
        const batchYear = getRandomElement(batchYears);
        const firstName = getRandomElement(FIRST_NAMES);
        const lastName = getRandomElement(LAST_NAMES);

        const student = {
            studentId: `${batchYear}${deptCode}${String(i + 1).padStart(3, '0')}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@college.edu`,
            password: hashedPassword,
            role: 'student',
            profile: {
                firstName,
                lastName,
                dateOfBirth: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                address: {
                    street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
                    city: getRandomElement(['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']),
                    state: getRandomElement(['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana', 'West Bengal']),
                    pincode: `${Math.floor(Math.random() * 900000) + 100000}`
                },
                department,
                batchYear,
                semester: Math.min(8, (currentYear - batchYear) * 2 + 1)
            }
        };

        students.push(student);
    }

    return students;
};

// Generate exam results for a student
const generateResultsForStudent = async (student) => {
    const results = [];
    const currentSemester = student.profile.semester;
    const deptCode = DEPARTMENT_CODES[student.profile.department];

    // Determine subject pool based on department
    let subjectPool = [...SUBJECTS.COMMON];
    if (deptCode === 'CSE' || deptCode === 'AI&DS' || deptCode === 'AI&ML' || deptCode === 'IT' || deptCode === 'ISE') {
        subjectPool = [...subjectPool, ...SUBJECTS.CSE];
    } else if (deptCode === 'ECE' || deptCode === 'EIE') {
        subjectPool = [...subjectPool, ...SUBJECTS.ECE];
    } else if (deptCode === 'MECH' || deptCode === 'MCT') {
        subjectPool = [...subjectPool, ...SUBJECTS.MECH];
    } else if (deptCode === 'CIVIL') {
        subjectPool = [...subjectPool, ...SUBJECTS.CIVIL];
    } else if (deptCode === 'EEE') {
        subjectPool = [...subjectPool, ...SUBJECTS.EEE];
    }

    // Generate results for each completed semester
    for (let sem = 1; sem <= currentSemester; sem++) {
        const numSubjects = Math.floor(Math.random() * 3) + 5; // 5-7 subjects per semester
        const semesterSubjects = [];

        // Select random subjects for this semester
        for (let j = 0; j < numSubjects && j < subjectPool.length; j++) {
            const subject = subjectPool[j];
            const grade = getWeightedGrade();
            const marks = getMarksForGrade(grade);

            const result = {
                studentId: student.studentId,
                student: student._id,
                examId: `EXAM${student.profile.batchYear}SEM${sem}`,
                examName: `Semester ${sem} Examination`,
                subjectCode: subject.code,
                subjectName: subject.name,
                marks: {
                    obtained: marks,
                    maximum: 100
                },
                grade,
                gradePoints: GRADE_POINTS[grade],
                credits: 4,
                semester: sem,
                academicYear: `${student.profile.batchYear + Math.floor((sem - 1) / 2)}-${student.profile.batchYear + Math.floor((sem - 1) / 2) + 1}`,
                examDate: new Date(student.profile.batchYear + Math.floor((sem - 1) / 2), (sem % 2 === 1) ? 4 : 11, 15),
                uploadBatchId: `BATCH-SEED-${Date.now()}`,
                uploadedBy: null,
                isArchived: false
            };

            results.push(result);
        }
    }

    return results;
};

// Main seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examination-portal');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing students and results...');
        await User.deleteMany({ role: 'student' });
        await ExamResult.deleteMany({});
        console.log('✅ Cleared existing data');

        // Generate and insert students
        console.log('👥 Generating students...');
        const studentsData = await generateStudents(200);
        const students = await User.insertMany(studentsData);
        console.log(`✅ Created ${students.length} students`);

        // Generate and insert exam results
        console.log('📊 Generating exam results...');
        let totalResults = 0;
        let processedStudents = 0;

        for (const student of students) {
            try {
                const results = await generateResultsForStudent(student);
                if (results.length > 0) {
                    await ExamResult.insertMany(results);
                    totalResults += results.length;
                }
                processedStudents++;
                if (processedStudents % 50 === 0) {
                    console.log(`   Processed ${processedStudents}/${students.length} students...`);
                }
            } catch (error) {
                console.error(`   Error generating results for student ${student.studentId}:`, error.message);
            }
        }

        console.log(`✅ Created ${totalResults} exam results`);

        // Display statistics
        console.log('\n📈 Seeding Statistics:');
        console.log(`   Total Students: ${students.length}`);
        console.log(`   Total Results: ${totalResults}`);
        console.log(`   Departments: ${DEPARTMENTS.length}`);

        const deptCounts = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$profile.department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        console.log('\n🏆 Top 5 Departments by Student Count:');
        deptCounts.forEach((dept, index) => {
            console.log(`   ${index + 1}. ${dept._id}: ${dept.count} students`);
        });

        console.log('\n✨ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();
