import { BlurIn } from "../components/header";

export function meta() {
  return [{ title: "Photos · Haseeb Arshad" }];
}

export default function Photos() {
  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Photos</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          Moments captured along the way
        </p>
      </BlurIn>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BlurIn key={i} delay={80 + i * 70}>
            <div className="aspect-square bg-gray-100 rounded-xl" />
          </BlurIn>
        ))}
      </div>

      <BlurIn delay={600}>
        <p className="text-gray-400 text-sm mt-8 text-center">
          Coming soon
        </p>
      </BlurIn>
    </section>
  );
}
