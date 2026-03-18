'use client';
import { useEffect, useState, useCallback } from 'react';
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

export default function ProductsPage({ searchParams }) {
  const sp = searchParams || {};
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    keyword: sp.keyword || '',
    category: sp.category || '',
    sort: sp.sort || 'newest',
    minPrice: sp.minPrice || '',
    maxPrice: sp.maxPrice || '',
    inStock: sp.inStock === 'true',
    isFeatured: sp.isFeatured === 'true',
    page: Number(sp.page) || 1,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Search */}
      <div>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Search</div>
        <input className="input" value={filters.keyword} onChange={(e) => updateFilter('keyword', e.target.value)} placeholder="Search products..." />
      </div>

      {/* Categories */}
      <div>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Categories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[{ name: 'All', count: total }, ...categories].map((cat) => (
            <button key={cat.name} onClick={() => updateFilter('category', cat.name === 'All' ? '' : cat.name)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 10, background: filters.category === (cat.name === 'All' ? '' : cat.name) ? 'rgba(108,71,255,0.2)' : 'transparent', border: '1px solid', borderColor: filters.category === (cat.name === 'All' ? '' : cat.name) ? 'rgba(108,71,255,0.4)' : 'transparent', color: filters.category === (cat.name === 'All' ? '' : cat.name) ? '#a78bfa' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', transition: 'all 0.2s' }}>
              {cat.name}
              {cat.count !== undefined && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>({cat.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Price Range</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {PRICE_RANGES.map((range) => {
            const active = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button key={range.label} onClick={() => setFilters((p) => ({ ...p, minPrice: range.min, maxPrice: range.max, page: 1 }))} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: active ? 'rgba(108,71,255,0.2)' : 'transparent', border: `1px solid ${active ? 'rgba(108,71,255,0.4)' : 'transparent'}`, color: active ? '#a78bfa' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', transition: 'all 0.2s' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${active ? '#a78bfa' : 'rgba(255,255,255,0.3)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />}
                </span>
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { key: 'inStock', label: 'In Stock Only' },
          { key: 'isFeatured', label: 'Featured Only' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div onClick={() => updateFilter(key, !filters[key])} style={{ width: 42, height: 24, borderRadius: 12, background: filters[key] ? '#6c47ff' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: filters[key] ? 21 : 3, transition: 'left 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>{label}</span>
          </label>
        ))}
      </div>

      <button onClick={() => setFilters({ keyword: '', category: '', sort: 'newest', minPrice: '', maxPrice: '', inStock: false, isFeatured: false, page: 1 })} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>Reset Filters</button>
    </div>
  );

  return (
    <div style={{ paddingTop: 70, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {filters.category || 'All Products'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>{loading ? '...' : `${total} products found`}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e8e8f0', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: '#13131a' }}>{o.label}</option>)}
            </select>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-outline" style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>☰ Filters</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: sidebarOpen ? '260px 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s' }}>
          {/* Sidebar */}
          {sidebarOpen && (
            <aside style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 90 }}>
              <SidebarContent />
            </aside>
          )}

          {/* Products Grid */}
          <div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
              </div>
            ) : products.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))} style={{ width: 40, height: 40, borderRadius: 10, background: filters.page === i + 1 ? '#6c47ff' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: filters.page === i + 1 ? '#6c47ff' : 'rgba(255,255,255,0.08)', color: filters.page === i + 1 ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>No products found</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Try adjusting your filters</p>
                <button onClick={() => setFilters({ keyword: '', category: '', sort: 'newest', minPrice: '', maxPrice: '', inStock: false, isFeatured: false, page: 1 })} className="btn btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
