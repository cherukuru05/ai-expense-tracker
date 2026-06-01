import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Download, TrendingUp, DollarSign, Wallet, ArrowDownRight } from 'lucide-react';
import { reportAPI } from '../services/api';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ReportsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
    years.push(y);
  }

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportAPI.getMonthly({ month: selectedMonth, year: selectedYear });
      setReport(data.report);
    } catch (error) {
      toast.error(error?.error || 'Unable to fetch report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedMonth, selectedYear]);

  const downloadPDFReport = async () => {
    setPdfLoading(true);
    try {
      const blobData = await reportAPI.downloadPDF({ month: selectedMonth, year: selectedYear });
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinTrack-Report-${months[selectedMonth - 1]}-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report PDF downloaded!');
    } catch (error) {
      toast.error('Failed to download report PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Financial Reports</h1>
          <p className="text-sm text-slate-500">Analyze your spending, savings, and download monthly statements.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select 
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
          </select>
          <select 
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Generating report data...
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Action Row */}
          <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
            <div>
              <p className="font-semibold text-slate-900">{months[selectedMonth - 1]} {selectedYear} Report</p>
              <p className="text-xs text-slate-500">Ready to export to PDF</p>
            </div>
            <button 
              onClick={downloadPDFReport}
              disabled={pdfLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-60"
            >
              <Download size={16} />
              {pdfLoading ? 'Exporting...' : 'Download PDF Statement'}
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-500 text-sm">
                <span>Total Spent</span>
                <ArrowDownRight size={18} className="text-red-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{money(report.totalSpent)}</p>
              <p className="text-xs text-slate-400 mt-1">Out of {money(report.totalBudget)} budgeted</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-500 text-sm">
                <span>Savings</span>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{money(report.savings)}</p>
              <p className="text-xs text-slate-400 mt-1">Net surplus this month</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-500 text-sm">
                <span>Savings Rate</span>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{report.savingsRate}%</p>
              <p className="text-xs text-slate-400 mt-1">Income saved percentage</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-500 text-sm">
                <span>Transactions</span>
                <FileText size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{report.transactions}</p>
              <p className="text-xs text-slate-400 mt-1">Transactions recorded</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Spend */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950 mb-4">Spend by Category</h2>
              <div className="space-y-4">
                {Object.entries(report.byCategory || {}).map(([cat, amount]) => {
                  const pct = report.totalSpent > 0 ? (amount / report.totalSpent) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1 text-slate-700">
                        <span className="font-medium">{cat}</span>
                        <span>{money(amount)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
                {!Object.keys(report.byCategory || {}).length && (
                  <p className="text-sm text-slate-500 text-center py-6">No expenses found for this month.</p>
                )}
              </div>
            </div>

            {/* Top Transactions */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950 mb-4">Recent Transactions</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {(report.expenses || []).slice(0, 10).map((expense) => (
                  <div key={expense._id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{expense.description}</p>
                      <p className="text-xs text-slate-500">{expense.category} · {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm">₹{expense.amount.toLocaleString('en-IN')}</p>
                  </div>
                ))}
                {!(report.expenses || []).length && (
                  <p className="text-sm text-slate-500 text-center py-6">No expenses logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
          <p className="text-slate-500">No report available for this period.</p>
        </div>
      )}
    </section>
  );
}
