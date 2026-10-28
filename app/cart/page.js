'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUser, getCart, saveCart } from '@/lib/useUser';

export default function Cart() {
  const { user, loading } = useUser();
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => setCart(getCart()), []);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function update(next) { setCart(next); saveCart(next); }
  function setQty(id, qty) { update(cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))); }
  function remove(id) { update(cart.filter((i) => i.id !== id)); }

  async function placeOrder(e) {
    e.preventDefault();
    setMsg('');
    const { error } = await supabase.from('orders').insert({ user_id: user.id, items: cart, total, address, phone });
    if (error) return setMsg(error.message);
    update([]);
    setDone(true);
  }

  if (done) return <div className="panel"><h1>Order placed</h1><p className="ok">Thanks. Payment is cash on delivery. <Link href="/orders" style={{ textDecoration: 'underline' }}>View your orders</Link></p></div>;
  if (cart.length === 0) return <><h1>Cart</h1><p className="muted">Your cart is empty. <Link href="/" style={{ textDecoration: 'underline' }}>Browse products</Link></p></>;

  return (
    <>
      <h1>Cart</h1>
      <div className="scroll">
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th></th></tr></thead>
          <tbody>
            {cart.map((i) => (
              <tr key={i.id}>
                <td>{i.title}</td>
                <td>Rs {Number(i.price).toLocaleString()}</td>
                <td><input type="number" min="1" value={i.qty} onChange={(e) => setQty(i.id, Number(e.target.value))} style={{ width: 80 }} /></td>
                <td><button className="ghost" onClick={() => remove(i.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Total: Rs {total.toLocaleString()}</h2>
      {!loading && !user ? (
        <p><Link href="/login" className="btn">Log in to checkout</Link></p>
      ) : (
        <form className="panel" onSubmit={placeOrder}>
          <label htmlFor="addr">Delivery address</label>
          <textarea id="addr" required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          <label htmlFor="ph">Phone</label>
          <input id="ph" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          {msg && <p className="msg">{msg}</p>}
          <p style={{ marginTop: 16 }}><button>Place order (cash on delivery)</button></p>
        </form>
      )}
    </>
  );
}
