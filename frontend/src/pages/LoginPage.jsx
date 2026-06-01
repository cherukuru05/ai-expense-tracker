import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.error || 'Unable to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">FinTrack AI</h1>
            <p className="text-sm text-slate-500">Sign in to continue</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input className="w-full border border-slate-300 rounded-md px-3 py-2 mb-5" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="w-full bg-blue-600 text-white rounded-md py-2 font-medium disabled:opacity-60" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-sm text-slate-500 mt-4 text-center">
          New here? <Link className="text-blue-700 font-medium" to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
