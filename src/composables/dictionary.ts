/**
 * 字典数据管理 Composable
 * 用于统一管理和缓存字典数据
 */
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getDicGroupApi, type DictionaryItem } from '@/api/common/dictionary'

// 字典数据缓存
const dictionaryCache = ref<Record<string, DictionaryItem[]>>({})

// 加载状态缓存
const loadingStates = ref<Record<string, boolean>>({})

/**
 * 字典编码常量
 */
export const DIC_CODES = {
  // 项目难度
  DIFFICULTY: 'project#difficulty',
  // 小类别
  SUBCATEGORY: 'project#subcategory',
  // 领域类别
  FIELD_CATEGORY: 'project#fieldcategory',
  // 附带环境
  COLLATERAL_ENVIRONMENT: 'project#collateralenvironment',
  // 编程语言
  PROGRAMMING_LANGUAGE: 'project#programminglanguage',
  // 实验环境 - 全栈
  ENVIRONMENT_FULL_STACK: 'project#environment_1',
  // 实验环境 - JupyterNotebook
  ENVIRONMENT_JUPYTER_NOTEBOOK: 'project#environment_2',
  // 实验环境 - JupyterLab
  ENVIRONMENT_JUPYTER_LAB: 'project#environment_3',
} as const

/**
 * 使用字典数据
 * @param code 字典编码
 * @returns 字典数据、加载状态、刷新方法
 */
export function useDictionary(code: string) {
  // 获取字典数据
  const data = computed(() => dictionaryCache.value[code] || [])
  
  // 获取加载状态
  const loading = computed(() => loadingStates.value[code] || false)
  
  // 获取选项列表（用于 Select 组件）
  const options = computed(() => {
    return data.value.map(item => ({
      label: item.name,
      value: item.value,
    }))
  })
  
  /**
   * 加载字典数据
   * @param force 是否强制刷新（忽略缓存）
   */
  const load = async (force = false) => {
    // 如果已有缓存且不强制刷新，直接返回
    if (!force && dictionaryCache.value[code]?.length > 0) {
      return
    }
    
    try {
      loadingStates.value[code] = true
      const result = await getDicGroupApi({ code })
      
      if (result && result.list) {
        dictionaryCache.value[code] = result.list
      }
    } catch (error) {
      console.error(`加载字典失败 [${code}]:`, error)
      message.error(`加载字典失败 [${code}]`)
    } finally {
      loadingStates.value[code] = false
    }
  }
  
  /**
   * 根据 value 查找字典项
   */
  const findByValue = (value: string) => {
    return data.value.find(item => item.value === value)
  }
  
  /**
   * 根据 value 获取 name
   */
  const getNameByValue = (value: string) => {
    return findByValue(value)?.name || ''
  }
  
  return {
    data,
    loading,
    options,
    load,
    findByValue,
    getNameByValue,
  }
}

/**
 * 批量加载字典数据
 * @param codes 字典编码数组
 */
export async function loadDictionaries(codes: string[]) {
  const promises = codes.map(code => {
    const { load } = useDictionary(code)
    return load()
  })
  
  await Promise.all(promises)
}

/**
 * 清除字典缓存
 * @param code 字典编码，不传则清除所有缓存
 */
export function clearDictionaryCache(code?: string) {
  if (code) {
    delete dictionaryCache.value[code]
  } else {
    dictionaryCache.value = {}
  }
}

/**
 * 预定义的常用字典 hooks
 */

// 项目难度
export function useDifficultyDictionary() {
  return useDictionary(DIC_CODES.DIFFICULTY)
}

// 小类别
export function useSubcategoryDictionary() {
  return useDictionary(DIC_CODES.SUBCATEGORY)
}

// 领域类别
export function useFieldCategoryDictionary() {
  return useDictionary(DIC_CODES.FIELD_CATEGORY)
}

// 附带环境
export function useCollateralEnvironmentDictionary() {
  return useDictionary(DIC_CODES.COLLATERAL_ENVIRONMENT)
}

// 编程语言
export function useProgrammingLanguageDictionary() {
  return useDictionary(DIC_CODES.PROGRAMMING_LANGUAGE)
}

// 实验环境（根据项目类型）
export function useEnvironmentDictionary(projectType: number) {
  const codeMap: Record<number, string> = {
    1: DIC_CODES.ENVIRONMENT_FULL_STACK,
    2: DIC_CODES.ENVIRONMENT_JUPYTER_NOTEBOOK,
    3: DIC_CODES.ENVIRONMENT_JUPYTER_LAB,
  }
  const code = codeMap[projectType] || DIC_CODES.ENVIRONMENT_FULL_STACK
  return useDictionary(code)
}

