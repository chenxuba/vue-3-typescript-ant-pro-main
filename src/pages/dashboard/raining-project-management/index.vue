<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
const dataSource = ref([
  {
    key: '1',
    projectName: '2025年新媒体战略规划会',
    environment: '全栈环境',
    skillTag: '实践培训',
    organizer: '中国科学院计算机网络信息中心',
    publicScope: '已发布\n全院公开',
    publishStatus: '已发布',
    scopeStatus: '全院公开',
  },
  {
    key: '2',
    projectName: '2025年新媒体战略规划会',
    environment: 'JupyterNotebook环境',
    skillTag: '实践培训',
    organizer: '中国科学院计算机网络信息中心',
    publicScope: '已发布\n完全公开',
    publishStatus: '已发布',
    scopeStatus: '完全公开',
  },
  {
    key: '3',
    projectName: '2025年新媒体战略规划会',
    environment: '其他',
    skillTag: '实践培训',
    organizer: '中国科学院计算机网络信息中心',
    publicScope: '未发布\n本单位公开',
    publishStatus: '未发布',
    scopeStatus: '本单位公开',
  },
  {
    key: '4',
    projectName: '2025年新媒体战略规划会',
    environment: 'JupyterLab环境',
    skillTag: '实践培训',
    organizer: '中国科学院计算机网络信息中心',
    publicScope: '已发布\n完全公开',
    publishStatus: '已发布',
    scopeStatus: '完全公开',
  },
  {
    key: '5',
    projectName: '2025年新媒体战略规划会',
    environment: 'JupyterLab环境',
    skillTag: '实践培训',
    organizer: '中国科学院计算机网络信息中心',
    publicScope: '已发布\n完全公开',
    publishStatus: '已发布',
    scopeStatus: '完全公开',
  },
])

// 总数据条数
const total = ref(123)

// 重置表单
const handleReset = () => {
  searchForm.value = {
    projectName: '',
    environment: undefined,
    organizer: undefined,
  }
}

// 查询
const handleSearch = () => {
  console.log('查询条件：', searchForm.value)
}

// 新建项目 - 跳转到新建页面
const handleCreate = () => {
  router.push('/dashboard/raining-project-management/create')
}

// 统计
const handleStatistics = (record: any) => {
  console.log('统计', record)
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
            <span class="data-count">数据共 {{ total }} 条</span>
          </div>
          <div class="tabs-right">
            <a-button type="primary" @click="handleCreate">新建项目</a-button>
          </div>
        </div>
      </div>
      
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="{
          total: total,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'publicScope'">
            <div class="public-scope-cell">
              <div 
                class="status-badge" 
                :class="{
                  'status-published': record.publishStatus === '已发布',
                  'status-unpublished': record.publishStatus === '未发布'
                }"
              >
                {{ record.publishStatus }}
              </div>
              <div 
                class="scope-badge"
                :class="{
                  'scope-full': record.scopeStatus === '完全公开',
                  'scope-academy': record.scopeStatus === '全院公开',
                  'scope-unit': record.scopeStatus === '本单位公开'
                }"
              >
                {{ record.scopeStatus }}
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="action-links">
              <a @click="handleStatistics(record)">统计</a>
              <template v-if="record.publishStatus === '已发布'">
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
  min-height: 100vh;

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
