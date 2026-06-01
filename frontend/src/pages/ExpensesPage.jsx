import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { expenseAPI, aiAPI } from '../services/api';

const categories = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Education', 'Travel', 'Other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: 'Other', paymentMode: 'UPI' });
  const [suggestedCategory, setSuggestedCategory] = useState('');

  const load = () => expenseAPI.getAll().then((data) => setExpenses(data.expenses || []));

  useEffect(() => { load().catch(() => toast.error('Unable to load expenses')); }, []);

  const addExpense = async (event) => {
    event.preventDefault();
    try {
      await expenseAPI.create({ ...form, amount: Number(form.amount) });
      setForm({ description: '', amount: '', category: 'Other', paymentMode: 'UPI' });
      setSuggestedCategory('');
      await load();
      toast.success('Expense added');
    } catch (error) {
      toast.error(error?.error || 'Unable to add expense');
    }
  };

  const suggestCategory = async () => {
    if (!form.description.trim()) {
      toast.error('Enter a description first');
      return;
    }

    try {
      const response = await aiAPI.categorize({ description: form.description, amount: Number(form.amount || 0) });
      setSuggestedCategory(response.category || 'Other');
    } catch (err) {
      setSuggestedCategory('');
      toast.error('Unable to fetch category suggestion');
    }
  };

  const remove = async (id) => {
    await expenseAPI.delete(id);
    setExpenses((items) => items.filter((item) => item._id !== id));
  };

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Expenses</h1>
      <form onSubmit={addExpense} className="bg-white border border-slate-200 rounded-lg p-4 mt-5 grid gap-3 md:grid-cols-6">
        <input className="border border-slate-300 rounded-md px-3 py-2 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); setSuggestedCategory(''); }} required />
        <input className="border border-slate-300 rounded-md px-3 py-2" type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <select className="border border-slate-300 rounded-md px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <button type="button" onClick={suggestCategory} className="bg-slate-100 text-slate-700 rounded-md px-3 py-2 hover:bg-slate-200">Suggest</button>
        <button className="bg-blue-600 text-white rounded-md px-4 py-2 flex items-center justify-center gap-2"><Plus size={16} /> Add</button>
        {suggestedCategory && suggestedCategory !== form.category && (
          <div className="md:col-span-6 text-sm text-slate-600">
            Suggested category: <strong>{suggestedCategory}</strong>{' '}
            <button type="button" onClick={() => setForm({ ...form, category: suggestedCategory })} className="text-blue-600 underline">Use suggestion</button>
          </div>
        )}
      </form>
      <div className="bg-white border border-slate-200 rounded-lg mt-5 overflow-hidden">
        {expenses.map((expense) => (
          <div key={expense._id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-medium text-slate-900">{expense.description}</p>
              <p className="text-sm text-slate-500">{expense.category} · {new Date(expense.date).toLocaleDateString()}</p>
            </div>
            <p className="font-semibold">₹{Number(expense.amount).toLocaleString('en-IN')}</p>
            <button onClick={() => remove(expense._id)} className="p-2 rounded-md text-red-600 hover:bg-red-50" aria-label="Delete expense"><Trash2 size={16} /></button>
          </div>
        ))}
        {!expenses.length && <p className="p-4 text-sm text-slate-500">No expenses yet.</p>}
      </div>
    </section>
  );
}
