<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { RoleAssignmentModel, RoleAssignmentQueryParams } from '@/api/system/role-assignment'
import { 
  getRoleAssignmentListApi, 
  createRoleAssignmentApi, 
  batchDeleteRoleAssignmentApi 
} from '@/api/system/role-assignment'
import { getRoleListApi } from '@/api/system/role'
import type { RoleModel } from '@/api/system/role'
import { getPersonnelListApi } from '@/api/system/personnel'
import type { PersonnelModel } from '@/api/system/personnel'

defineOptions({
  name: 'RoleAssignment',
})

// 查询表单
const queryForm = reactive<RoleAssignmentQueryParams>({
  userName: '',
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
    title: '用户编号',
    dataIndex: 'userCode',
    key: 'userCode',
  },
  {
    title: '用户姓名',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '单位',
    dataIndex: 'organization',
    key: 'organization',
    ellipsis: true,
  },
  {
    title: '授予角色',
    dataIndex: 'roles',
    key: 'roles',
  },
]

// 模态框相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const allRoles = ref<RoleModel[]>([])
const allUsers = ref<PersonnelModel[]>([])

// 表单数据
const formData = reactive({
  userId: undefined as string | number | undefined,
  roleIds: [] as (string | number)[],
})

// 获取角色分配列表
const fetchAssignmentList = async () => {
  loading.value = true
  try {
    const result = await getRoleAssignmentListApi(queryForm)
    if (result.data) {
      assignmentList.value = result.data.list
      total.value = result.data.total
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
    const result = await getRoleListApi({ pageNum: 1, pageSize: 1000 })
    if (result.data) {
      allRoles.value = result.data.list
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 获取所有用户列表
const fetchAllUsers = async () => {
  try {
    const result = await getPersonnelListApi({ pageNum: 1, pageSize: 1000 })
    if (result.data) {
      allUsers.value = result.data.list
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
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
  queryForm.userName = ''
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
  formData.roleIds = []
  modalVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.userId || formData.roleIds.length === 0) {
    message.error('请填写所有必填项')
    return
  }

  // 根据选中的用户ID获取用户信息
  const selectedUser = allUsers.value.find(user => user.id === formData.userId)
  if (!selectedUser) {
    message.error('未找到选中的用户信息')
    return
  }

  modalLoading.value = true
  try {
    await createRoleAssignmentApi({
      userCode: selectedUser.userCode,
      userName: selectedUser.userName,
      organization: selectedUser.organization,
      roleIds: formData.roleIds,
    })
    message.success('创建成功')
    modalVisible.value = false
    fetchAssignmentList()
  } catch (error) {
    message.error('创建失败')
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
  fetchAllUsers()
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
                v-model:value="queryForm.userName" 
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
              <template v-if="column.key === 'userName'">
                <a class="user-link">{{ record.userName }}</a>
              </template>
              <template v-else-if="column.key === 'roles'">
                <a-space wrap>
                  <a-tag v-for="role in record.roles" :key="role" color="blue">
                    {{ role }}
                  </a-tag>
                </a-space>
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
            placeholder="请选择用户"
            allow-clear
            show-search
            :filter-option="(input, option) => {
              return option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }"
            :options="allUsers.map(user => ({ 
              label: `${user.userName} - ${user.userCode} - ${user.organization}`, 
              value: user.id 
            }))"
          />
        </a-form-item>

        <a-form-item 
          label="授予角色" 
          name="roleIds"
          :rules="[
            { required: true, message: '请选择角色', trigger: 'change' }
          ]"
        >
          <a-select 
            v-model:value="formData.roleIds"
            mode="multiple"
            placeholder="请选择角色"
            allow-clear
            show-search
            :filter-option="(input, option) => {
              return option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }"
            :options="allRoles.map(role => ({ label: role.roleName, value: role.id }))"
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
