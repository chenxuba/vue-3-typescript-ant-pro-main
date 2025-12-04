<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  BookOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import type { 
  DictionaryTypeModel, 
  DictionaryItemModel,
  DictionaryTypeQueryParams,
  DictionaryItemQueryParams
} from '@/api/system/dictionary'
import { 
  getDictionaryTypeListApi,
  createDictionaryTypeApi,
  updateDictionaryTypeApi,
  deleteDictionaryTypeApi,
  getDictionaryItemListApi,
  createDictionaryItemApi,
  updateDictionaryItemApi,
  deleteDictionaryItemApi
} from '@/api/system/dictionary'

defineOptions({
  name: 'DictionaryManagement',
})

// 字典类型相关
const typeLoading = ref(false)
const typeList = ref<DictionaryTypeModel[]>([])
const selectedType = ref<DictionaryTypeModel | null>(null)
const typeSearchKeyword = ref('')

// 前端过滤字典类型列表
const filteredTypeList = computed(() => {
  if (!typeSearchKeyword.value.trim()) {
    return typeList.value
  }
  const keyword = typeSearchKeyword.value.trim().toLowerCase()
  return typeList.value.filter(type => 
    type.name.toLowerCase().includes(keyword) || 
    type.code.toLowerCase().includes(keyword)
  )
})

// 字典项相关
const itemLoading = ref(false)
const itemList = ref<DictionaryItemModel[]>([])
const itemTotal = ref(0)
const itemQueryForm = reactive<DictionaryItemQueryParams>({
  dicGroupId: undefined,
  name: '',
  content: '',
  status: undefined,
  page: 1,
  limit: 10,
  orderbyFiled: 'weight:asc',
})

// 字典类型模态框
const typeModalVisible = ref(false)
const typeModalLoading = ref(false)
const typeModalTitle = ref('新建字典类型')
const isTypeEdit = ref(false)
const currentTypeId = ref<string | number | undefined>(undefined)

const typeFormData = reactive({
  name: '',
  code: '',
  remark: '',
  weight: 0,
})

// 字典项模态框
const itemModalVisible = ref(false)
const itemModalLoading = ref(false)
const itemModalTitle = ref('新建字典项')
const isItemEdit = ref(false)
const currentItemId = ref<string | number | undefined>(undefined)

const itemFormData = reactive({
  dicGroupId: undefined as string | number | undefined,
  name: '',
  content: '',
  config: '',
  status: 1,
  weight: 0,
})

// 表格选择
const selectedItemKeys = ref<(string | number)[]>([])
const selectedItems = ref<DictionaryItemModel[]>([])

// 字典项表格列
const itemColumns = [
  {
    title: '字典标签',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '字典值',
    dataIndex: 'content',
    key: 'content',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '权重',
    dataIndex: 'weight',
    key: 'weight',
    width: 80,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right' as const,
  },
]

// 获取字典类型列表
const fetchTypeList = async () => {
  typeLoading.value = true
  try {
    const params: DictionaryTypeQueryParams = {
      page: 1,
      limit: 1000,
      orderbyFiled: 'weight:asc',
    }
    
    const result = await getDictionaryTypeListApi(params)
    if (result.data) {
      // 接口返回的 data 可能是数组或者是 { list, count } 格式
      typeList.value = Array.isArray(result.data) ? result.data : (result.data.list || [])
      
      // 如果有选中的类型，更新选中的类型信息
      if (selectedType.value) {
        const updated = typeList.value.find(t => t.dicGroupId === selectedType.value?.dicGroupId)
        if (updated) {
          selectedType.value = updated
        }
      } else if (typeList.value.length > 0) {
        // 默认选中第一个
        selectedType.value = typeList.value[0]
      }
    }
  } catch (error) {
    message.error('获取字典类型列表失败')
  } finally {
    typeLoading.value = false
  }
}

