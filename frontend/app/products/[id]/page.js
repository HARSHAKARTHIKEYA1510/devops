'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

function StarRating({ rating, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} onClick={() => interactive && onRate && onRate(s)} onMouseEnter={() => interactive && setHover(s)} onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: interactive ? '1.5rem' : '1rem', color: s <= (interactive ? hover || rating : rating) ? '#ffffff' : 'rgba(255,255,255,0.15)', cursor: interactive ? 'pointer' : 'default', transition: 'color 0.15s' }}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await productsApi.getOne(id);
        setProduct(data.product);
        if (data.product?.category) {
          const rel = await productsApi.getAll({ category: data.product.category, limit: 4 });
          setRelated(rel.products?.filter((p) => p._id !== data.product._id).slice(0, 4) || []);
        }
      } catch { toast.error('Product not found'); }
      finally { setLoading(false); }
    };
    if (id) load();
  }, [id, toast]);

  if (loading) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #ffffff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <h2 style={{ color: '#fff' }}>Product Not Found</h2>
      <Link href="/products" className="btn btn-primary">Back to Products</Link>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [{ url: null }];
  const discount = product.discount || (product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    addItem(product, qty, selectedSize, selectedColor);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      await authApi.toggleWishlist(product._id);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { toast.error('Something went wrong'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      const data = await productsApi.addReview(product._id, reviewForm);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.message); }
    finally { setSubmittingReview(false); }
  };

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link> /
          <Link href="/products" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Products</Link> /
          <Link href={`/products?category=${product.category}`} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{product.category}</Link> /
          <span style={{ color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', aspectRatio: '1', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {images[selectedImg]?.url ? (
                <img src={images[selectedImg].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '5rem' }}>📦</span>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: `2px solid ${selectedImg === i ? '#ffffff' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: 0, transition: 'border-color 0.2s' }}>
                    {img.url ? <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>📦</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {product.brand && <span style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</span>}
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StarRating rating={product.rating} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
              <span style={{ color: product.stock > 0 ? '#ffffff' : '#ffffff', fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 6, background: product.stock > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)' }}>{product.stock > 0 ? `✓ In Stock (${product.stock})` : '✕ Out of Stock'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.25rem', fontWeight: 800, color: '#fff' }}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString()}</span>
                  <span style={{ background: 'linear-gradient(135deg,#ffffff,#ffffff)', padding: '0.2rem 0.6rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{discount}% OFF</span>
                </>
              )}
            </div>

            {product.shortDescription && <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '0.95rem' }}>{product.shortDescription}</p>}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Size: <span style={{ color: '#ffffff' }}>{selectedSize || 'Select size'}</span></div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{ padding: '0.5rem 1rem', borderRadius: 10, border: `2px solid ${selectedSize === s ? '#ffffff' : 'rgba(255,255,255,0.1)'}`, background: selectedSize === s ? 'rgba(255,255,255,0.2)' : 'transparent', color: selectedSize === s ? '#ffffff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Color: <span style={{ color: '#ffffff' }}>{selectedColor || 'Select color'}</span></div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)} style={{ padding: '0.5rem 0.875rem', borderRadius: 10, border: `2px solid ${selectedColor === c ? '#ffffff' : 'rgba(255,255,255,0.1)'}`, background: selectedColor === c ? 'rgba(255,255,255,0.2)' : 'transparent', color: selectedColor === c ? '#ffffff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty and CTA */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 44, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700, color: '#fff' }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: 40, height: 44, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary" style={{ flex: 1, minWidth: 160, height: 48, fontSize: '0.95rem' }}>
                🛒 Add to Cart
              </button>
              <button onClick={handleWishlist} style={{ width: 48, height: 48, borderRadius: 12, background: wishlisted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${wishlisted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: wishlisted ? '#ffffff' : 'rgba(255,255,255,0.6)' }}>
                {wishlisted ? '❤' : '♡'}
              </button>
            </div>

            {/* Shipping info */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>🚚</span>
              <div>
                <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>Free Shipping</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>On orders above ₹999. Estimated delivery in 3–5 business days.</div>
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {product.tags.map((t) => (
                  <span key={t} style={{ padding: '0.25rem 0.6rem', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 500 }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
            {['description', 'reviews', 'specifications'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#ffffff' : 'transparent'}`, color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s', marginBottom: -1 }}>
                {tab} {tab === 'reviews' && `(${product.numReviews})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, fontSize: '0.95rem', maxWidth: 800 }}>{product.description}</p>
          )}

          {activeTab === 'specifications' && (
            <div style={{ maxWidth: 600 }}>
              {[
                ['Category', product.category],
                ['Brand', product.brand],
                ['SKU', product.sku],
                ['Weight', product.weight ? `${product.weight} kg` : '—'],
                ['Available Sizes', product.sizes?.join(', ') || '—'],
                ['Available Colors', product.colors?.join(', ') || '—'],
              ].map(([key, val]) => val && (
                <div key={key} style={{ display: 'flex', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ width: 160, color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', flexShrink: 0 }}>{key}</span>
                  <span style={{ color: '#ffffff', fontSize: '0.875rem' }}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                {product.reviews?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {product.reviews.map((r) => (
                      <div key={r._id} style={{ padding: '1.25rem', background: '#0a0a0a', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#ffffff,#ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.85rem', flexShrink: 0 }}>{r.name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{r.name}</div>
                            <StarRating rating={r.rating} />
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.7 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>No reviews yet. Be the first to review!</p>
                )}
              </div>

              {/* Review Form */}
              {user && (
                <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>Write a Review</h3>
                  <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rating</label>
                      <StarRating rating={reviewForm.rating} interactive onRate={(r) => setReviewForm((p) => ({ ...p, rating: r }))} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Comment</label>
                      <textarea className="input" value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} placeholder="Share your experience..." rows={4} style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" disabled={submittingReview} className="btn btn-primary">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Related <span className="gradient-text">Products</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
