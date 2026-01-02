import ProductCard from "./ProductCard";

export default function ProductGrid({ products, onAdd }) {
  return (
    <section id="shop" className="max-w-6xl mx-auto px-4 mt-8 pb-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Featured Products</h2>
          <p className="text-slate-600 mt-1">Showing all products</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sort:</span>
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
