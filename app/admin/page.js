'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

const empty = { title: '', description: '', price: '', stock: '', image_url: '' };
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Admin() {
  const { role, loading } = useUser();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const p = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const o = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setProducts(p.data || []);
    setOrders(o.data || []);
  }
  useEffect(() => { if (role === 'admin') load(); }, [role]);

  if (loading) return <p className="muted">Loading...</p>;
  if (role !== 'admin') return <p className="msg">Admin access only.</p>;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setMsg('');
    const row = { title: form.title, description: form.description, price: Number(form.price), stock: Number(form.stock), image_url: form.image_url || null };
    const { error } = editId
      ? await supabase.from('products').update(row).eq('id', editId)
      : await supabase.from('products').insert(row);
    if (error) return setMsg(error.message);
    setForm(empty); setEditId(null); load();
  }

  function edit(p) {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description || '', price: p.price, stock: p.stock, image_url: p.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) setMsg(error.message); else load();
  }

  async function setStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  }

  return (
    <>
      <h1>Admin panel</h1>
      <div className="tabs">
        <button className={tab === 'products' ? '' : 'ghost'} onClick={() => setTab('products')}>Products ({products.length})</button>
        <button className={tab === 'orders' ? '' : 'ghost'} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
      </div>

      {tab === 'products' && (
        <>
          <form className="panel" onSubmit={save}>
            <h2 style={{ marginTop: 0 }}>{editId ? 'Edit product' : 'Add product'}</h2>
            <label htmlFor="t">Title</label>
            <input id="t" required value={form.title} onChange={set('title')} />
            <label htmlFor="d">Description</label>
            <textarea id="d" rows={2} value={form.description} onChange={set('description')} />
            <div className="row">
              <div style={{ flex: 1 }}><label htmlFor="p">Price (Rs)</label><input id="p" type="number" min="0" required value={form.price} onChange={set('price')} /></div>
              <div style={{ flex: 1 }}><label htmlFor="s">Stock</label><input id="s" type="number" min="0" required value={form.stock} onChange={set('stock')} /></div>
            </div>
            <label htmlFor="i">Image URL</label>
            <input id="i" placeholder="https://..." value={form.image_url} onChange={set('image_url')} />
            {msg && <p className="msg">{msg}</p>}
            <div className="row" style={{ marginTop: 16 }}>
              <button>{editId ? 'Save changes' : 'Add product'}</button>
              {editId && <button type="button" className="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
            </div>
          </form>
          <div className="scroll">
            <table>
              <thead><tr><th>Title</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td><td>Rs {Number(p.price).toLocaleString()}</td><td>{p.stock}</td>
                    <td className="row"><button className="ghost" onClick={() => edit(p)}>Edit</button><button className="danger" onClick={() => del(p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <>
          {orders.length === 0 && <p className="muted">No orders yet.</p>}
          {orders.map((o) => (
            <div className="panel" key={o.id}>
              <div className="row between">
                <strong>Order #{o.id} - Rs {Number(o.total).toLocaleString()}</strong>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} style={{ width: 160 }}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <p className="muted">{o.phone} | {o.address} | {new Date(o.created_at).toLocaleString()}</p>
              <ul>{o.items.map((i) => <li key={i.id}>{i.title} x {i.qty}</li>)}</ul>
            </div>
          ))}
        </>
      )}
    </>
  );
}
