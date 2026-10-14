import { Appear, Typed, type Demo, type SceneProps } from "./stage";

/* WikiAsterisk: paste a Wikipedia link and the article comes back as a
   magazine page, with a drop cap, a pull quote, highlights and references
   set in the margin. "Byzantine Empire" is one of its own example reads. */

const URL = "en.wikipedia.org/wiki/Byzantine_Empire";
const READING = { fontFamily: 'Georgia, "Times New Roman", serif' };

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const pressed = on(2) && !on(3);

  return (
    <>
      <Appear
        on={on(1) && !on(3)}
        className="absolute inset-x-5 top-1/2 -mt-8 flex flex-col items-center gap-3"
      >
        <span className="font-serif text-[22px] italic text-gray-900">WikiAsterisk</span>
        <div className="flex w-full max-w-[340px] items-stretch gap-1.5">
          <span className="min-w-0 flex-1 truncate border border-gray-300 bg-white px-2.5 py-1.5 font-mono text-[11px] text-gray-700">
            <Typed text={URL} on={on(1)} still={still} speed={28} caret />
          </span>
          <span
            className={`bg-black px-3 py-1.5 text-[11px] text-white transition-transform duration-150 ${
              pressed ? "scale-95" : ""
            }`}
          >
            Read
          </span>
        </div>
      </Appear>

      <Appear on={on(3)} className="absolute inset-x-5 top-4 bottom-10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">History</p>
        <p className="font-serif text-[26px] italic leading-none text-gray-900">
          Byzantine Empire
        </p>

        <div className="mt-3 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4">
          <Appear on={on(4)} className="min-w-0">
            <p className="text-[11.5px] leading-[1.55] text-gray-700" style={READING}>
              <span className="float-left mr-1.5 mt-0.5 font-serif text-[36px] leading-[0.8] text-gray-900">
                T
              </span>
              he eastern half of the Roman Empire carried on for centuries after
              the west fell,{" "}
              {/* A growing background rather than an overlay, so the sweep
                  follows the phrase across a line break like a real pen. */}
              <span
                className="bg-no-repeat transition-[background-size] duration-700 ease-out"
                style={{
                  backgroundImage: "linear-gradient(#fde68a, #fde68a)",
                  backgroundSize: on(6) ? "100% 100%" : "0% 100%",
                }}
              >
                ruled from Constantinople until 1453
              </span>
              .<sup className="ml-0.5 font-mono text-[11px] text-gray-400">1</sup>
            </p>
          </Appear>

          <div className="min-w-0">
            <Appear on={on(5)}>
              <p className="border-l-2 border-gray-900 pl-2.5 font-serif text-[15px] italic leading-snug text-gray-900">
                "It endured for more than a thousand years."
              </p>
            </Appear>
            <Appear on={on(7)} className="mt-3 text-[11px] leading-snug text-gray-500">
              <span className="font-mono">1</span> Treadgold, A History of the
              Byzantine State and Society, 1997
            </Appear>
          </div>
        </div>
      </Appear>
    </>
  );
}

export const wikiAsterisk: Demo = {
  label:
    "Animated demo: a Wikipedia link for the Byzantine Empire is pasted into WikiAsterisk and comes back as a magazine page with a drop cap, a pull quote, a highlight and a reference.",
  chapters: ["Paste a link", "Rebuilt as a magazine", "Highlights and references"],
  cues: [
    { at: 200 },
    { at: 1700 },
    { at: 2100, chapter: 1 },
    { at: 2400 },
    { at: 2900 },
    { at: 3900, chapter: 2 },
    { at: 4700 },
  ],
  surface: "bg-[#faf8f3]",
  Scene,
};
