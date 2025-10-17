<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { RoleModel, RoleQueryParams } from '@/api/system/role'
import { 
  getRoleListApi, 
  createRoleApi, 
  updateRoleApi, 
  deleteRoleApi, 
  batchDeleteRoleApi,
  getRolePermissionsApi,
  saveRolePermissionsApi
} from '@/api/system/role'
import dynamicRoutes from '@/router/dynamic-routes'

defineOptions({
  name: 'RoleManagement',
})

// 查询表单
const queryForm = reactive<RoleQueryParams>({
  roleName: '',
  pageNum: 1,
  pageSize: 10,
})

const loading = ref(false)
const roleList = ref<RoleModel[]>([])
const total = ref(0)

// 表格选择
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<RoleModel[]>([])

// 表格列定义
const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
  },
  {
    title: '管理范围',
    dataIndex: 'managementScope',
    key: 'managementScope',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right' as const,
  },
]

// 模态框相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('新建角色')
const isEdit = ref(false)
const currentEditId = ref<string | number | undefined>(undefined)

// 权限管理模态框
const permissionModalVisible = ref(false)
const permissionLoading = ref(false)
const currentRole = ref<any>(null)
const checkedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// 表单数据
const formData = reactive({
  roleName: '',
  roleCode: '',
  isVirtualManagerRole: undefined as any,
  managementScopeType: undefined as string | undefined,
  managementScope: undefined as string | undefined,
  remark: '',
  status: true,
})

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const result = await getRoleListApi(queryForm)
    if (result.data) {
      roleList.value = result.data.list
      total.value = result.data.total
    }
  } catch (error) {
    message.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryForm.pageNum = 1
  selectedRowKeys.value = []
  selectedRows.value = []
  fetchRoleList()
}

// 重置
const handleReset = () => {
  queryForm.roleName = ''
  queryForm.pageNum = 1
  queryForm.pageSize = 10
  selectedRowKeys.value = []
  selectedRows.value = []
  fetchRoleList()
}

// 表格选择变化
const onSelectChange = (keys: (string | number)[], rows: any[]) => {
  selectedRowKeys.value = keys
  selectedRows.value = rows as RoleModel[]
}

// 打开新建模态框
const handleCreate = () => {
  modalTitle.value = '新建角色'
  isEdit.value = false
  currentEditId.value = undefined
  formData.roleName = ''
  formData.roleCode = ''
  formData.isVirtualManagerRole = undefined
  formData.managementScopeType = undefined
  formData.managementScope = undefined
  formData.remark = ''
  formData.status = true
  modalVisible.value = true
}

