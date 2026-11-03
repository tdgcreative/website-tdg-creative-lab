export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function estimateReadingTime(markdown: string): number {
  const words = markdown
    .replace(/[#*`>_~\[\]()!-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function formatInlineMarkdown(text: string): string {
  let out = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Images: ![alt](src)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_m, alt, src) =>
      `<figure class="my-8"><img src="${src}" alt="${alt || 'Blog illustration'}" loading="lazy" class="w-full rounded-2xl border border-brand-dark/10 shadow-md object-cover" />${
        alt ? `<figcaption class="text-xs text-brand-dark/55 mt-2.5 text-center italic">${alt}</figcaption>` : ''
      }</figure>`
  );

  // Links: [label](href)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    const isExternal = /^https?:\/\//i.test(href) && !href.includes('thedigitalgrounds.com');
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${attrs} class="text-brand-orange font-bold underline decoration-brand-orange/40 underline-offset-4 hover:decoration-brand-orange transition-colors">${label}</a>`;
  });

  // Bold & Italic
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-brand-dark">$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="bg-brand-dark/10 text-brand-dark px-1.5 py-0.5 rounded text-[0.9em] font-mono">$1</code>');

  return out;
}

export function renderMarkdownWithToc(markdown: string): { html: string; toc: TocItem[]; readingTime: number } {
  const lines = (markdown || '').replace(/\r\n/g, '\n').split('\n');
  const toc: TocItem[] = [];
  const htmlBlocks: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Heading H2 / H3 / H4
    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      const cleanText = h3Match[1].replace(/\*\*|\*/g, '').trim();
      const id = slugifyHeading(cleanText) || `section-${toc.length + 1}`;
      toc.push({ id, text: cleanText, level: 3 });
      htmlBlocks.push(
        `<h3 id="${id}" class="scroll-mt-28 text-xl sm:text-2xl font-black uppercase tracking-tight text-brand-dark mt-8 mb-3">${formatInlineMarkdown(h3Match[1])}</h3>`
      );
      i++;
      continue;
    }

    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      const cleanText = h2Match[1].replace(/\*\*|\*/g, '').trim();
      const id = slugifyHeading(cleanText) || `section-${toc.length + 1}`;
      toc.push({ id, text: cleanText, level: 2 });
      htmlBlocks.push(
        `<h2 id="${id}" class="scroll-mt-28 text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-dark mt-10 mb-4 pt-2 border-t border-brand-dark/10">${formatInlineMarkdown(h2Match[1])}</h2>`
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      htmlBlocks.push(
        `<blockquote class="my-6 pl-5 sm:pl-6 py-4 pr-5 bg-white border-l-4 border-brand-orange rounded-r-2xl shadow-sm text-brand-dark/90 font-semibold italic leading-relaxed">${formatInlineMarkdown(
          quoteLines.join(' ')
        )}</blockquote>`
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      htmlBlocks.push(
        `<ul class="my-5 space-y-2.5 pl-1">${items
          .map(
            (item) =>
              `<li class="flex items-start gap-3 text-brand-dark/85 leading-relaxed"><span class="w-2 h-2 rounded-full bg-brand-orange mt-2.5 shrink-0"></span><span>${formatInlineMarkdown(
                item
              )}</span></li>`
          )
          .join('')}</ul>`
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      htmlBlocks.push(
        `<ol class="my-5 space-y-3 pl-1">${items
          .map(
            (item, idx) =>
              `<li class="flex items-start gap-3 text-brand-dark/85 leading-relaxed"><span class="w-6 h-6 rounded-full bg-brand-dark text-white text-xs font-black flex items-center justify-center mt-0.5 shrink-0">${
                idx + 1
              }</span><span>${formatInlineMarkdown(item)}</span></li>`
          )
          .join('')}</ol>`
      );
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{2,3}\s|>|[-*]\s|\d+\.\s)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    htmlBlocks.push(
      `<p class="my-4 text-base sm:text-lg text-brand-dark/85 leading-relaxed">${formatInlineMarkdown(
        paraLines.join(' ')
      )}</p>`
    );
  }

  return {
    html: htmlBlocks.join('\n'),
    toc,
    readingTime: estimateReadingTime(markdown)
  };
}

