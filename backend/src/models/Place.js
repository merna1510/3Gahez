import mongoose from 'mongoose';

// A small shared Place model so the university details endpoint can return its
// campus locations. The places team can extend this schema without changing
// the university relationship (universityId).
const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    type: { type: String, trim: true, default: 'other' },
    openingHours: { type: String, default: '' },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    avgPrepTime: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Place', placeSchema);
