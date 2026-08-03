import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { getMeOptions } from '@/generated/client/@tanstack/react-query.gen'
import { getFindAllRightsQueryOptions } from '@/hooks/data/rights'
import { getAllRolesQueryOptions } from '@/hooks/data/roles'
import { authenticatedClient } from '@/lib/auth-store'
import { paginationSearchParamsSchema } from '@/lib/pagination'
import { getUserRights, hasRequiredRights, RIGHTS } from '@/lib/permissions'
import { RightsPage } from '@/pages/rights/rights-page'

export const extendedPaginationSearchSchema =
  paginationSearchParamsSchema.extend({
    sort: z.string().optional(),
  })

export const Route = createFileRoute('/_authenticated/rights')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(
      getMeOptions({ client: authenticatedClient }),
    )
    const rights = getUserRights(user)
    const allowed =
      hasRequiredRights(rights, RIGHTS.ROLE_UPDATE) &&
      hasRequiredRights(rights, RIGHTS.RIGHT_READ)
    if (!allowed) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/' })
    }
  },
  component: RightsPage,
  validateSearch: extendedPaginationSearchSchema,
  loaderDeps: ({ search: { page, size, sort } }) => ({ page, size, sort }),
  loader: ({ context: { queryClient }, deps: { page, size, sort } }) => {
    // Roles are the matrix columns — always the full set, never paginated
    // alongside the rights rows.
    void queryClient.ensureQueryData(getAllRolesQueryOptions())
    void queryClient.ensureQueryData(
      getFindAllRightsQueryOptions({
        page,
        size,
        ...(sort ? { sort: [sort] } : {}),
      }),
    )
  },
})
