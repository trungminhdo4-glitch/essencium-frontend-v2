import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

import { getMeOptions } from '@/generated/client/@tanstack/react-query.gen'
import { authenticatedClient } from '@/lib/auth-store'
import { getUserRights, hasRequiredRights, type Right } from '@/lib/permissions'

export async function requireRights(
  queryClient: QueryClient,
  rights: Right | readonly Right[] | undefined,
): Promise<void> {
  if (rights === undefined) return
  const user = await queryClient.ensureQueryData(
    getMeOptions({ client: authenticatedClient }),
  )
  if (!hasRequiredRights(getUserRights(user), rights)) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/' })
  }
}
