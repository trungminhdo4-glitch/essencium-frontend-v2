import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import { getRouteApi } from '@tanstack/react-router'
import type { ColumnDef, SortingState, Updater } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { Checkbox } from '@/components/ui/checkbox'
import { LinkButton } from '@/components/ui/link-button'
import { Right } from '@/generated/client'
import { useFindAllRights } from '@/hooks/data/rights'
import { useAllRoles, useUpdateRoleRights } from '@/hooks/data/roles'
import { parseSort, serializeSort } from '@/lib/pagination'

const route = getRouteApi('/_authenticated/rights')

export function RightsPage(): React.ReactElement {
  const { t } = useTranslation()
  const { page, size, sort } = route.useSearch()
  const navigate = route.useNavigate()

  const { data: allRights } = useFindAllRights({
    page,
    size,
    sort: sort ? [sort] : undefined,
  })

  const { data: allRoles } = useAllRoles()
  const { mutateAsync: updateRoleRights, isPending } = useUpdateRoleRights()

  const roleRightSets = new Map(
    allRoles?.content?.map(role => [
      role.id,
      new Set(role?.rights?.map(r => r.authority)),
    ]),
  )

  function handleRoleRightsUpdate(
    roleName: string,
    authorityToUpdate: string,
    nextChecked: boolean,
  ): void {
    const role = allRoles.content?.find(r => r.name === roleName)
    if (!role) return

    const currentAuthorities = role.rights?.map(right => right.authority) ?? []
    const authorityPayload = nextChecked
      ? [...currentAuthorities, authorityToUpdate]
      : currentAuthorities.filter(a => a !== authorityToUpdate)

    void updateRoleRights(
      { name: roleName, authorities: authorityPayload },
      {
        onSuccess: () => toast.success(t('rights.updateSuccess')),
        onError: () => toast.error(t('rights.updateError')),
      },
    )
  }

  const roleColumns: ColumnDef<Right>[] =
    allRoles.content?.map(role => ({
      id: role.id ?? role.name,
      header: role.name,
      cell: row => {
        const isChecked =
          roleRightSets.get(role.id)?.has(row.row.original.authority) ?? false
        const isDisabled =
          !role.editable || role.systemRole || role.protected || isPending
        return (
          <Checkbox
            checked={isChecked}
            disabled={isDisabled}
            className={isDisabled ? 'cursor-not-allowed' : ''}
            onCheckedChange={nextChecked =>
              handleRoleRightsUpdate(
                role.name,
                row.row.original.authority,
                nextChecked,
              )
            }
          />
        )
      },
      enableSorting: false,
    })) || []

  const columns: ColumnDef<Right>[] = [
    {
      accessorKey: 'authority',
      header: t('rights.authority'),
      cell: info => info.getValue(),
      enableSorting: true,
      enablePinning: true,
    },
    ...roleColumns,
  ]

  const sorting = parseSort(sort)

  function onSortingChange(updater: Updater<SortingState>): void {
    const next = typeof updater === 'function' ? updater(sorting) : updater

    void navigate({
      search: prev => ({
        ...prev,
        sort: serializeSort(next),
        page: 0,
      }),
    })
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('rights.title')} />
      <DataTable
        columns={columns}
        data={allRights.content ?? []}
        currentPage={page}
        totalPages={allRights.totalPages ?? 0}
        totalElements={allRights.totalElements ?? 0}
        onSortingChange={onSortingChange}
        sorting={sorting}
        pinnedColumns={['authority']}
        renderPreviousPageButton={({ disabled }) => (
          <LinkButton
            variant="outline"
            size="sm"
            disabled={disabled}
            to="/rights"
            search={prev => ({ ...prev, page: Math.max(0, page - 1), size })}
          >
            <RiArrowLeftSLine className="size-4" />
          </LinkButton>
        )}
        renderNextPageButton={({ disabled }) => (
          <LinkButton
            variant="outline"
            size="sm"
            disabled={disabled}
            to="/rights"
            search={prev => ({
              ...prev,
              page: Math.min((allRights.totalPages ?? 1) - 1, page + 1),
              size,
            })}
          >
            <RiArrowRightSLine className="size-4" />
          </LinkButton>
        )}
      />
    </div>
  )
}
