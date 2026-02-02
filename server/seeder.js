const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        try { await User.collection.drop(); } catch (e) { }
        try { await Student.collection.drop(); } catch (e) { }
        try { await Attendance.collection.drop(); } catch (e) { }

        const users = [
            { username: 'admin', password: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin' },
            { username: 'user', password: process.env.USER_PASSWORD || 'user123', role: 'user' },
            // Sample student users - they can login with enrollment number as username
            { username: '240280107043', password: 'student123', role: 'student', enrollmentNo: '240280107043' },
            { username: '240280107036', password: 'student123', role: 'student', enrollmentNo: '240280107036' },
            { username: '240280107141', password: 'student123', role: 'student', enrollmentNo: '240280107141' },
        ];

        for (const u of users) {
            const user = new User(u);
            await user.save();
        }

        console.log('Users Imported (including sample students)');

        const students = [
            { name: "DUBEY ARCHIT RAJESH", enrollmentNo: "240280107036", department: 'AI & Machine Learning' },
            { name: "Tailor Sumit Jigneshbhai", enrollmentNo: "240280107141", department: 'AI & Machine Learning' },
            { name: "VAJA VINAY JENTIBHAI", enrollmentNo: "240280107147", department: 'AI & Machine Learning' },
            { name: "SHAH KEVAL PINTUBHAI", enrollmentNo: "240280107134", department: 'AI & Machine Learning' },
            { name: "TANKARIYA SHUBHAM KETANKUMAR", enrollmentNo: "240280107142", department: 'AI & Machine Learning' },
            { name: "VIVEK KHASIYA", enrollmentNo: "240280107155", department: 'AI & Machine Learning' },
            { name: "Parmar Dharmi Prakashbhai", enrollmentNo: "240280107090", department: 'AI & Machine Learning' },
            { name: "Bhati Piyush Pramod", enrollmentNo: "240280107166", department: 'AI & Machine Learning' },
            { name: "Solanki Misari Dharmendrabhai", enrollmentNo: "240280107078", department: 'AI & Machine Learning' },
            { name: "RIYA KISHORBHAI NANDASANA", enrollmentNo: "240280107129", department: 'AI & Machine Learning' },
            { name: "Dave Krisha NiteshKumar", enrollmentNo: "240280107027", department: 'AI & Machine Learning' },
            { name: "Ghoghari Jigar Arjanbhai", enrollmentNo: "240280107041", department: 'AI & Machine Learning' },
            { name: "KALARIYA DHRUVI MITESHBHAI", enrollmentNo: "240280107059", department: 'AI & Machine Learning' },
            { name: "Letwala Dev Anilkumar", enrollmentNo: "240280107071", department: 'AI & Machine Learning' },
            { name: "Rathva Prashantkumar Kiranbhai", enrollmentNo: "240280107127", department: 'AI & Machine Learning' },
            { name: "PARMAR DEVENDRABHAI BHARATBHAI", enrollmentNo: "240280107089", department: 'AI & Machine Learning' },
            { name: "Patel Vraj Tejaskumar", enrollmentNo: "240280107111", department: 'AI & Machine Learning' },
            { name: "Mehta Karan Tusharbhai", enrollmentNo: "240280107076", department: 'AI & Machine Learning' },
            { name: "Doshi Aangi Jayeshkumar", enrollmentNo: "240280107035", department: 'AI & Machine Learning' },
            { name: "Gondaliya Dev Dineshbhai", enrollmentNo: "240280107043", department: 'AI & Machine Learning' },
            { name: "CHAUHAN ARYA MANISHKUMAR", enrollmentNo: "240280107002", department: 'AI & Machine Learning' },
            { name: "Katara Mehulbhai Rajubhai", enrollmentNo: "240280107063", department: 'AI & Machine Learning' },
            { name: "SATHWARA DHRUMILBHAI NARESHKUMAR", enrollmentNo: "240280107133", department: 'AI & Machine Learning' },
            { name: "DAYMA NISHARHUSEN SULATANMAHAMAD", enrollmentNo: "240280107028", department: 'AI & Machine Learning' },
            { name: "PRAJAPATI VALSKUMAR SURESHBHAI", enrollmentNo: "240280107118", department: 'AI & Machine Learning' },
            { name: "Jiya Vipul Patel", enrollmentNo: "240280107170", department: 'AI & Machine Learning' },
            { name: "Desai Tanmay Tushar", enrollmentNo: "240280107029", department: 'AI & Machine Learning' },
            { name: "DHRUVESHBHAI", enrollmentNo: "240280107034", department: 'AI & Machine Learning' },
            { name: "KALANI KRUSHANG YOGESHKUMAR", enrollmentNo: "240280107058", department: 'AI & Machine Learning' },
            { name: "Ansari Aayesha", enrollmentNo: "240280107001", department: 'AI & Machine Learning' },
            { name: "Mujpara Rushikesh Hirenbhai", enrollmentNo: "250283107009", department: 'AI & Machine Learning' },
            { name: "Harsh Vipul Shah", enrollmentNo: "250283107018", department: 'AI & Machine Learning' },
            { name: "Parv Amitkumar Shah", enrollmentNo: "250283107011", department: 'AI & Machine Learning' },
            { name: "Maitri Girishkumar Padia", enrollmentNo: "230280111069", department: 'AI & Machine Learning' },
            { name: "Misha Bansilal Patel", enrollmentNo: "240280116069", department: 'AI & Machine Learning' },
            { name: "PRAJAPATI ARYA PRAVINKUMAR", enrollmentNo: "240280111108", department: 'AI & Machine Learning' },
            { name: "Bardolia Jay Viral", enrollmentNo: "240280116047", department: 'AI & Machine Learning' },
            { name: "PRAJAPATI MEETKUMAR ASHOKKUMAR", enrollmentNo: "240280111113", department: 'AI & Machine Learning' },
            { name: "TANDEL KIRTAN VIRALKUMAR", enrollmentNo: "240280116135", department: 'AI & Machine Learning' },
            { name: "Devashish Bansal", enrollmentNo: "240280117018", department: 'AI & Machine Learning' },
            { name: "PATEL ADITI PINAKIN", enrollmentNo: "240280141038", department: 'AI & Machine Learning' },
            { name: "Patel Bhavya Prakashkumar", enrollmentNo: "240280141039", department: 'AI & Machine Learning' },
            { name: "Bhavsar Devasya Hirenkumar", enrollmentNo: "240280111012", department: 'AI & Machine Learning' },
            { name: "Vatukiya Yogeshkumar RajeshBhai", enrollmentNo: "240280116152", department: 'AI & Machine Learning' },
            { name: "Mistry Priyal Pankajkumar", enrollmentNo: "240280111117", department: 'AI & Machine Learning' },
            { name: "Mistry Krisha mayankbhai", enrollmentNo: "240280141030", department: 'AI & Machine Learning' },
            { name: "Harsh", enrollmentNo: "240280117024", department: 'AI & Machine Learning' },
            { name: "PATEL KUSHAL HEMALKUMAR", enrollmentNo: "240280116092", department: 'AI & Machine Learning' },
            { name: "Nai Diya", enrollmentNo: "240280141032", department: 'AI & Machine Learning' },
            { name: "Shivam Nandi", enrollmentNo: "240280111139", department: 'AI & Machine Learning' },
            { name: "Tharakan Rahil Ramachandran", enrollmentNo: "240280111146", department: 'AI & Machine Learning' },
            { name: "Harshit Singh", enrollmentNo: "240280141021", department: 'AI & Machine Learning' },
            { name: "PATEL KRISH NARESHBHAI", enrollmentNo: "240280116091", department: 'AI & Machine Learning' },
            { name: "ANSARI JUNEDAKHTAR JAMALUDIN", enrollmentNo: "240280116004", department: 'AI & Machine Learning' },
            { name: "BAGHEL SHIVAMKUMAR PRADIPKUMAR", enrollmentNo: "240280111008", department: 'AI & Machine Learning' },
            { name: "SARTHAKK ANJARIYA", enrollmentNo: "240280141057", department: 'AI & Machine Learning' },
            { name: "Kavin Jindal", enrollmentNo: "240280117033", department: 'AI & Machine Learning' },
            { name: "GUPTA ANCHAL UMESHBHAI", enrollmentNo: "240280116038", department: 'AI & Machine Learning' },
            { name: "Makwana Hardikbhai Hareshbhai", enrollmentNo: "240280116064", department: 'AI & Machine Learning' },
            { name: "Jain Krish Alpesh", enrollmentNo: "240280111063", department: 'AI & Machine Learning' },
            { name: "PATEL JENIL RAJNIKANT", enrollmentNo: "240280141040", department: 'AI & Machine Learning' },
            { name: "BRAHMBHATT YASH", enrollmentNo: "240280141010", department: 'AI & Machine Learning' },
            { name: "JOSHI PRANJAL PRATIKKUMAR", enrollmentNo: "240280111051", department: 'AI & Machine Learning' },
            { name: "BOSMIYA AAKANKSHA VIKRAMBHAI", enrollmentNo: "250283116003", department: 'AI & Machine Learning' },
            { name: "Pandya Raasa Pritesh", enrollmentNo: "250283116005", department: 'AI & Machine Learning' },
            { name: "Joshi Dax Vipulkumar", enrollmentNo: "250283119007", department: 'AI & Machine Learning' }
        ];
        await Student.insertMany(students);
        console.log('66 AI/ML Students Imported');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
