'use client';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ffffff,#ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
              <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>SHOP</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Your premium destination for quality products at unbeatable prices. Shop smarter, live better.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['Twitter', 'Instagram', 'Facebook', 'YouTube'].map((s) => (
                <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                  {s.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Shop', links: [['Products', '/products'], ['Featured', '/products?isFeatured=true'], ['Electronics', '/products?category=Electronics'], ['Clothing', '/products?category=Clothing'], ['Footwear', '/products?category=Footwear']] },
            { title: 'Account', links: [['Login', '/auth/login'], ['Register', '/auth/register'], ['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Profile', '/profile']] },
            { title: 'Support', links: [['FAQ', '#'], ['Shipping Info', '#'], ['Return Policy', '#'], ['Track Order', '#'], ['Contact Us', '#']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#fff', fontSize: '0.95rem' }}>{title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                      onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#fff', fontSize: '0.95rem' }}>Newsletter</h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '1rem' }}>Get exclusive deals and updates delivered to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input className="input" type="email" placeholder="your@email.com" style={{ fontSize: '0.875rem' }} />
              <button className="btn btn-primary" type="submit" style={{ height: 42 }}>Subscribe →</button>
            </form>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>© {year} SHOP. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['💳', '🏦', '📱', '🔒'].map((icon, i) => (
              <span key={i} style={{ fontSize: '1.2rem' }}>{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
