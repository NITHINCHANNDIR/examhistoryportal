const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Configure dotenv to read from .env in server folder
dotenv.config();

const ExamResult = require('./src/models/ExamResult');
const User = require('./src/models/User');

const cleanOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for cleanup.');

        // Find all unique student IDs in the ExamResult collection
        const studentIdsWithResults = await ExamResult.distinct('student');
        console.log(`Found ${studentIdsWithResults.length} unique student IDs with results.`);

        // Find which of these student IDs actually exist in the User collection
        const existingUsers = await User.find({ _id: { $in: studentIdsWithResults } }, '_id');
        const existingUserIds = existingUsers.map(u => u._id.toString());
        console.log(`Found ${existingUserIds.length} existing users with results.`);
        
        let deletedCount = 0;
        // Delete ExamResults for student IDs that no longer exist
        for (const studentId of studentIdsWithResults) {
            if (!studentId || !existingUserIds.includes(studentId.toString())) {
                const result = await ExamResult.deleteMany({ student: studentId });
                deletedCount += result.deletedCount;
                console.log(`Deleted ${result.deletedCount} orphaned results for student ${studentId}`);
            }
        }

        console.log(`Cleanup complete. Total orphaned results deleted: ${deletedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanOrphans();
