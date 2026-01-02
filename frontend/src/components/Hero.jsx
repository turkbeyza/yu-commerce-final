export default function Hero() {
  return (
    <section id="home" className="max-w-6xl mx-auto px-4 pt-8">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 text-white">
        <div className="px-8 py-10 md:px-12 md:py-14">
          <div className="text-sm opacity-90 flex items-center gap-2">
            <span>⚡</span>
            <span>Winter Collection 2025</span>
          </div>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
            Rediscover
            <br />
            Your Style
          </h1>

          <p className="mt-5 max-w-xl text-white/90">
            Breathe new life into your wardrobe with premium products. Up to 50% off.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="#shop"
              className="h-11 px-5 rounded-full bg-white text-indigo-900 font-semibold inline-flex items-center justify-center"
            >
              Start Shopping
            </a>
            <button className="h-11 px-5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10">
              View Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
