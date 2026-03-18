'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';

const HERO_SLIDES = [
  {
    tag: 'New Collection',
    title: 'Discover Premium\nProducts',
    subtitle: 'Explore thousands of curated products with fast delivery and exclusive deals.',
    cta: 'Shop Now',
    href: '/products',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #cccccc 50%, #ffffff 100%)',
    emoji: '⚡',
  },
  {
    tag: 'Best Sellers',
    title: 'Top Picks of\nThe Season',
    subtitle: 'Our most-loved products handpicked by thousands of happy customers.',
    cta: 'View Top Picks',
    href: '/products?sort=popular',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
    emoji: '🔥',
  },
  {
    tag: 'Flash Sale',
    title: 'Up to 70% Off\nToday Only',
    subtitle: 'Grab incredible deals before they expire. Limited stock available.',
    cta: 'Grab Deals',
    href: '/products?sort=price-asc',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
    emoji: '🎁',
  },
];

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: '#ffffff', href: '/products?category=Electronics' },
  { name: 'Clothing', emoji: '👕', color: '#ffffff', href: '/products?category=Clothing' },
  { name: 'Footwear', emoji: '👟', color: '#ffffff', href: '/products?category=Footwear' },
];

const FEATURES = [
  { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day delivery for orders placed before 2 PM' },
  { icon: '🔒', title: 'Secure Payment', desc: '256-bit SSL encryption for all transactions' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free return policy' },
  { icon: '🎧', title: '24/7 Support', desc: 'Round-the-clock customer assistance' },
];

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          productsApi.getFeatured(),
          productsApi.getAll({ sort: 'newest', limit: 8 }),
        ]);
        setFeaturedProducts(featuredRes.products || []);
        setNewArrivals(newRes.products || []);
      } catch {
        // Products will be empty until backend is running
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div style={{ paddingTop: 70 }}>
      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '0 1.5rem' }}>
        {/* Animated BG */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(200,200,200,0.06)', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite reverse', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          {/* Left */}
          <div key={heroIdx} style={{ animation: 'fadeInUp 0.7s ease' }}>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 999, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
              {slide.emoji} {slide.tag}
            </span>
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
              {slide.title.split('\n')[0]}<br />
              <span className="gradient-text">{slide.title.split('\n')[1]}</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 480 }}>{slide.subtitle}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href={slide.href} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                {slide.cta} →
              </Link>
              <Link href="/products" className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Browse All
              </Link>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
              {[['50K+', 'Products'], ['2M+', 'Customers'], ['99%', 'Satisfaction']].map(([val, lab]) => (
                <div key={lab}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-outfit)' }}>{val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Hero visual */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'float 4s ease-in-out infinite' }}>
            <div style={{ width: 380, height: 380, borderRadius: '50%', background: slide.gradient, opacity: 0.15, position: 'absolute', filter: 'blur(60px)' }} />
            <div style={{ width: 320, height: 320, borderRadius: 32, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', position: 'relative' }}>
              {slide.emoji}
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? 28 : 8, height: 8, borderRadius: 4, background: i === heroIdx ? '#ffffff' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display: 'inline-block', padding: '0.3rem 0.875rem', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>CATEGORIES</span>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff' }}>Shop by <span className="gradient-text">Category</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={cat.href} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem 1rem', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${cat.color}15`; e.currentTarget.style.borderColor = `${cat.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>{cat.emoji}</div>
                <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem', textAlign: 'center' }}>{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ display: 'block', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.05em' }}>HANDPICKED FOR YOU</span>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff' }}>Featured <span className="gradient-text">Products</span></h2>
          </div>
          <Link href="/products?isFeatured=true" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>View All →</Link>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />)}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {featuredProducts.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
            <p>No featured products yet. <Link href="/products" style={{ color: '#ffffff' }}>Browse all products</Link></p>
          </div>
        )}
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ display: 'block', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.05em' }}>JUST ARRIVED</span>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff' }}>New <span className="gradient-text">Arrivals</span></h2>
            </div>
            <Link href="/products?sort=newest" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {newArrivals.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* PROMO BANNER */}
      <section style={{ padding: '0 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(200,200,200,0.15) 100%)', border: '1px solid rgba(255,255,255,0.2)', padding: '3rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>🎉 LIMITED TIME OFFER</div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Get 20% off your first order</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Use code <strong style={{ color: '#ffffff' }}>WELCOME20</strong> at checkout</p>
          </div>
          <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem', whiteSpace: 'nowrap' }}>
            Claim Offer →
          </Link>
        </div>
      </section>
    </div>
  );
}
