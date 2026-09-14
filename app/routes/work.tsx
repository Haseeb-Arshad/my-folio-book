import { Link, useLoaderData } from "react-router";
import {
  getProjects,
  getExperience,
  getCaseStudiesByOrg,
} from "../data/content.server";
import { presentations } from "../data/project-stories";
import type { Project } from "../data/projects";

export async function loader() {
  const [projects, experience, byOrg] = await Promise.all([
    getProjects(),
    getExperience(),
    getCaseStudiesByOrg(),
  ]);
  const caseStudies = Object.fromEntries(
    [...byOrg].map(([org, studies]) => [
      org,
      studies.map(({ slug, title }) => ({ slug, title })),
    ]),
  );
  return { projects, experience, caseStudies };
}
export function meta() {
  return [
    { title: "Work · Haseeb Arshad" },
    {
      name: "description",
      content:
        "Explore Incillum, ChatGideon and selected engineering work through visual walkthroughs and case studies.",
    },
  ];
}
function ProjectLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return href.startsWith("/") ? (
    <Link to={href}>{children}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
function MoreProject({ project }: { project: Project }) {
  const primary = project.live ?? project.code;
  return (
    <article className="more-project">
      {project.popup && (
        <ProjectLink href={primary}>
          <div className="more-project-image">
            <img
              src={project.popup.image}
              alt={`${project.name} interface preview`}
              loading="lazy"
            />
          </div>
        </ProjectLink>
      )}
      <div className="more-project-title">
        {project.logo && (
          <img src={project.logo} alt="" width={30} height={30} />
        )}
        <h3>
          <ProjectLink href={primary}>
            {project.name} <span aria-hidden="true">↗</span>
          </ProjectLink>
        </h3>
        <span>{project.year}</span>
      </div>
      <p>{project.tagline}</p>
      <div className="project-tags">
        {project.stack.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="project-links">
        {project.live && (
          <ProjectLink href={project.live}>Visit site ↗</ProjectLink>
        )}
        {project.links
          ? project.links.map((link) => (
              <ProjectLink key={link.href} href={link.href}>
                {link.label} ↗
              </ProjectLink>
            ))
          : project.code !== project.live && (
              <ProjectLink href={project.code}>View project ↗</ProjectLink>
            )}
      </div>
    </article>
  );
}
export default function Work() {
  const { projects, experience, caseStudies } = useLoaderData<typeof loader>();
  const featured = Object.entries(presentations).filter(([name]) =>
    projects.some((project) => project.name === name),
  );
  return (
    <section className="work-showcase">
      <header className="work-intro">
        <span className="eyebrow">Selected work</span>
        <h1>
          Ideas, made <em>tangible.</em>
        </h1>
        <p>
          AI systems, thoughtful interfaces, and the engineering that makes them
          work. A closer look at what I build.
        </p>
        <a href="#selected">
          Explore the work <span aria-hidden="true">↓</span>
        </a>
      </header>
      <div id="selected" className="featured-projects">
        {featured.map(([name, presentation], index) => (
          <article
            className={`featured-project tone-${presentation.tone}`}
            key={name}
          >
            <div className="featured-heading">
              <div className="project-brand">
                {presentation.logo && (
                  <img
                    src={presentation.logo}
                    alt={`${name} logo`}
                    width={48}
                    height={48}
                  />
                )}
                <span>{name}</span>
              </div>
              <span className="project-index">
                {String(index + 1).padStart(2, "0")} / {presentation.category}
              </span>
            </div>
            <Link
              to={`/work/${presentation.slug}`}
              className="featured-image"
              aria-label={`Explore ${name}`}
            >
              <img
                src={presentation.cover}
                alt={presentation.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="featured-image-link" aria-hidden="true">
                Explore project ↗
              </span>
            </Link>
            <div className="featured-body">
              <div>
                <span className="eyebrow">{presentation.category}</span>
                <h2>
                  <Link to={`/work/${presentation.slug}`}>
                    {presentation.headline}
                  </Link>
                </h2>
                <p>{presentation.description}</p>
              </div>
              <div className="featured-details">
                <span className="project-status">{presentation.status}</span>
                <dl>
                  {presentation.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link to={`/work/${presentation.slug}`} className="story-link">
                  Explore {name} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <section className="other-work" aria-labelledby="more-work">
        <div className="section-heading">
          <span className="eyebrow">More to explore</span>
          <h2 id="more-work">Other things I've built.</h2>
        </div>
        <div className="more-project-grid">
          {projects
            .filter((project) => !presentations[project.name])
            .map((project) => (
              <MoreProject key={project.name} project={project} />
            ))}
        </div>
        <a
          className="story-link"
          href="https://github.com/Haseeb-Arshad"
          target="_blank"
          rel="noopener noreferrer"
        >
          More on GitHub ↗
        </a>
      </section>
      <section className="work-experience" aria-labelledby="experience">
        <div className="section-heading">
          <span className="eyebrow">The background</span>
          <h2 id="experience">Where I've worked.</h2>
        </div>
        {experience.map((job) => (
          <article className="experience-row" key={job.org}>
            <div>
              <span className="eyebrow">{job.year}</span>
              <h3>{job.org}</h3>
              <p>{job.role}</p>
            </div>
            <div>
              <p>{job.summary}</p>
              <details>
                <summary>Responsibilities and work</summary>
                <ul>
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <div className="project-tags">
                  {job.stack.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </details>
              {(caseStudies[job.org] ?? []).map((study) => (
                <Link
                  className="story-link"
                  key={study.slug}
                  to={`/work/${study.slug}`}
                >
                  {study.title} ↗
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
