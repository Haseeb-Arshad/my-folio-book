import Header, { Nav } from "../components/header";

export function meta() {
  return [{ title: "Work — Haseeb Arshad" }];
}

export default function Work() {
  const workItems = [
    {
      name: "Summon Electronics",
      role: "Full-Stack Engineer",
      color: "bg-indigo-600",
      letter: "S",
    },
    {
      name: "AI Agentic Systems",
      role: "AI Engineer",
      color: "bg-emerald-600",
      letter: "A",
    },
    {
      name: "Open Source",
      role: "Contributor",
      color: "bg-orange-500",
      letter: "O",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[980px] mx-auto px-6">
        <Nav />

        <div className="animate-blur-in">
          <section className="pb-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Work</h2>
            <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
              A selection of projects and roles
            </p>
            <div>
              {workItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className="group flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50/50 -mx-3 px-3 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 ${item.color} rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {item.letter}
                    </div>
                    <span className="text-gray-900 font-medium group-hover:underline underline-offset-2">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">{item.role}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
