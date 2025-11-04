<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { getProjectListPagerApi, updateProjectApi, deleteProjectApi, type ProjectListItem } from '@/api/project'
import { getDicGroupApi, type DictionaryItem } from '@/api/common/dictionary'
import { getAllOrganizationListApi, type RawOrganizationModel } from '@/api/system/organization'

defineOptions({
  name: 'RainingProjectManagement',
})

const router = useRouter()

// 环境字典数据
const environmentDictList = ref<DictionaryItem[]>([])

// 组织列表数据
const organizationList = ref<RawOrganizationModel[]>([])

// 组织搜索加载状态
const fetchingOrganization = ref(false)

/**
 * 获取环境字典数据
 * 需要查询三个字典组：project#environment_1, project#environment_2, project#environment_3
 */
const fetchEnvironmentDict = async () => {
  try {
    const codes = ['project#environment_1', 'project#environment_2', 'project#environment_3']
    
    // 并行查询三个字典组
    const results = await Promise.all(
      codes.map(code => getDicGroupApi({ code }))
    )
    
    // 合并所有字典项
    const allDictItems: DictionaryItem[] = []
    results.forEach(result => {
      if (result && result.list) {
        allDictItems.push(...result.list)
      }
    })
    
    // 根据 value 字段去重
    const uniqueMap = new Map<string, DictionaryItem>()
    allDictItems.forEach(item => {
      if (!uniqueMap.has(item.value)) {
        uniqueMap.set(item.value, item)
      }
    })
    
    environmentDictList.value = Array.from(uniqueMap.values())
  } catch (error) {
    console.error('获取环境字典失败：', error)
    environmentDictList.value = []
  }
}

/**
 * 获取组织列表数据（支持按 orgName 搜索）
 */
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
      organizationList.value = response.data.list
    }
  } catch (error) {
    console.error('获取组织列表失败：', error)
    organizationList.value = []
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

/**
 * 获取环境名称
 * @param envValue 环境值
 * @returns 环境名称
 */
const getEnvironmentName = (envValue: number | string | undefined): string => {
  if (!envValue && envValue !== 0) return '-'
  
  // 将 envValue 转为字符串进行匹配
  const valueStr = String(envValue)
  const item = environmentDictList.value.find(dict => dict.value === valueStr)
  
  return item ? item.name : '-'
}

// 筛选表单数据
const searchForm = ref({
  projectName: '',
  environment: undefined,
  organizer: undefined,
})

// 环境选项 - 从字典数据动态生成
const environmentOptions = computed(() => {
  return environmentDictList.value.map(item => ({
    label: item.name,
    value: item.value,
  }))
})

// 主办单位选项 - 从组织列表动态生成
const organizerOptions = computed(() => {
  // 去重并按组织名称排序
  const uniqueOrgs = new Map<string, string>()
  organizationList.value.forEach(org => {
    if (org.orgName && !uniqueOrgs.has(org.orgName)) {
      uniqueOrgs.set(org.orgName, org.orgName)
    }
  })
  
  return Array.from(uniqueOrgs.values())
    .sort()
    .map(name => ({
      label: name,
      value: name,
    }))
})


// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

// 表格列配置
const columns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: '实验环境',
    dataIndex: 'environment',
    key: 'environment',
  },
  {
    title: '技能标签',
    dataIndex: 'skillTag',
    key: 'skillTag',
    ellipsis: true,
  },
  {
    title: '主办单位',
    dataIndex: 'organizer',
    key: 'organizer',
  },
  {
    title: '公开范围',
    dataIndex: 'publicScope',
    key: 'publicScope',
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
  },
]

// 表格数据
const dataSource = ref<ProjectListItem[]>([])

// 加载状态
const loading = ref(false)

// 获取项目列表
const fetchProjectList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      startNum: (pagination.value.current - 1) * pagination.value.pageSize,
      name: searchForm.value.projectName || undefined,
      orgName: searchForm.value.organizer || undefined,
      environment: searchForm.value.environment || undefined,
      orderbyFiled: 'createTime:desc', // 按创建时间正序
    }

    const result = await getProjectListPagerApi(params)

    dataSource.value = result.list
    pagination.value.total = result.total // 使用 count 字段作为总条数
  } catch (error: any) {
    message.error(error.message || '获取项目列表失败')
    dataSource.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 分页改变时的回调
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchProjectList()
}

