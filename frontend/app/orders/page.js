'use client';
import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const STATUS_CONFIG = {
  placed: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '📋' },
  confirmed: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '✅' },
  processing: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '⚙️' },
  shipped: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '🚚' },
  delivered: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '📦' },
  cancelled: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '✕' },
  returned: { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', icon: '↩️' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await ordersApi.getMyOrders({ status: filter });
        setOrders(data.orders || []);
      } catch { toast.error('Failed to load orders'); }
      finally { setLoading(false); }
    };
    load();
  }, [user, filter, toast]);

  if (!user) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ color: '#fff' }}>Please login to view orders</h2>
      <Link href="/auth/login" className="btn btn-primary">Login →</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>My Orders</h1>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => {
            const config = s ? STATUS_CONFIG[s] : null;
            return (
              <button key={s || 'all'} onClick={() => setFilter(s)} style={{ padding: '0.4rem 1rem', borderRadius: 999, background: filter === s ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === s ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.07)'}`, color: filter === s ? '#ffffff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {config?.icon} {s || 'All Orders'}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>No orders found</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Start shopping to see your orders here</p>
            <Link href="/products" className="btn btn-primary">Shop Now →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => {
              const sc = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
              return (
                <Link key={order._id} href={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>#{order.orderNumber}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: 999, background: sc.bg, color: sc.color, fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>{sc.icon} {order.orderStatus}</span>
                        <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={`${item._id}`} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.5rem 0.75rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name} × {item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>+{order.items.length - 3} more</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
