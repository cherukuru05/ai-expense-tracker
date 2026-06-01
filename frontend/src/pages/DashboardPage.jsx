import { useEffect, useState } from 'react';
import { IndianRupee, Receipt, TrendingUp, WalletCards } from 'lucide-react';
import { analyticsAPI, aiAPI } from '../services/api';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    analyticsAPI.getOverview().then(setOverview).catch(() => setOverview({}));
    aiAPI.predict().then(setPrediction).catch(() => setPrediction(null));
  }, []);

  const cards = [
    { label: 'Spent this month', value: money(overview?.totalSpent), icon: IndianRupee },
    { label: 'Transactions', value: overview?.transactionCount || 0, icon: Receipt },
    { label: 'Month-end prediction', value: money(prediction?.prediction), icon: TrendingUp },
    { label: 'Monthly change', value: `${overview?.changePercent || 0}%`, icon: WalletCards },
  ];

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="text-sm text-slate-500">A quick read on this month&apos;s money movement.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <Icon size={18} className="text-blue-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-950 mt-3">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 mt-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-950 mb-4">Category spend</h2>
          <div className="space-y-3">
            {(overview?.byCategory || []).map((item) => (
              <div key={item._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item._id}</span>
                  <span className="font-medium">{money(item.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${Math.min((item.total / Math.max(overview.totalSpent, 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
            {!overview?.byCategory?.length && <p className="text-sm text-slate-500">No expenses recorded yet.</p>}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-950 mb-4">Daily spending</h2>
          <div className="flex items-end gap-2 h-48">
            {(overview?.dailySpending || []).map((day) => (
              <div key={day._id} className="flex-1 min-w-2 bg-emerald-500 rounded-t" title={`Day ${day._id}: ${money(day.total)}`} style={{ height: `${Math.max((day.total / Math.max(overview.totalSpent, 1)) * 100, 5)}%` }} />
            ))}
          </div>
          {!overview?.dailySpending?.length && <p className="text-sm text-slate-500">Add expenses to see daily trends.</p>}
        </div>
      </div>
    </section>
  );
}
