import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { publicRoutes } from './shared/utils/routes'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/mdc',
    '@nuxtjs/plausible',
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
  },

  css: [
    join(currentDir, './app/assets/css/main.css'),
  ],

  content: {
    highlight: {
      theme: 'github-dark',
    },
    markdown: {
      anchorLinks: false,
      toc: {
        depth: 2,
      },
    },
  },

  mdc: {
    // highlight: {
    //   theme: 'github-dark',
    //   // shikiEngine: 'javascript',
    // },
    components: {
      map: {
        code: 'CustomProseCode',
        pre: 'CustomProsePre',
      },
    },
  },

  runtimeConfig: {
    openaiApiKey: '',
    anthropicApiKey: '',
    perplexityApiKey: '',
    geminiApiKey: '',
    supadataApiKey: '',
    youtubeApiKey: '',
    public: {
      appUrl: process.env.CF_PAGES_URL,
    },
  },

  routeRules: {
    // '/': { prerender: true }, // do not prerender the home page, it would not allow redirects
    '/about': { prerender: true },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  nitro: {
    routeRules: {
      // '/api/chats/suggestions': { cache: { maxAge: 60 * 60 } },
    },
  },

  typescript: {
    strict: false,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  ogImage: {
    fonts: [
      'JetBrains+Mono:400',
      'JetBrains+Mono:700',
    ],
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: publicRoutes,
      cookieRedirect: true,
    },
  },

  tailwindcss: {
    cssPath: join(currentDir, './app/assets/css/tailwind.css'),
  },
})
