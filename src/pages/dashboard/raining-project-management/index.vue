<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getProjectListPagerApi, type ProjectListItem } from '@/api/project'

defineOptions({
  name: 'RainingProjectManagement',
})

const router = useRouter()

// 筛选表单数据
const searchForm = ref({
  projectName: '',
  environment: undefined,
  organizer: undefined,
})

// 环境选项
const environmentOptions = [
  { label: '全栈环境', value: '全栈环境' },
  { label: 'JupyterNotebook环境', value: 'JupyterNotebook环境' },
  { label: 'JupyterLab环境', value: 'JupyterLab环境' },
  { label: '其他', value: '其他' },
]

// 主办单位选项
const organizerOptions = [
  { label: '中国科学院计算机网络信息中心', value: '中国科学院计算机网络信息中心' },
]

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
      orderbyFiled: 'createTime:desc', // 按创建时间正序
    }
    
    const result = await getProjectListPagerApi(params)
    
    dataSource.value = result.list
    pagination.value.total = result.count // 使用 count 字段作为总条数
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

// 组件挂载时获取列表
onMounted(() => {
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
      id: record.key,
      name: record.projectName,
    },
  })
}

// 发布/取消发布
const handlePublish = (record: any) => {
  console.log('发布/取消发布', record)
}

// 编辑
const handleEdit = (record: any) => {
  console.log('编辑', record)
}

// 删除
const handleDelete = (record: any) => {
  console.log('删除', record)
}
</script>

<template>
  <div class="raining-project-management">
    <!-- 筛选查询区域 -->
    <div class="search-section">
      <h3 class="section-title">筛选查询</h3>
      <a-form
        :model="searchForm"
        layout="horizontal"
        class="search-form"
      >
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item label="项目名称：" name="projectName">
              <a-input
                v-model:value="searchForm.projectName"
                placeholder="请输入项目名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="实验环境：" name="environment">
              <a-select
                v-model:value="searchForm.environment"
                placeholder="请选择实验环境"
                :options="environmentOptions"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="主办单位：" name="organizer">
              <a-select
                v-model:value="searchForm.organizer"
                placeholder="请选择主办单位"
                :options="organizerOptions"
                allow-clear
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
          <template v-else-if="column.key === 'skillTag'">
            {{ record.tag }}
          </template>
          <template v-else-if="column.key === 'organizer'">
            {{ record.connectUnit || '-' }}
          </template>
          <template v-else-if="column.key === 'publicScope'">
            <div class="public-scope-cell">
              <div 
                class="status-badge" 
                :class="{
                  'status-published': record.status === 1,
                  'status-unpublished': record.status !== 1
                }"
              >
                {{ record.status === 1 ? '已发布' : '未发布' }}
              </div>
              <div 
                class="scope-badge"
                :class="{
                  'scope-full': record.authType === 1,
                  'scope-academy': record.authType === 2,
                  'scope-unit': record.authType === 3,
                  'scope-private': record.authType === 4
                }"
              >
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
              <a @click="handleStatistics(record)">统计</a>
              <template v-if="record.status === 1">
                <a-divider type="vertical" />
                <a @click="handlePublish(record)">取消发布</a>
                <a-divider type="vertical" />
                <a @click="handleEdit(record)">编辑</a>
              </template>
              <template v-else>
                <a-divider type="vertical" />
                <a @click="handlePublish(record)">发布</a>
              </template>
              <a-divider type="vertical" />
              <a class="danger-link" @click="handleDelete(record)">删除</a>
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
