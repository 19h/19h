import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fallback, link, main, top } from '../src/render';
import type { StatsData } from '../src/types';

const MAX_YEARS = 3;
const OUT_DIR = 'svg';

async function build() {
  const raw = await readFile('src/stats.json', 'utf-8');
  const data: StatsData = JSON.parse(raw);

  await mkdir(OUT_DIR, { recursive: true });

  const themes = ['light', 'dark'] as const;
  const files: [string, string][] = [];

  for (const theme of themes) {
    // Top bar
    const { contributions } = data;
    files.push([`top-${theme}.svg`, top({ height: 20, contributions, theme })]);

    // Links
    const links = [
      { name: 'website', label: 'Website', index: 0 },
      { name: 'twitter', label: 'Twitter', index: 1 },
      { name: 'linkedin', label: 'LinkedIn', index: 2 }
    ];
    for (const l of links) {
      files.push([
        `link-${l.name}-${theme}.svg`,
        link({ height: 18, width: 100, index: l.index, theme })(l.label)
      ]);
    }

    // Main section
    const years = data.years.slice(0, MAX_YEARS);
    const options = {
      dots: { rows: 6, size: 24, gap: 5 },
      year: { gap: 5 }
    };

    const sizes = years.map((year) => {
      const columns = Math.ceil(year.days.length / options.dots.rows);
      const width = columns * options.dots.size + (columns - 1) * options.dots.gap;
      const height =
        options.dots.rows * options.dots.size + (options.dots.rows - 1) * options.dots.gap;
      return [width, height];
    });

    const length =
      sizes.reduce((acc, size) => {
        acc += size[0] + options.year.gap;
        return acc;
      }, 0) - options.year.gap;

    files.push([
      `main-${theme}.svg`,
      main({
        height: 350,
        years,
        sizes,
        length,
        location: { city: '', country: '' },
        theme,
        ...options
      })
    ]);

    // Fallback (Firefox)
    files.push([`fallback-${theme}.svg`, fallback({ height: 180, width: 420, theme })]);
  }

  for (const [name, content] of files) {
    await writeFile(`${OUT_DIR}/${name}`, content);
    console.log(`  ${name}`);
  }

  console.log(`\nWrote ${files.length} SVGs to ${OUT_DIR}/`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
