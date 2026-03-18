'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await authApi.getWishlist();
        setWishlist(data.wishlist || []);
      } catch {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return (
    <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '3rem' }}>♡</div>
      <h2 style={{ color: '#fff' }}>Please login to view your wishlist</h2>
      <Link href="/auth/login" className="btn btn-primary">Login →</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>My Wishlist <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({wishlist.length} items)</span></h1>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />)}
          </div>
        ) : wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤍</div>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Your wishlist is empty</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Save items you love and buy them later</p>
            <Link href="/products" className="btn btn-primary">Explore Products →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {wishlist.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
