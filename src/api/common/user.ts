export interface UserInfo {
  id?: number | string
  username?: string
  nickname?: string
  avatar?: string
  roles?: (string | number)[]
  permissions?: string[]
  orgName: string
  gender: number
  isCtnEduRequire: number
  tenantOrgName: string
  regDate: string
  remark: string
  birthDate: string
  operatorName: string
  userID: string
  orgID: number
  token: string
  canManage: number
  isCpc: number
  tenantName: string
  createTime: string
  empCode: string
  shixun: {
    roles: string[]
    menus: string[]
  }
  lastModifyTime: string
  tenantOrgId: number
  tenantId: number
  orgSEQ: string
  operatorID: number
  isreal: number
  status: number
}

export function getUserInfoApi(params?: any) {
  return usePost<UserInfo>('/web/api/user/info', params, {
    customDev: true,
  })
}
