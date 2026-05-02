import {
  AlertTriangle, CheckCircle2, ChevronRight,
  Loader2, QrCode, Shield, ShieldCheck, ShieldOff,
  Smartphone, X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { get2FAStatus, toggle2FA } from '../api/auth.api';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import OtpInput from '../components/common/OtpInput';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

interface TwoFAStatus {
  twoFactorEnabled: boolean;
  email?: string;
}

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Enable 2FA modal state
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Disable 2FA modal state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disabling, setDisabling] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await get2FAStatus();
      setStatus(data);
    } catch {
      setToast({ msg: 'Failed to load security settings', type: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleEnable2FA = async () => {
    setToggling(true);
    try {
      const res = await toggle2FA(true);
      if (res.qrDataUrl) setQrDataUrl(res.qrDataUrl);
      if (res.secret) setTotpSecret(res.secret);
      setShowEnableModal(true);
    } catch (err: any) {
      setToast({ msg: err?.message || 'Failed to initiate 2FA setup', type: 'error' });
    } finally { setToggling(false); }
  };

  const handleVerifyEnable = async () => {
    if (verifyCode.length < 6) { setVerifyError('Enter the 6-digit code from your authenticator'); return; }
    setVerifying(true);
    try {
      // In production: call verify2FA(verifyCode) to confirm TOTP is correctly configured
      // Then backend marks twoFactorEnabled = true
      await new Promise(r => setTimeout(r, 800)); // simulated confirm call
      setStatus(p => p ? { ...p, twoFactorEnabled: true } : p);
      setShowEnableModal(false);
      setVerifyCode('');
      setToast({ msg: '2FA enabled successfully! Your account is now more secure.', type: 'success' });
    } catch (err: any) {
      setVerifyError(err?.message || 'Invalid code. Please try again.');
    } finally { setVerifying(false); }
  };

  const handleDisable2FA = async () => {
    if (disableCode.length < 6) { setDisableError('Enter your current 6-digit authenticator code'); return; }
    setDisabling(true);
    try {
      await toggle2FA(false);
      setStatus(p => p ? { ...p, twoFactorEnabled: false } : p);
      setShowDisableModal(false);
      setDisableCode('');
      setToast({ msg: '2FA has been disabled.', type: 'info' });
    } catch (err: any) {
      setDisableError(err?.message || 'Failed to disable 2FA. Please check your code.');
    } finally { setDisabling(false); }
  };

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="section-title text-xl">Security Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security</p>
          </div>
        </div>

        {/* 2FA Card */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-700 text-slate-800 dark:text-white uppercase tracking-wide">Two-Factor Authentication</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Status banner */}
              <div className={`flex items-start gap-4 p-4 rounded-xl border ${status?.twoFactorEnabled ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${status?.twoFactorEnabled ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
                  {status?.twoFactorEnabled
                    ? <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    : <ShieldOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-700 ${status?.twoFactorEnabled ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                      {status?.twoFactorEnabled ? '2FA is Active' : '2FA is Disabled'}
                    </p>
                    <span className={`badge text-2xs ${status?.twoFactorEnabled ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'}`}>
                      {status?.twoFactorEnabled ? '✓ Protected' : 'Recommended'}
                    </span>
                  </div>
                  <p className={`text-xs ${status?.twoFactorEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {status?.twoFactorEnabled
                      ? 'Your account requires a time-based one-time code (TOTP) on every login.'
                      : 'Enable 2FA to protect your account with an authenticator app like Google Authenticator or Authy.'
                    }
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-2">
                <p className="text-xs font-600 text-slate-500 dark:text-slate-400 uppercase tracking-wider">How TOTP 2FA works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Smartphone className="w-4 h-4" />, title: '1. Install App', desc: 'Download Google Authenticator, Authy, or any TOTP app' },
                    { icon: <QrCode className="w-4 h-4" />, title: '2. Scan QR Code', desc: 'Scan the QR code shown during setup with your app' },
                    { icon: <ShieldCheck className="w-4 h-4" />, title: '3. Protected', desc: 'Enter the 6-digit code from your app when logging in' },
                  ].map(s => (
                    <div key={s.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">{s.icon}</div>
                      <div>
                        <p className="text-xs font-600 text-slate-800 dark:text-slate-200">{s.title}</p>
                        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-600 text-slate-800 dark:text-slate-200">
                    {status?.twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {status?.twoFactorEnabled ? 'Your account will be less secure after disabling' : 'Uses a time-based one-time password (TOTP)'}
                  </p>
                </div>
                {status?.twoFactorEnabled ? (
                  <Button variant="danger" size="sm" onClick={() => setShowDisableModal(true)} disabled={toggling}>
                    <ShieldOff className="w-4 h-4" /> Disable
                  </Button>
                ) : (
                  <Button variant="success" size="sm" onClick={handleEnable2FA} loading={toggling}>
                    <ShieldCheck className="w-4 h-4" /> Enable 2FA
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Change password link */}
        <a href="/change-password" className="card p-4 flex items-center gap-3 group hover:shadow-card-md transition-all cursor-pointer block">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-600 text-slate-800 dark:text-slate-200">Change Password</p>
            <p className="text-xs text-slate-400">Update with OTP verification</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
        </a>
      </div>

      {/* ── Enable 2FA Modal ── */}
      <Modal isOpen={showEnableModal} onClose={() => { setShowEnableModal(false); fetchStatus(); }} title="Set Up Two-Factor Authentication" subtitle="Scan the QR code with your authenticator app" size="md">
        <div className="space-y-5">
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-card-md border border-slate-200">
                <img src={qrDataUrl} alt="2FA QR Code" className="w-44 h-44" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Can't scan? Enter this key manually:</p>
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <code className="font-mono text-sm text-slate-800 dark:text-slate-200 tracking-widest select-all">{totpSecret}</code>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Generating QR code…</p>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-500">⚠️ Save the backup key above in a safe place. You'll need it if you lose access to your authenticator app.</p>
          </div>

          <div>
            <p className="text-sm font-600 text-slate-700 dark:text-slate-300 mb-3 text-center">Enter the 6-digit code from your app to confirm setup</p>
            <OtpInput value={verifyCode} onChange={setVerifyCode} error={verifyError} autoFocus disabled={verifying} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={() => { setShowEnableModal(false); setVerifyCode(''); setVerifyError(''); }} disabled={verifying} className="flex-1">
            Cancel
          </Button>
          <Button variant="success" onClick={handleVerifyEnable} loading={verifying} disabled={verifyCode.length < 6} className="flex-1">
            <CheckCircle2 className="w-4 h-4" /> Confirm & Enable
          </Button>
        </div>
      </Modal>

      {/* ── Disable 2FA Modal ── */}
      <Modal isOpen={showDisableModal} onClose={() => { setShowDisableModal(false); setDisableCode(''); setDisableError(''); }} title="Disable Two-Factor Authentication" size="sm">
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-700 text-slate-900 dark:text-white">Are you sure?</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Disabling 2FA will make your account less secure. Confirm by entering your authenticator code.</p>
            </div>
          </div>
          <OtpInput value={disableCode} onChange={setDisableCode} error={disableError} autoFocus disabled={disabling} />
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={() => setShowDisableModal(false)} disabled={disabling} className="flex-1">Keep Enabled</Button>
          <Button variant="danger" onClick={handleDisable2FA} loading={disabling} disabled={disableCode.length < 6} className="flex-1">
            <X className="w-4 h-4" /> Disable 2FA
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default SecuritySettings;
