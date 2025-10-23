<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { RoleModel, RolePagerQueryParams } from '@/api/system/role'
import { 
  getRoleListPagerApi,
  createRolePagerApi,
  updateRolePagerApi,
  deleteRolePagerApi
} from '@/api/system/role'
import dynamicRoutes from '@/router/dynamic-routes'

defineOptions({
  name: 'RoleManagement',
})

// 时间格式化函数
const formatTime = (timestamp: number | string | undefined) => {
  if (!timestamp) return '-'
  
  const date = new Date(typeof timestamp === 'number' ? timestamp : parseInt(timestamp))
  
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 查询表单
const queryForm = reactive<RolePagerQueryParams>({
  name: '',
  page: 1,
  limit: 20,
  orderbyFiled: 'name:desc',
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
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '管理范围',
    dataIndex: 'authTypeContent',
    key: 'authTypeContent',
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

// 批量删除进度
const batchDeleteModalVisible = ref(false)
const batchDeleteProgress = ref(0)
const batchDeleteTotal = ref(0)
const batchDeleteCurrent = ref(0)
const batchDeleteSuccessCount = ref(0)
const batchDeleteFailCount = ref(0)
const batchDeleteStatus = ref<'active' | 'success' | 'exception'>('active')

// 表单数据
const formData = reactive({
  name: '',
  isAdmin: undefined as number | undefined,
  authType: undefined as number | undefined,
  authTypeContent: undefined as string | undefined,
  remark: '',
})

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    // 过滤掉空值字段
    const params: any = {
      page: queryForm.page,
      limit: queryForm.limit,
      orderbyFiled: queryForm.orderbyFiled,
    }
    
    // 只有当 name 有值时才传递
    if (queryForm.name && queryForm.name.trim()) {
      params.name = queryForm.name
    }
    
    const result = await getRoleListPagerApi(params)
    if (result.data) {
      roleList.value = result.data.list
      total.value = result.data.count
    }
  } catch (error) {
    message.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryForm.page = 1
  selectedRowKeys.value = []
  selectedRows.value = []
  fetchRoleList()
}

// 重置
const handleReset = () => {
  queryForm.name = ''
  queryForm.page = 1
  queryForm.limit = 20
  queryForm.orderbyFiled = 'name:desc'
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
  formData.name = ''
  formData.isAdmin = undefined
  formData.authType = undefined
  formData.authTypeContent = undefined
  formData.remark = ''
  modalVisible.value = true
}

// 打开编辑模态框
const handleEdit = (record: any) => {
  modalTitle.value = '编辑角色'
  isEdit.value = true
  currentEditId.value = record.roleId || record.id
  formData.name = record.name || record.roleName || ''
  formData.isAdmin = record.isAdmin
  formData.authType = record.authType
  formData.authTypeContent = record.authTypeContent
  formData.remark = record.remark || ''
  modalVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  modalLoading.value = true
  try {
    if (isEdit.value && currentEditId.value) {
      if (!formData.name || formData.isAdmin === undefined || formData.authType === undefined || !formData.authTypeContent) {
        message.error('请填写所有必填项')
        return
      }
      await updateRolePagerApi({
        roleId: currentEditId.value,
        name: formData.name,
        isAdmin: formData.isAdmin,
        authType: formData.authType,
        authTypeContent: formData.authTypeContent,
        remark: formData.remark,
      })
      message.success('更新成功')
    } else {
      if (!formData.name || formData.isAdmin === undefined || formData.authType === undefined || !formData.authTypeContent) {
        message.error('请填写所有必填项')
        return
      }
      await createRolePagerApi({
        name: formData.name,
        isAdmin: formData.isAdmin,
        authType: formData.authType,
        authTypeContent: formData.authTypeContent,
        remark: formData.remark,
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

// 构建路由路径到权限标识的映射
const buildRouteAccessMap = () => {
  const map: Record<string, string[]> = {}
  
  dynamicRoutes.forEach((route: any) => {
    // 收集父路由的权限标识
    if (route.meta?.access && Array.isArray(route.meta.access)) {
      map[route.path] = route.meta.access
    }
    
    // 收集子路由的权限标识
    if (route.children && route.children.length > 0) {
      route.children.forEach((child: any) => {
        if (child.meta?.access && Array.isArray(child.meta.access)) {
          map[child.path] = child.meta.access
        }
      })
    }
  })
  
  return map
}

// 构建权限标识到路由路径的反向映射
const buildAccessRouteMap = () => {
  const map: Record<string, string[]> = {}
  
  dynamicRoutes.forEach((route: any) => {
    // 收集父路由的权限标识
    if (route.meta?.access && Array.isArray(route.meta.access)) {
      route.meta.access.forEach((access: string) => {
        if (!map[access]) {
          map[access] = []
        }
        if (!map[access].includes(route.path)) {
          map[access].push(route.path)
        }
      })
    }
    
    // 收集子路由的权限标识
    if (route.children && route.children.length > 0) {
      route.children.forEach((child: any) => {
        if (child.meta?.access && Array.isArray(child.meta.access)) {
          child.meta.access.forEach((access: string) => {
            if (!map[access]) {
              map[access] = []
            }
            if (!map[access].includes(child.path)) {
              map[access].push(child.path)
            }
          })
        }
      })
    }
  })
  
  return map
}

// 构建权限树
const buildPermissionTree = () => {
  const tree: any[] = []
  
  dynamicRoutes.forEach((route: any) => {
    // 只显示在菜单中的路由
    if (route.meta?.hideInMenu) {
      return
    }
    
    const node: any = {
      key: route.path,
      title: route.meta?.title || route.name,
      children: [],
    }
    
    if (route.children && route.children.length > 0) {
      // 过滤子路由
      const visibleChildren = route.children.filter((child: any) => {
        // 如果设置了 hideChildrenInMenu，则只显示主菜单，不显示子菜单
        if (route.meta?.hideChildrenInMenu) {
          return false
        }
        // 不显示在菜单中隐藏的子路由
        return !child.meta?.hideInMenu
      })
      
      visibleChildren.forEach((child: any) => {
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

const routeAccessMap = buildRouteAccessMap()
const accessRouteMap = buildAccessRouteMap()
const permissionTree = ref(buildPermissionTree())

// 权限管理
const handlePermissionManage = async (record: any) => {
  currentRole.value = record
  permissionModalVisible.value = true
  
  // 展开所有节点
  expandedKeys.value = permissionTree.value.map(node => node.key)
  
  // 根据 authMenus 字段回显勾选状态
  if (record.authMenus) {
    // authMenus 是逗号分隔的权限标识字符串，如 "project:view,system:view,system:role:view"
    const authMenusArray = record.authMenus.split(',').filter((item: string) => item.trim())
    
    // 将权限标识转换为路由路径
    const routePathsSet = new Set<string>()
    authMenusArray.forEach((access: string) => {
      const paths = accessRouteMap[access.trim()]
      if (paths && Array.isArray(paths)) {
        paths.forEach(path => routePathsSet.add(path))
      }
    })
    
    checkedKeys.value = Array.from(routePathsSet)
    
    console.log('角色权限标识:', authMenusArray)
    console.log('转换后的路由路径:', checkedKeys.value)
  } else {
    checkedKeys.value = []
  }
}

// 保存权限
const handleSavePermissions = async () => {
  permissionLoading.value = true
  try {
    // 将选中的路由路径转换为权限标识
    const accessSet = new Set<string>()
    
    checkedKeys.value.forEach((routePath: string) => {
      const accessList = routeAccessMap[routePath]
      if (accessList && Array.isArray(accessList)) {
        accessList.forEach(access => accessSet.add(access))
      }
    })
    
    // 转换为逗号分隔的字符串
    const authMenus = Array.from(accessSet).join(',')
    
    console.log('当前角色对象:', currentRole.value)
    console.log('选中的路由路径:', checkedKeys.value)
    console.log('对应的权限标识:', authMenus)
    
    // 使用编辑角色接口保存权限，需要传递角色的完整信息
    const params = {
      roleId: currentRole.value.roleId || currentRole.value.id,
      name: currentRole.value.name || currentRole.value.roleName,
      isAdmin: currentRole.value.isAdmin,
      authType: currentRole.value.authType,
      authTypeContent: currentRole.value.authTypeContent,
      remark: currentRole.value.remark,
      authMenus: authMenus
    }
    
    console.log('提交的参数:', params)
    
    await updateRolePagerApi(params)
    
    message.success('权限保存成功')
    permissionModalVisible.value = false
    fetchRoleList() // 刷新列表
  } catch (error) {
    console.error('权限保存失败:', error)
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
    content: `确定要删除角色"${record.name || record.roleName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteRolePagerApi(record.roleId || record.id!)
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
      await executeBatchDelete()
    },
  })
}

// 执行批量删除
const executeBatchDelete = async () => {
  const total = selectedRows.value.length
  
  // 初始化进度
  batchDeleteTotal.value = total
  batchDeleteCurrent.value = 0
  batchDeleteProgress.value = 0
  batchDeleteSuccessCount.value = 0
  batchDeleteFailCount.value = 0
  batchDeleteStatus.value = 'active'
  batchDeleteModalVisible.value = true
  
  // 循环删除
  for (let i = 0; i < selectedRows.value.length; i++) {
    const role: any = selectedRows.value[i]
    batchDeleteCurrent.value = i + 1
    
    try {
      await deleteRolePagerApi(role.roleId || role.id)
      batchDeleteSuccessCount.value++
    } catch (error) {
      batchDeleteFailCount.value++
      console.error(`删除角色 ${role.name || role.roleName} 失败:`, error)
    }
    
    // 更新进度
    batchDeleteProgress.value = Math.floor((batchDeleteCurrent.value / batchDeleteTotal.value) * 100)
  }
  
  // 完成
  batchDeleteStatus.value = batchDeleteFailCount.value > 0 ? 'exception' : 'success'
  
  // 延迟关闭弹窗并刷新列表
  setTimeout(() => {
    batchDeleteModalVisible.value = false
    
    if (batchDeleteSuccessCount.value > 0) {
      message.success(`成功删除 ${batchDeleteSuccessCount.value} 个角色${batchDeleteFailCount.value > 0 ? `，失败 ${batchDeleteFailCount.value} 个` : ''}`)
      selectedRowKeys.value = []
      selectedRows.value = []
      fetchRoleList()
    } else {
      message.error('批量删除失败')
    }
  }, 1500)
}

// 关闭批量删除进度弹窗
const closeBatchDeleteModal = () => {
  if (batchDeleteStatus.value !== 'active') {
    batchDeleteModalVisible.value = false
  }
}

// 分页变化
const handleTableChange = (pagination: any) => {
  queryForm.page = pagination.current
  queryForm.limit = pagination.pageSize
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
                v-model:value="queryForm.name" 
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
              current: queryForm.page,
              pageSize: queryForm.limit,
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
            :row-key="(record) => record.roleId || record.id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a class="role-link">{{ record.name || record.roleName }}</a>
              </template>
              <template v-else-if="column.key === 'createTime'">
                <span>{{ formatTime(record.createTime) }}</span>
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
          name="name"
          :rules="[
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ]"
        >
          <a-input 
            v-model:value="formData.name" 
            placeholder="请输入角色名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item 
          label="是否虚拟机构管理员角色" 
          name="isAdmin"
          :rules="[
            { required: true, message: '请选择', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.isAdmin"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option :value="1">是</a-select-option>
            <a-select-option :value="0">否</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item 
          label="管理范围类型" 
          name="authType"
          :rules="[
            { required: true, message: '请选择管理范围类型', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.authType"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option :value="0">全部数据</a-select-option>
            <a-select-option :value="1">本单位及下属单位</a-select-option>
            <a-select-option :value="2">仅本单位</a-select-option>
            <a-select-option :value="3">本部门及下属部门</a-select-option>
            <a-select-option :value="4">仅本部门</a-select-option>
            <a-select-option :value="5">指定范围</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item 
          label="管理范围" 
          name="authTypeContent"
          :rules="[
            { required: true, message: '请选择管理范围', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.authTypeContent"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="全部">全部</a-select-option>
            <a-select-option value="计算机网络信息中心">计算机网络信息中心</a-select-option>
            <a-select-option value="大数据技术与应用发展部">大数据技术与应用发展部</a-select-option>
            <a-select-option value="高性能计算技术与应用发展部">高性能计算技术与应用发展部</a-select-option>
            <a-select-option value="网络安全部">网络安全部</a-select-option>
            <a-select-option value="系统运维部">系统运维部</a-select-option>
            <a-select-option value="技术研发部">技术研发部</a-select-option>
            <a-select-option value="综合管理部">综合管理部</a-select-option>
            <a-select-option value="人力资源部">人力资源部</a-select-option>
            <a-select-option value="财务部">财务部</a-select-option>
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

    <!-- 批量删除进度模态框 -->
    <a-modal
      v-model:open="batchDeleteModalVisible"
      title="批量删除进度"
      :width="500"
      :closable="batchDeleteStatus !== 'active'"
      :maskClosable="false"
      :keyboard="false"
    >
      <div style="padding: 20px 0;">
        <a-alert
          :message="`正在删除角色，请稍候...`"
          :type="batchDeleteStatus === 'exception' ? 'warning' : 'info'"
          show-icon
          style="margin-bottom: 20px;"
        />

        <div style="margin-bottom: 16px;">
          <a-progress
            :percent="batchDeleteProgress"
            :status="batchDeleteStatus"
            :stroke-color="{
              '0%': '#667eea',
              '100%': '#764ba2',
            }"
          />
        </div>

        <div style="display: flex; justify-content: space-between; color: #666; font-size: 14px;">
          <span>进度：{{ batchDeleteCurrent }} / {{ batchDeleteTotal }}</span>
          <span style="color: #52c41a;">成功：{{ batchDeleteSuccessCount }}</span>
          <span style="color: #f5222d;">失败：{{ batchDeleteFailCount }}</span>
        </div>

        <div v-if="batchDeleteStatus !== 'active'" style="margin-top: 16px; text-align: center; color: #666;">
          <template v-if="batchDeleteStatus === 'success'">
            <a-result
              status="success"
              title="批量删除完成"
              :sub-title="`成功删除 ${batchDeleteSuccessCount} 个角色`"
              style="padding: 20px 0 0 0;"
            />
          </template>
          <template v-else>
            <a-result
              status="warning"
              title="批量删除完成"
              :sub-title="`成功 ${batchDeleteSuccessCount} 个，失败 ${batchDeleteFailCount} 个`"
              style="padding: 20px 0 0 0;"
            />
          </template>
        </div>
      </div>

      <template #footer>
        <a-button
          v-if="batchDeleteStatus !== 'active'"
          type="primary"
          @click="closeBatchDeleteModal"
        >
          关闭
        </a-button>
        <span v-else style="color: #999; font-size: 12px;">
          删除中，请勿关闭窗口...
        </span>
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

     
    }
  }

}
</style>
