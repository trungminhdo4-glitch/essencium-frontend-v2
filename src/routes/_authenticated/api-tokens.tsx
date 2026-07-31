import { createFileRoute } from '@tanstack/react-router'

import { navRights } from '@/components/layout/navigation'
import { getFindAllApiTokensQueryOptions } from '@/hooks/data/api-tokens'
import { paginationSearchParamsSchema } from '@/lib/pagination'
import { requireRights } from '@/lib/route-guards'
import { ApiTokensListPage } from '@/pages/api-tokens/api-tokens-list-page'

export const Route = createFileRoute('/_authenticated/api-tokens')({
  beforeLoad: ({ context: { queryClient } }) =>
    requireRights(queryClient, navRights('/api-tokens')),
  component: ApiTokensListPage,
  validateSearch: paginationSearchParamsSchema,
  loaderDeps: ({ search: { page, size } }) => ({ page, size }),
  loader: ({ context: { queryClient }, deps: { page, size } }) =>
    queryClient.ensureQueryData(
      getFindAllApiTokensQueryOptions({ page, size }),
    ),
})
