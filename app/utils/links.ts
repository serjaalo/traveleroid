export interface NavLink {
  icon: string
  label: string
  to: string
}

export const navLinks: NavLink[] = [
  {
    icon: 'i-ion-image',
    label: 'Лента',
    to: '/'
  },
  {
    icon: 'i-ion-search',
    label: 'Поиск',
    to: '/search'
  },
  {
    icon: 'i-ion-chatbubbles',
    label: 'Чаты',
    to: '/chat'
  },
  {
    icon: 'i-ion-person',
    label: 'Профиль',
    to: '/profile'
  }
]
