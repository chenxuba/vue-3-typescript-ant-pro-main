<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  getProjectUserListPagerApi, 
  type GetProjectUserListParams,
  type ProjectUserListItem
} from '@/api/project'
import { 
  getAllOrganizationListApi,
  type RawOrganizationModel
} from '@/api/system/organization'

defineOptions({
  name: 'ProjectStatistics',
})

const router = useRouter()
const route = useRoute()

// 获取项目信息（从路由参数）
const projectName = ref(route.query.name || '实训项目管理详情')

// 当前激活的标签页
const activeTab = ref('participation')

// 筛选表单
const filterForm = ref({
  userNumber: '',
  userName: '',
  unit: undefined,
  status: undefined,
})

// 单位选项（从接口获取）
const unitOptions = ref<Array<{ label: string; value: string }>>([])

// 获取组织列表
const fetchOrganizationList = async () => {
  try {
    const response = await getAllOrganizationListApi({
      limit: 10000, // 获取所有数据
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
    })
    
    if (response && response.data && response.data.list) {
      // 将组织列表转换为下拉选项格式
      unitOptions.value = response.data.list.map((org: RawOrganizationModel) => ({
        label: org.orgName,
        value: org.orgName,
      }))
    }
  } catch (error) {
    console.error('获取组织列表失败:', error)
    message.error('获取组织列表失败')
  }
}

// 参训状态选项
const statusOptions = [
  { label: '已完成', value: '已完成' },
  { label: '进行中', value: '进行中' },
  { label: '未开始', value: '未开始' },
]

// 任务关卡列表
const taskLevelList = [
  { id: '1', name: '第1关：编码任务' },
  { id: '2', name: '第2关：选择题任务' },
  { id: '3', name: '第3关：内嵌链接任务' },
  { id: '4', name: '第4关：lab任务' },
  { id: '5', name: '第5关：notebook任务' },
]

// 选中的任务关卡
const selectedTaskLevel = ref('1')

// 任务关卡搜索关键词
const taskLevelSearchKeyword = ref('')

// 过滤后的任务关卡列表
const filteredTaskLevelList = computed(() => {
  if (!taskLevelSearchKeyword.value) {
    return taskLevelList
  }
  return taskLevelList.filter(task => 
    task.name.toLowerCase().includes(taskLevelSearchKeyword.value.toLowerCase())
  )
})

// 选择任务关卡
const handleSelectTaskLevel = (taskId: string) => {
  selectedTaskLevel.value = taskId
}

// 表格列定义 - 参训整体情况
const participationColumns = [
  { title: '用户编号', dataIndex: 'userId', key: 'userId', width: 150 },
  { title: '用户姓名', dataIndex: 'nickName', key: 'nickName', width: 150 },
  { title: '单位', dataIndex: 'orgName', key: 'orgName', width: 300 },
  { title: '参训时间', dataIndex: 'joinTime', key: 'joinTime', width: 200 },
  { title: '参训状态', dataIndex: 'currentTask', key: 'currentTask', width: 150, align: 'center' as const },
]

// 统一的任务完成情况表格列定义（所有任务类型使用相同字段）
const taskColumns = [
  { title: '用户编号', dataIndex: 'userNumber', key: 'userNumber', width: 150 },
  { title: '用户姓名', dataIndex: 'userName', key: 'userName', width: 150 },
  { title: '单位', dataIndex: 'unit', key: 'unit', width: 250 },
  { title: '任务开始时间', dataIndex: 'taskStartTime', key: 'taskStartTime', width: 180 },
  { title: '任务结束时间', dataIndex: 'taskEndTime', key: 'taskEndTime', width: 180 },
  { title: '累计时间', dataIndex: 'totalTime', key: 'totalTime', width: 120 },
  { title: '实验状态', dataIndex: 'experimentStatus', key: 'experimentStatus', width: 120 },
]

// 参训整体情况数据
const participationData = ref<ProjectUserListItem[]>([])

