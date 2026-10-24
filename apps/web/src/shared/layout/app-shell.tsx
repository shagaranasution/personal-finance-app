import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { IconMinimizeMenu } from '@/shared/components/icons/IconMinimizeMenu'
import { navigationItems, type NavigationItem } from '@/shared/navigation/navigation-items'

interface NavigationLinkProps {
  item: NavigationItem
  collapsed?: boolean
  compact?: boolean
}

function NavigationLink({ item, collapsed = false, compact = false }: NavigationLinkProps) {
  const { Icon, label, to } = item

  return (
    <NavLink
      aria-label={collapsed || compact ? label : undefined}
      className={({ isActive }) => {
        if (compact) {
          return [
            'flex h-full flex-1 items-center justify-center border-t-4 border-transparent text-grey-300',
            'focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white',
            'tablet:flex-col tablet:gap-100 tablet:pt-150',
            isActive ? 'border-green bg-beige-100 tablet:text-grey-900' : '',
          ].join(' ')
        }

        return [
          'flex h-14 items-center text-grey-300 transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white',
          collapsed ? 'justify-center px-200' : 'gap-200 px-400',
          isActive
            ? 'border-l-4 border-green bg-beige-100 text-grey-900'
            : 'border-l-4 border-transparent hover:bg-grey-500/20',
        ].join(' ')
      }}
      end={to === '/'}
      to={to}
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-green' : ''}>
            <Icon />
          </span>
          <span
            className={[
              'text-preset-3',
              compact ? 'hidden tablet:block tablet:text-preset-5-bold' : '',
              collapsed ? 'sr-only' : '',
            ].join(' ')}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={[
        'hidden shrink-0 flex-col overflow-hidden rounded-r-200 bg-grey-900 pb-300 transition-[width]',
        'desktop:sticky desktop:top-0 desktop:flex desktop:h-screen',
        collapsed ? 'desktop:w-[88px]' : 'desktop:w-[300px]',
      ].join(' ')}
    >
      <div
        className={['flex h-[133px] items-center', collapsed ? 'justify-center' : 'px-400'].join(
          ' ',
        )}
      >
        <img
          alt="finance"
          className={collapsed ? 'h-auto w-6' : 'h-auto w-[121px]'}
          src={collapsed ? '/assets/images/logo-small.svg' : '/assets/images/logo-large.svg'}
        />
      </div>

      <nav aria-label="Primary navigation" className={collapsed ? 'w-full' : 'w-[276px]'}>
        <ul className="flex flex-col gap-50">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavigationLink collapsed={collapsed} item={item} />
            </li>
          ))}
        </ul>
      </nav>

      <button
        aria-expanded={!collapsed}
        className={[
          'mt-auto flex h-14 items-center text-grey-300 hover:bg-grey-500/20',
          'focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white',
          collapsed ? 'justify-center px-200' : 'gap-200 px-400',
        ].join(' ')}
        onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
        type="button"
      >
        <IconMinimizeMenu />
        <span className={collapsed ? 'sr-only' : 'text-preset-3'}>Minimize Menu</span>
        <span className="sr-only">{collapsed ? 'Expand navigation' : 'Collapse navigation'}</span>
      </button>
    </aside>
  )
}

function BottomNavigation() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-10 h-[52px] rounded-t-100 bg-grey-900 tablet:h-[74px] desktop:hidden"
    >
      <ul className="flex h-full">
        {navigationItems.map((item) => (
          <li className="flex flex-1" key={item.to}>
            <NavigationLink compact item={item} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function AppShell() {
  return (
    <div className="min-h-screen desktop:flex">
      <DesktopSidebar />
      <main className="min-w-0 flex-1 px-200 py-300 pb-[76px] tablet:px-500 tablet:py-400 tablet:pb-[106px] desktop:pb-400">
        <div className="mx-auto w-full max-w-[1440px]">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  )
}
