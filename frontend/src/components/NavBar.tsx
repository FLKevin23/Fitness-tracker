import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',        label: 'Dashboard', icon: '📊' },
  { to: '/pantry',  label: 'Pantry',    icon: '🥗' },
  { to: '/meals',   label: 'Meals',     icon: '🍽️' },
  { to: '/log',     label: 'Log',       icon: '✏️' },
  { to: '/profile', label: 'Profile',   icon: '⚙️' },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 min-h-screen bg-gray-900 text-white flex-col flex-shrink-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-tight">FitTracker</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl leading-none mb-0.5">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
