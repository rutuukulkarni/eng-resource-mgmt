import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { 
  User,
  Mail,
  Calendar,
  Briefcase,
  Code,
  Save,
  Edit,
  Clock
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  bio?: string;
  skills?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract';
  seniority?: 'junior' | 'mid-level' | 'senior' | 'lead';
  availability?: number;
  startDate?: string;
  phone?: string;
  location?: string;
}

const Profile = () => {
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/auth/users/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data.data);
        setEditedProfile(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user, token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedProfile({...profile});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile({...editedProfile, [name]: value});
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && editedProfile.skills) {
      setEditedProfile({
        ...editedProfile, 
        skills: [...editedProfile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (editedProfile.skills) {
      setEditedProfile({
        ...editedProfile,
        skills: editedProfile.skills.filter(skill => skill !== skillToRemove)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5001/api/users/${user?.id}`, 
        editedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setProfile(response.data.data);
      setIsEditing(false);
      // User will be updated on next page load/refresh
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (error && !profile) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button 
          onClick={handleEditToggle}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            isEditing ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'
          }`}
        >
          {isEditing ? (
            <>
              <Edit size={16} />
              Cancel Editing
            </>
          ) : (
            <>
              <Edit size={16} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
              <User className="text-blue-500" size={48} />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <p className="text-blue-100">{profile?.title || profile?.role}</p>
              <div className="flex items-center mt-2">
                <Mail className="mr-2" size={16} />
                <span>{profile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editedProfile.phone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editedProfile.location || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              
              {profile?.role === 'engineer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editedProfile.title || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seniority Level</label>
                    <select
                      name="seniority"
                      value={editedProfile.seniority || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Select Level</option>
                      <option value="junior">Junior</option>
                      <option value="mid-level">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                    <select
                      name="employmentType"
                      value={editedProfile.employmentType || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Select Type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Availability (%)</label>
                    <input
                      type="number"
                      name="availability"
                      min="0"
                      max="100"
                      value={editedProfile.availability || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {profile?.role === 'engineer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedProfile.skills?.map((skill) => (
                    <div key={skill} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <Code size={14} className="mr-1" />
                      {skill}
                      <button 
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex mt-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-grow border border-gray-300 rounded-l-md shadow-sm p-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={editedProfile.bio || ''}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                disabled={isLoading}
              >
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Mail className="mt-1 mr-3 text-gray-400" size={18} />
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Email</span>
                      <span className="block mt-1">{profile?.email}</span>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <User className="mt-1 mr-3 text-gray-400" size={18} />
                    <div>
                      <span className="block text-sm font-medium text-gray-500">Role</span>
                      <span className="block mt-1 capitalize">{profile?.role}</span>
                    </div>
                  </li>
                  
                  {profile?.phone && (
                    <li className="flex items-start">
                      <User className="mt-1 mr-3 text-gray-400" size={18} />
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Phone</span>
                        <span className="block mt-1">{profile.phone}</span>
                      </div>
                    </li>
                  )}
                  
                  {profile?.location && (
                    <li className="flex items-start">
                      <User className="mt-1 mr-3 text-gray-400" size={18} />
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Location</span>
                        <span className="block mt-1">{profile.location}</span>
                      </div>
                    </li>
                  )}
                  
                  {profile?.bio && (
                    <li className="flex items-start">
                      <User className="mt-1 mr-3 text-gray-400" size={18} />
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Bio</span>
                        <p className="mt-1 text-gray-700">{profile.bio}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              
              {profile?.role === 'engineer' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
                  <ul className="space-y-3">
                    {profile?.title && (
                      <li className="flex items-start">
                        <Briefcase className="mt-1 mr-3 text-gray-400" size={18} />
                        <div>
                          <span className="block text-sm font-medium text-gray-500">Job Title</span>
                          <span className="block mt-1">{profile.title}</span>
                        </div>
                      </li>
                    )}
                    
                    {profile?.seniority && (
                      <li className="flex items-start">
                        <User className="mt-1 mr-3 text-gray-400" size={18} />
                        <div>
                          <span className="block text-sm font-medium text-gray-500">Seniority Level</span>
                          <span className="block mt-1 capitalize">{profile.seniority}</span>
                        </div>
                      </li>
                    )}
                    
                    {profile?.employmentType && (
                      <li className="flex items-start">
                        <Briefcase className="mt-1 mr-3 text-gray-400" size={18} />
                        <div>
                          <span className="block text-sm font-medium text-gray-500">Employment Type</span>
                          <span className="block mt-1 capitalize">{profile.employmentType}</span>
                        </div>
                      </li>
                    )}
                    
                    {profile?.availability !== undefined && (
                      <li className="flex items-start">
                        <Clock className="mt-1 mr-3 text-gray-400" size={18} />
                        <div>
                          <span className="block text-sm font-medium text-gray-500">Availability</span>
                          <span className="block mt-1">{profile.availability}%</span>
                        </div>
                      </li>
                    )}
                    
                    {profile?.startDate && (
                      <li className="flex items-start">
                        <Calendar className="mt-1 mr-3 text-gray-400" size={18} />
                        <div>
                          <span className="block text-sm font-medium text-gray-500">Start Date</span>
                          <span className="block mt-1">{new Date(profile.startDate).toLocaleDateString()}</span>
                        </div>
                      </li>
                    )}
                    
                    {profile?.skills && profile.skills.length > 0 && (
                      <li className="flex items-start">
                        <Code className="mt-1 mr-3 text-gray-400" size={18} />
                        <div>
                          <span className="block text-sm font-medium text-gray-500">Skills</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profile.skills.map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                                <Code size={12} className="mr-1" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
