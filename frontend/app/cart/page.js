'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, shippingCost, taxAmount, total, itemCount, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>🛒</div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Looks like you haven&apos;t added anything yet</p>
      </div>
      <Link href="/products" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>Start Shopping →</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Shopping Cart <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({itemCount} items)</span></h1>
          <button onClick={clearCart} style={{ color: '#ffffff', background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}>Clear Cart</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => {
              const key = `${item._id}-${item.size}-${item.color}`;
              return (
                <div key={key} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <span style={{ fontSize: '2rem' }}>📦</span>}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/products/${item._id}`} style={{ fontWeight: 600, color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>{item.name}</Link>
                    {(item.size || item.color) && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {item.size && <span style={{ fontSize: '0.75rem', color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem', borderRadius: 6 }}>Size: {item.size}</span>}
                        {item.color && <span style={{ fontSize: '0.75rem', color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem', borderRadius: 6 }}>Color: {item.color}</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item._id, item.quantity - 1, item.size, item.color)} style={{ width: 34, height: 34, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, item.quantity + 1, item.size, item.color)} style={{ width: 34, height: 34, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>₹{item.price} × {item.quantity}</div>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => removeItem(item._id, item.size, item.color)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem', lineHeight: 1 }} title="Remove">✕</button>
                </div>
              );
            })}
            <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 0' }}>← Continue Shopping</Link>
          </div>

          {/* Summary */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.75rem', position: 'sticky', top: 90 }}>
            <h2 style={{ fontWeight: 700, color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {[
                ['Subtotal', `₹${subtotal.toLocaleString()}`],
                ['Shipping', shippingCost === 0 ? '🎉 Free' : `₹${shippingCost}`],
                ['Tax (18% GST)', `₹${taxAmount.toLocaleString()}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                  <span style={{ color: val.includes('Free') ? '#ffffff' : '#ffffff', fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>₹{total.toLocaleString()}</span>
            </div>
            {shippingCost > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#ffffff', textAlign: 'center' }}>
                Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
              </div>
            )}
            <button onClick={() => router.push('/checkout')} className="btn btn-primary" style={{ width: '100%', height: 52, fontSize: '1rem', marginBottom: '0.75rem' }}>
              Proceed to Checkout →
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
              {['💳', '🏦', '📱', '🔒'].map((i) => <span key={i} style={{ fontSize: '1.25rem' }}>{i}</span>)}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem' }}>Secure checkout powered by SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
