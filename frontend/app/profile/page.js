'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', addressLine1: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
  const [saving, setSaving] = useState(false);

  if (!user) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ color: '#fff' }}>Please login to view profile</h2>
      <Link href="/auth/login" className="btn btn-primary">Login →</Link>
    </div>
  );

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateProfile(profileForm); }
    catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.addAddress(addressForm);
      toast.success('Address added!');
      setAddressForm({ fullName: '', phone: '', addressLine1: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'security', label: '🔒 Security', icon: '🔒' },
    { id: 'addresses', label: '📍 Addresses', icon: '📍' },
  ];

  const INPUT = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</label>
      <input className="input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.75rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{user.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>{user.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: user.role === 'admin' ? 'rgba(251,191,36,0.15)' : 'rgba(108,71,255,0.12)', color: user.role === 'admin' ? '#fbbf24' : '#a78bfa', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {user.role === 'admin' ? '⭐ ' : ''}  {user.role}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/orders" className="btn btn-outline" style={{ height: 40, padding: '0 1rem', fontSize: '0.8rem' }}>📦 Orders</Link>
            {user.role === 'admin' && <Link href="/admin" className="btn btn-primary" style={{ height: 40, padding: '0 1rem', fontSize: '0.8rem' }}>⚙️ Admin</Link>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', background: activeTab === tab.id ? 'rgba(108,71,255,0.15)' : 'transparent', border: 'none', borderLeft: `3px solid ${activeTab === tab.id ? '#6c47ff' : 'transparent'}`, color: activeTab === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left', transition: 'all 0.2s' }}>
                {tab.icon} {tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />
            <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left' }}>
              🚪 Logout
            </button>
          </div>

          {/* Content */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.75rem' }}>
            {activeTab === 'profile' && (
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Personal Information</h2>
                <INPUT label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>Email</label>
                  <input className="input" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <INPUT label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                <INPUT label="Avatar URL" value={profileForm.avatar} onChange={(e) => setProfileForm((p) => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ height: 48, alignSelf: 'flex-start', minWidth: 160 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Change Password</h2>
                <INPUT label="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} type="password" placeholder="Current password" />
                <INPUT label="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} type="password" placeholder="Min. 6 characters" />
                <INPUT label="Confirm New Password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} type="password" placeholder="Repeat new password" />
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ height: 48, alignSelf: 'flex-start', minWidth: 160 }}>{saving ? 'Saving...' : 'Update Password'}</button>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff' }}>Saved Addresses</h2>
                {user.addresses?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {user.addresses.map((addr) => (
                      <div key={addr._id} style={{ padding: '1.125rem', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{addr.fullName}</span>
                          {addr.isDefault && <span style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '0.15rem 0.5rem', borderRadius: 6, fontWeight: 600 }}>Default</span>}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.845rem', lineHeight: 1.6 }}>{addr.addressLine1}, {addr.city}, {addr.state} – {addr.postalCode}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>📞 {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No addresses saved yet.</p>}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.95rem' }}>Add New Address</h3>
                  <form onSubmit={addAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <INPUT label="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" />
                      <INPUT label="Phone" value={addressForm.phone} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                    </div>
                    <INPUT label="Address Line 1" value={addressForm.addressLine1} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))} placeholder="House no, Street" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <INPUT label="City" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                      <INPUT label="State" value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} placeholder="Maharashtra" />
                    </div>
                    <INPUT label="Postal Code" value={addressForm.postalCode} onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))} placeholder="400001" />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                      <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} style={{ accentColor: '#6c47ff' }} />
                      Set as default address
                    </label>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ height: 46, alignSelf: 'flex-start', minWidth: 140 }}>{saving ? 'Adding...' : '+ Add Address'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
