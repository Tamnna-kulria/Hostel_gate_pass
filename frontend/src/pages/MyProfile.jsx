import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyStudentProfile } from "../api";


function MyProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getMyStudentProfile().then((data) => setProfile(data.profile));
  }, []);

  return (
    <>
      <Navbar title="My Profile" />
      <div className="form-page">
        <div className="form-card">
          <h1>My Official Hostel Profile</h1>

          {profile && (
            <div className="result-card">
              <p><strong>Name:</strong> {profile.user?.name}</p>
              <p><strong>College ID:</strong> {profile.collegeId}</p>
              <p><strong>Father Name:</strong> {profile.fatherName}</p>
              <p><strong>Branch:</strong> {profile.branch}</p>
              <p><strong>Year:</strong> {profile.year}</p>
              <p><strong>Room:</strong> {profile.roomNumber}</p>
              <p><strong>Parent Email:</strong> {profile.parentEmail}</p>
              <p><strong>Parent Contact:</strong> {profile.parentContact}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyProfile;