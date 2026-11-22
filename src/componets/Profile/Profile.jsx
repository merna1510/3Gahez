import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import { fetchUniversities } from '../../services/universities';
import { getApiError } from '../../services/api';
import { getCurrentUser, updateCurrentUser, clearSession } from '../../services/auth';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', universityId: '', image: '' });
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    Promise.all([getCurrentUser(), fetchUniversities()])
      .then(([user, list]) => {
        if (!active) return;
        setUniversities(list);
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          universityId: user.universityId?._id || user.universityId || '',
          image: localStorage.getItem('profileImage') || user.profilePicture || '',
        });
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) {
          clearSession();
          navigate('/login', { replace: true });
        } else setError(getApiError(err));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSuccess('');
    setError('');
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please select a valid image.');
    if (file.size > 2 * 1024 * 1024) return setError('Image size must be less than 2MB.');
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({ ...current, image: reader.result }));
      localStorage.setItem('profileImage', reader.result);
      setSuccess(''); setError('');
    };
    reader.onerror = () => setError('Could not read the image.');
    reader.readAsDataURL(file);
  }

  async function saveData(e) {
    e.preventDefault(); setSuccess(''); setError('');
    if (profile.name.trim().length < 2) return setError('Name must be at least 2 characters.');
    if (profile.phone && !/^01[0125]\d{8}$/.test(profile.phone)) return setError('Enter a valid Egyptian phone number.');
    setSaving(true);
    try {
      const updated = await updateCurrentUser({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        universityId: profile.universityId || null,
      });
      setProfile((current) => ({ ...current, name: updated.name, phone: updated.phone || '', universityId: updated.universityId?._id || updated.universityId || '' }));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(getApiError(err));
    } finally { setSaving(false); }
  }

  if (loading) return <p className="text-center py-5">Loading profile...</p>;

  return (
    <section className={`${styles.profilePage} py-5`}>
      <div className="container"><div className="row justify-content-center"><div className="col-lg-8">
        <div className={`card border-0 shadow p-4 ${styles.profileCard}`}>
          <div className="text-center mb-4">
            <label htmlFor="profileImage" className={styles.avatar} title="Change profile picture">
              {profile.image ? <img src={profile.image} alt="Profile" className={styles.profileImage} /> : (profile.name || 'U')[0].toUpperCase()}
              <span className={styles.cameraIcon}>📷</span>
            </label>
            <input type="file" id="profileImage" accept="image/*" hidden onChange={handleImageChange} />
            <p className={styles.imageHint}>Click on the photo to change it</p>
            <h2 className="fw-bold mt-3">My Profile</h2>
            <p className="text-secondary">Manage your personal information</p>
          </div>
          <form onSubmit={saveData}>
            <div className="mb-3"><label className="form-label">Full Name</label><input className="form-control" name="name" value={profile.name} onChange={handleChange} required /></div>
            <div className="mb-3"><label className="form-label">Email Address</label><input type="email" className="form-control" value={profile.email} readOnly disabled /><div className="form-text">Email is managed by your account.</div></div>
            <div className="mb-3"><label className="form-label">Phone Number</label><input type="tel" className="form-control" name="phone" value={profile.phone} onChange={handleChange} placeholder="01xxxxxxxxx" /></div>
            <div className="mb-3"><label className="form-label">University</label><select className="form-select" name="universityId" value={profile.universityId} onChange={handleChange}><option value="">Select your university</option>{universities.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select></div>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <button type="submit" className={`btn w-100 mt-3 ${styles.saveButton}`} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        <div className="text-center mt-3"><button className="btn btn-outline-danger w-100" onClick={() => { clearSession(); navigate('/login'); }}>Logout</button></div>
      </div></div></div>
    </section>
  );
}
