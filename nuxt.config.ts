// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon',
    'nuxt-auth-utils',
  ],

  css: ['~/assets/css/main.css'],

  nitro: {
    storage: {
      db: {
        driver: 'fs',
        base: './server/db'
      },
      users: {
        driver: 'fs',
        base: './server/db/user'
      },
      posts: {
        driver: 'fs',
        base: './server/db/post'
      },
      reviews: {
        driver: 'fs',
        base: './server/db/review'
      },
      likes: {
        driver: 'fs',
        base: './server/db/like'
      },
      follows: {
        driver: 'fs',
        base: './server/db/follow'
      },
      chats: {
        driver: 'fs',
        base: './server/db/chat'
      },
      messages: {
        driver: 'fs',
        base: './server/db/message'
      },
      indexes: {
        driver: 'fs',
        base: './server/db/index'
      },
      companies: {
        driver: 'fs',
        base: './server/db/company'
      },
      companyKeys: {
        driver: 'fs',
        base: './server/db/companyKey'
      }
    }
  },

  routeRules: {
    '/': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD || '',
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      cookie: {
        // Allow cookie over plain HTTP (e.g. LAN access by IP).
        // For production behind HTTPS set NUXT_SESSION_COOKIE_SECURE=true.
        secure: false,
        sameSite: 'lax'
      }
    }
  },

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  future: {
    compatibilityVersion: 4
  }
})