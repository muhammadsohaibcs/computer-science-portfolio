import {
  ArrowLeft, CheckCircle2, Eye, EyeOff,
  Key, Lock, Mail, RefreshCw, Shield, ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { changePassword, requestPasswordChangeOtp } from '../api/auth.api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import OtpInput from '../components/common/OtpInput';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

type Step = 'request' | 'verify' | 'done';

const ChangePassword: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('request');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [sentTo, setSentTo] = useState('');

  const startCountdown = (secs = 60) => {
    setCountdown(secs);
    const t = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const handleRequestOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await requestPasswordChangeOtp();
      const email = user?.email || 'your registered email';
      setSentTo(email);
      setToast({ msg: res.message || `OTP sent to ${email}`, type: 'info' });
      setStep('verify');
      startCountdown(60);
    } catch (err: any) {
      setToast({ msg: err?.message || 'Failed to send OTP. Please try again.', type: 'error' });
    } finally { setOtpLoading(false); }
  };

  const passwordStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!otp || otp.length < 6) e.otp = 'Enter the 6-digit OTP';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword, otp });
      setStep('done');
      setToast({ msg: 'Password changed successfully!', type: 'success' });
    } catch (err: any) {
      const msg = err?.message || 'Failed to change password';
      if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('code')) {
        setErrors({ otp: 'Invalid or expired OTP. Please request a new one.' });
      } else if (msg.toLowerCase().includes('current') || msg.toLowerCase().includes('wrong')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        setToast({ msg, type: 'error' });
      }
    } finally { setSubmitLoading(false); }
  };

  const reset = () => {
    setStep('request'); setOtp(''); setErrors({});
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const s = passwordStrength(form.newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][s];
  const strengthBg = ['', 'bg-red-500', 'bg-amber-500', 'bg-brand-500', 'bg-emerald-500'][s];

  return (
    <Layout>
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-md mx-auto space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="section-title text-xl">Change Password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Secured with OTP email verification</p>
          </div>
        </div>

        {/* Step tracker */}
        <div className="flex items-center gap-0">
          {[
            { label: 'Verify Identity', num: 1 },
            { label: 'Enter OTP', num: 2 },
            { label: 'Done', num: 3 },
          ].map((item, idx) => {
            const active = (step === 'request' && idx === 0) || (step === 'verify' && idx === 1) || (step === 'done' && idx === 2);
            const done = (step === 'verify' && idx === 0) || (step === 'done' && idx <= 1);
            return (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : item.num}
                  </div>
                  <span className={`text-2xs font-600 whitespace-nowrap ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>{item.label}</span>
                </div>
                {idx < 2 && <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: Request OTP ── */}
        {step === 'request' && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900">
              <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-600 text-brand-800 dark:text-brand-300">OTP Verification Required</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
                  A 6-digit code will be emailed to <strong>{user?.email || 'your registered email'}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password" name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={e => { setForm(p => ({ ...p, currentPassword: e.target.value })); if (errors.currentPassword) setErrors(p => { const n = { ...p }; delete n.currentPassword; return n; }); }}
                  required error={errors.currentPassword}
                  autoComplete="current-password"
                  suffix={
                    <button type="button" onClick={() => setShowCurrent(p => !p)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <div>
                <Input
                  label="New Password" name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={e => { setForm(p => ({ ...p, newPassword: e.target.value })); if (errors.newPassword) setErrors(p => { const n = { ...p }; delete n.newPassword; return n; }); }}
                  required error={errors.newPassword}
                  hint="Minimum 8 characters"
                  autoComplete="new-password"
                  suffix={
                    <button type="button" onClick={() => setShowNew(p => !p)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {form.newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= s ? strengthBg : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-500 ${s === 1 ? 'text-red-500' : s === 2 ? 'text-amber-500' : s === 3 ? 'text-brand-500' : 'text-emerald-500'}`}>
                      {strengthLabel} password
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); if (errors.confirmPassword) setErrors(p => { const n = { ...p }; delete n.confirmPassword; return n; }); }}
                required error={errors.confirmPassword}
                autoComplete="new-password"
                suffix={
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button variant="primary" fullWidth loading={otpLoading} onClick={handleRequestOtp}>
              <Mail className="w-4 h-4" /> Send OTP to My Email
            </Button>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-500 mb-2">Password requirements:</p>
              <ul className="space-y-1">
                {[
                  { rule: 'At least 8 characters', pass: form.newPassword.length >= 8 },
                  { rule: 'One uppercase letter', pass: /[A-Z]/.test(form.newPassword) },
                  { rule: 'One number', pass: /[0-9]/.test(form.newPassword) },
                  { rule: 'One special character', pass: /[^A-Za-z0-9]/.test(form.newPassword) },
                ].map(({ rule, pass }) => (
                  <li key={rule} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${form.newPassword ? (pass ? 'bg-emerald-500' : 'bg-red-400') : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className={form.newPassword ? (pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400') : 'text-slate-400'}>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── STEP 2: Enter OTP + Submit ── */}
        {step === 'verify' && (
          <form onSubmit={handleSubmit} className="card p-6 space-y-6 animate-slide-up">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-base font-700 text-slate-900 dark:text-white">Check your email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                We sent a 6-digit code to<br />
                <strong className="text-slate-700 dark:text-slate-300">{sentTo || user?.email}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-1.5">The code expires in 10 minutes.</p>
            </div>

            <OtpInput
              value={otp}
              onChange={setOtp}
              error={errors.otp}
              autoFocus
              disabled={submitLoading}
            />

            {errors.currentPassword && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-sm text-red-700 dark:text-red-300">{errors.currentPassword}</p>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={submitLoading} disabled={otp.length < 6}>
              <Lock className="w-4 h-4" /> Verify & Change Password
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button" onClick={() => setStep('request')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Go back
              </button>
              <button
                type="button" onClick={handleRequestOtp}
                disabled={countdown > 0 || otpLoading}
                className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${otpLoading ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 'done' && (
          <div className="card p-8 text-center animate-slide-up space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-700 text-slate-900 dark:text-white">Password Changed!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your password has been updated successfully. All other sessions have been logged out for security.
            </p>
            <Button variant="primary" onClick={reset} className="mx-auto">
              <Shield className="w-4 h-4" /> Change Again
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChangePassword;
