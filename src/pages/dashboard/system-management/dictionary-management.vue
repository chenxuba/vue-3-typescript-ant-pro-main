<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
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

// 字典项相关
const itemLoading = ref(false)
const itemList = ref<DictionaryItemModel[]>([])
const itemTotal = ref(0)
const itemQueryForm = reactive<DictionaryItemQueryParams>({
  typeId: undefined,
  label: '',
  value: '',
  status: undefined,
  page: 1,
  limit: 10,
  orderbyFiled: 'sort:asc',
})

// 字典类型模态框
const typeModalVisible = ref(false)
const typeModalLoading = ref(false)
const typeModalTitle = ref('新建字典类型')
const isTypeEdit = ref(false)
const currentTypeId = ref<string | number | undefined>(undefined)

const typeFormData = reactive({
  typeName: '',
  typeCode: '',
  description: '',
  status: 1,
  sort: 0,
})

// 字典项模态框
const itemModalVisible = ref(false)
const itemModalLoading = ref(false)
const itemModalTitle = ref('新建字典项')
const isItemEdit = ref(false)
const currentItemId = ref<string | number | undefined>(undefined)

const itemFormData = reactive({
  typeId: undefined as string | number | undefined,
  label: '',
  value: '',
  description: '',
  status: 1,
  sort: 0,
})

// 表格选择
const selectedItemKeys = ref<(string | number)[]>([])
const selectedItems = ref<DictionaryItemModel[]>([])

