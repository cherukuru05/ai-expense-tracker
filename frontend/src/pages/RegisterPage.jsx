import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', monthlyIncome: '', currency: 'INR' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register({
        ...form,
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : 0
      });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.error || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">FinTrack AI</h1>
            <p className="text-sm text-slate-500">Create a new account</p>
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input 
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4" 
          type="text" 
          value={form.name} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required 
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input 
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4" 
          type="email" 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          required 
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input 
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4" 
          type="password" 
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          required 
        />

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Income</label>
            <input 
              className="w-full border border-slate-300 rounded-md px-3 py-2" 
              type="number" 
              placeholder="e.g. 50000"
              value={form.monthlyIncome} 
              onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select 
              className="w-full border border-slate-300 rounded-md px-3 py-2" 
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

        <button 
          className="w-full bg-blue-600 text-white rounded-md py-2 font-medium disabled:opacity-60" 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Already have an account? <Link className="text-blue-700 font-medium" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
