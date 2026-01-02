const cats = ["All", "Electronics", "Fashion", "Lifestyle"];

export default function Categories({ value, onChange }) {
  return (
    <div className="max-w-6xl mx-auto px-4 mt-4 flex flex-wrap gap-2">
      {cats.map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={[
              "h-10 px-4 rounded-full border text-sm font-semibold",
              active
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
            ].join(" ")}
          >
            {c === "All" ? "✨ All" : c}
          </button>
        );
      })}
    </div>
  );
}