// 字典项表格列
const itemColumns = [
  {
    title: '字典标签',
    dataIndex: 'label',
    key: 'label',
  },
  {
    title: '字典值',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
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
      orderbyFiled: 'sort:asc',
    }
    
    if (typeSearchKeyword.value.trim()) {
      params.typeName = typeSearchKeyword.value.trim()
    }
    
    const result = await getDictionaryTypeListApi(params)
    if (result.data) {
      typeList.value = result.data.list || []
      
      // 如果有选中的类型，更新选中的类型信息
      if (selectedType.value) {
        const updated = typeList.value.find(t => t.id === selectedType.value?.id)
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
      typeId: selectedType.value.id,
      page: itemQueryForm.page,
      limit: itemQueryForm.limit,
      orderbyFiled: itemQueryForm.orderbyFiled,
    }
    
    if (itemQueryForm.label?.trim()) {
      params.label = itemQueryForm.label
    }
    if (itemQueryForm.value?.trim()) {
      params.value = itemQueryForm.value
    }
    if (itemQueryForm.status !== undefined) {
      params.status = itemQueryForm.status
    }
    
    const result = await getDictionaryItemListApi(params)
    if (result.data) {
      itemList.value = result.data.list || []
      itemTotal.value = result.data.count || 0
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
  itemQueryForm.label = ''
  itemQueryForm.value = ''
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
  typeFormData.typeName = ''
  typeFormData.typeCode = ''
  typeFormData.description = ''
  typeFormData.status = 1
  typeFormData.sort = 0
  typeModalVisible.value = true
}

// 编辑字典类型
const handleEditType = (type: DictionaryTypeModel) => {
  typeModalTitle.value = '编辑字典类型'
  isTypeEdit.value = true
  currentTypeId.value = type.id
  typeFormData.typeName = type.typeName
  typeFormData.typeCode = type.typeCode
  typeFormData.description = type.description || ''
  typeFormData.status = type.status
  typeFormData.sort = type.sort
  typeModalVisible.value = true
}

// 提交字典类型
const handleSubmitType = async () => {
  if (!typeFormData.typeName.trim()) {
    message.error('请输入字典类型名称')
    return
  }
  if (!typeFormData.typeCode.trim()) {
    message.error('请输入字典类型编码')
    return
  }
  
  typeModalLoading.value = true
  try {
    const data = {
      typeName: typeFormData.typeName,
      typeCode: typeFormData.typeCode,
      description: typeFormData.description,
      status: typeFormData.status,
      sort: typeFormData.sort,
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
    content: `确定要删除字典类型"${type.typeName}"吗？删除后该类型下的所有字典项也将被删除。`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteDictionaryTypeApi(type.id!)
        message.success('删除成功')
        
        // 如果删除的是当前选中的类型，清空选中
        if (selectedType.value?.id === type.id) {
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
  itemFormData.typeId = selectedType.value.id
  itemFormData.label = ''
  itemFormData.value = ''
  itemFormData.description = ''
  itemFormData.status = 1
  itemFormData.sort = 0
  itemModalVisible.value = true
}

// 编辑字典项
const handleEditItem = (item: any) => {
  itemModalTitle.value = '编辑字典项'
  isItemEdit.value = true
  currentItemId.value = item.id
  itemFormData.typeId = item.typeId
  itemFormData.label = item.label
  itemFormData.value = item.value
  itemFormData.description = item.description || ''
  itemFormData.status = item.status
  itemFormData.sort = item.sort
  itemModalVisible.value = true
}

// 提交字典项
const handleSubmitItem = async () => {
  if (!itemFormData.label.trim()) {
    message.error('请输入字典标签')
    return
  }
  if (!itemFormData.value.trim()) {
    message.error('请输入字典值')
    return
  }
  
  itemModalLoading.value = true
  try {
    const data = {
      typeId: itemFormData.typeId,
      label: itemFormData.label,
      value: itemFormData.value,
      description: itemFormData.description,
      status: itemFormData.status,
      sort: itemFormData.sort,
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
    content: `确定要删除字典项"${item.label}"吗？`,
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
  itemQueryForm.label = ''
  itemQueryForm.value = ''
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
            @pressEnter="fetchTypeList"
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
            v-for="type in typeList" 
            :key="type.id"
            class="type-item"
            :class="{ active: selectedType?.id === type.id }"
            @click="onSelectType(type)"
          >
            <div class="type-info">
              <div class="type-name">{{ type.typeName }}</div>
              <div class="type-code">{{ type.typeCode }}</div>
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
            v-if="typeList.length === 0" 
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
            <h3>{{ selectedType.typeName }} <span class="type-code-tag">{{ selectedType.typeCode }}</span></h3>
            <p v-if="selectedType.description">{{ selectedType.description }}</p>
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
                    v-model:value="itemQueryForm.label" 
                    placeholder="请输入" 
                    allow-clear
                    style="width: 180px"
                    @pressEnter="handleQueryItems"
                  />
                </a-form-item>
                <a-form-item label="字典值">
                  <a-input 
                    v-model:value="itemQueryForm.value" 
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
            v-model:value="typeFormData.typeName" 
            placeholder="请输入字典类型名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="字典类型编码" required>
          <a-input 
            v-model:value="typeFormData.typeCode" 
            placeholder="请输入字典类型编码"
            allow-clear
            :disabled="isTypeEdit"
          />
        </a-form-item>

        <a-form-item label="状态">
          <a-radio-group v-model:value="typeFormData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="排序">
          <a-input-number 
            v-model:value="typeFormData.sort" 
            :min="0"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea 
            v-model:value="typeFormData.description" 
            placeholder="请输入描述"
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
            v-model:value="itemFormData.label" 
            placeholder="请输入字典标签"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="字典值" required>
          <a-input 
            v-model:value="itemFormData.value" 
            placeholder="请输入字典值"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="状态">
          <a-radio-group v-model:value="itemFormData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="排序">
          <a-input-number 
            v-model:value="itemFormData.sort" 
            :min="0"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea 
            v-model:value="itemFormData.description" 
            placeholder="请输入描述"
            :rows="3"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.dictionary-management {
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);

  .content-wrapper {
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 180px);
  }

  .left-panel {
    width: 360px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .panel-header {
      padding: 24px 20px 16px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;

        .title-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .title-text {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      }
    }

    .search-box {
      padding: 16px 20px;
      position: relative;
      z-index: 1;

      .modern-search {
        border-radius: 12px;
        border: none;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }

        &:focus-within {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        :deep(.ant-input) {
          background: transparent;
          border: none;
          font-size: 14px;
          padding: 10px 12px;

          &::placeholder {
            color: rgba(0, 0, 0, 0.4);
          }
        }

        :deep(.ant-input-prefix) {
          color: rgba(102, 126, 234, 0.6);
          font-size: 16px;
        }
      }
    }

    .loading-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.95);
      margin: 0 12px 16px;
      border-radius: 12px;
      position: relative;
      z-index: 1;
    }

    .type-list {
      flex: 1;
      overflow: auto;
      padding: 8px 12px 16px;
      background: rgba(255, 255, 255, 0.95);
      margin: 0 12px 16px;
      border-radius: 12px;
      position: relative;
      z-index: 1;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.02);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.3);
        border-radius: 3px;
        
        &:hover {
          background: rgba(102, 126, 234, 0.5);
        }
      }

      .type-item {
        padding: 16px;
        margin-bottom: 8px;
        background: #fff;
        border-radius: 10px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:hover {
          border-color: rgba(102, 126, 234, 0.3);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);

          .type-actions {
            opacity: 1;
          }
        }

        &.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-color: #667eea;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);

          .type-name {
            color: #667eea;
            font-weight: 600;
          }
        }

        .type-info {
          flex: 1;
          min-width: 0;

          .type-name {
            font-size: 15px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.85);
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .type-code {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.45);
            font-family: 'Monaco', 'Menlo', monospace;
          }
        }

        .type-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;

          .action-icon {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.45);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              color: #667eea;
              transform: scale(1.2);
            }

            &.danger:hover {
              color: #f5222d;
            }
          }
        }
      }
    }
  }

  .right-panel {
    flex: 1;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
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
      padding: 28px 32px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        gap: 12px;

        .type-code-tag {
          font-size: 12px;
          font-weight: 500;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 4px 12px;
          border-radius: 12px;
          font-family: 'Monaco', 'Menlo', monospace;
        }
      }

      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }

    .query-section {
      border-bottom: 1px solid #f0f0f0;

      .query-header {
        padding: 20px 32px 12px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
        }
      }

      .query-form {
        padding: 16px 32px 20px;

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
        padding: 16px 32px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
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
            color: rgba(0, 0, 0, 0.85);
            font-weight: 500;
          }

          .info-divider {
            color: rgba(0, 0, 0, 0.45);
          }

          .info-value {
            color: #667eea;
            font-weight: 600;
            font-size: 18px;
          }

          .info-unit {
            color: rgba(0, 0, 0, 0.45);
          }
        }

        .table-actions {
          display: flex;
          gap: 12px;
        }
      }

      .table-container {
        flex: 1;
        padding: 24px 32px;
        overflow: auto;
      }
    }
  }
}
</style>

