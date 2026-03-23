import Header, { Nav } from "../components/header";

export function meta() {
  return [{ title: "Photos — Haseeb Arshad" }];
}

export default function Photos() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[980px] mx-auto px-6">
        <Nav />

        <div className="animate-blur-in">
          <section className="pb-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Photos</h2>
            <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
              Moments captured along the way
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-xl"
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-8 text-center">
              Coming soon
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