// 模拟数据 - 任务完成情况
const taskData = ref([
  {
    key: '1',
    userNumber: 'ceshi123456',
    userName: '李清照',
    unit: '中国科学院计算机网络信息中心',
    taskStartTime: '2025-07-21  12:12:12',
    taskEndTime: '2025-07-21  12:12:12',
    totalTime: '12:12:12',
    experimentStatus: '已完成',
    statusType: 'completed',
  },
  {
    key: '2',
    userNumber: 'ceshi123456',
    userName: '李清照',
    unit: '中国科学院计算机网络信息中心',
    taskStartTime: '2025-07-21  12:12:12',
    taskEndTime: '2025-07-21  12:12:12',
    totalTime: '12:12:12',
    experimentStatus: '已完成',
    statusType: 'completed',
  },
  {
    key: '3',
    userNumber: 'ceshi123456',
    userName: '李清照',
    unit: '中国科学院计算机网络信息中心',
    taskStartTime: '2025-07-21  12:12:12',
    taskEndTime: '2025-07-21  12:12:12',
    totalTime: '12:12:12',
    experimentStatus: '进行中',
    statusType: 'inProgress',
  },
  {
    key: '4',
    userNumber: 'ceshi123456',
    userName: '李清照',
    unit: '中国科学院计算机网络信息中心',
    taskStartTime: '2025-07-21  12:12:12',
    taskEndTime: '2025-07-21  12:12:12',
    totalTime: '12:12:12',
    experimentStatus: '进行中',
    statusType: 'inProgress',
  },
  {
    key: '5',
    userNumber: 'ceshi123456',
    userName: '李清照',
    unit: '中国科学院计算机网络信息中心',
    taskStartTime: '2025-07-21  12:12:12',
    taskEndTime: '2025-07-21  12:12:12',
    totalTime: '12:12:12',
    experimentStatus: '进行中',
    statusType: 'inProgress',
  },
  {
    key: '6',
    userNumber: 'ceshi123456',
    userName: '李清照',
    unit: '中国科学院计算机网络信息中心',
    taskStartTime: '2025-07-21  12:12:12',
    taskEndTime: '2025-07-21  12:12:12',
    totalTime: '12:12:12',
    experimentStatus: '进行中',
    statusType: 'inProgress',
  },
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `数据共 ${total} 条`,
})

// 加载状态
const loading = ref(false)

// 获取项目ID（从路由参数）
const projectId = ref(Number(route.query.id) || 0)

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return '-'
  
  // 如果是秒级时间戳（小于10000000000），转换为毫秒
  const time = timestamp < 10000000000 ? timestamp * 1000 : timestamp
  const date = new Date(time)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取参训整体情况数据
const fetchParticipationData = async () => {
  loading.value = true
  try {
    const params: GetProjectUserListParams = {
      limit: pagination.value.pageSize,
      page: pagination.value.current,
      projectId: projectId.value,
    }

    // 添加筛选条件
    if (filterForm.value.userNumber) {
      params.userId = filterForm.value.userNumber
    }
    if (filterForm.value.userName) {
      params.nickName = filterForm.value.userName
    }
    if (filterForm.value.unit) {
      params.orgName = filterForm.value.unit
    }
    // 参训状态筛选（如果后端支持按currentTask筛选）
    // 注意：这里的逻辑需要根据后端实际支持的筛选方式调整
    // 如果后端不支持这种筛选，可能需要在前端过滤数据
    if (filterForm.value.status) {
      // 根据选择的状态，可以传递对应的筛选条件
      // 具体实现取决于后端API的设计
    }

    const response = await getProjectUserListPagerApi(params)
    
    if (response && response.list) {
      // 直接使用后端返回的数据
      participationData.value = response.list
      pagination.value.total = response.total
    }
  } catch (error) {
    console.error('获取参训数据失败:', error)
    message.error('获取参训数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  console.log('查询', filterForm.value)
  pagination.value.current = 1
  fetchParticipationData()
}

// 重置
const handleReset = () => {
  filterForm.value = {
    userNumber: '',
    userName: '',
    unit: undefined,
    status: undefined,
  }
  pagination.value.current = 1
  fetchParticipationData()
}

// 导出
const handleExport = () => {
  console.log('导出数据')
}

// 返回
const handleBack = () => {
  router.back()
}

// 处理分页变化
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchParticipationData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrganizationList() // 获取组织列表
  fetchParticipationData()
})
</script>

