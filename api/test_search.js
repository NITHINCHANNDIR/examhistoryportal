require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const searchController = require('./src/controllers/searchController');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    
    const req = {
        user: admin,
        query: { q: 'a', limit: 10 }
    };
    
    const res = {
        status: function(s) { this.statusCode = s; return this; },
        json: function(data) { console.log("STATUS:", this.statusCode, "\nDATA:", JSON.stringify(data, null, 2)); }
    };
    
    await searchController.search(req, res);
    
    mongoose.disconnect();
}

run().catch(console.error);
