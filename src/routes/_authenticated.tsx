import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ContentError, RouteError } from '@/components/error-fallback'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { CommandMenu } from '@/components/layout/command-menu'
import { ContentSpinner, FullPageSpinner } from '@/components/spinner'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getAccessToken, waitForAuth } from '@/lib/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    await waitForAuth()
    if (!getAccessToken()) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
  pendingComponent: FullPageSpinner,
  errorComponent: RouteError,
})

function AuthenticatedLayout(): React.ReactElement {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader onOpenSearch={() => setSearchOpen(true)} />
        <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
        <ErrorBoundary FallbackComponent={ContentError}>
          <Suspense fallback={<ContentSpinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </SidebarInset>
    </SidebarProvider>
  )
}
