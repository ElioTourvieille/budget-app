import { Fragment, type ReactNode } from 'react';

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
      ),
    );
}

// Rend le sous-ensemble markdown produit par le system prompt de l'insight IA
// (titres ##, listes -, gras **) — pas un parseur markdown générique.
export function InsightMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList(key: string) {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="list-disc pl-5 space-y-1">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-li-${i}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2));
      return;
    }

    flushList(`list-${idx}`);

    if (!line) return;

    if (line.startsWith('## ')) {
      blocks.push(
        <h4 key={idx} className="font-semibold text-sm mt-4 first:mt-0">
          {renderInline(line.slice(3), `h-${idx}`)}
        </h4>,
      );
      return;
    }

    blocks.push(
      <p key={idx} className="text-sm leading-relaxed">
        {renderInline(line, `p-${idx}`)}
      </p>,
    );
  });

  flushList('list-end');

  return <div className="space-y-2">{blocks}</div>;
}