// 打开编辑模态框
const handleEdit = (record: any) => {
  modalTitle.value = '编辑角色'
  isEdit.value = true
  currentEditId.value = record.id
  formData.roleName = record.roleName
  formData.roleCode = record.roleCode || ''
  formData.isVirtualManagerRole = record.isVirtualManagerRole
  formData.managementScopeType = record.managementScopeType
  formData.managementScope = record.managementScope
  formData.remark = record.remark || ''
  formData.status = record.status
  modalVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  modalLoading.value = true
  try {
    if (isEdit.value && currentEditId.value) {
      await updateRoleApi({
        id: currentEditId.value,
        roleName: formData.roleName,
        roleCode: formData.roleCode,
        isVirtualManagerRole: formData.isVirtualManagerRole,
        managementScopeType: formData.managementScopeType,
        managementScope: formData.managementScope,
        remark: formData.remark,
        status: formData.status,
      })
      message.success('更新成功')
    } else {
      if (!formData.roleCode || !formData.managementScopeType || !formData.managementScope || formData.isVirtualManagerRole === undefined) {
        message.error('请填写所有必填项')
        return
      }
      await createRoleApi({
        roleName: formData.roleName,
        roleCode: formData.roleCode,
        isVirtualManagerRole: formData.isVirtualManagerRole,
        managementScopeType: formData.managementScopeType,
        managementScope: formData.managementScope,
        remark: formData.remark,
        status: formData.status,
      })
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchRoleList()
  } catch (error) {
    message.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    modalLoading.value = false
  }
}

// 构建权限树
const buildPermissionTree = () => {
  const tree: any[] = []
  
  dynamicRoutes.forEach((route: any) => {
    const node: any = {
      key: route.path,
      title: route.meta?.title || route.name,
      children: [],
    }
    
    if (route.children && route.children.length > 0) {
      route.children.forEach((child: any) => {
        // 包含所有子路由，不过滤隐藏项
        node.children.push({
          key: child.path,
          title: child.meta?.title || child.name,
        })
      })
    }
    
    tree.push(node)
  })
  
  return tree
}

const permissionTree = ref(buildPermissionTree())

// 权限管理
const handlePermissionManage = async (record: any) => {
  currentRole.value = record
  permissionModalVisible.value = true
  
  // 展开所有节点
  expandedKeys.value = permissionTree.value.map(node => node.key)
  
  // 从后端加载该角色已有的权限
  try {
    const result = await getRolePermissionsApi(record.id)
    if (result.data) {
      checkedKeys.value = result.data
    }
  } catch (error) {
    console.error('加载权限失败:', error)
    checkedKeys.value = []
  }
}

// 保存权限
const handleSavePermissions = async () => {
  permissionLoading.value = true
  try {
    await saveRolePermissionsApi(currentRole.value.id, checkedKeys.value)
    message.success('权限保存成功')
    permissionModalVisible.value = false
  } catch (error) {
    message.error('权限保存失败')
  } finally {
    permissionLoading.value = false
  }
}

// 取消权限编辑
const handleCancelPermission = () => {
  permissionModalVisible.value = false
  checkedKeys.value = []
  currentRole.value = null
}

// 删除单个角色
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除角色"${record.roleName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteRoleApi(record.id!)
        message.success('删除成功')
        fetchRoleList()
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的角色')
    return
  }
  
  Modal.confirm({
    title: '确认批量删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个角色吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await batchDeleteRoleApi(selectedRowKeys.value)
        message.success('批量删除成功')
        selectedRowKeys.value = []
        selectedRows.value = []
        fetchRoleList()
      } catch (error) {
        message.error('批量删除失败')
      }
    },
  })
}

// 分页变化
const handleTableChange = (pagination: any) => {
  queryForm.pageNum = pagination.current
  queryForm.pageSize = pagination.pageSize
  fetchRoleList()
}

onMounted(() => {
  fetchRoleList()
})
</script>

