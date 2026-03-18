'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ordersApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const loadStats = async () => {
      try {
        const data = await ordersApi.getStats();
        setStats(data.stats);
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user, authLoading, router]);

  if (authLoading || loading) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(108,71,255,0.3)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh', background: '#0a0a0f' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/" className="btn btn-outline" style={{ height: 40, fontSize: '0.875rem' }}>View Site</Link>
          </div>
        </div>

        {/* Top Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: '💰', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
            { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
            { label: 'Avg. Order Value', value: stats?.totalOrders ? `₹${Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString()}` : '₹0', icon: '📈', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          ].map((c) => (
            <div key={c.label} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: '0.2rem' }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Recent Orders */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Recent Orders</h2>
              <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View All</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th>
                    <th style={{ textAlign: 'left', padding: '1rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '1rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '1rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '1rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '1rem 0', color: '#e8e8f0', fontSize: '0.875rem', fontWeight: 500 }}>#{o.orderNumber}</td>
                      <td style={{ padding: '1rem 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{o.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '1rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 0', color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>₹{o.total.toLocaleString()}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(108,71,255,0.1)', color: '#a78bfa' }}>
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!stats?.recentOrders?.length && (
                    <tr><td colSpan="5" style={{ padding: '2rem 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No recent orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