// 获取字典项列表
const fetchItemList = async () => {
  if (!selectedType.value) {
    itemList.value = []
    itemTotal.value = 0
    return
  }
  
  itemLoading.value = true
  try {
    const params: any = {
      dicGroupId: selectedType.value.dicGroupId,
      page: itemQueryForm.page,
      limit: itemQueryForm.limit,
      orderbyFiled: itemQueryForm.orderbyFiled,
    }
    
    if (itemQueryForm.name?.trim()) {
      params.name = itemQueryForm.name
    }
    if (itemQueryForm.content?.trim()) {
      params.content = itemQueryForm.content
    }
    if (itemQueryForm.status !== undefined) {
      params.status = itemQueryForm.status
    }
    
    const result = await getDictionaryItemListApi(params)
    if (result.data) {
      // 接口返回的 data 可能是数组或者是 { list, count } 格式
      if (Array.isArray(result.data)) {
        itemList.value = result.data
        itemTotal.value = result.data.length
      } else {
        itemList.value = result.data.list || []
        itemTotal.value = result.data.total || 0
      }
    }
  } catch (error) {
    message.error('获取字典项列表失败')
  } finally {
    itemLoading.value = false
  }
}

// 选择字典类型
const onSelectType = (type: DictionaryTypeModel) => {
  selectedType.value = type
  // 重置查询条件
  itemQueryForm.page = 1
  itemQueryForm.name = ''
  itemQueryForm.content = ''
  itemQueryForm.status = undefined
  selectedItemKeys.value = []
  selectedItems.value = []
  fetchItemList()
}

// 监听选中类型变化
watch(() => selectedType.value, () => {
  if (selectedType.value) {
    fetchItemList()
  }
})

// ==================== 字典类型操作 ====================

// 新建字典类型
const handleCreateType = () => {
  typeModalTitle.value = '新建字典类型'
  isTypeEdit.value = false
  currentTypeId.value = undefined
  typeFormData.name = ''
  typeFormData.code = ''
  typeFormData.remark = ''
  typeFormData.weight = 0
  typeModalVisible.value = true
}

// 编辑字典类型
const handleEditType = (type: DictionaryTypeModel) => {
  typeModalTitle.value = '编辑字典类型'
  isTypeEdit.value = true
  currentTypeId.value = type.dicGroupId
  typeFormData.name = type.name
  typeFormData.code = type.code
  typeFormData.remark = type.remark || ''
  typeFormData.weight = type.weight
  typeModalVisible.value = true
}

// 提交字典类型
const handleSubmitType = async () => {
  if (!typeFormData.name.trim()) {
    message.error('请输入字典类型名称')
    return
  }
  if (!typeFormData.code.trim()) {
    message.error('请输入字典类型编码')
    return
  }
  
  typeModalLoading.value = true
  try {
    const data = {
      name: typeFormData.name,
      code: typeFormData.code,
      remark: typeFormData.remark,
      weight: typeFormData.weight,
    }
    
    if (isTypeEdit.value && currentTypeId.value) {
      await updateDictionaryTypeApi(currentTypeId.value, data)
      message.success('更新成功')
    } else {
      await createDictionaryTypeApi(data)
      message.success('创建成功')
    }
    
    typeModalVisible.value = false
    fetchTypeList()
  } catch (error) {
    message.error(isTypeEdit.value ? '更新失败' : '创建失败')
  } finally {
    typeModalLoading.value = false
  }
}

