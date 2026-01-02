export default function Header({ onOpenCart }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-extrabold tracking-tight text-xl">YU</div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <a href="#home" className="hover:text-slate-900">Home</a>
          <a href="#shop" className="hover:text-slate-900">Shop</a>
          <a href="#about" className="hover:text-slate-900">About</a>
          <a href="#contact" className="hover:text-slate-900">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCart}
            className="h-10 px-3 rounded-full border border-slate-200 hover:bg-slate-50"
          >
            🛒
          </button>
        </div>
      </div>
    </header>
  );
}
