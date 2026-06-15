// Type augmentation for nuxt-auth-utils session
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    username: string
    name: string
    avatar: string
  }

  interface UserSession {
    user?: User
    admin?: boolean
  }
}

export {}
