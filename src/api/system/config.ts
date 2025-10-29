/**
 * 系统配置相关接口
 */

/**
 * 系统配置查询参数
 */
interface SysConfigQueryParams {
  code: string
}

/**
 * 系统配置更新参数
 */
interface SysConfigUpdateParams {
  config: string
  keyName: string
}

/**
 * 系统配置返回数据
 */
interface SysConfigResult {
  code?: string
  keyName?: string
  config?: string
  createTime?: string
  updateTime?: string
}

/**
 * 根据code查询系统配置
 */
export async function getSysConfigByCodeApi(params: SysConfigQueryParams) {
  return usePost<SysConfigResult>('/admin/api/sysConfig/getByCode', params, {
    customDev: true,
  })
}

/**
 * 更新系统配置
 */
export async function updateSysConfigByCodeApi(data: SysConfigUpdateParams) {
  return usePost('/admin/api/sysConfig/updateByCode', data, {
    customDev: true,
  })
}

export type {
  SysConfigQueryParams,
  SysConfigUpdateParams,
  SysConfigResult,
}

