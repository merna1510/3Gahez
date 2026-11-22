import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-z0-9_]+$/,
        'Username may only contain letters, numbers and underscores',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // Never include the password in query results unless explicitly asked
      // for with .select('+password').
      select: false,
    },
    phone: { type: String, trim: true, default: '', maxlength: 20 },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', default: null },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profilePicture: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2048, 'Profile picture URL is too long'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [160, 'Bio cannot exceed 160 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        // Extra safety net: the password must never leave the server.
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash the password whenever it is created or changed. Controllers therefore
// always work with plain passwords and never have to remember to hash.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compares a plain password with the stored hash.
 * Requires the document to be loaded with `.select('+password')`.
 *
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Safe representation of a user for the authenticated owner.
 */
userSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    phone: this.phone,
    universityId: this.universityId,
    role: this.role,
    profilePicture: this.profilePicture,
    bio: this.bio,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Safe representation of a user for other users (email is private).
 */
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    profilePicture: this.profilePicture,
    bio: this.bio,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