<template>
  <div class="role-management">
    <div class="content-wrapper">
      <div class="main-panel">
        <!-- 筛选查询区域 -->
        <div class="query-header">
          <h3>筛选查询</h3>
        </div>

        <div class="query-form">
          <a-form layout="inline">
            <a-form-item label="角色名称">
              <a-input 
                v-model:value="queryForm.roleName" 
                placeholder="请输入" 
                allow-clear
                style="width: 200px"
                @pressEnter="handleQuery"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleQuery">
                  查询
                </a-button>
                <a-button @click="handleReset">
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>

        <!-- 数据列表区域 -->
        <div class="table-header">
          <div class="table-info">
            <span class="info-label">数据列表</span>
            <span class="info-divider">数据共</span>
            <span class="info-value">{{ total }}</span>
            <span class="info-unit">条</span>
          </div>
          <div class="table-actions">
            <a-button type="primary" @click="handleCreate">
              <template #icon>
                <PlusOutlined />
              </template>
              新建角色
            </a-button>
            <a-button 
              danger 
              :disabled="selectedRowKeys.length === 0"
              @click="handleBatchDelete"
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
            :columns="columns"
            :data-source="roleList"
            :loading="loading"
            :pagination="{
              current: queryForm.pageNum,
              pageSize: queryForm.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }"
            :row-selection="{
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange,
            }"
            :scroll="{ x: 1000 }"
            row-key="id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'roleName'">
                <a class="role-link">{{ record.roleName }}</a>
              </template>
              <template v-else-if="column.key === 'remark'">
                <span>{{ record.remark || '-' }}</span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button 
                    type="link" 
                    size="small"
                    @click="handleEdit(record)"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="link" 
                    size="small"
                    @click="handlePermissionManage(record)"
                  >
                    权限管理
                  </a-button>
                  <a-button 
                    type="link" 
                    size="small"
                    danger
                    @click="handleDelete(record)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 新建/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="600"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
    >
      <a-form
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 14 }"
        style="margin-top: 24px"
      >
        <a-form-item 
          label="角色名称" 
          name="roleName"
          :rules="[
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ]"
        >
          <a-input 
            v-model:value="formData.roleName" 
            placeholder="请输入角色名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item 
          label="角色编号" 
          name="roleCode"
          :rules="[
            { required: true, message: '请输入角色编号', trigger: 'blur' }
          ]"
        >
          <a-input 
            v-model:value="formData.roleCode" 
            placeholder="请输入角色编号"
            allow-clear
          />
        </a-form-item>

        <a-form-item 
          label="是否虚拟机构管理员角色" 
          name="isVirtualManagerRole"
          :rules="[
            { required: true, message: '请选择', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.isVirtualManagerRole"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item 
          label="管理范围类型" 
          name="managementScopeType"
          :rules="[
            { required: true, message: '请选择', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.managementScopeType"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="本单位">本单位</a-select-option>
            <a-select-option value="本单位及下属单位">本单位及下属单位</a-select-option>
            <a-select-option value="所有单位">所有单位</a-select-option>
            <a-select-option value="指定单位">指定单位</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item 
          label="管理范围" 
          name="managementScope"
          :rules="[
            { required: true, message: '请选择', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.managementScope"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="全部">全部</a-select-option>
            <a-select-option value="计算机网络信息中心">计算机网络信息中心</a-select-option>
            <a-select-option value="大数据技术与应用发展部">大数据技术与应用发展部</a-select-option>
            <a-select-option value="高性能计算技术与应用发展部">高性能计算技术与应用发展部</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea 
            v-model:value="formData.remark" 
            placeholder="请输入备注"
            :rows="3"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限管理模态框 -->
    <a-modal
      v-model:open="permissionModalVisible"
      :title="`${currentRole?.roleName || ''}角色权限编辑`"
      :width="600"
      :maskClosable="false"
    >
      <div style="padding: 20px 0;">
        <a-alert
          message="请选择该角色可以访问的功能模块"
          type="info"
          show-icon
          style="margin-bottom: 20px;"
        />

        <div style="max-height: 400px; overflow: auto; padding: 10px; background: #fafafa; border-radius: 4px;">
          <a-tree
            v-model:checkedKeys="checkedKeys"
            v-model:expandedKeys="expandedKeys"
            :tree-data="permissionTree"
            checkable
            :field-names="{ title: 'title', key: 'key', children: 'children' }"
            :selectable="false"
          />
        </div>
      </div>

      <template #footer>
        <a-button @click="handleCancelPermission">取消</a-button>
        <a-button type="primary" :loading="permissionLoading" @click="handleSavePermissions">
          保存
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.role-management {
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);

  .content-wrapper {
    min-height: calc(100vh - 180px);
  }

  .main-panel {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .query-header {
      padding: 24px 24px 16px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
      }
    }

    .query-form {
      padding: 20px 24px;
      background: #fff;
      border-bottom: 1px solid #f0f0f0;

      :deep(.ant-form-inline) {
        .ant-form-item {
          margin-bottom: 16px;
        }

        .ant-form-item-label {
          > label {
            color: rgba(0, 0, 0, 0.85);
            font-weight: 500;
          }
        }
      }
    }

    .table-header {
      padding: 16px 24px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
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
      padding: 24px;
      overflow: auto;

      .role-link {
        color: #667eea;
        cursor: pointer;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      :deep(.ant-table) {
        .ant-table-thead {
          > tr > th {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
            color: rgba(0, 0, 0, 0.85);
            font-weight: 600;
            border-bottom: 2px solid rgba(102, 126, 234, 0.2);
          }
        }

        .ant-table-tbody {
          > tr {
            transition: all 0.3s ease;

            &:hover {
              > td {
                background: rgba(102, 126, 234, 0.03);
              }
            }
          }
        }
      }
    }
  }

}
</style>