// 删除字典类型
const handleDeleteType = (type: DictionaryTypeModel) => {
  Modal.confirm({
    title: '确认删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除字典类型"${type.name}"吗？删除后该类型下的所有字典项也将被删除。`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteDictionaryTypeApi(type.dicGroupId!)
        message.success('删除成功')
        
        // 如果删除的是当前选中的类型，清空选中
        if (selectedType.value?.dicGroupId === type.dicGroupId) {
          selectedType.value = null
          itemList.value = []
          itemTotal.value = 0
        }
        
        fetchTypeList()
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

// ==================== 字典项操作 ====================

// 新建字典项
const handleCreateItem = () => {
  if (!selectedType.value) {
    message.warning('请先选择字典类型')
    return
  }
  
  itemModalTitle.value = '新建字典项'
  isItemEdit.value = false
  currentItemId.value = undefined
  itemFormData.dicGroupId = selectedType.value.dicGroupId
  itemFormData.name = ''
  itemFormData.content = ''
  itemFormData.config = ''
  itemFormData.status = 1
  itemFormData.weight = 0
  itemModalVisible.value = true
}

// 编辑字典项
const handleEditItem = (item: any) => {
  itemModalTitle.value = '编辑字典项'
  isItemEdit.value = true
  currentItemId.value = item.id
  itemFormData.dicGroupId = item.dicGroupId
  itemFormData.name = item.name
  itemFormData.content = item.content
  itemFormData.config = item.config || ''
  itemFormData.status = item.status
  itemFormData.weight = item.weight
  itemModalVisible.value = true
}

// 提交字典项
const handleSubmitItem = async () => {
  if (!itemFormData.name.trim()) {
    message.error('请输入字典标签')
    return
  }
  if (!itemFormData.content.trim()) {
    message.error('请输入字典值')
    return
  }
  
  itemModalLoading.value = true
  try {
    const data = {
      dicGroupId: itemFormData.dicGroupId,
      name: itemFormData.name,
      content: itemFormData.content,
      config: itemFormData.config,
      status: itemFormData.status,
      weight: itemFormData.weight,
    }
    
    if (isItemEdit.value && currentItemId.value) {
      await updateDictionaryItemApi(currentItemId.value, data)
      message.success('更新成功')
    } else {
      await createDictionaryItemApi(data)
      message.success('创建成功')
    }
    
    itemModalVisible.value = false
    fetchItemList()
  } catch (error) {
    message.error(isItemEdit.value ? '更新失败' : '创建失败')
  } finally {
    itemModalLoading.value = false
  }
}

// 删除字典项
const handleDeleteItem = (item: any) => {
  Modal.confirm({
    title: '确认删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除字典项"${item.name}"吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteDictionaryItemApi(item.id!)
        message.success('删除成功')
        fetchItemList()
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

// 批量删除字典项
const handleBatchDeleteItems = () => {
  if (selectedItemKeys.value.length === 0) {
    message.warning('请选择要删除的字典项')
    return
  }
  
  Modal.confirm({
    title: '确认批量删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除选中的 ${selectedItemKeys.value.length} 个字典项吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await Promise.all(
          selectedItemKeys.value.map(id => deleteDictionaryItemApi(id))
        )
        message.success('批量删除成功')
        selectedItemKeys.value = []
        selectedItems.value = []
        fetchItemList()
      } catch (error) {
        message.error('批量删除失败')
      }
    },
  })
}

// 查询字典项
const handleQueryItems = () => {
  itemQueryForm.page = 1
  selectedItemKeys.value = []
  selectedItems.value = []
  fetchItemList()
}

// 重置查询
const handleResetQuery = () => {
  itemQueryForm.name = ''
  itemQueryForm.content = ''
  itemQueryForm.status = undefined
  itemQueryForm.page = 1
  selectedItemKeys.value = []
  selectedItems.value = []
  fetchItemList()
}

// 表格选择变化
const onSelectItemChange = (keys: (string | number)[], rows: any[]) => {
  selectedItemKeys.value = keys
  selectedItems.value = rows as DictionaryItemModel[]
}

// 分页变化
const handleTableChange = (pagination: any) => {
  itemQueryForm.page = pagination.current
  itemQueryForm.limit = pagination.pageSize
  fetchItemList()
}

onMounted(() => {
  fetchTypeList()
})
</script>

<template>
  <div class="dictionary-management">
    <div class="content-wrapper">
      <!-- 左侧字典类型列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="header-title">
            <div class="title-icon">
              <BookOutlined />
            </div>
            <span class="title-text">字典类型</span>
          </div>
          <a-button type="primary" size="small" @click="handleCreateType">
            <template #icon>
              <PlusOutlined />
            </template>
          </a-button>
        </div>

        <div class="search-box">
          <a-input 
            v-model:value="typeSearchKeyword"
            placeholder="搜索字典类型..." 
            allow-clear
            class="modern-search"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div v-if="typeLoading" class="loading-container">
          <a-spin size="large" tip="加载中..." />
        </div>

        <div v-else class="type-list">
          <div 
            v-for="type in filteredTypeList" 
            :key="type.dicGroupId"
            class="type-item"
            :class="{ active: selectedType?.dicGroupId === type.dicGroupId }"
            @click="onSelectType(type)"
          >
            <div class="type-info">
              <div class="type-name">{{ type.name }}</div>
              <div class="type-code">{{ type.code }}</div>
            </div>
            <div class="type-actions">
              <a-tooltip title="编辑">
                <EditOutlined 
                  class="action-icon" 
                  @click.stop="handleEditType(type)" 
                />
              </a-tooltip>
              <a-tooltip title="删除">
                <DeleteOutlined 
                  class="action-icon danger" 
                  @click.stop="handleDeleteType(type)" 
                />
              </a-tooltip>
            </div>
          </div>
          
          <a-empty 
            v-if="filteredTypeList.length === 0" 
            description="暂无数据"
            style="margin-top: 60px;"
          />
        </div>
      </div>

      <!-- 右侧字典项列表 -->
      <div class="right-panel">
        <div v-if="!selectedType" class="empty-state">
          <a-empty description="请在左侧选择字典类型" />
        </div>

        <template v-else>
          <div class="panel-header-info">
            <h3>{{ selectedType.name }} <span class="type-code-tag">{{ selectedType.code }}</span></h3>
            <p v-if="selectedType.remark">{{ selectedType.remark }}</p>
          </div>

          <!-- 筛选查询 -->
          <div class="query-section">
            <div class="query-header">
              <h4>筛选查询</h4>
            </div>
            <div class="query-form">
              <a-form layout="inline">
                <a-form-item label="字典标签">
                  <a-input 
                    v-model:value="itemQueryForm.name" 
                    placeholder="请输入" 
                    allow-clear
                    style="width: 180px"
                    @pressEnter="handleQueryItems"
                  />
                </a-form-item>
                <a-form-item label="字典值">
                  <a-input 
                    v-model:value="itemQueryForm.content" 
                    placeholder="请输入" 
                    allow-clear
                    style="width: 180px"
                    @pressEnter="handleQueryItems"
                  />
                </a-form-item>
                <a-form-item label="状态">
                  <a-select 
                    v-model:value="itemQueryForm.status" 
                    placeholder="请选择" 
                    allow-clear
                    style="width: 120px"
                  >
                    <a-select-option :value="1">启用</a-select-option>
                    <a-select-option :value="0">禁用</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button type="primary" @click="handleQueryItems">
                      查询
                    </a-button>
                    <a-button @click="handleResetQuery">
                      重置
                    </a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </div>
          </div>

          <!-- 数据列表 -->
          <div class="table-section">
            <div class="table-header">
              <div class="table-info">
                <span class="info-label">数据列表</span>
                <span class="info-divider">数据共</span>
                <span class="info-value">{{ itemTotal }}</span>
                <span class="info-unit">条</span>
              </div>
              <div class="table-actions">
                <a-button type="primary" @click="handleCreateItem">
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  新建字典项
                </a-button>
                <a-button 
                  danger 
                  :disabled="selectedItemKeys.length === 0"
                  @click="handleBatchDeleteItems"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  批量删除
                </a-button>
              </div>
            </div>

            <div class="table-container">
              <a-table
                :columns="itemColumns"
                :data-source="itemList"
                :loading="itemLoading"
                :pagination="{
                  current: itemQueryForm.page,
                  pageSize: itemQueryForm.limit,
                  total: itemTotal,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条`,
                }"
                :row-selection="{
                  selectedRowKeys: selectedItemKeys,
                  onChange: onSelectItemChange,
                }"
                :scroll="{ x: 900 }"
                :row-key="(record) => record.id"
                @change="handleTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === 1 ? 'success' : 'error'">
                      <template #icon>
                        <CheckCircleOutlined v-if="record.status === 1" />
                        <CloseCircleOutlined v-else />
                      </template>
                      {{ record.status === 1 ? '启用' : '禁用' }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button 
                        type="link" 
                        size="small"
                        @click="handleEditItem(record)"
                      >
                        编辑
                      </a-button>
                      <a-button 
                        type="link" 
                        size="small"
                        danger
                        @click="handleDeleteItem(record)"
                      >
                        删除
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 字典类型模态框 -->
    <a-modal
      v-model:open="typeModalVisible"
      :title="typeModalTitle"
      :width="600"
      :confirm-loading="typeModalLoading"
      @ok="handleSubmitType"
    >
      <a-form
        :model="typeFormData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        style="margin-top: 24px"
      >
        <a-form-item label="字典类型名称" required>
          <a-input 
            v-model:value="typeFormData.name" 
            placeholder="请输入字典类型名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="字典类型编码" required>
          <a-input 
            v-model:value="typeFormData.code" 
            placeholder="请输入字典类型编码"
            allow-clear
            :disabled="isTypeEdit"
          />
        </a-form-item>

        <a-form-item label="权重">
          <a-input-number 
            v-model:value="typeFormData.weight" 
            :min="0"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea 
            v-model:value="typeFormData.remark" 
            placeholder="请输入备注"
            :rows="3"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 字典项模态框 -->
    <a-modal
      v-model:open="itemModalVisible"
      :title="itemModalTitle"
      :width="600"
      :confirm-loading="itemModalLoading"
      @ok="handleSubmitItem"
    >
      <a-form
        :model="itemFormData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        style="margin-top: 24px"
      >
        <a-form-item label="字典标签" required>
          <a-input 
            v-model:value="itemFormData.name" 
            placeholder="请输入字典标签"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="字典值" required>
          <a-input 
            v-model:value="itemFormData.content" 
            placeholder="请输入字典值"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="配置">
          <a-input 
            v-model:value="itemFormData.config" 
            placeholder="请输入配置（可选）"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="状态">
          <a-radio-group v-model:value="itemFormData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="权重">
          <a-input-number 
            v-model:value="itemFormData.weight" 
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.dictionary-management {
  min-height: calc(100vh - 180px);

  .content-wrapper {
    display: flex;
    gap: 16px;
    min-height: calc(100vh - 180px);
  }

  // 左侧面板 - 简约风格
  .left-panel {
    width: 280px;
    height: calc(100vh - 0px);
    background: #fff;
    border: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .title-icon {
          font-size: 18px;
          color: #262626;
        }

        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
      }
    }

    .search-box {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;

      .modern-search {
        :deep(.ant-input) {
          font-size: 14px;
        }

        :deep(.ant-input-prefix) {
          color: #8c8c8c;
        }
      }
    }

    .loading-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .type-list {
      flex: 1;
      overflow: auto;
      padding: 8px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d9d9d9;
        border-radius: 3px;
        
        &:hover {
          background: #bfbfbf;
        }
      }

      .type-item {
        padding: 12px 16px;
        margin-bottom: 4px;
        background: #fff;
        border-left: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:hover {
          background: #fafafa;

          .type-actions {
            opacity: 1;
          }
        }

        &.active {
          background: #f5f5f5;
          border-left-color: #1890ff;

          .type-name {
            color: #1890ff;
            font-weight: 500;
          }
        }

        .type-info {
          flex: 1;
          min-width: 0;

          .type-name {
            font-size: 14px;
            color: #262626;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .type-code {
            font-size: 12px;
            color: #8c8c8c;
            font-family: 'Consolas', 'Monaco', monospace;
          }
        }

        .type-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;

          .action-icon {
            font-size: 14px;
            color: #8c8c8c;
            cursor: pointer;
            padding: 4px;

            &:hover {
              color: #1890ff;
            }

            &.danger:hover {
              color: #ff4d4f;
            }
          }
        }
      }
    }
  }

  // 右侧面板 - 简约风格
  .right-panel {
    flex: 1;
    background: #fff;
    border: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .panel-header-info {
      padding: 20px 24px;
      border-bottom: 1px solid #e8e8e8;
      background: #fafafa;

      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        display: flex;
        align-items: center;
        gap: 12px;

        .type-code-tag {
          font-size: 12px;
          font-weight: normal;
          color: #595959;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 2px;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }

      p {
        margin: 0;
        color: #8c8c8c;
        font-size: 14px;
      }
    }

    .query-section {
      border-bottom: 1px solid #f0f0f0;

      .query-header {
        padding: 16px 24px;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #262626;
        }
      }

      .query-form {
        padding: 16px 24px;

        :deep(.ant-form-inline) {
          .ant-form-item {
            margin-bottom: 12px;
          }
        }
      }
    }

    .table-section {
      flex: 1;
      display: flex;
      flex-direction: column;

      .table-header {
        padding: 16px 24px;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .table-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;

          .info-label {
            color: #262626;
            font-weight: 600;
          }

          .info-divider {
            color: #8c8c8c;
          }

          .info-value {
            color: #1890ff;
            font-weight: 600;
            font-size: 16px;
          }

          .info-unit {
            color: #8c8c8c;
          }
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }
      }

      .table-container {
        flex: 1;
        padding: 16px 24px;
        overflow: auto;
      }
    }
  }
}
</style>

