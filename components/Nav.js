'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser, getCart } from '@/lib/useUser';

export default function Nav() {
  const { user, role } = useUser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getCart().reduce((n, i) => n + i.qty, 0));
    update();
    window.addEventListener('cart-changed', update);
    return () => window.removeEventListener('cart-changed', update);
  }, []);

  return (
    <header className="nav">
      <Link href="/" className="brand">myShop</Link>
      <nav>
        <Link href="/cart">Cart ({count})</Link>
        {user && <Link href="/orders">My orders</Link>}
        {role === 'admin' && <Link href="/admin">Admin</Link>}
        {user ? (
          <button className="link" onClick={() => supabase.auth.signOut()}>Log out</button>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
