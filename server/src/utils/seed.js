import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import User model
import User from '../models/User.js';

const seedUsers = [
    {
        username: 'admin',
        email: 'admin@videostream.com',
        password: 'Admin@123',
        role: 'admin'
    },
    {
        username: 'editor',
        email: 'editor@videostream.com',
        password: 'Editor@123',
        role: 'editor'
    },
    {
        username: 'viewer',
        email: 'viewer@videostream.com',
        password: 'Viewer@123',
        role: 'viewer'
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users (optional)
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create seed users
        for (const userData of seedUsers) {
            const user = await User.create(userData);
            console.log(`👤 Created user: ${user.username} (${user.role})`);
        }

        console.log('\n✅ Database seeded successfully!\n');
        console.log('Demo credentials:');
        console.log('================');
        seedUsers.forEach(user => {
            console.log(`Role: ${user.role.toUpperCase()}`);
            console.log(`Email: ${user.email}`);
            console.log(`Password: ${user.password}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
