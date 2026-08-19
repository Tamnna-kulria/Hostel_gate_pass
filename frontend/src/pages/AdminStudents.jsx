import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getAllStudentProfiles,
  createStudentProfile,
  updateStudentProfile
} from "../api";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    user: "",
    collegeId: "",
    branch: "",
    year: "",
    roomNumber: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    isVerifiedByAdmin: false
  });

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStudentProfiles();

      setStudents(data.profiles || data.studentProfiles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function resetForm() {
    setFormData({
      user: "",
      collegeId: "",
      branch: "",
      year: "",
      roomNumber: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      isVerifiedByAdmin: false
    });

    setEditingId(null);
  }

  function handleEdit(student) {
    setEditingId(student._id);

    setFormData({
      user: student.user?._id || student.user || "",
      collegeId: student.collegeId || "",
      branch: student.branch || "",
      year: student.year || "",
      roomNumber: student.roomNumber || "",
      parentName: student.parentName || "",
      parentEmail: student.parentEmail || "",
      parentPhone: student.parentPhone || "",
      isVerifiedByAdmin: student.isVerifiedByAdmin || false
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      let data;

      if (editingId) {
        data = await updateStudentProfile(editingId, formData);
      } else {
        data = await createStudentProfile(formData);
      }

      setMessage(data.message);

      resetForm();

      await loadStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar title="Student Management" />

      <div className="dashboard-page">
        <h1>Student Management</h1>

        <p>
          Admin can create, update and verify student profiles.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* ADD / UPDATE FORM */}

        <div className="form-card">
          <h2>
            {editingId
              ? "Update Student Profile"
              : "Create Student Profile"}
          </h2>

          <form onSubmit={handleSubmit}>

            <label>User ID</label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="Enter student user ID"
              required
              disabled={!!editingId}
            />

            <label>College ID</label>
            <input
              type="text"
              name="collegeId"
              value={formData.collegeId}
              onChange={handleChange}
              placeholder="Example: SKIT123"
              required
            />

            <label>Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Example: CSE"
              required
            />

            <label>Year</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Example: 2nd Year"
              required
            />

            <label>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="Example: A-204"
              required
            />

            <label>Parent Name</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              placeholder="Parent name"
              required
            />

            <label>Parent Email</label>
            <input
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              placeholder="parent@gmail.com"
              required
            />

            <label>Parent Phone</label>
            <input
              type="text"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              placeholder="Parent phone number"
              required
            />

            <label>
              <input
                type="checkbox"
                name="isVerifiedByAdmin"
                checked={formData.isVerifiedByAdmin}
                onChange={handleChange}
              />

              {" "}Verify Student
            </label>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Student"
                : "Create Student"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </form>
        </div>

        {/* STUDENT LIST */}

        <div className="request-list">

          <h2>All Student Profiles</h2>

          {loading && (
            <div className="info-message">
              Loading students...
            </div>
          )}

          {!loading && students.length === 0 && (
            <div className="info-message">
              No student profiles found.
            </div>
          )}

          {students.map((student) => (
            <div
              className="request-card"
              key={student._id}
            >

              <div className="request-card-header">

                <div>
                  <h2>
                    {student.user?.name || "Student"}
                  </h2>

                  <p>
                    College ID: {student.collegeId}
                  </p>
                </div>

                <span
                  className={`status-badge ${
                    student.isVerifiedByAdmin
                      ? "returned"
                      : "pending"
                  }`}
                >
                  {student.isVerifiedByAdmin
                    ? "Verified"
                    : "Not Verified"}
                </span>

              </div>

              <div className="request-details-grid">

                <p>
                  <strong>Email:</strong>{" "}
                  {student.user?.email || "-"}
                </p>

                <p>
                  <strong>Branch:</strong>{" "}
                  {student.branch}
                </p>

                <p>
                  <strong>Year:</strong>{" "}
                  {student.year}
                </p>

                <p>
                  <strong>Room:</strong>{" "}
                  {student.roomNumber}
                </p>

                <p>
                  <strong>Parent:</strong>{" "}
                  {student.parentName}
                </p>

                <p>
                  <strong>Parent Email:</strong>{" "}
                  {student.parentEmail}
                </p>

                <p>
                  <strong>Parent Phone:</strong>{" "}
                  {student.parentPhone}
                </p>

              </div>

              <button
                onClick={() => handleEdit(student)}
              >
                Update
              </button>

            </div>
          ))}

        </div>
      </div>
    </>
  );
}

export default AdminStudents;