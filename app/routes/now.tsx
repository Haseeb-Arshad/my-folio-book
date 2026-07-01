import { BlurIn } from "../components/header";

export function meta() {
  return [{ title: "Now · Haseeb Arshad" }];
}

export default function Now() {
  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Now</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          What I&apos;m focused on right now
        </p>
      </BlurIn>

      <div className="max-w-xl space-y-6">
        <BlurIn delay={100}>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Building
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Working on AI agentic systems at Summon Electronics, exploring
              the intersection of intelligent automation and thoughtful
              software design.
            </p>
            {/* Alt copy:
              I'm building the systems a sourcing and sales operation quietly
              runs on: RFQ workflows, supplier intelligence, analytics, and
              AI-assisted automation layered into real operational software.
            */}
          </div>
        </BlurIn>

        <BlurIn delay={190}>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Learning
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Deep-diving into multi-agent architectures, LLM tooling, and
              systems that can reason and act autonomously.
            </p>
            {/* Alt copy:
              Going deep on multi-agent architectures and LLM tooling, chasing
              the question of how software can reason, act, and still stay
              legible to the person behind it.
            */}
          </div>
        </BlurIn>

        <BlurIn delay={280}>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Exploring
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Contributing to open source, experimenting with new frameworks,
              and pushing the boundaries of what&apos;s possible with code.
            </p>
            {/* Alt copy:
              Exploring open source and unfamiliar frameworks through small,
              unglamorous experiments. Most lead nowhere, a few quietly reshape
              how I build.
            */}
          </div>
        </BlurIn>
      </div>
    </section>
  );
}
