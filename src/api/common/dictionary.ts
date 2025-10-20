/**
 * 字典相关API
 */

/**
 * 字典项数据结构
 */
export interface DictionaryItem {
  name: string // 显示名称
  value: string // 实际值
  weight: number // 权重/排序
}

/**
 * 字典组数据结构
 */
export interface DictionaryGroup {
  name: string // 字典组名称
  code: string | null // 字典组编码
  weight: number // 权重
  list: DictionaryItem[] // 字典项列表
}

/**
 * 获取字典组的请求参数
 */
export interface GetDicGroupParams {
  code: string // 字典编码
}

/**
 * 获取字典组的响应数据
 */
export interface GetDicGroupResponse {
  result: number
  msg: string
  data: DictionaryGroup
}

/**
 * 获取字典组数据
 * @param params 包含code的参数
 * @returns 返回字典组数据
 */
export async function getDicGroupApi(params: GetDicGroupParams): Promise<DictionaryGroup> {
  const response = await usePost<DictionaryGroup>('/admin/api/dic/getDicGroup', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('获取字典数据失败')
}

/**
 * 根据项目类型获取对应的字典编码
 * @param projectType 项目类型：1-全栈环境 2-JupyterNotebook 3-JupyterLab
 * @returns 字典编码
 */
export function getEnvironmentDicCode(projectType: number): string {
  const codeMap: Record<number, string> = {
    1: 'project#environment_1', // 全栈环境实训项目
    2: 'project#environment_2', // JupyterNotebook环境实训项目
    3: 'project#environment_3', // JupyterLab环境实训项目
  }
  return codeMap[projectType] || ''
}

