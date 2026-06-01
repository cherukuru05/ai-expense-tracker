import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import { billAPI } from '../services/api';

const categories = ['Utilities', 'Entertainment', 'Health', 'Education', 'Housing', 'Transport', 'Other'];
const repeats = ['none', 'weekly', 'monthly', 'yearly'];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ name: '', amount: '', dueDate: '', category: 'Utilities', repeat: 'monthly', notes: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    billAPI.getAll()
      .then((data) => setBills(data.bills || []))
      .catch(() => toast.error('Unable to load bills'));
  };

  useEffect(() => { load(); }, []);

  const addBill = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await billAPI.create({
        ...form,
        amount: Number(form.amount),
        dueDate: new Date(form.dueDate)
      });
      setForm({ name: '', amount: '', dueDate: '', category: 'Utilities', repeat: 'monthly', notes: '' });
      load();
      toast.success('Bill reminder added');
    } catch (error) {
      toast.error(error?.error || 'Unable to add bill reminder');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await billAPI.markPaid(id);
      load();
      toast.success('Bill marked as paid');
    } catch (error) {
      toast.error(error?.error || 'Unable to update bill');
    }
  };

  const remove = async (id) => {
    try {
      await billAPI.delete(id);
      setBills((items) => items.filter((item) => item._id !== id));
      toast.success('Bill reminder deleted');
    } catch (error) {
      toast.error('Unable to delete bill reminder');
    }
  };

  const getDaysRemaining = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Bills & Reminders</h1>
        <p className="text-sm text-slate-500">Keep track of your recurring payments and upcoming bills.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Add Bill Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 h-fit shadow-sm">
          <h2 className="font-semibold text-slate-950 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" />
            Add Bill Reminder
          </h2>
          <form onSubmit={addBill} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bill Name</label>
              <input 
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
                placeholder="Electricity, Rent, Netflix" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount</label>
                <input 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
                  type="number" 
                  min="0"
                  placeholder="₹" 
                  value={form.amount} 
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                <input 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600" 
                  type="date" 
                  value={form.dueDate} 
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                <select 
                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm" 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Repeat</label>
                <select 
                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm" 
                  value={form.repeat} 
                  onChange={(e) => setForm({ ...form, repeat: e.target.value })}
                >
                  {repeats.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes (Optional)</label>
              <textarea 
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
                rows="2"
                placeholder="Add account details, bill no. etc." 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white rounded-md py-2 font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Plus size={16} /> Save Reminder
            </button>
          </form>
        </div>

        {/* Bill Reminders List */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Upcoming Bills
            </h2>
            <div className="space-y-3">
              {bills.filter(b => !b.isPaid).map((bill) => {
                const days = getDaysRemaining(bill.dueDate);
                const isOverdue = days < 0;
                return (
                  <div key={bill._id} className={`flex items-start justify-between p-3.5 border rounded-lg ${isOverdue ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">{bill.name}</p>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {bill.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Due: {new Date(bill.dueDate).toLocaleDateString()} · Repeat: {bill.repeat}
                      </p>
                      {bill.notes && <p className="text-xs text-slate-400 mt-1.5 italic truncate">{bill.notes}</p>}
                    </div>
                    <div className="text-right ml-4 flex flex-col items-end">
                      <p className="font-bold text-slate-950">₹{bill.amount.toLocaleString('en-IN')}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {isOverdue ? (
                          <span className="text-red-600 text-xs font-semibold flex items-center gap-1">
                            <AlertCircle size={12} /> Overdue by {Math.abs(days)}d
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold">
                            {days === 0 ? 'Due today' : `${days}d left`}
                          </span>
                        )}
                        <button 
                          onClick={() => markAsPaid(bill._id)}
                          className="bg-blue-50 text-blue-600 p-1.5 rounded-full hover:bg-blue-100" 
                          title="Mark as paid"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => remove(bill._id)}
                          className="text-red-500 p-1.5 rounded-full hover:bg-red-50"
                          title="Delete reminder"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!bills.filter(b => !b.isPaid).length && (
                <p className="text-sm text-slate-500 text-center py-6">No upcoming bills! You are all caught up.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <Check size={18} className="text-emerald-600" />
              Paid Bills History
            </h2>
            <div className="space-y-2">
              {bills.filter(b => b.isPaid).map((bill) => (
                <div key={bill._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/10">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{bill.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paid on: {bill.paidDate ? new Date(bill.paidDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-semibold text-slate-500">₹{bill.amount.toLocaleString('en-IN')}</p>
                    <button 
                      onClick={() => remove(bill._id)}
                      className="text-red-500 p-1 rounded hover:bg-red-50"
                      title="Delete reminder"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!bills.filter(b => b.isPaid).length && (
                <p className="text-sm text-slate-500 text-center py-4">No payment history available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
