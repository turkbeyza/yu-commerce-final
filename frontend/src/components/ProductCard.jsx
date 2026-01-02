import { money } from "../utils/money";

export default function ProductCard({ p, onAdd }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
          {p.emoji}
        </div>

        <button
          onClick={() => onAdd(p)}
          className="h-9 px-4 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          Add
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="text-sm text-slate-500">
          {p.category} • Stock {p.stock}
        </div>
        <div className="mt-1 font-extrabold text-slate-900">{p.name}</div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xl font-extrabold">{money(p.price)}</div>
          <div className="text-sm text-slate-600">
            {"★".repeat(4)}{"☆"}{" "}
            <span className="font-semibold">({p.rating})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
