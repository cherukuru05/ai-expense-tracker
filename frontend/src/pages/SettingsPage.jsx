import { useState } from 'react';
import toast from 'react-hot-toast';
import { Shield, Bell, Save, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [notifForm, setNotifForm] = useState({
    billReminders: user?.notificationPrefs?.billReminders ?? true,
    budgetAlerts: user?.notificationPrefs?.budgetAlerts ?? true,
    weeklySummary: user?.notificationPrefs?.weeklySummary ?? false,
    aiSuggestions: user?.notificationPrefs?.aiSuggestions ?? true,
  });

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifLoading, setNotifLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleNotifSubmit = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      const response = await userAPI.updateProfile({ notificationPrefs: notifForm });
      updateUser(response.user);
      toast.success('Notification preferences updated');
    } catch (err) {
      toast.error(err?.error || 'Unable to update preferences');
    } finally {
      setNotifLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwdLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err?.error || 'Unable to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <section className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Settings</h1>
        <p className="text-sm text-slate-500">Customize notification alerts and manage account security.</p>
      </div>

      {/* Notifications Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-blue-600" />
          Notification Alerts
        </h2>
        <form onSubmit={handleNotifSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
                checked={notifForm.billReminders} 
                onChange={(e) => setNotifForm({ ...notifForm, billReminders: e.target.checked })} 
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Bill Reminders</p>
                <p className="text-xs text-slate-500">Get notified when recurring bills are due.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
                checked={notifForm.budgetAlerts} 
                onChange={(e) => setNotifForm({ ...notifForm, budgetAlerts: e.target.checked })} 
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Budget Alerts</p>
                <p className="text-xs text-slate-500">Receive warnings when reaching 80% of category limits.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
                checked={notifForm.weeklySummary} 
                onChange={(e) => setNotifForm({ ...notifForm, weeklySummary: e.target.checked })} 
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Weekly Summary Reports</p>
                <p className="text-xs text-slate-500">Receive email digests of your weekly money movement.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
                checked={notifForm.aiSuggestions} 
                onChange={(e) => setNotifForm({ ...notifForm, aiSuggestions: e.target.checked })} 
              />
              <div>
                <p className="text-sm font-medium text-slate-900">AI Budget Recommendations</p>
                <p className="text-xs text-slate-500">Let AI suggest monthly budgets based on recent historical average spend.</p>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-60"
            disabled={notifLoading}
          >
            <Save size={16} />
            {notifLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>

      {/* Security Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-600" />
          Change Password
        </h2>
        <form onSubmit={handlePwdSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <div className="relative">
              <input 
                className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2 text-sm" 
                type="password" 
                value={pwdForm.currentPassword} 
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} 
                required 
              />
              <Key size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <input 
                className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2 text-sm" 
                type="password" 
                value={pwdForm.newPassword} 
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} 
                required 
              />
              <Key size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input 
                className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2 text-sm" 
                type="password" 
                value={pwdForm.confirmPassword} 
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} 
                required 
              />
              <Key size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-60"
            disabled={pwdLoading}
          >
            <Shield size={16} />
            {pwdLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
}
