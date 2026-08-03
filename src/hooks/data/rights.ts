import {
  useSuspenseQuery,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query'

import type { FindAll5Error, PageRight } from '@/generated/client'
import { findAll5Options } from '@/generated/client/@tanstack/react-query.gen'
import { authenticatedClient } from '@/lib/auth-store'

interface ListOptions {
  page: number
  size: number
  sort?: string[]
}

const DEFAULT_RIGHTS_SORT = ['authority,asc']

export function getFindAllRightsQueryOptions(
  options: ListOptions,
): ReturnType<typeof findAll5Options> {
  const { page, size, sort } = options
  return findAll5Options({
    client: authenticatedClient,
    query: { page, size, sort: sort ?? DEFAULT_RIGHTS_SORT },
  })
}

/** Paginated rights — for the rights matrix. */
export function useFindAllRights(
  options: ListOptions,
): UseSuspenseQueryResult<PageRight, FindAll5Error> {
  return useSuspenseQuery(getFindAllRightsQueryOptions(options))
}

/** All rights (single large page) — for the role rights selection. */
export function useAllRights(): UseSuspenseQueryResult<
  PageRight,
  FindAll5Error
> {
  return useSuspenseQuery(
    findAll5Options({
      client: authenticatedClient,
      query: { page: 0, size: 1000, sort: ['authority,asc'] },
    }),
  )
}
