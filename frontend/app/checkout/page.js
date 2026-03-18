'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ordersApi, couponsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STEPS = ['Address', 'Payment', 'Review'];

const INPUT = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>{label}{required && ' *'}</label>
    <input className="input" type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />
  </div>
);

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, taxAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    fullName: defaultAddr?.fullName || user?.name || '',
    phone: defaultAddr?.phone || user?.phone || '',
    addressLine1: defaultAddr?.addressLine1 || '',
    addressLine2: defaultAddr?.addressLine2 || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    postalCode: defaultAddr?.postalCode || '',
    country: defaultAddr?.country || 'India',
  });
  const [payment, setPayment] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  if (!user) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 style={{ color: '#fff' }}>Please Login to Checkout</h2>
      <Link href="/auth/login?redirect=/checkout" className="btn btn-primary">Login →</Link>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '3rem' }}>🛒</div>
      <h2 style={{ color: '#fff' }}>Your cart is empty</h2>
      <Link href="/products" className="btn btn-primary">Shop Now →</Link>
    </div>
  );

  const updateAddress = (field) => (e) => setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const validateCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const data = await couponsApi.validate({ code: couponCode, cartTotal: subtotal });
      setCouponDiscount(data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! Saved ₹${data.discount}`);
    } catch (err) {
      toast.error(err.message);
      setCouponApplied(false);
      setCouponDiscount(0);
    } finally { setValidatingCoupon(false); }
  };

  const finalTotal = total - couponDiscount;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const data = await ordersApi.create({
        items: items.map((i) => ({ product: i._id, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: address,
        paymentMethod: payment,
        couponCode: couponApplied ? couponCode : undefined,
      });
      clearCart();
      toast.success(`Order ${data.order.orderNumber} placed successfully! 🎉`);
      router.push(`/orders/${data.order._id}?success=true`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  const addressComplete = address.fullName && address.phone && address.addressLine1 && address.city && address.state && address.postalCode;

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>Checkout</h1>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', gap: '0' }}>
          {STEPS.map((s, i) => (
            <>
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', background: i <= step ? 'linear-gradient(135deg,#6c47ff,#a855f7)' : 'rgba(255,255,255,0.06)', color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)', border: i === step ? '2px solid rgba(108,71,255,0.5)' : '1px solid transparent', transition: 'all 0.3s' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: i <= step ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div key={`line-${i}`} style={{ flex: 1, height: 2, background: i < step ? '#6c47ff' : 'rgba(255,255,255,0.06)', marginBottom: 18, mx: 8, transition: 'background 0.3s' }} />}
            </>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* STEP 0: Address */}
            {step === 0 && (
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem', marginBottom: '0.25rem' }}>📍 Shipping Address</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <INPUT label="Full Name" value={address.fullName} onChange={updateAddress('fullName')} placeholder="John Doe" required />
                  <INPUT label="Phone" value={address.phone} onChange={updateAddress('phone')} placeholder="+91 98765 43210" required />
                </div>
                <INPUT label="Address Line 1" value={address.addressLine1} onChange={updateAddress('addressLine1')} placeholder="House no, Street" required />
                <INPUT label="Address Line 2" value={address.addressLine2} onChange={updateAddress('addressLine2')} placeholder="Landmark (optional)" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <INPUT label="City" value={address.city} onChange={updateAddress('city')} placeholder="Mumbai" required />
                  <INPUT label="State" value={address.state} onChange={updateAddress('state')} placeholder="Maharashtra" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <INPUT label="Postal Code" value={address.postalCode} onChange={updateAddress('postalCode')} placeholder="400001" required />
                  <INPUT label="Country" value={address.country} onChange={updateAddress('country')} placeholder="India" required />
                </div>
                <button onClick={() => { if (!addressComplete) { toast.error('Please fill all required fields'); return; } setStep(1); }} className="btn btn-primary" style={{ marginTop: '0.5rem', height: 48 }}>Continue to Payment →</button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>💳 Payment Method</h2>
                {[
                  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                  { id: 'upi', label: 'UPI', icon: '📱' },
                  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                ].map((m) => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.125rem', borderRadius: 14, background: payment === m.id ? 'rgba(108,71,255,0.12)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${payment === m.id ? 'rgba(108,71,255,0.5)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} style={{ accentColor: '#6c47ff' }} />
                    <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                    <span style={{ fontWeight: 600, color: payment === m.id ? '#a78bfa' : '#e8e8f0', fontSize: '0.9rem' }}>{m.label}</span>
                    {payment === m.id && m.id !== 'cod' && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.75rem' }}>✓ Selected</span>}
                  </label>
                ))}
                {payment === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem', background: 'rgba(108,71,255,0.05)', borderRadius: 12 }}>
                    <INPUT label="Cardholder Name" value={cardDetails.name} onChange={(e) => setCardDetails((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                    <INPUT label="Card Number" value={cardDetails.number} onChange={(e) => setCardDetails((p) => ({ ...p, number: e.target.value }))} placeholder="1234 5678 9012 3456" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <INPUT label="Expiry" value={cardDetails.expiry} onChange={(e) => setCardDetails((p) => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY" />
                      <INPUT label="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails((p) => ({ ...p, cvv: e.target.value }))} placeholder="123" type="password" />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setStep(0)} className="btn btn-outline" style={{ flex: 1, height: 48 }}>← Back</button>
                  <button onClick={() => setStep(2)} className="btn btn-primary" style={{ flex: 2, height: 48 }}>Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>📍 Shipping To</h3>
                    <button onClick={() => setStep(0)} style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.7 }}>{address.fullName}<br />{address.addressLine1}, {address.addressLine2}<br />{address.city}, {address.state} – {address.postalCode}<br />{address.phone}</p>
                </div>

                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>💳 Payment</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textTransform: 'capitalize' }}>{payment === 'cod' ? '💵 Cash on Delivery' : payment === 'card' ? '💳 Card ending ' + (cardDetails.number.slice(-4) || '****') : payment.toUpperCase()}</p>
                </div>

                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>🎟 Coupon</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="input" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" style={{ flex: 1 }} disabled={couponApplied} />
                    {couponApplied ? (
                      <button onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(''); }} style={{ padding: '0 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Remove</button>
                    ) : (
                      <button onClick={validateCoupon} disabled={validatingCoupon} style={{ padding: '0 1.25rem', borderRadius: 10, background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.3)', color: '#a78bfa', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponApplied && <p style={{ color: '#4ade80', fontSize: '0.8rem' }}>✓ Coupon applied! You saved ₹{couponDiscount}</p>}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, height: 52 }}>← Back</button>
                  <button onClick={placeOrder} disabled={placing} className="btn btn-primary" style={{ flex: 2, height: 52, fontSize: '1rem' }}>
                    {placing ? '⏳ Placing Order...' : '✓ Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.75rem', position: 'sticky', top: 90 }}>
            <h2 style={{ fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: 240, overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={`${item._id}${item.size}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.03)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.images?.[0]?.url ? <img src={item.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', color: '#e8e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem', flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                ['Subtotal', `₹${subtotal.toLocaleString()}`],
                ['Shipping', shippingCost === 0 ? 'Free' : `₹${shippingCost}`],
                ['Tax (18%)', `₹${taxAmount.toLocaleString()}`],
                ...(couponDiscount > 0 ? [['Coupon Discount', `-₹${couponDiscount}`]] : []),
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
                  <span style={{ color: l.includes('Discount') ? '#4ade80' : '#e8e8f0' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
