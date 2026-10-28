'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

export default function Orders() {
  const { user, loading } = useUser();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  if (loading) return <p className="muted">Loading...</p>;
  if (!user) return <p>Please <Link href="/login" style={{ textDecoration: 'underline' }}>log in</Link> to see your orders.</p>;

  return (
    <>
      <h1>My orders</h1>
      <p className="muted">Signed in as {user.email}</p>
      {orders && orders.length === 0 && <p className="muted">No orders yet.</p>}
      {orders?.map((o) => (
        <div className="panel" key={o.id}>
          <div className="row between">
            <strong>Order #{o.id}</strong>
            <span className="badge">{o.status}</span>
          </div>
          <p className="muted">{new Date(o.created_at).toLocaleString()}</p>
          <ul>{o.items.map((i) => <li key={i.id}>{i.title} x {i.qty}</li>)}</ul>
          <strong>Total: Rs {Number(o.total).toLocaleString()}</strong>
        </div>
      ))}
    </>
  );
}
