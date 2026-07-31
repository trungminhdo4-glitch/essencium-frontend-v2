import { RiSearchLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface AppHeaderProps {
  onOpenSearch: () => void
}

export function AppHeader({
  onOpenSearch,
}: AppHeaderProps): React.ReactElement {
  const { t } = useTranslation()

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          aria-label={t('search.buttonLabel')}
          className="text-muted-foreground gap-2 font-normal"
        >
          <RiSearchLine className="size-4" />
          <span className="hidden sm:inline">{t('search.placeholder')}</span>
          <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}