// 重置表单
const handleReset = () => {
  searchForm.value = {
    projectName: '',
    environment: undefined,
    organizer: undefined,
  }
  pagination.value.current = 1
  fetchProjectList()
}

// 查询
const handleSearch = () => {
  pagination.value.current = 1 // 重置到第一页
  fetchProjectList()
}

// 组件挂载时获取字典和列表
onMounted(() => {
  fetchEnvironmentDict() // 获取环境字典数据
  fetchOrganizationList() // 初始加载一些组织数据
  fetchProjectList()
})

// 新建项目 - 跳转到新建页面
const handleCreate = () => {
  router.push('/dashboard/raining-project-management/create')
}

// 统计
const handleStatistics = (record: any) => {
  router.push({
    path: '/dashboard/raining-project-management/statistics',
    query: {
      id: record.id,
      name: record.name,
    },
  })
}

// 发布/取消发布
const handlePublish = (record: any) => {
  const isPublished = record.status === 10
  const actionText = isPublished ? '取消发布' : '发布'
  const newStatus = isPublished ? 2 : 10

  Modal.confirm({
    title: `确认${actionText}`,
    content: `确定要${actionText}项目"${record.name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await updateProjectApi({
          id: record.id,
          status: newStatus,
        } as any)

        message.success(`${actionText}成功`)

        // 刷新列表
        fetchProjectList()
      } catch (error: any) {
        console.error(`${actionText}失败：`, error)
        message.error(error.message || `${actionText}失败`)
      }
    },
  })
}

// 编辑
const handleEdit = (record: any) => {
  router.push({
    path: '/dashboard/raining-project-management/edit',
    query: {
      id: record.id,
    },
  })
}

// 删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目"${record.name}"吗？删除后数据将无法恢复！`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteProjectApi({
          id: record.id,
        })

        message.success('删除成功')

        // 如果删除的是当前页最后一条数据，且不是第一页，则返回上一页
        if (dataSource.value.length === 1 && pagination.value.current > 1) {
          pagination.value.current -= 1
        }

        // 刷新列表
        fetchProjectList()
      } catch (error: any) {
        console.error('删除失败：', error)
        message.error(error.message || '删除失败')
      }
    },
  })
}
</script>

