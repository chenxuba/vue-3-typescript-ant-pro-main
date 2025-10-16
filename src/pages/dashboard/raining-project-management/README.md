# 全栈环境实训项目配置 - 重构说明

## 📁 文件结构

```
raining-project-management/
├── config-full-stack.vue          # 主页面（已重构，从1704行减少到约600行）
├── types/
│   └── index.ts                   # TypeScript 类型定义
├── composables/
│   ├── useFileTree.ts             # 文件树逻辑（文件/文件夹操作）
│   └── useCodeEditor.ts           # 代码编辑器逻辑（行号、滚动同步等）
└── components/
    ├── FileTreeComponent.vue      # 文件树组件
    ├── FilePreview.vue            # 文件预览组件
    ├── RichTextEditor.vue         # 富文本编辑器组件
    ├── NewFileModal.vue           # 新建文件弹窗
    ├── NewFolderModal.vue         # 新建文件夹弹窗
    └── RepositoryModal.vue        # 代码仓库确认弹窗
```

## 🔧 重构内容

### 1. **类型定义** (`types/index.ts`)
- `FormData`: 表单数据类型
- `FileTreeNode`: 文件树节点类型
- `SelectedFile`: 选中文件类型
- `NewFileForm`: 新建文件表单类型
- `NewFolderForm`: 新建文件夹表单类型

### 2. **业务逻辑复用** (`composables/`)

#### `useFileTree.ts`
封装了所有文件树相关的逻辑：
- 文件树数据管理
- 文件选择和预览
- 代码高亮
- 新建文件/文件夹
- 重命名、复制路径、删除节点

#### `useCodeEditor.ts`
封装了代码编辑器的辅助功能：
- 行号显示和更新
- 滚动同步
- Tab键缩进处理

### 3. **组件拆分** (`components/`)

#### `FileTreeComponent.vue`
- 文件树展示
- 右键菜单（新建文件/文件夹、重命名、删除等）
- 文件夹和文件图标区分

#### `FilePreview.vue`
- 文件内容预览
- 代码高亮显示
- 空状态提示

#### `RichTextEditor.vue`
- 富文本编辑器封装
- 工具栏配置
- 自动清理（onBeforeUnmount）

#### `NewFileModal.vue`
- 新建文件弹窗
- 代码编辑器（带行号）
- 表单验证

#### `NewFolderModal.vue`
- 新建文件夹弹窗
- 表单验证

#### `RepositoryModal.vue`
- 代码仓库开启确认弹窗

## ✨ 重构优势

### 1. **代码可维护性提升**
- 主文件从 1704 行减少到约 600 行
- 每个组件和 composable 职责单一、清晰

### 2. **代码复用性提升**
- `useFileTree` 和 `useCodeEditor` 可以在其他页面复用
- 各个组件可以独立使用

### 3. **类型安全**
- 使用 TypeScript 类型定义，减少运行时错误
- 更好的 IDE 提示和自动补全

### 4. **易于测试**
- 每个 composable 和组件都可以独立测试
- 业务逻辑和 UI 分离

### 5. **团队协作友好**
- 文件结构清晰，新成员容易上手
- 多人协作时减少代码冲突

## 🚀 使用示例

### 在主页面中使用文件树
```vue
<script setup lang="ts">
import { useFileTree } from './composables/useFileTree'

const {
  fileTreeData,
  expandedKeys,
  selectedFile,
  highlightedCode,
  handleSelectFile,
  // ...其他方法
} = useFileTree()
</script>

<template>
  <FileTreeComponent 
    :file-tree-data="fileTreeData"
    v-model:expanded-keys="expandedKeys"
    @select="handleSelectFile"
  />
</template>
```

### 使用代码编辑器
```vue
<script setup lang="ts">
import { useCodeEditor } from './composables/useCodeEditor'

const { 
  codeLineNumbers, 
  updateLineNumbers, 
  syncScroll, 
  handleKeydown 
} = useCodeEditor()
</script>
```

## 📝 注意事项

1. 所有组件都保持了原有的功能和样式
2. 使用了 Vue 3 Composition API
3. 支持 TypeScript 类型检查
4. 保持了与原代码的向后兼容性

