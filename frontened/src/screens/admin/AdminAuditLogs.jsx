import { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { getAuditLogs } from '../../utils/adminApi';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      const res = await getAuditLogs({ limit: 50 });
      const list = res?.logs || res?.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const severityColors = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Security & Operation Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all administrative actions, KYC decisions, user status changes, and cancellations.
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchLogs(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-500' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-mono">Retrieving security audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No audit records currently available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Resource Description</th>
                  <th className="px-6 py-3.5">Admin ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          severityColors[log.severity] || severityColors.info
                        }`}
                      >
                        {log.severity || 'info'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-300 font-sans text-xs">
                      {log.resource?.description || log.resource?.type || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 text-[11px]">
                      {log.admin?._id || log.admin || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
