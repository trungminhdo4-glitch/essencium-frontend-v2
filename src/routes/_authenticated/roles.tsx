import { createFileRoute } from '@tanstack/react-router'

import { navRights } from '@/components/layout/navigation'
import { getFindAllRolesQueryOptions } from '@/hooks/data/roles'
import { paginationSearchParamsSchema } from '@/lib/pagination'
import { requireRights } from '@/lib/route-guards'
import { RolesListPage } from '@/pages/roles/roles-list-page'

export const Route = createFileRoute('/_authenticated/roles')({
  beforeLoad: ({ context: { queryClient } }) =>
    requireRights(queryClient, navRights('/roles')),
  component: RolesListPage,
  validateSearch: paginationSearchParamsSchema,
  loaderDeps: ({ search: { page, size } }) => ({ page, size }),
  loader: ({ context: { queryClient }, deps: { page, size } }) =>
    queryClient.ensureQueryData(
      getFindAllRolesQueryOptions({ page, size, sort: ['name,asc'] }),
    ),
})
