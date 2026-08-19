import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";

export async function createStudentProfile(req, res) {
  try {
    const {
    userId,
    collegeId,
    fatherName,
    branch,
    year,
    roomNumber,
    hostelBlock,
    selfContact,
    parentContact,
    parentEmail,
    parentName,
     
  } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        message: "Student profile can be created only for student users"
      });
    }

    const existingProfile = await StudentProfile.findOne({
      $or: [{ user: userId }, { collegeId }]
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Student profile already exists for this user or college ID"
      });
    }

    const profile = await StudentProfile.create({
        user: userId,
        collegeId,
        fatherName,
        branch,
        year,
        roomNumber,
        hostelBlock,
        selfContact,
        parentContact,
        parentEmail,
        parentName,
        isVerifiedByAdmin: true
    });

    res.status(201).json({
      message: "Student profile created successfully",
      profile
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getAllStudentProfiles(req, res) {
  try {
    const profiles = await StudentProfile.find()
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 });

    res.json({
      message: "Student profiles fetched successfully",
      count: profiles.length,
      profiles
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getMyStudentProfile(req, res) {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user._id
    }).populate("user", "name email phone role");

    if (!profile) {
      return res.status(404).json({
        message: "Student profile not found"
      });
    }

    res.json({
      message: "My student profile fetched successfully",
      profile
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getStudentProfileById(req, res) {
  try {
    const profile = await StudentProfile.findById(req.params.id)
      .populate("user", "name email phone role");

    if (!profile) {
      return res.status(404).json({
        message: "Student profile not found"
      });
    }

    res.json({
      message: "Student profile fetched successfully",
      profile
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}


export async function updateStudentProfile(req, res) {
  try {
    const {
      collegeId,
      fatherName,
      branch,
      year,
      roomNumber,
      hostelBlock,
      selfContact,
      parentContact,
      parentEmail,
      parentName,
      isVerifiedByAdmin
    } = req.body;

    const profile = await StudentProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        message: "Student profile not found"
      });
    }

    if (collegeId !== undefined) profile.collegeId = collegeId;
    if (fatherName !== undefined) profile.fatherName = fatherName;
    if (branch !== undefined) profile.branch = branch;
    if (year !== undefined) profile.year = year;
    if (roomNumber !== undefined) profile.roomNumber = roomNumber;
    if (hostelBlock !== undefined) profile.hostelBlock = hostelBlock;
    if (selfContact !== undefined) profile.selfContact = selfContact;
    if (parentContact !== undefined) profile.parentContact = parentContact;
    if (parentEmail !== undefined) profile.parentEmail = parentEmail;
    if (parentName !== undefined) profile.parentName = parentName;
    if (isVerifiedByAdmin !== undefined) {
      profile.isVerifiedByAdmin = isVerifiedByAdmin;
    }

    await profile.save();

    const updatedProfile = await StudentProfile.findById(profile._id)
      .populate("user", "name email phone role");

    res.json({
      message: "Student profile updated successfully",
      profile: updatedProfile
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}