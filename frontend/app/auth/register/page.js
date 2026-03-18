'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      router.push('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['', '#f87171', '#fbbf24', '#4ade80'][strength];
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength];

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(108,71,255,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6c47ff,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚡</div>
            <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>ShopZen</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Create account</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Join ShopZen and start shopping today</p>
        </div>

        <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[['name', 'Full Name', 'John Doe', 'text'], ['phone', 'Phone', '+91 98765 43210', 'tel']].map(([field, label, ph, type]) => (
                <div key={field}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</label>
                  <input className="input" type={type} value={form[field]} onChange={update(field)} placeholder={ph} required={field === 'name'} />
                </div>
              ))}
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>Email *</label>
              <input className="input" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 500 }}>Password *</label>
                {form.password && <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>}
              </div>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min. 6 characters" required style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {form.password && (
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem' }}>
                  {[1, 2, 3].map((l) => <div key={l} style={{ flex: 1, height: 3, borderRadius: 2, background: l <= strength ? strengthColor : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />)}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>Confirm Password *</label>
              <input className="input" type="password" value={form.confirm} onChange={update('confirm')} placeholder="Re-enter password" required style={{ borderColor: form.confirm && form.confirm !== form.password ? 'rgba(239,68,68,0.5)' : undefined }} />
              {form.confirm && form.confirm !== form.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>Passwords do not match</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: 52, fontSize: '1rem', marginTop: '0.5rem' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite' }} />
                  Creating account...
                </div>
              ) : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>By signing up, you agree to our <a href="#" style={{ color: '#a78bfa' }}>Terms</a> and <a href="#" style={{ color: '#a78bfa' }}>Privacy Policy</a></p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
