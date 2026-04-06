require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    const adminEmail = 'Admin@gmail.com';
    const adminPassword = 'Admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      profile: {
        firstName: 'Super',
        lastName: 'Admin'
      }
    });

    console.log("Admin created successfully");
    process.exit();

  } catch (error) {
    console.error(error);
  }
};

createAdmin();