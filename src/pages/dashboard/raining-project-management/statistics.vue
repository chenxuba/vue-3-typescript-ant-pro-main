<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ClockCircleOutlined ,CheckCircleFilled} from '@ant-design/icons-vue'
import { 
  getProjectUserListPagerApi, 
  type GetProjectUserListParams,
  type ProjectUserListItem,
  getProjectTaskListApi,
  type GetProjectTaskListParams,
  getProjectUserTaskListPagerApi,
  type GetProjectUserTaskListParams,
  type ProjectUserTaskListItem,
  exportProjectUserApi,
  type ExportProjectUserParams,
  exportProjectUserTaskApi,
  type ExportProjectUserTaskParams
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
const projectName = ref(route.query.name || '项目管理详情')

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

// 组织搜索加载状态
const fetchingOrganization = ref(false)

// 获取组织列表（支持按 orgName 搜索）
const fetchOrganizationList = async (searchValue: string = '') => {
  fetchingOrganization.value = true
  try {
    const response = await getAllOrganizationListApi({
      limit: 50, // 限制返回数量
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
      orgName: searchValue || undefined, // 传递搜索关键词
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
    unitOptions.value = []
  } finally {
    fetchingOrganization.value = false
  }
}

// 防抖定时器
let searchTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 远程搜索组织（带防抖）
 */
const handleSearchOrganization = (searchValue: string) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    fetchOrganizationList(searchValue)
  }, 300) // 300ms 防抖
}

// 参训状态选项
const statusOptions = [
  { label: '已完成', value: '1' },
  { label: '进行中', value: '2' },
  { label: '未开始', value: '3' },
]

// 任务关卡列表（从接口获取）
const taskLevelList = ref<Array<{ taskId: number; name: string }>>([])

// 选中的任务关卡
const selectedTaskLevel = ref<number | null>(null)

// 任务关卡搜索关键词
const taskLevelSearchKeyword = ref('')

// 过滤后的任务关卡列表
const filteredTaskLevelList = computed(() => {
  if (!taskLevelSearchKeyword.value) {
    return taskLevelList.value
  }
  return taskLevelList.value.filter(task => 
    task.name.toLowerCase().includes(taskLevelSearchKeyword.value.toLowerCase())
  )
})

// 选择任务关卡
const handleSelectTaskLevel = (taskId: number) => {
  selectedTaskLevel.value = taskId
  // 重置分页并获取新数据
  taskPagination.value.current = 1
  fetchTaskCompletionData()
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

// 任务完成情况数据
const taskData = ref<ProjectUserTaskListItem[]>([])

// 分页配置 - 参训整体情况
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `数据共 ${total} 条`,
})

// 分页配置 - 任务完成情况
const taskPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `数据共 ${total} 条`,
})

// 加载状态
const loading = ref(false)
const taskLoading = ref(false)

// 获取项目ID（从路由参数）
const projectId = ref(Number(route.query.id) || 0)

// 项目任务总数
const totalTaskCount = ref(0)