<template>
  <div class="raining-project-management">
    <!-- 筛选查询区域 -->
    <div class="search-section">
      <h3 class="section-title">筛选查询</h3>
      <a-form :model="searchForm" layout="horizontal" class="search-form">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item label="项目名称：" name="projectName">
              <a-input v-model:value="searchForm.projectName" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="实验环境：" name="environment">
              <a-select v-model:value="searchForm.environment" placeholder="请选择实验环境" :options="environmentOptions"
                allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="主办单位：" name="organizer">
              <a-select 
                v-model:value="searchForm.organizer" 
                placeholder="请输入主办单位名称搜索" 
                :options="organizerOptions"
                allow-clear 
                show-search 
                :filter-option="false"
                :loading="fetchingOrganization"
                :not-found-content="fetchingOrganization ? '加载中...' : '暂无数据'"
                @search="handleSearchOrganization"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6" class="form-actions">
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-col>
        </a-row>

      </a-form>
    </div>

    <!-- 数据列表区域 -->
    <div class="table-section">
      <div class="table-header">
        <div class="table-tabs">
          <div class="tabs-left">
            <span class="tab-item active">数据列表</span>
            <span class="data-count">数据共 {{ pagination.total }} 条</span>
          </div>
          <div class="tabs-right">
            <a-button type="primary" @click="handleCreate">新建项目</a-button>
          </div>
        </div>
      </div>

      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :loading="loading" 
        :row-key="(record) => record.id"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }" 
        @change="handleTableChange" 
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'projectName'">
            {{ record.name }}
          </template>
          <!-- 实验环境 -->
          <template v-else-if="column.key === 'environment'">
            {{ getEnvironmentName(record.environment) }}
          </template>
          <template v-else-if="column.key === 'skillTag'">
            <a-tooltip :title="record.tag" placement="topLeft">
              <span>{{ record.tag }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'organizer'">
            {{ record.orgName || '-' }}
          </template>
          <template v-else-if="column.key === 'publicScope'">
            <div class="public-scope-cell">
              <div class="status-badge" :class="{
                'status-published': record.status === 10,
                'status-unpublished': record.status !== 10
              }">
                {{ record.status === 10 ? '已发布' : record.status === 2 ? '已取消发布' : record.status === 1 ? '已中断' : '已中断' }}
              </div>
              <div class="scope-badge" :class="{
                'scope-full': record.authType === 1,
                'scope-academy': record.authType === 2,
                'scope-unit': record.authType === 3,
                'scope-private': record.authType === 4
              }">
                {{
                  record.authType === 1 ? '完全公开' :
                    record.authType === 2 ? '全院公开' :
                      record.authType === 3 ? '本单位公开' :
                        record.authType === 4 ? '不公开' : '-'
                }}
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="action-links">
              <!-- status === 1 已中断的项目：编辑、删除 -->
              <template v-if="record.status === 1">
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
                <a class="danger-link" @click="handleDelete(record)">删除</a>
              </template>
              
              <!-- status === 10 已发布项目：统计、取消发布 -->
              <template v-else-if="record.status === 10">
                <a @click="handleStatistics(record)">统计</a>
                <a-divider type="vertical" />
                <a @click="handlePublish(record)">取消发布</a>
              </template>
              
              <!-- status === 2 已取消发布项目：统计、发布、编辑、删除 -->
              <template v-else-if="record.status === 2">
                <a @click="handleStatistics(record)">统计</a>
                <a-divider type="vertical" />
                <a @click="handlePublish(record)">发布</a>
                <a-divider type="vertical" />
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
                <a class="danger-link" @click="handleDelete(record)">删除</a>
              </template>
              
              <!-- 其他状态：默认显示所有操作 -->
              <template v-else>
                <a @click="handleStatistics(record)">统计</a>
                <a-divider type="vertical" />
                <a @click="handlePublish(record)">发布</a>
                <a-divider type="vertical" />
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
                <a class="danger-link" @click="handleDelete(record)">删除</a>
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped lang="less">
.raining-project-management {
  background: #f0f2f5;
  // min-height: 100vh;

  .search-section {
    background: #fff;
    padding: 12px 24px;
    border-radius: 4px;
    margin-bottom: 18px;

    .section-title {
      margin: 0 0 24px 0;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }

    .search-form {
      :deep(.ant-form-item) {
        margin-bottom: 0;
      }

      :deep(.ant-form-item-label) {
        white-space: nowrap;
      }

      .form-actions {
        text-align: center;

        .ant-btn {
          margin: 0 8px;
          padding: 0 32px;
        }
      }
    }
  }

  .table-section {
    background: #fff;
    padding: 24px;
    border-radius: 4px;

    .table-header {
      margin-bottom: 16px;

      .table-tabs {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 12px;

        .tabs-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tabs-right {
          display: flex;
          align-items: center;
        }

        .tab-item {
          font-size: 16px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
          cursor: pointer;
          position: relative;

          &.active {
            color: #1890ff;

            &::after {
              content: '';
              position: absolute;
              bottom: -13px;
              left: 0;
              right: 0;
              height: 2px;
              background: #1890ff;
            }
          }
        }

        .data-count {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
      }
    }

    .public-scope-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .status-badge,
      .scope-badge {
        padding: 2px 8px;
        border-radius: 2px;
        font-size: 12px;
        display: inline-block;
        width: fit-content;
      }

      .status-badge {
        &.status-published {
          color: #1890ff;
          background: #e6f7ff;
        }

        &.status-unpublished {
          color: rgba(0, 0, 0, 0.65);
          background: #f5f5f5;
        }
      }

      .scope-badge {
        &.scope-full {
          color: #1890ff;
          background: #e6f7ff;
        }

        &.scope-academy {
          color: #1890ff;
          background: #e6f7ff;
        }

        &.scope-unit {
          color: #1890ff;
          background: #e6f7ff;
        }

        &.scope-private {
          color: rgba(0, 0, 0, 0.65);
          background: #f5f5f5;
        }
      }
    }

    .action-links {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      a {
        color: #1890ff;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          color: #40a9ff;
        }

        &.danger-link {
          color: #ff4d4f;

          &:hover {
            color: #ff7875;
          }
        }
      }

      .ant-divider-vertical {
        margin: 0 8px;
      }
    }
  }
}
</style>
