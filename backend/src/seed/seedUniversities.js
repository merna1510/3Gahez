import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import University from '../models/University.js';

const universities = [
  {
    name: 'Zagazig University', city: 'Zagazig', location: 'Zagazig, Sharqia, Egypt',
    description: 'Explore campus food and drink options at Zagazig University.', logo: '',
  },
  {
    name: 'Cairo University', city: 'Giza', location: 'Giza, Egypt',
    description: 'Find cafeterias and restaurants around Cairo University.', logo: '',
  },
  {
    name: 'Alexandria University', city: 'Alexandria', location: 'Alexandria, Egypt',
    description: 'Discover food options available across Alexandria University.', logo: '',
  },
  {
    name: 'Mansoura University', city: 'Mansoura', location: 'Mansoura, Dakahlia, Egypt',
    description: 'Browse campus dining places at Mansoura University.', logo: '',
  },
];

try {
  await connectDB();
  for (const university of universities) {
    await University.updateOne({ name: university.name }, { $setOnInsert: university }, { upsert: true });
  }
  console.log(`Seeded ${universities.length} universities (existing records were preserved).`);
} catch (error) {
  console.error('University seed failed:', error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState) await disconnectDB();
}