// 获取项目任务列表
const fetchProjectTaskCount = async () => {
  try {
    const params: GetProjectTaskListParams = {
      projectId: projectId.value,
      orderbyFiled:'task_id:asc',
    }
    
    const response = await getProjectTaskListApi(params)
    
    if (response && Array.isArray(response)) {
      totalTaskCount.value = response.length
      // 将任务列表数据存储到 taskLevelList
      taskLevelList.value = response.map((task: any) => ({
        taskId: task.taskId,
        name: task.name,
      }))
      // 默认选中第一个任务
      if (taskLevelList.value.length > 0) {
        selectedTaskLevel.value = taskLevelList.value[0].taskId
      }
    }
  } catch (error) {
    console.error('获取项目任务列表失败:', error)
    message.error('获取项目任务列表失败')
  }
}

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
    // 参训状态筛选
    if (filterForm.value.status) {
      params.status = filterForm.value.status
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

// 计算累计时间（时间戳差值转换为时分秒格式）
const formatDuration = (beginTime: number, endTime: number) => {
  if (!beginTime || !endTime) return '-'
  
  // 判断时间戳单位（秒级还是毫秒级）
  const begin = beginTime < 10000000000 ? beginTime * 1000 : beginTime
  const end = endTime < 10000000000 ? endTime * 1000 : endTime
  
  // 计算时间差（毫秒）并转换为秒
  const duration = Math.floor((end - begin) / 1000)
  
  if (duration < 0) return '-'
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 获取实验状态文本
const getExperimentStatusText = (status: number) => {
  if (status === 10) {
    return '已完成'
  } else if (status > 0 && status < 10) {
    return '进行中'
  } else {
    return '未开始'
  }
}

// 获取实验状态类型
const getExperimentStatusType = (status: number) => {
  if (status === 10) {
    return 'completed'
  } else if (status > 0 && status < 10) {
    return 'inProgress'
  } else {
    return 'notStarted'
  }
}

// 获取任务完成情况数据
const fetchTaskCompletionData = async () => {
  if (!selectedTaskLevel.value) {
    return
  }
  
  taskLoading.value = true
  try {
    const params: GetProjectUserTaskListParams = {
      limit: taskPagination.value.pageSize,
      page: taskPagination.value.current,
      projectId: projectId.value,
      taskId: selectedTaskLevel.value,
      orderbyFiled: 'id:desc',
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

    const response = await getProjectUserTaskListPagerApi(params)
    
    if (response && response.list) {
      taskData.value = response.list
      taskPagination.value.total = response.total
    }
  } catch (error) {
    console.error('获取任务完成情况失败:', error)
    message.error('获取任务完成情况失败')
  } finally {
    taskLoading.value = false
  }
}

// 查询
const handleSearch = () => {
  console.log('查询', filterForm.value)
  if (activeTab.value === 'participation') {
    pagination.value.current = 1
    fetchParticipationData()
  } else if (activeTab.value === 'task') {
    taskPagination.value.current = 1
    fetchTaskCompletionData()
  }
}

// 重置
const handleReset = () => {
  filterForm.value = {
    userNumber: '',
    userName: '',
    unit: undefined,
    status: undefined,
  }
  if (activeTab.value === 'participation') {
    pagination.value.current = 1
    fetchParticipationData()
  } else if (activeTab.value === 'task') {
    taskPagination.value.current = 1
    fetchTaskCompletionData()
  }
}

// 导出
const handleExport = async () => {
  try {
    message.loading({ content: '正在导出...', key: 'export', duration: 0 })
    
    let blob: Blob
    let fileName: string
    
    if (activeTab.value === 'participation') {
      // 参训整体情况导出
      const params: ExportProjectUserParams = {
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
      // 参训状态筛选
      if (filterForm.value.status) {
        params.status = filterForm.value.status
      }

      blob = await exportProjectUserApi(params)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      fileName = `${projectName.value || '项目统计'}_参训整体情况_${timestamp}.xlsx`
    } else {
      // 任务完成情况导出
      if (!selectedTaskLevel.value) {
        message.error({ content: '请先选择任务关卡', key: 'export' })
        return
      }
      
      const params: ExportProjectUserTaskParams = {
        limit: taskPagination.value.pageSize,
        page: taskPagination.value.current,
        projectId: projectId.value,
        taskId: selectedTaskLevel.value,
        orderbyFiled: 'id:desc',
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

      blob = await exportProjectUserTaskApi(params)
      const taskName = taskLevelList.value.find(t => t.taskId === selectedTaskLevel.value)?.name || '任务'
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      fileName = `${projectName.value || '项目统计'}_${taskName}_${timestamp}.xlsx`
    }
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.success({ content: '导出成功', key: 'export' })
  } catch (error: any) {
    console.error('导出失败:', error)
    message.error({ content: error.message || '导出失败', key: 'export' })
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 处理分页变化 - 参训整体情况
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchParticipationData()
}

// 处理分页变化 - 任务完成情况
const handleTaskTableChange = (pag: any) => {
  taskPagination.value.current = pag.current
  taskPagination.value.pageSize = pag.pageSize
  fetchTaskCompletionData()
}

// 组件挂载时获取数据
onMounted(async () => {
  fetchOrganizationList() // 获取组织列表
  await fetchProjectTaskCount() // 获取项目任务总数
  fetchParticipationData()
  // 如果有选中的任务关卡，获取任务完成情况数据
  if (selectedTaskLevel.value) {
    fetchTaskCompletionData()
  }
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
                      placeholder="请输入单位名称搜索" 
                      :options="unitOptions"
                      allow-clear
                      show-search
                      :filter-option="false"
                      :loading="fetchingOrganization"
                      :not-found-content="fetchingOrganization ? '加载中...' : '暂无数据'"
                      @search="handleSearchOrganization"
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
                    <span>{{ record.currentTask }} / {{ totalTaskCount }}</span>
                    <span 
                      class="status-icon"
                      :class="record.currentTask >= totalTaskCount ? 'completed' : 'inProgress'"
                    >
                      <template v-if="record.currentTask >= totalTaskCount"><CheckCircleFilled /></template>
                      <template v-else><ClockCircleOutlined /></template>
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
                      placeholder="请输入单位名称搜索" 
                      :options="unitOptions"
                      allow-clear
                      show-search
                      :filter-option="false"
                      :loading="fetchingOrganization"
                      :not-found-content="fetchingOrganization ? '加载中...' : '暂无数据'"
                      @search="handleSearchOrganization"
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
                  :key="task.taskId"
                  class="task-level-item"
                  :class="{ active: selectedTaskLevel === task.taskId }"
                  @click="handleSelectTaskLevel(task.taskId)"
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
                  <span class="total-info">数据共 <span class="total-number">{{ taskPagination.total }}</span> 条</span>
                </div>
                <a-button type="primary" @click="handleExport">导出</a-button>
              </div>

              <a-table 
                :columns="taskColumns" 
                :data-source="taskData"
                :pagination="taskPagination"
                :loading="taskLoading"
                :row-key="(record) => record.id"
                :scroll="{ x: 1200 }"
                @change="handleTaskTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'userNumber'">
                    {{ record.userId }}
                  </template>
                  <template v-else-if="column.key === 'userName'">
                    <span class="user-link">{{ record.nickName }}</span>
                  </template>
                  <template v-else-if="column.key === 'unit'">
                    {{ record.orgName || '-' }}
                  </template>
                  <template v-else-if="column.key === 'taskStartTime'">
                    {{ formatTimestamp(record.beginTime) }}
                  </template>
                  <template v-else-if="column.key === 'taskEndTime'">
                    {{ formatTimestamp(record.endTime) }}
                  </template>
                  <template v-else-if="column.key === 'totalTime'">
                    {{ formatDuration(record.beginTime, record.endTime) }}
                  </template>
                  <template v-else-if="column.key === 'experimentStatus'">
                    <span 
                      class="status-tag"
                      :class="getExperimentStatusType(record.status)"
                    >
                      {{ getExperimentStatusText(record.status) }}
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
      color: #333;
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
          // background: #52c41a;
          color: #52c41a;
        }

        &.inProgress {
          // background: #1890ff;
          color: #1890ff;
          // animation: rotate 1s linear infinite;
          font-size: 16px;
        }
      }
    }

    .status-tag {
      padding: 2px 8px;
      border-radius: 2px;
      font-size: 14px;

      &.completed {
        color: #52c41a;
        background: #f6ffed;
      }

      &.inProgress {
        color: #1890ff;
        background: #e6f7ff;
      }

      &.notStarted {
        color: #8c8c8c;
        background: #fafafa;
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

