require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/insightflow");
  console.log("Connected to DB");
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const user = await User.findOne({ email: 'test@example.com' });
  console.log("User found:", user ? "Yes" : "No");
  
  if (user) {
    console.log("Stored password hash:", user.password);
    const isValid = await bcrypt.compare('Password123!', user.password);
    console.log("Password valid:", isValid);
  }
  
  mongoose.disconnect();
}

test().catch(console.error);
