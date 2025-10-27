# 字典 Hooks 使用示例

## 快速开始

### 1. 基础使用 - 预定义的字典

```typescript
import { useDifficultyDictionary } from '@/composables/dictionary'

// 在 setup 中使用
const difficulty = useDifficultyDictionary()

// 在 onMounted 中加载数据
onMounted(() => {
  difficulty.load()
})

// 在模板中使用
// 获取选项列表（用于 Select 组件）
difficulty.options.value

// 获取加载状态
difficulty.loading.value

// 获取原始数据
difficulty.data.value

// 根据 value 查找字典项
difficulty.findByValue('1')

// 根据 value 获取 name
difficulty.getNameByValue('1')
```

### 2. 在模板中使用

```vue
<template>
  <a-select
    v-model:value="formData.difficulty"
    placeholder="请选择难度"
    :options="difficulty.options.value"
    :loading="difficulty.loading.value"
  />
</template>
```

### 3. 使用自定义字典编码

```typescript
import { useDictionary } from '@/composables/dictionary'

const myDict = useDictionary('your#custom#code')

onMounted(() => {
  myDict.load()
})
```

## 预定义的字典 Hooks

```typescript
import {
  useDifficultyDictionary,           // 项目难度
  useSubcategoryDictionary,           // 小类别
  useFieldCategoryDictionary,         // 领域类别
  useCollateralEnvironmentDictionary, // 附带环境
  useProgrammingLanguageDictionary,   // 编程语言
  useEnvironmentDictionary,           // 实验环境（需要传入项目类型）
} from '@/composables/dictionary'

// 使用实验环境（需要传入项目类型）
const environment = computed(() => useEnvironmentDictionary(projectType.value))
```

## 字典编码常量

```typescript
import { DIC_CODES } from '@/composables/dictionary'

// 所有可用的字典编码
DIC_CODES.DIFFICULTY                  // 'project#difficulty'
DIC_CODES.SUBCATEGORY                 // 'project#subcategory'
DIC_CODES.FIELD_CATEGORY              // 'project#fieldcategory'
DIC_CODES.COLLATERAL_ENVIRONMENT      // 'project#collateralenvironment'
DIC_CODES.PROGRAMMING_LANGUAGE        // 'project#programminglanguage'
DIC_CODES.ENVIRONMENT_FULL_STACK      // 'project#environment_1'
DIC_CODES.ENVIRONMENT_JUPYTER_NOTEBOOK // 'project#environment_2'
DIC_CODES.ENVIRONMENT_JUPYTER_LAB     // 'project#environment_3'
```

## 高级用法

### 1. 批量加载字典

```typescript
import { loadDictionaries, DIC_CODES } from '@/composables/dictionary'

onMounted(async () => {
  // 批量加载多个字典
  await loadDictionaries([
    DIC_CODES.DIFFICULTY,
    DIC_CODES.SUBCATEGORY,
    DIC_CODES.FIELD_CATEGORY,
  ])
})
```

### 2. 强制刷新缓存

```typescript
// 强制刷新，忽略缓存
difficulty.load(true)
```

### 3. 清除缓存

```typescript
import { clearDictionaryCache, DIC_CODES } from '@/composables/dictionary'

// 清除指定字典缓存
clearDictionaryCache(DIC_CODES.DIFFICULTY)

// 清除所有字典缓存
clearDictionaryCache()
```

### 4. 响应式的实验环境（根据项目类型变化）

```typescript
const projectType = ref(1)

// 使用 computed 让环境字典响应项目类型变化
const environment = computed(() => useEnvironmentDictionary(projectType.value))

// 监听项目类型变化，重新加载环境选项
watch(projectType, () => {
  environment.value.load()
})

onMounted(() => {
  environment.value.load()
})
```

## 完整示例

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useDifficultyDictionary,
  useSubcategoryDictionary,
  useProgrammingLanguageDictionary,
} from '@/composables/dictionary'

// 表单数据
const formData = ref({
  difficulty: undefined,
  subcategory: undefined,
  programmingLanguage: undefined,
})

// 使用字典 hooks
const difficulty = useDifficultyDictionary()
const subcategory = useSubcategoryDictionary()
const programmingLanguage = useProgrammingLanguageDictionary()

// 页面加载时获取字典数据
onMounted(() => {
  difficulty.load()
  subcategory.load()
  programmingLanguage.load()
})

// 根据选中的值显示名称
const selectedDifficultyName = computed(() => {
  return difficulty.getNameByValue(formData.value.difficulty || '')
})
</script>

<template>
  <a-form :model="formData">
    <a-form-item label="难度">
      <a-select
        v-model:value="formData.difficulty"
        placeholder="请选择难度"
        :options="difficulty.options.value"
        :loading="difficulty.loading.value"
      />
    </a-form-item>

    <a-form-item label="小类别">
      <a-select
        v-model:value="formData.subcategory"
        placeholder="请选择小类别"
        :options="subcategory.options.value"
        :loading="subcategory.loading.value"
      />
    </a-form-item>

    <a-form-item label="编程语言">
      <a-select
        v-model:value="formData.programmingLanguage"
        placeholder="请选择编程语言"
        :options="programmingLanguage.options.value"
        :loading="programmingLanguage.loading.value"
      />
    </a-form-item>

    <div v-if="formData.difficulty">
      已选难度：{{ selectedDifficultyName }}
    </div>
  </a-form>
</template>
```

## API 说明

### useDictionary(code: string)

返回对象包含以下属性和方法：

- `data`: `ComputedRef<DictionaryItem[]>` - 字典原始数据
- `loading`: `ComputedRef<boolean>` - 加载状态
- `options`: `ComputedRef<Array<{ label: string; value: string }>>` - 格式化的选项列表（用于 Select）
- `load(force?: boolean)`: `Promise<void>` - 加载字典数据，force=true 强制刷新
- `findByValue(value: string)`: `DictionaryItem | undefined` - 根据 value 查找字典项
- `getNameByValue(value: string)`: `string` - 根据 value 获取 name

### DictionaryItem 类型

```typescript
interface DictionaryItem {
  name: string    // 显示名称
  value: string   // 实际值
  weight: number  // 权重/排序
}
```

## 注意事项

1. **缓存机制**: 字典数据会自动缓存，相同的编码不会重复请求
2. **响应式**: 所有返回值都是响应式的，数据更新会自动反映到界面
3. **错误处理**: 加载失败会自动显示错误提示
4. **性能优化**: 使用 computed 确保不必要的重新计算

