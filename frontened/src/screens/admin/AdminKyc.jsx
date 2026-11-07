import { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  ShieldAlert,
  CreditCard,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { listPendingKycs, approveKyc, rejectKyc } from '../../utils/adminApi';

export default function AdminKyc() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchKycs = useCallback(async () => {
    try {
      setError(null);
      const query = {};
      if (statusFilter) query.status = statusFilter;
      const res = await listPendingKycs(query);
      const list = res?.kycs || res?.data || [];
      setKycs(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchKycs();
  }, [fetchKycs]);

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this helper for live marketplace work?')) return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg('');
    try {
      await approveKyc(userId);
      setSuccessMsg('Helper KYC verified successfully!');
      setSelectedKyc(null);
      fetchKycs();
    } catch (err) {
      setError(err?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting this KYC.');
      return;
    }
    const userId = selectedKyc?.userId?._id || selectedKyc?.userId;
    setActionLoading(true);
    setError(null);
    setSuccessMsg('');
    try {
      await rejectKyc(userId, rejectReason.trim());
      setSuccessMsg('KYC rejected with note sent to helper.');
      setShowRejectModal(false);
      setSelectedKyc(null);
      setRejectReason('');
      fetchKycs();
    } catch (err) {
      setError(err?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">KYC Verification Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review government IDs, bank accounts, and photo submissions before helpers take live customer jobs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="submitted">Awaiting Review (Submitted)</option>
            <option value="verified">Approved & Verified</option>
            <option value="rejected">Rejected Submissions</option>
          </select>
          <button
            onClick={() => { setRefreshing(true); fetchKycs(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-500' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Submissions Table ──────────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-mono">Loading KYC queue...</p>
          </div>
        ) : kycs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No KYC records currently in '{statusFilter}' status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Helper</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Skills</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted At</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {kycs.map((item) => {
                  const u = item.userId || {};
                  return (
                    <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{u.name || 'Helper Account'}</div>
                        <div className="text-[11px] font-mono text-slate-500">ID: {item._id?.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-300">{u.phone || '—'}</div>
                        <div className="text-slate-500 text-[11px]">{u.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.skills?.length > 0 ? (
                            item.skills.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600">None listed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            item.kycStatus === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : item.kycStatus === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {item.kycStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedKyc(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        {item.kycStatus !== 'verified' && (
                          <button
                            onClick={() => handleApprove(u._id || item.userId)}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inspection Modal / Drawer ─────────────────────────── */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white font-display">Helper Verification Dossier</h2>
              <button
                onClick={() => setSelectedKyc(null)}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Personal Details</div>
                <div className="text-white font-semibold text-sm">{selectedKyc.userId?.name || 'Helper'}</div>
                <div className="text-slate-400">{selectedKyc.userId?.email} • {selectedKyc.userId?.phone}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Service Profile</div>
                <div className="text-slate-300">
                  <span className="font-semibold text-white">Service Area: </span>
                  {selectedKyc.area || 'Bangalore Urban'} (Radius: {selectedKyc.radiusKm || 5} km)
                </div>
                <div className="text-slate-300 mt-1">
                  <span className="font-semibold text-white">Declared Skills: </span>
                  {selectedKyc.skills?.join(', ') || 'General Tasks'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Status Summary</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-semibold">Current State:</span>
                  <span className="font-mono text-amber-400 uppercase">{selectedKyc.kycStatus}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
              >
                Reject / Request Re-upload
              </button>
              {selectedKyc.kycStatus !== 'verified' && (
                <button
                  onClick={() => handleApprove(selectedKyc.userId?._id || selectedKyc.userId)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Verify & Activate Helper
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Modal ────────────────────────────────────── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Provide Rejection Reason</h3>
            <p className="text-xs text-slate-400">
              This note will be shown to the helper so they can correct documents and resubmit.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Aadhaar image is blurry, name does not match bank account..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
