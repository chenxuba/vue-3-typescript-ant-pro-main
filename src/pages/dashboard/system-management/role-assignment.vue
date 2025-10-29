<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { RoleAssignmentModel, RoleAssignmentQueryParams } from '@/api/system/role-assignment'
import { 
  getRoleUserListPagerApi, 
  createRoleUserApi, 
  batchDeleteRoleAssignmentApi 
} from '@/api/system/role-assignment'
import { getRoleListPagerApi } from '@/api/system/role'
import type { RolePagerItem } from '@/api/system/role'
import { getAllUsersApi } from '@/api/system/personnel'
import type { AllUserModel } from '@/api/system/personnel'

defineOptions({
  name: 'RoleAssignment',
})

// 查询表单
const queryForm = reactive<RoleAssignmentQueryParams>({
  nickName: '',
  roleName: '',
  pageNum: 1,
  pageSize: 10,
})

const loading = ref(false)
const assignmentList = ref<RoleAssignmentModel[]>([])
const total = ref(0)

// 表格选择
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<RoleAssignmentModel[]>([])

// 表格列定义
const columns = [
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: '用户姓名',
    dataIndex: 'nickName',
    key: 'nickName',
  },
  {
    title: '单位',
    dataIndex: 'orgName',
    key: 'orgName',
    ellipsis: true,
  },
  // {
  //   title: '角色ID',
  //   dataIndex: 'roleId',
  //   key: 'roleId',
  // },
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
  },
]

// 模态框相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const allRoles = ref<RolePagerItem[]>([])
const allUsers = ref<AllUserModel[]>([])

// 用户搜索加载状态
const fetchingUsers = ref(false)

// 表单数据
const formData = reactive({
  userId: undefined as string | number | undefined,
  roleId: undefined as string | number | undefined,
})

// 获取角色分配列表
const fetchAssignmentList = async () => {
  loading.value = true
  try {
    // 将 pageNum 和 pageSize 转换为 page 和 limit
    const params = {
      nickName: queryForm.nickName,
      roleName: queryForm.roleName,
      page: queryForm.pageNum,
      limit: queryForm.pageSize,
    }
    const result = await getRoleUserListPagerApi(params)
    if (result.data && result.data.list) {
      assignmentList.value = result.data.list as any
      total.value = result.data.count
    }
  } catch (error) {
    message.error('获取角色分配列表失败')
  } finally {
    loading.value = false
  }
}

// 获取所有角色列表
const fetchAllRoles = async () => {
  try {
    const result = await getRoleListPagerApi({ 
      page: 1, 
      limit: 1000,
      startNum: 0
    })
    if (result.data && result.data.list) {
      allRoles.value = result.data.list
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 获取所有用户列表（支持按 operatorName 搜索）
const fetchAllUsers = async (searchValue: string = '') => {
  fetchingUsers.value = true
  try {
    const result = await getAllUsersApi({ 
      page: 1, 
      limit: 50, // 限制返回数量
      startNum: 0,
      operatorName: searchValue || undefined, // 传递搜索关键词
    })
    if (result.data && result.data.list) {
      allUsers.value = result.data.list
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    allUsers.value = []
  } finally {
    fetchingUsers.value = false
  }
}

// 防抖定时器
let userSearchTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 远程搜索用户（带防抖）
 */
const handleSearchUsers = (searchValue: string) => {
  if (userSearchTimer) {
    clearTimeout(userSearchTimer)
  }
  
  userSearchTimer = setTimeout(() => {
    fetchAllUsers(searchValue)
  }, 300) // 300ms 防抖
}

// 查询
const handleQuery = () => {
  queryForm.pageNum = 1
  selectedRowKeys.value = []
  selectedRows.value = []
  fetchAssignmentList()
}

// 重置
const handleReset = () => {
  queryForm.nickName = ''
  queryForm.roleName = ''
  queryForm.pageNum = 1
  queryForm.pageSize = 10
  selectedRowKeys.value = []
  selectedRows.value = []
  fetchAssignmentList()
}

// 表格选择变化
const onSelectChange = (keys: (string | number)[], rows: any[]) => {
  selectedRowKeys.value = keys
  selectedRows.value = rows as RoleAssignmentModel[]
}

// 打开新增模态框
const handleCreate = () => {
  formData.userId = undefined
  formData.roleId = undefined
  modalVisible.value = true
  // 打开弹窗时加载初始用户数据
  fetchAllUsers()
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.userId || !formData.roleId) {
    message.error('请填写所有必填项')
    return
  }

  modalLoading.value = true
  try {
    await createRoleUserApi({
      roleId: Number(formData.roleId),
      userId: Number(formData.userId)
    })
    
    message.success('分配成功')
    modalVisible.value = false
    fetchAssignmentList()
  } catch (error) {
    message.error('分配失败')
  } finally {
    modalLoading.value = false
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的角色分配')
    return
  }
  
  Modal.confirm({
    title: '确认批量删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条角色分配记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await batchDeleteRoleAssignmentApi(selectedRowKeys.value)
        message.success('批量删除成功')
        selectedRowKeys.value = []
        selectedRows.value = []
        fetchAssignmentList()
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
  fetchAssignmentList()
}

onMounted(() => {
  fetchAssignmentList()
  fetchAllRoles()
  // 移除初始加载用户列表，改为打开弹窗时按需加载
})
</script>

<template>
  <div class="role-assignment">
    <div class="content-wrapper">
      <div class="main-panel">
        <!-- 筛选查询区域 -->
        <div class="query-header">
          <h3>筛选查询</h3>
        </div>

        <div class="query-form">
          <a-form layout="inline">
            <a-form-item label="用户姓名">
              <a-input 
                v-model:value="queryForm.nickName" 
                placeholder="请输入" 
                allow-clear
                style="width: 200px"
                @pressEnter="handleQuery"
              />
            </a-form-item>
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
              新增分配
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
            :data-source="assignmentList"
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
              <template v-if="column.key === 'nickName'">
                <a class="user-link">{{ record.nickName || '-' }}</a>
              </template>
              <template v-else-if="column.key === 'roleName'">
                <a-tag v-if="record.roleName" color="blue">
                  {{ record.roleName }}
                </a-tag>
                <span v-else>-</span>
              </template>
              <template v-else-if="column.key === 'orgName'">
                {{ record.orgName || '-' }}
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 新增分配模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="新增角色分配"
      :width="600"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
    >
      <a-form
        :model="formData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        style="margin-top: 24px"
      >
        <a-form-item 
          label="选择用户" 
          name="userId"
          :rules="[
            { required: true, message: '请选择用户', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.userId" 
            placeholder="请输入用户姓名搜索"
            allow-clear
            show-search
            :filter-option="false"
            :loading="fetchingUsers"
            :not-found-content="fetchingUsers ? '加载中...' : '暂无数据'"
            @search="handleSearchUsers"
            :options="allUsers.map(user => ({ 
              label: `${user.operatorName} - ${user.userID} - ${user.orgName}`, 
              value: user.operatorID 
            }))"
          />
        </a-form-item>

        <a-form-item 
          label="授予角色" 
          name="roleId"
          :rules="[
            { required: true, message: '请选择角色', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.roleId"
            placeholder="请选择角色"
            allow-clear
            show-search
            :filter-option="(input, option) => {
              return option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }"
            :options="allRoles.map(role => ({ label: role.name, value: role.roleId }))"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.role-assignment {
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

      .user-link {
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
