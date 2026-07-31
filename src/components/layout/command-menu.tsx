import { useNavigate, type LinkProps } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { flattenNavItems, useNavItems } from '@/components/layout/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { usePermissions } from '@/hooks/use-permissions'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({
  open,
  onOpenChange,
}: CommandMenuProps): React.ReactElement {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const navigate = useNavigate()

  const items = flattenNavItems(useNavItems()).filter(item => can(item.rights))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  function handleSelect(to: LinkProps['to']): void {
    onOpenChange(false)
    void navigate({ to })
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('search.title')}
      description={t('search.placeholder')}
    >
      <CommandInput placeholder={t('search.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('search.nothingFound')}</CommandEmpty>
        <CommandGroup heading={t('search.groupNavigation')}>
          {items.map(item => (
            <CommandItem
              key={item.to}
              value={item.breadcrumbLabel}
              onSelect={() => handleSelect(item.to)}
            >
              <item.icon />
              <span>{item.breadcrumbLabel}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
