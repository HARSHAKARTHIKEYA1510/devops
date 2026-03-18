'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 70, gap: '1.5rem' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6c47ff,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.02em' }}>ShopZen</span>
        </Link>

        {/* Nav Links - Desktop */}
        <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }} className="nav-links-desktop">
          {[['/', 'Home'], ['/products', 'Products'], ['/products?isFeatured=true', 'Featured'], ['/products?category=Electronics', 'Electronics'], ['/products?category=Fashion', 'Fashion']].map(([href, label]) => (
            <Link key={href} href={href} style={{ padding: '0.5rem 0.875rem', borderRadius: 10, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.7)'; e.target.style.background = 'transparent'; }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: searchOpen ? 1 : 'none', maxWidth: searchOpen ? 360 : 'auto', transition: 'all 0.3s' }}>
          {searchOpen && (
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) window.location.href = `/products?keyword=${encodeURIComponent(searchQuery)}`; }} style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
              <input className="input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." style={{ height: 40, padding: '0 1rem', fontSize: '0.875rem' }} autoFocus />
            </form>
          )}
          <button onClick={() => setSearchOpen(!searchOpen)} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
            {searchOpen ? '✕' : '🔍'}
          </button>
        </div>

        {/* Right Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {user && (
            <Link href="/wishlist" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s' }}
              title="Wishlist">♡</Link>
          )}

          {/* Cart */}
          <Link href="/cart" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', textDecoration: 'none', position: 'relative', transition: 'all 0.2s' }}>
            🛒
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, background: 'linear-gradient(135deg,#6c47ff,#ec4899)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{itemCount}</span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: 10, background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.name?.split(' ')[0]}
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 180, background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100 }}>
                  {[
                    ['/profile', '👤', 'My Profile'],
                    ['/orders', '📦', 'My Orders'],
                    ['/wishlist', '♡', 'Wishlist'],
                    ...(isAdmin ? [['/admin', '⚙️', 'Admin Dashboard']] : []),
                  ].map(([href, icon, label]) => (
                    <Link key={href} href={href} onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.875rem', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span>{icon}</span>{label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />
                  <button onClick={() => { logout(); setUserMenuOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left' }}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/auth/login" className="btn btn-outline" style={{ height: 40, padding: '0 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ height: 40, padding: '0 1rem', fontSize: '0.85rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
