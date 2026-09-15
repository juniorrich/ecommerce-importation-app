import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-espresso-700 bg-espresso-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg text-ivory-100">Kwabena &amp; Co.</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-sand-500">
            Every order is logged against a shipping manifest the moment it
            leaves origin, so you always know where your goods stand between
            the port and your door.
          </p>
        </div>
        <div>
          <p className="text-sm text-ivory-200">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-sand-500">
            <li><Link href="/products" className="hover:text-gold-400">Full catalogue</Link></li>
            <li><Link href="/orders" className="hover:text-gold-400">Track an order</Link></li>
            <li><Link href="/cart" className="hover:text-gold-400">Your cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm text-ivory-200">Reach us</p>
          <ul className="mt-3 space-y-2 text-sm text-sand-500">
            <li>Obuasi &amp; Accra, Ghana</li>
            <li>hello@kwabenaandco.gh</li>
            <li>+233 20 000 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-espresso-700 px-5 py-5 text-center text-xs text-sand-500">
        &copy; {new Date().getFullYear()} Kwabena &amp; Co. Curated imports, cleared and delivered.
      </div>
    </footer>
  );
}
