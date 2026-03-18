'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? '#ffffff' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const discount = product.discount || (product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    setAddingToCart(true);
    addItem(product, 1);
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    try {
      await authApi.toggleWishlist(product._id);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const img = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="card" style={{ 
        position: 'relative', 
        cursor: 'pointer', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1/1', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'rgba(255,255,255,0.05)' }}>📦</div>
          )}

          {/* Badges - Floating style */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {discount > 0 && (
              <span style={{ background: '#fff', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: 4, letterSpacing: '0.02em', textTransform: 'uppercase' }}>-{discount}%</span>
            )}
            {product.stock === 0 ? (
                <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 4, textTransform: 'uppercase' }}>Sold Out</span>
              ) : product.stock <= 5 && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 4, textTransform: 'uppercase' }}>Low Stock</span>
            )}
            {product.isFeatured && (
              <span style={{ background: 'rgba(255,215,0,0.9)', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: 4, textTransform: 'uppercase' }}>Featured</span>
            )}
          </div>

          {/* Wishlist */}
          <button onClick={handleWishlist} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 2 }}>
            <span style={{ color: wishlisted ? '#ffffff' : 'rgba(255,255,255,0.8)', fontSize: '1.2rem', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
              {wishlisted ? '♥' : '♡'}
            </span>
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              {product.brand && (
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem' }}>{product.brand}</span>
              )}
              <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.name}
              </h3>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            {product.numReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <StarRating rating={product.rating} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>({product.numReviews})</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginBottom: '-0.1rem' }}>₹{product.originalPrice.toLocaleString()}</span>
                )}
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>₹{product.price.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={handleAddToCart} 
                disabled={product.stock === 0 || addingToCart} 
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: addingToCart ? '#fff' : 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: addingToCart ? '#000' : '#fff',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: product.stock === 0 ? 0.4 : 1,
                  fontSize: addingToCart ? '1rem' : '1.2rem'
                }}
                onMouseEnter={(e) => { 
                  if (product.stock > 0 && !addingToCart) { 
                    e.currentTarget.style.background = '#ffffff'; 
                    e.currentTarget.style.color = '#000000';
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (!addingToCart) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}>
                {addingToCart ? '✓' : '+'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

