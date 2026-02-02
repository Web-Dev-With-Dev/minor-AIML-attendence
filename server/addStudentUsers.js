const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');

dotenv.config();
connectDB();

const addStudentUsers = async () => {
    try {
        console.log('\ud83d\udd0d Fetching all students from database...\\n');

        const allStudents = await Student.find({}).sort({ enrollmentNo: 1 });

        if (allStudents.length === 0) {
            console.log('\u26a0\ufe0f  No students found in database!');
            process.exit(1);
        }

        console.log(`\ud83d\udcda Found ${allStudents.length} students in database`);
        console.log('\ud83d\udd10 Creating user accounts for all students...\\n');

        let addedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        const defaultPassword = 'student123';

        for (const student of allStudents) {
            try {
                const existingUser = await User.findOne({ username: student.enrollmentNo });

                if (existingUser) {
                    console.log(`\u23ed\ufe0f  ${student.enrollmentNo} - ${student.name} (already exists)`);
                    skippedCount++;
                    continue;
                }

                const userData = {
                    username: student.enrollmentNo,
                    password: defaultPassword,
                    role: 'student',
                    enrollmentNo: student.enrollmentNo
                };

                const user = new User(userData);
                await user.save();
                console.log(`✅ ${student.enrollmentNo} - ${student.name}`);
                addedCount++;

            } catch (err) {
                console.error(`❌ Error creating user for ${student.enrollmentNo}: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 SUMMARY:');
        console.log(`${'='.repeat(60)}`);
        console.log(`✅ Successfully added: ${addedCount} student user accounts`);
        console.log(`⏭️  Skipped (already exist): ${skippedCount}`);
        if (errorCount > 0) {
            console.log(`❌ Errors: ${errorCount}`);
        }
        console.log(`📚 Total students in database: ${allStudents.length}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`\n🎓 All students can now login with:`);
        console.log(`   Username: <enrollment_number>`);
        console.log(`   Password: student123`);
        console.log(`\n💡 Example:`);
        if (allStudents.length > 0) {
            console.log(`   Username: ${allStudents[0].enrollmentNo}`);
            console.log(`   Password: student123`);
        }
        console.log('');

        process.exit();
    } catch (error) {
        console.error(`\n❌ Fatal Error: ${error}`);
        process.exit(1);
    }
};

addStudentUsers();
