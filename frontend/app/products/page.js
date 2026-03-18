'use client';
import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productsApi } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'All', min: '', max: '' },
  { label: 'Under ₹500', min: '', max: '500' },
  { label: '₹500 – ₹2,000', min: '500', max: '2000' },
  { label: '₹2,000 – ₹10,000', min: '2000', max: '10000' },
  { label: '₹10,000+', min: '10000', max: '' },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    page: Number(searchParams.get('page')) || 1,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 12, ...filters };
      if (filters.inStock) params.inStock = 'true'; else delete params.inStock;
      if (filters.isFeatured) params.isFeatured = 'true'; else delete params.isFeatured;
      Object.keys(params).forEach((k) => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const data = await productsApi.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productsApi.getCategories();
      setCategories(data.categories || []);
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Search */}
      <div>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</div>
        <div style={{ position: 'relative' }}>
          <input 
            className="input" 
            value={filters.keyword} 
            onChange={(e) => updateFilter('keyword', e.target.value)} 
            placeholder="Name, brand, etc..." 
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              paddingRight: '2.5rem'
            }} 
          />
          <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}>🔍</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[{ name: 'All', count: total }, ...categories].map((cat) => {
            const isActive = filters.category === (cat.name === 'All' ? '' : cat.name);
            return (
              <button 
                key={cat.name} 
                onClick={() => updateFilter('category', cat.name === 'All' ? '' : cat.name)} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.6rem 0.75rem', 
                  borderRadius: 10, 
                  background: isActive ? '#ffffff' : 'transparent', 
                  border: 'none',
                  color: isActive ? '#000000' : 'rgba(255,255,255,0.5)', 
                  cursor: 'pointer', 
                  fontSize: '0.875rem', 
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'left', 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                {cat.name}
                <span style={{ fontSize: '0.7rem', opacity: isActive ? 0.6 : 0.4 }}>{cat.count !== undefined ? cat.count : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Range</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {PRICE_RANGES.map((range) => {
            const active = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button 
                key={range.label} 
                onClick={() => setFilters((p) => ({ ...p, minPrice: range.min, maxPrice: range.max, page: 1 }))} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.6rem 0.75rem', 
                  borderRadius: 10, 
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent', 
                  border: 'none',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)', 
                  cursor: 'pointer', 
                  fontSize: '0.875rem', 
                  fontWeight: active ? 600 : 500,
                  textAlign: 'left', 
                  transition: 'all 0.2s' 
                }}>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  border: `2px solid ${active ? '#ffffff' : 'rgba(255,255,255,0.2)'}`, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0,
                  transition: 'border-color 0.2s'
                }}>
                  {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />}
                </div>
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { key: 'inStock', label: 'In Stock Only' },
          { key: 'isFeatured', label: 'Featured Selection' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ fontSize: '0.875rem', color: filters[key] ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</span>
            <div onClick={() => updateFilter(key, !filters[key])} style={{ width: 44, height: 22, borderRadius: 11, background: filters[key] ? '#ffffff' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: filters[key] ? '#000' : '#fff', position: 'absolute', top: 3, left: filters[key] ? 25 : 3, transition: 'all 0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15)' }} />
            </div>
          </label>
        ))}
      </div>

      <button 
        onClick={() => setFilters({ keyword: '', category: '', sort: 'newest', minPrice: '', maxPrice: '', inStock: false, isFeatured: false, page: 1 })} 
        className="btn" 
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        onMouseEnter={(e) => e.target.style.color = '#fff'}
        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}>
        Reset All Filters
      </button>
    </div>
  );

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#050505' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '1rem 2rem 4rem' }}>
        {/* Header - Large Profile Style */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
              {filters.category || 'Catalog'}
            </h1>
            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600, paddingBottom: '0.4rem' }}>
              / {loading ? '...' : total}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: sidebarOpen ? '#fff' : 'rgba(255,255,255,0.05)', color: sidebarOpen ? '#000' : '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{sidebarOpen ? '✕' : '☰'}</span> Filters
              </button>
              {filters.category && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500 }}>
                  Showing {filters.category}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By:</span>
              <select 
                value={filters.sort} 
                onChange={(e) => updateFilter('sort', e.target.value)} 
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: 10, 
                  background: 'transparent', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#ffffff', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  cursor: 'pointer', 
                  outline: 'none',
                  appearance: 'none',
                  textAlign: 'center'
                }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: '#0a0a0a' }}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '3rem' }}>
          {/* Sidebar */}
          {sidebarOpen && (
            <aside style={{ width: 280, flexShrink: 0, position: 'sticky', top: 100, height: 'calc(100vh - 140px)', overflowY: 'auto', paddingRight: '1rem', maskImage: 'linear-gradient(to bottom, black 95%, transparent)' }}>
              <SidebarContent />
            </aside>
          )}

          {/* Products Column */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 16 }} />
                    <div className="skeleton" style={{ height: 20, width: '60%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 24, width: '40%', borderRadius: 4, marginTop: 'auto' }} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '5rem' }}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, page: i + 1 }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        style={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: 12, 
                          background: filters.page === i + 1 ? '#ffffff' : 'rgba(255,255,255,0.03)', 
                          border: filters.page === i + 1 ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.1)', 
                          color: filters.page === i + 1 ? '#000' : 'rgba(255,255,255,0.6)', 
                          cursor: 'pointer', 
                          fontWeight: 700, 
                          fontSize: '0.9rem',
                          transition: 'all 0.2s' 
                        }}
                        onMouseEnter={(e) => { if (filters.page !== i+1) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                        onMouseLeave={(e) => { if (filters.page !== i+1) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}>∅</div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>No results for your search</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', maxWidth: 300, marginInline: 'auto' }}>
                  Try using more general keywords or clearing some filters.
                </p>
                <button 
                  onClick={() => setFilters({ keyword: '', category: '', sort: 'newest', minPrice: '', maxPrice: '', inStock: false, isFeatured: false, page: 1 })} 
                  style={{ background: '#fff', color: '#000', border: 'none', padding: '0.8rem 2rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
