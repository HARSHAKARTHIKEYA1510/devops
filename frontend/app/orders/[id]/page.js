'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  placed: { color: '#a78bfa', icon: '📋', label: 'Order Placed' },
  confirmed: { color: '#60a5fa', icon: '✅', label: 'Confirmed' },
  processing: { color: '#fbbf24', icon: '⚙️', label: 'Processing' },
  shipped: { color: '#34d399', icon: '🚚', label: 'Shipped' },
  delivered: { color: '#4ade80', icon: '📦', label: 'Delivered' },
  cancelled: { color: '#f87171', icon: '✕', label: 'Cancelled' },
  returned: { color: '#fb923c', icon: '↩️', label: 'Returned' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ordersApi.getOne(id);
        setOrder(data.order);
      } catch { toast.error('Order not found'); }
      finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const data = await ordersApi.cancel(id, { reason: 'Customer request' });
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) { toast.error(err.message); }
    finally { setCancelling(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(108,71,255,0.3)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
    </div>
  );

  if (!order) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <h2 style={{ color: '#fff' }}>Order Not Found</h2>
      <Link href="/orders" className="btn btn-primary">My Orders</Link>
    </div>
  );

  const sc = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
  const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = ['cancelled', 'returned'].includes(order.orderStatus);

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Success Banner */}
        {isSuccess && (
          <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🎉</div>
            <div>
              <div style={{ fontWeight: 700, color: '#4ade80', marginBottom: '0.25rem' }}>Order Placed Successfully!</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Thank you for your order. You'll receive a confirmation email shortly.</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>#{order.orderNumber}</h1>
              <span style={{ padding: '0.3rem 0.8rem', borderRadius: 999, background: `${sc.color}15`, color: sc.color, fontWeight: 600, fontSize: '0.8rem' }}>{sc.icon} {sc.label}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          {['placed', 'confirmed'].includes(order.orderStatus) && (
            <button onClick={handleCancel} disabled={cancelling} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Order Tracking</h2>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 18, left: '10%', right: '10%', height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: 18, left: '10%', height: 2, width: `${Math.max(0, stepIdx) * (80 / (STATUS_STEPS.length - 1))}%`, background: 'linear-gradient(90deg,#6c47ff,#a855f7)', transition: 'width 0.5s ease', zIndex: 1 }} />
              {STATUS_STEPS.map((status, i) => {
                const cfg = STATUS_CONFIG[status];
                const done = i <= stepIdx;
                return (
                  <div key={status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? 'linear-gradient(135deg,#6c47ff,#a855f7)' : '#13131a', border: `2px solid ${done ? '#6c47ff' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'all 0.3s' }}>{done ? (i === stepIdx ? cfg.icon : '✓') : cfg.icon}</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: done ? 600 : 400, color: done ? '#a78bfa' : 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
            {order.trackingNumber && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>Tracking #: <span style={{ color: '#a78bfa', fontWeight: 600 }}>{order.trackingNumber}</span></p>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Items */}
          <div>
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.5rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>📦 Order Items ({order.items.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>📦</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#e8e8f0', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{item.name}</div>
                      {(item.size || item.color) && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.2rem' }}>{[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}</div>}
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>₹{item.price.toLocaleString()} × {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.875rem' }}>📍 Delivery Address</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.8 }}>
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}<br />
                📞 {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>💰 Payment Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                ['Subtotal', `₹${order.subtotal.toLocaleString()}`],
                ['Shipping', order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`],
                ['Tax (18%)', `₹${order.taxAmount.toLocaleString()}`],
                ...(order.discount > 0 ? [['Discount', `-₹${order.discount}`]] : []),
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
                  <span style={{ color: l === 'Discount' ? '#4ade80' : '#e8e8f0' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                ['Payment Method', order.paymentMethod?.toUpperCase() || '—'],
                ['Payment Status', order.paymentStatus || '—'],
                ...(order.couponCode ? [['Coupon Used', order.couponCode]] : []),
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                  <span style={{ color: '#e8e8f0', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/products" className="btn btn-primary" style={{ height: 46, fontSize: '0.9rem', textAlign: 'center' }}>Continue Shopping</Link>
              <Link href="/orders" className="btn btn-outline" style={{ height: 44, fontSize: '0.875rem', textAlign: 'center' }}>All Orders</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
