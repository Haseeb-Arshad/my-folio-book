import { useEffect, useRef, useState } from "react";
import type { ProjectPresentation } from "../data/project-stories";

export function ProjectImage({
  src,
  alt,
  eager = false,
}: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="project-image-button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Enlarge image: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
        <span className="image-enlarge" aria-hidden="true">
          View full size ↗
        </span>
      </button>
      <dialog
        ref={dialog}
        className="project-lightbox"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        aria-label={alt}
      >
        <button
          type="button"
          className="lightbox-close"
          onClick={() => dialog.current?.close()}
          autoFocus
        >
          Close ×
        </button>
        <img src={src} alt={alt} loading="lazy" />
        <p>{alt}</p>
      </dialog>
    </>
  );
}

export function Walkthrough({
  presentation,
}: {
  presentation: ProjectPresentation;
}) {
  const [active, setActive] = useState(0);
  const step = presentation.steps[active];
  if (!step) return null;
  return (
    <section
      className="project-walkthrough"
      id="walkthrough"
      aria-labelledby="walkthrough-title"
    >
      <div className="section-heading">
        <span className="eyebrow">A closer look</span>
        <h2 id="walkthrough-title">Follow the experience.</h2>
      </div>
      <div className="walkthrough-controls" aria-label="Walkthrough steps">
        {presentation.steps.map((item, index) => (
          <button
            type="button"
            key={item.title}
            aria-pressed={active === index}
            aria-controls="walkthrough-panel"
            onClick={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.title}
          </button>
        ))}
      </div>
      <div
        id="walkthrough-panel"
        className={`walkthrough-panel tone-${presentation.tone}`}
      >
        <ProjectImage src={step.image} alt={step.alt} />
      </div>
      <div
        className="walkthrough-caption"
        aria-live="polite"
        aria-atomic="true"
      >
        <p>{step.text}</p>
        <small>{step.caption}</small>
      </div>
    </section>
  );
}

export function Contents({
  items,
}: {
  items: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-8% 0px -55% 0px", threshold: 0 },
    );
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="story-contents">
      <span className="eyebrow">In this story</span>
      {items.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
          onClick={() => setActive(item.id)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {item.title}
        </a>
      ))}
    </nav>
  );
}
