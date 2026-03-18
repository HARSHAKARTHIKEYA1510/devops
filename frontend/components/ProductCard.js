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
    setAddingToCart(true);
    addItem(product, 1);
    setTimeout(() => setAddingToCart(false), 600);
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
    <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ position: 'relative', cursor: 'pointer' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '4/3', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(200,200,200,0.1))' }}>📦</div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {discount > 0 && (
              <span style={{ background: 'linear-gradient(135deg,#ffffff,#ffffff)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6 }}>-{discount}% OFF</span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6 }}>Few Left</span>
            )}
            {product.stock === 0 && (
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6 }}>Out of Stock</span>
            )}
            {product.isFeatured && (
              <span style={{ background: 'rgba(255,215,0,0.15)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6 }}>⭐ Featured</span>
            )}
          </div>

          {/* Wishlist */}
          <button onClick={handleWishlist} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: 36, height: 36, borderRadius: '50%', background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', color: wishlisted ? '#ffffff' : 'rgba(255,255,255,0.6)' }}>
            {wishlisted ? '❤' : '♡'}
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
          {product.brand && (
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</span>
          )}
          <h3 style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>

          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <StarRating rating={product.rating} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>({product.numReviews})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', marginLeft: '0.4rem' }}>₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart} style={{
              padding: '0.5rem 0.875rem', borderRadius: 10, background: addingToCart ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: addingToCart ? '#ffffff' : '#ffffff', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap', opacity: product.stock === 0 ? 0.5 : 1,
            }}
              onMouseEnter={(e) => { if (product.stock > 0) { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = addingToCart ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)'; }}>
              {addingToCart ? '✓ Added' : '+ Cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
