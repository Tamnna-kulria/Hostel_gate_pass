import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    collegeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fatherName: {
      type: String,
      required: true,
      trim: true
    },

    branch: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: String,
      required: true,
      trim: true
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true
    },

    hostelBlock: {
      type: String,
      required: true,
      trim: true
    },

    selfContact: {
      type: String,
      required: true,
      trim: true
    },

    parentContact: {
      type: String,
      required: true,
      trim: true
    },

    parentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
  },

    parentName: {
      type: String,
      trim: true
    },

    isVerifiedByAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;