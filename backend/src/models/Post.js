import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must belong to a user'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      minlength: [1, 'Post content cannot be empty'],
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2048, 'Image URL is too long'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// The feed is always sorted newest first.
postSchema.index({ createdAt: -1 });
// Speeds up "all posts by a specific user" queries.
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