<template>
  <div class="project-statistics-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>{{ projectName }}</h2>
      <a-button @click="handleBack">返回</a-button>
    </div>

    <div class="page-content">
      <!-- 标签页 -->
      <a-tabs v-model:activeKey="activeTab" class="statistics-tabs">
        <!-- 参训整体情况 -->
        <a-tab-pane key="participation" tab="参训整体情况">
          <!-- 筛选区域 -->
          <div class="filter-section">
            <div class="filter-title">筛选查询</div>
            <div class="filter-form">
              <a-row :gutter="16" align="middle">
                <a-col :span="5">
                  <a-form-item label="用户编号：" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                    <a-input v-model:value="filterForm.userNumber" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="用户姓名：" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                    <a-input v-model:value="filterForm.userName" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="单位：" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                    <a-select 
                      v-model:value="filterForm.unit" 
                      placeholder="请选择" 
                      :options="unitOptions"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="参训状态：" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                    <a-select 
                      v-model:value="filterForm.status" 
                      placeholder="请选择" 
                      :options="statusOptions"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="4">
                  <div class="filter-actions">
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                  </div>
                </a-col>
              </a-row>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-section">
            <div class="table-header">
              <div class="table-info">
                数据列表
                <span class="total-info">数据共 <span class="total-number">{{ pagination.total }}</span> 条</span>
              </div>
              <a-button type="primary" @click="handleExport">导出</a-button>
            </div>

            <a-table 
              :columns="participationColumns" 
              :data-source="participationData"
              :pagination="pagination"
              :loading="loading"
              :row-key="(record) => record.id"
              :scroll="{ x: 1000 }"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'nickName'">
                  <a class="user-link">{{ record.nickName }}</a>
                </template>
                <template v-else-if="column.key === 'joinTime'">
                  {{ formatTimestamp(record.joinTime) }}
                </template>
                <template v-else-if="column.key === 'currentTask'">
                  <div class="status-cell">
                    <span>{{ record.currentTask }} / {{ record.currentTask }}</span>
                    <span 
                      class="status-icon"
                      :class="record.currentTask >= record.currentTask ? 'completed' : 'inProgress'"
                    >
                      <template v-if="record.currentTask >= record.currentTask">✓</template>
                      <template v-else>⟳</template>
                    </span>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 任务完成情况 -->
        <a-tab-pane key="task" tab="任务完成情况">
          <!-- 筛选区域 -->
          <div class="filter-section">
            <div class="filter-title">筛选查询</div>
            <div class="filter-form">
              <a-row :gutter="16" align="middle">
                <a-col :span="6">
                  <a-form-item label="用户编号：" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                    <a-input v-model:value="filterForm.userNumber" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="用户姓名：" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                    <a-input v-model:value="filterForm.userName" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="单位：" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                    <a-select 
                      v-model:value="filterForm.unit" 
                      placeholder="请选择" 
                      :options="unitOptions"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div class="filter-actions">
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                  </div>
                </a-col>
              </a-row>
            </div>
          </div>

          <!-- 主要内容区域：左侧关卡列表 + 右侧表格 -->
          <div class="task-completion-container">
            <!-- 左侧：关卡列表 -->
            <div class="task-level-sidebar">
              <div class="task-level-search">
                <a-input 
                  v-model:value="taskLevelSearchKeyword"
                  placeholder="请输入内容"
                  allow-clear
                >
                  <template #suffix>
                    <span class="search-icon">🔍</span>
                  </template>
                </a-input>
              </div>
              
              <div class="task-level-list">
                <div 
                  v-for="task in filteredTaskLevelList" 
                  :key="task.id"
                  class="task-level-item"
                  :class="{ active: selectedTaskLevel === task.id }"
                  @click="handleSelectTaskLevel(task.id)"
                >
                  {{ task.name }}
                </div>
              </div>
            </div>

            <!-- 右侧：表格区域 -->
            <div class="task-table-area">
              <div class="table-header">
                <div class="table-info">
                  数据列表
                  <span class="total-info">数据共 <span class="total-number">123</span> 条</span>
                </div>
                <a-button type="primary" @click="handleExport">导出</a-button>
              </div>

              <a-table 
                :columns="taskColumns" 
                :data-source="taskData"
                :pagination="pagination"
                :scroll="{ x: 1200 }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'userName'">
                    <a class="user-link">{{ record.userName }}</a>
                  </template>
                  <template v-else-if="column.key === 'experimentStatus'">
                    <span 
                      class="status-tag"
                      :class="record.statusType"
                    >
                      {{ record.experimentStatus }}
                    </span>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.project-statistics-page {
  background: #f0f2f5;
  // min-height: 100vh;

  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  .page-content {
    background: #fff;
    padding: 0;
    border-radius: 4px;

    .statistics-tabs {
      ::v-deep(.ant-tabs-nav) {
        padding: 0 24px;
        margin-bottom: 0;
      }

      ::v-deep(.ant-tabs-content-holder) {
        padding: 24px;
      }
    }
  }

  .filter-section {
    margin-bottom: 24px;

    .filter-title {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 16px;
      font-weight: 500;
    }

    .filter-form {
      .ant-form-item {
        margin-bottom: 0;

        ::v-deep(.ant-form-item-label) {
          label {
            color: rgba(0, 0, 0, 0.85);
            font-size: 14px;
          }
        }
      }

      .filter-actions {
        display: flex;
        gap: 12px;

        .ant-btn {
          min-width: 80px;
        }
      }
    }
  }

  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .table-info {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;

        .total-info {
          margin-left: 16px;
          font-weight: normal;
          color: rgba(0, 0, 0, 0.65);

          .total-number {
            color: #1890ff;
            font-weight: 500;
          }
        }
      }
    }

    .user-link {
      color: #1890ff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .status-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .status-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;

        &.completed {
          background: #52c41a;
          color: #fff;
        }

        &.inProgress {
          background: #1890ff;
          color: #fff;
          animation: rotate 1s linear infinite;
        }
      }
    }

    .status-tag {
      padding: 2px 8px;
      border-radius: 2px;
      font-size: 14px;

      &.completed {
        color: #1890ff;
        background: #e6f7ff;
      }

      &.inProgress {
        color: #1890ff;
        background: #e6f7ff;
      }
    }

    .action-link {
      color: #1890ff;
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  // 任务完成情况特殊布局
  .task-completion-container {
    display: flex;
    gap: 16px;
    margin-top: 24px;

    .task-level-sidebar {
      width: 320px;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 16px;
      display: flex;
      flex-direction: column;

      .task-level-search {
        margin-bottom: 16px;

        .search-icon {
          font-size: 16px;
          color: rgba(0, 0, 0, 0.45);
        }
      }

      .task-level-list {
        flex: 1;
        overflow-y: auto;

        .task-level-item {
          padding: 12px 16px;
          background: #fff;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          border: 1px solid transparent;

          &:hover {
            background: #f0f5ff;
          }

          &.active {
            background: #1890ff;
            color: #fff;
            font-weight: 500;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .task-table-area {
      flex: 1;
      min-width: 0;

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .table-info {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;

          .total-info {
            margin-left: 16px;
            font-weight: normal;
            color: rgba(0, 0, 0, 0.65);

            .total-number {
              color: #1890ff;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

