import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { navRights } from '@/components/layout/navigation'
import { getFindAllUsersQueryOptions } from '@/hooks/data/users'
import { paginationSearchParamsSchema } from '@/lib/pagination'
import { requireRights } from '@/lib/route-guards'
import { UsersListPage } from '@/pages/users/users-list-page'

const usersSearchSchema = paginationSearchParamsSchema.extend({
  name: z.string().optional(),
  email: z.string().optional(),
  roles: z.array(z.string()).optional(),
  sort: z.string().optional().default('email,asc'),
})

export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: ({ context: { queryClient } }) =>
    requireRights(queryClient, navRights('/users')),
  component: UsersListPage,
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(
      getFindAllUsersQueryOptions({
        page: deps.page,
        size: deps.size,
        sort: [deps.sort],
        name: deps.name,
        email: deps.email,
        roles: deps.roles,
      }),
    ),
})
