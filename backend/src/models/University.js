import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    logo: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, required: true, maxlength: 80 },
    description: { type: String, trim: true, default: '', maxlength: 1500 },
    location: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

universitySchema.index({ name: 'text', city: 'text' });
export default mongoose.model('University', universitySchema);
