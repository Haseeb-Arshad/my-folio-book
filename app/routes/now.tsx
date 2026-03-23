import Header, { Nav } from "../components/header";

export function meta() {
  return [{ title: "Now — Haseeb Arshad" }];
}

export default function Now() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[980px] mx-auto px-6">
        <Nav />

        <div className="animate-blur-in">
          <section className="pb-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Now</h2>
            <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
              What I'm focused on right now
            </p>

            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Building
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Working on AI agentic systems at Summon Electronics — exploring
                  the intersection of intelligent automation and thoughtful
                  software design.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Learning
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Deep-diving into multi-agent architectures, LLM tooling, and
                  systems that can reason and act autonomously.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Exploring
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Contributing to open source, experimenting with new frameworks,
                  and pushing the boundaries of what's possible with code.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
