import { Fragment } from "react";
import {
  safeUrl,
  type PublicContent,
  type ContentPayload,
} from "../editor/types";

function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => (
        <Fragment key={i}>
          {part.startsWith("**") ? (
            <strong>{part.slice(2, -2)}</strong>
          ) : part.startsWith("`") ? (
            <code>{part.slice(1, -1)}</code>
          ) : (
            part
          )}
        </Fragment>
      ))}
    </>
  );
}
export function ArticleBody({ body }: { body: string }) {
  return (
    <div className="owner-preview-body">
      {body
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((block, i) => {
          const image = /^!\[([^\]]+)\]\(([^)]+)\)$/.exec(block.trim());
          if (image && safeUrl(image[2], true))
            return (
              <figure key={i}>
                <img src={image[2]} alt={image[1]} loading="lazy" />
                <figcaption>{image[1]}</figcaption>
              </figure>
            );
          if (block.startsWith("### "))
            return <h3 key={i}>{block.slice(4)}</h3>;
          if (block.startsWith("## "))
            return (
              <h2 key={i} id={`section-${i}`}>
                {block.slice(3)}
              </h2>
            );
          if (block.split("\n").every((line) => line.startsWith("- ")))
            return (
              <ul key={i}>
                {block.split("\n").map((line, j) => (
                  <li key={j}>
                    <InlineText text={line.slice(2)} />
                  </li>
                ))}
              </ul>
            );
          return (
            <p key={i}>
              <InlineText text={block} />
            </p>
          );
        })}
    </div>
  );
}
