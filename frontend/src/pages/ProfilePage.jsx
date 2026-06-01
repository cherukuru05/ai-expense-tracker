import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Phone, DollarSign, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', currency: 'INR', monthlyIncome: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        currency: user.currency || 'INR',
        monthlyIncome: user.monthlyIncome || 0
      });
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await userAPI.updateProfile({
        ...form,
        monthlyIncome: Number(form.monthlyIncome)
      });
      // Response returns updated user
      updateUser(response.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.error || 'Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Profile Settings</h1>
        <p className="text-sm text-slate-500">Manage your basic profile details, currency, and income details.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
              type="email" 
              value={user?.email || ''} 
              disabled 
            />
            <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <input 
                className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2 text-sm" 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
              />
              <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <input 
                className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2 text-sm" 
                type="tel" 
                placeholder="e.g. +91 9876543210"
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
              <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Income</label>
              <div className="relative">
                <input 
                  className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2 text-sm" 
                  type="number" 
                  value={form.monthlyIncome} 
                  onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} 
                />
                <DollarSign size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Currency</label>
              <select 
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white" 
                value={form.currency} 
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-60"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
