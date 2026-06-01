import { useEffect, useState } from 'react';
import { analyticsAPI, aiAPI } from '../services/api';

export default function AnalyticsPage() {
  const [trend, setTrend] = useState([]);
  const [insights, setInsights] = useState([]);
  const [budgetSuggestions, setBudgetSuggestions] = useState([]);

  useEffect(() => {
    analyticsAPI.getTrend().then((data) => setTrend(data.trend || [])).catch(() => setTrend([]));
    analyticsAPI.getInsights().then((data) => setInsights(data.insights || [])).catch(() => setInsights([]));
    aiAPI.getBudgetSuggestions().then((data) => setBudgetSuggestions(data.suggestions || [])).catch(() => setBudgetSuggestions([]));
  }, []);

  const max = Math.max(...trend.map((item) => item.total), 1);

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Analytics</h1>
      <div className="grid gap-5 lg:grid-cols-3 mt-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold mb-4">Six month trend</h2>
          <div className="flex items-end gap-3 h-64">
            {trend.map((item) => (
              <div key={`${item.month}-${item.year}`} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-blue-600 rounded-t" style={{ height: `${Math.max((item.total / max) * 100, 4)}%` }} />
                <span className="text-xs text-slate-500">{item.month}/{String(item.year).slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold mb-4">AI insights</h2>
          <div className="space-y-3">
            {insights.map((item, index) => (
              <div key={`${item.message}-${index}`} className="border border-slate-200 rounded-md p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.type}{item.category ? ` · ${item.category}` : ''}</p>
                <p className="text-sm text-slate-700 mt-1">{item.message}</p>
              </div>
            ))}
            {!insights.length && <p className="text-sm text-slate-500">Insights appear once you have recent expenses.</p>}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold mb-4">Budget suggestions</h2>
          <div className="space-y-3">
            {budgetSuggestions.map((item) => (
              <div key={item.category} className="border border-slate-200 rounded-md p-3">
                <p className="text-sm text-slate-700 font-semibold">{item.category}</p>
                <p className="text-sm text-slate-500">Suggested: ₹{item.suggested.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-400">{item.based_on}</p>
              </div>
            ))}
            {!budgetSuggestions.length && <p className="text-sm text-slate-500">Budget suggestions appear after tracking expenses for a few weeks.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
