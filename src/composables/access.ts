import { toArray } from '@v-c/utils'
import type { AccessEnum } from '~@/utils/constant'

export function useAccess() {
  const userStore = useUserStore()
  const roles = computed(() => userStore.roles)
  const permissions = computed(() => userStore.permissions)
  const hasAccess = (accessList: (string | number)[] | string | number | AccessEnum) => {
    const userPermissions = userStore.permissions
    const accessArr = toArray(accessList).flat(1)
    return accessArr.some(access => userPermissions?.includes(String(access)))
  }
  return {
    hasAccess,
    roles,
    permissions,
  }
}
