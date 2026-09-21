import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Button from '../components/ui/Button';

function ArrayInput({ label, value, onChange, placeholder, hint }) {
  const handleChange = (e) => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    onChange(arr);
  };
  return (
    <div className="sc-form-group">
      <label className="sc-label">
        {label}
      </label>
      <textarea
        className="sc-textarea"
        value={value.join(', ')}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {hint && <span className="sc-form-hint">{hint}</span>}
    </div>
  );
}

function TextInput({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="sc-form-group">
      <label className="sc-label">
        {label}
      </label>
      <input
        className="sc-input"
        type={type}
        value={value || ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <div className="sc-form-group">
      <label className="sc-label">
        {label}
      </label>
      <select
        className="sc-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [profile, setProfile] = useState({
    education: [],
    degree: '',
    graduationYear: new Date().getFullYear(),
    experienceLevel: '',
    skills: [],
    softSkills: [],
    preferredRoles: [],
    preferredIndustries: [],
    careerGoals: [],
    experience: [],
    location: '',
    remotePreference: '',
    expectedSalary: 0,
    maxPaymentWillingness: 0,
    learningGoals: [],
    budget: 0,
    availableTime: '',
    preferredLearningMode: 'ONLINE',
  });

  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getUserProfile();
        if (data) {
          setProfile(p => ({ ...p, ...data }));
        }
      } catch (err) {
        if (err.code !== 'UNAUTHORIZED') {
          setError(err.message);
        } else {
          navigate('/login', { state: { from: '/profile' } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await api.updateUserProfile(profile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="sc-container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="sc-container" style={{ padding: '4rem 1rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--sc-text)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          Your Profile
        </h1>
        <p style={{ color: 'var(--sc-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '640px' }}>
          Tell us about your background and goals so we can calculate personalized suitability and skill gaps for every opportunity you analyze.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--sc-danger-soft)', color: 'var(--sc-danger-dark)', padding: '1rem', borderRadius: 'var(--sc-radius-sm)', marginBottom: '2rem', border: '1px solid var(--sc-danger-border)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--sc-success-soft)', color: 'var(--sc-success)', padding: '1rem', borderRadius: 'var(--sc-radius-sm)', marginBottom: '2rem', border: '1px solid var(--sc-success-border)' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--sc-surface)', padding: '2.5rem', borderRadius: 'var(--sc-radius-lg)', border: '1px solid var(--sc-border)' }}>
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--sc-border)' }}>Education & Background</h3>
        <div className="sc-form-grid">
          <TextInput label="Degree" value={profile.degree} onChange={(v) => updateField('degree', v)} placeholder="e.g. B.Tech Computer Science" />
          <TextInput label="Graduation Year" type="number" value={profile.graduationYear} onChange={(v) => updateField('graduationYear', v)} />
        </div>
        <ArrayInput label="Institutions / Education History" value={profile.education} onChange={(v) => updateField('education', v)} hint="Comma separated list" />
        <SelectInput 
          label="Experience Level" 
          value={profile.experienceLevel} 
          onChange={(v) => updateField('experienceLevel', v)} 
          options={[
            { value: 'BEGINNER', label: 'Beginner / Student' },
            { value: 'INTERMEDIATE', label: 'Intermediate / Junior' },
            { value: 'ADVANCED', label: 'Advanced / Senior' },
            { value: 'EXPERT', label: 'Expert / Lead' },
          ]} 
        />
        <ArrayInput label="Experience (Companies / Roles)" value={profile.experience} onChange={(v) => updateField('experience', v)} hint="Comma separated" />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--sc-border)', marginTop: '2.5rem' }}>Skills</h3>
        <ArrayInput label="Technical Skills" value={profile.skills} onChange={(v) => updateField('skills', v)} hint="Comma separated (e.g. Python, React, AWS)" />
        <ArrayInput label="Soft Skills" value={profile.softSkills} onChange={(v) => updateField('softSkills', v)} hint="Comma separated (e.g. Leadership, Communication)" />
        <ArrayInput label="Learning Goals" value={profile.learningGoals} onChange={(v) => updateField('learningGoals', v)} hint="Skills you want to learn next" />
        <SelectInput 
          label="Preferred Learning Mode" 
          value={profile.preferredLearningMode} 
          onChange={(v) => updateField('preferredLearningMode', v)} 
          options={[
            { value: 'ONLINE', label: 'Online' },
            { value: 'OFFLINE', label: 'In Person' },
            { value: 'HYBRID', label: 'Hybrid' },
          ]} 
        />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--sc-border)', marginTop: '2.5rem' }}>Career & Preferences</h3>
        <ArrayInput label="Career Goals" value={profile.careerGoals} onChange={(v) => updateField('careerGoals', v)} hint="e.g. Become a full stack engineer, Get an internship in fintech" />
        <ArrayInput label="Preferred Roles" value={profile.preferredRoles} onChange={(v) => updateField('preferredRoles', v)} hint="Comma separated (e.g. Frontend Developer, Data Analyst)" />
        <ArrayInput label="Preferred Industries" value={profile.preferredIndustries} onChange={(v) => updateField('preferredIndustries', v)} hint="Comma separated (e.g. Finance, Healthcare)" />
        
        <div className="sc-form-grid">
          <TextInput label="Location" value={profile.location} onChange={(v) => updateField('location', v)} placeholder="City, Country" />
          <SelectInput 
            label="Remote Preference" 
            value={profile.remotePreference} 
            onChange={(v) => updateField('remotePreference', v)} 
            options={[
              { value: 'REMOTE_ONLY', label: 'Remote Only' },
              { value: 'HYBRID', label: 'Hybrid' },
              { value: 'ON_SITE', label: 'On-Site' },
              { value: 'ANY', label: 'No Preference' },
            ]} 
          />
        </div>

        <div className="sc-form-grid">
          <TextInput label="Expected Salary / Stipend (INR)" type="number" value={profile.expectedSalary} onChange={(v) => updateField('expectedSalary', v)} />
          <TextInput label="Max Payment Willingness (INR)" type="number" value={profile.maxPaymentWillingness} onChange={(v) => updateField('maxPaymentWillingness', v)} />
        </div>
        <TextInput label="Available Time" value={profile.availableTime} onChange={(v) => updateField('availableTime', v)} placeholder="e.g. 20 hours/week" />

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => navigate(-1)} type="button">Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
