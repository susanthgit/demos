import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// demos.aguidetocloud.com — interactive customer demo decks.
// Static output, zero CDN: everything bundled at build so demos run on dead
// customer wifi / air-gapped rooms (the whole point — see HANDOFF-scaffold.md).
export default defineConfig({
  site: 'https://demos.aguidetocloud.com',
  output: 'static',
  integrations: [mdx()],
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  compressHTML: true,
  trailingSlash: 'ignore',
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
