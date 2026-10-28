'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCart, saveCart } from '@/lib/useUser';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  function add(p) {
    const cart = getCart();
    const found = cart.find((i) => i.id === p.id);
    if (found) { if (found.qty < p.stock) found.qty += 1; }
    else cart.push({ id: p.id, title: p.title, price: p.price, qty: 1 });
    saveCart(cart);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1200);
  }

  const shown = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1>Products</h1>
      <input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360, marginBottom: 20 }} />
      {loading && <p className="muted">Loading products...</p>}
      {!loading && shown.length === 0 && <p className="muted">No products found.</p>}
      <div className="grid">
        {shown.map((p) => (
          <div className="card" key={p.id}>
            {p.image_url ? <img src={p.image_url} alt={p.title} /> : <div className="noimg" />}
            <div className="body">
              <strong>{p.title}</strong>
              <span className="muted">{p.description}</span>
              <span className="price">Rs {Number(p.price).toLocaleString()}</span>
              <button disabled={p.stock < 1} onClick={() => add(p)} className="accent">
                {p.stock < 1 ? 'Out of stock' : added === p.id ? 'Added' : 'Add to cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
