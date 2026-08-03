import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationResult,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query'

import type {
  Create1Data,
  Create1Error,
  Create1Response,
  Delete1Data,
  Delete1Error,
  Delete1Response,
  FindAll1Error,
  Options,
  PageRole,
  Update2Error,
  Update2Response,
  UpdateObjectData,
  UpdateObjectError,
  UpdateObjectResponse,
} from '@/generated/client'
import { update2 } from '@/generated/client'
import {
  create1Mutation,
  delete1Mutation,
  findAll1Options,
  findAll1QueryKey,
  updateObjectMutation,
} from '@/generated/client/@tanstack/react-query.gen'
import { authenticatedClient } from '@/lib/auth-store'

interface ListOptions {
  page: number
  size: number
  sort?: string[]
}

export function getFindAllRolesQueryOptions(
  options: ListOptions,
): ReturnType<typeof findAll1Options> {
  return findAll1Options({ client: authenticatedClient, query: options })
}

export function useFindAllRoles(
  options: ListOptions,
): UseSuspenseQueryResult<PageRole, FindAll1Error> {
  return useSuspenseQuery(getFindAllRolesQueryOptions(options))
}

/** All roles (single large page) — for select inputs and the rights matrix columns. */
export function getAllRolesQueryOptions(): ReturnType<typeof findAll1Options> {
  return findAll1Options({
    client: authenticatedClient,
    query: { page: 0, size: 1000, sort: ['name,asc'] },
  })
}

/** All roles (single large page) — for select inputs. */
export function useAllRoles(): UseSuspenseQueryResult<PageRole, FindAll1Error> {
  return useSuspenseQuery(getAllRolesQueryOptions())
}

function useInvalidateRoles(): () => void {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({
      queryKey: findAll1QueryKey({ client: authenticatedClient }),
    })
  }
}

export function useCreateRole(): UseMutationResult<
  Create1Response,
  Create1Error,
  Options<Create1Data>
> {
  const invalidate = useInvalidateRoles()
  return useMutation({
    ...create1Mutation({ client: authenticatedClient }),
    onSuccess: invalidate,
  })
}

export function useUpdateRole(): UseMutationResult<
  UpdateObjectResponse,
  UpdateObjectError,
  Options<UpdateObjectData>
> {
  const invalidate = useInvalidateRoles()
  return useMutation({
    ...updateObjectMutation({ client: authenticatedClient }),
    onSuccess: invalidate,
  })
}

export function useDeleteRole(): UseMutationResult<
  Delete1Response,
  Delete1Error,
  Options<Delete1Data>
> {
  const invalidate = useInvalidateRoles()
  return useMutation({
    ...delete1Mutation({ client: authenticatedClient }),
    onSuccess: invalidate,
  })
}

export interface UpdateRoleRightsVariables {
  // path param is role name not id
  name: string
  authorities: string[]
}

export function useUpdateRoleRights(): UseMutationResult<
  Update2Response,
  Update2Error,
  UpdateRoleRightsVariables
> {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: async ({ name, authorities }) => {
      const { data } = await update2({
        client: authenticatedClient,
        path: { name },
        body: { rights: authorities },
        throwOnError: true,
      })
      return data
    },
    onSuccess: invalidate,
  })
}
