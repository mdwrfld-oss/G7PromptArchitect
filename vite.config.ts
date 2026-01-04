import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // Required for GitHub Pages deployment
    // https://<username>.github.io/G7PromptArchitect/
    base: '/G7PromptArchitect/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    // NOTE:
    // This exposes the Gemini API key to the browser.
    // Safe ONLY if you accept that this key is public.
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
