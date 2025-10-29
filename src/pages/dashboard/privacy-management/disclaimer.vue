<template>
  <div class="disclaimer-container">
    <a-card title="免责声明" :bordered="false">
      <template #extra>
        <a-space>
          <a-button v-if="!isEditing" type="primary" @click="handleEdit">
            <template #icon>
              <EditOutlined />
            </template>
            编辑
          </a-button>
          <template v-else>
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" :loading="saveLoading" @click="handleSave">
              <template #icon>
                <SaveOutlined />
              </template>
              保存
            </a-button>
          </template>
        </a-space>
      </template>

      <!-- 预览模式 -->
      <div v-if="!isEditing" class="content">
        <a-spin :spinning="loading">
          <div v-html="disclaimerContent"></div>
        </a-spin>
        
        <!-- <div class="update-time">
          <a-divider />
          <p class="text-gray-500">最后更新时间：{{ updateTime }}</p>
        </div> -->
      </div>

      <!-- 编辑模式 -->
      <div v-else class="edit-mode">
        <RichTextEditor
          v-model="editContent"
          :height="600"
          :show-ai-embellish="false"
          placeholder="请输入免责声明内容"
        />
        <a-divider />
        <a-alert
          message="提示"
          description="保存后的内容将立即生效，请仔细核对后再保存。"
          type="info"
          show-icon
          class="save-tip"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, SaveOutlined } from '@ant-design/icons-vue'
import RichTextEditor from '@/pages/dashboard/raining-project-management/components/RichTextEditor.vue'
import { getSysConfigByCodeApi, updateSysConfigByCodeApi } from '@/api/system/config'

// 默认免责声明内容
const defaultContent = `
<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">使用条款</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  欢迎使用本系统。在使用本系统之前，请您仔细阅读以下条款。使用本系统即表示您同意接受以下所有条款的约束。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">服务说明</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统提供的所有信息和服务仅供参考，我们会尽力确保信息的准确性和完整性，但不对信息的准确性、完整性、可靠性做任何形式的保证。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">免责条款</h3>
<ul style="padding-left: 24px; margin-bottom: 16px;">
  <li style="margin-bottom: 8px; color: #595959;">用户使用本系统所存在的风险将完全由其本人承担，我们不承担任何责任。</li>
  <li style="margin-bottom: 8px; color: #595959;">我们不保证服务一定能满足用户的要求，也不保证服务不会中断。</li>
  <li style="margin-bottom: 8px; color: #595959;">我们不对因不可抗力或我们不能控制的原因造成的网络服务中断或其它缺陷负责。</li>
  <li style="margin-bottom: 8px; color: #595959;">用户理解并同意自行承担使用本系统服务的风险，包括但不限于数据丢失、服务中断等。</li>
</ul>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">用户责任</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  用户应当遵守国家法律法规，不得利用本系统从事违法违规活动。用户对其使用本系统的一切行为负责。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">知识产权</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统的所有内容，包括但不限于文字、图片、标识、界面设计等，均受知识产权法保护，未经许可不得擅自使用。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">免责声明的修改</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  我们保留随时修改本免责声明的权利，修改后的内容将在本页面公布，请您定期查阅。
</p>
`

const isEditing = ref(false)
const saveLoading = ref(false)
const loading = ref(false)
const disclaimerContent = ref<string>(defaultContent)
const editContent = ref<string>('')

const updateTime = ref(new Date().toLocaleDateString('zh-CN'))

// 获取隐私协议内容
const fetchDisclaimerContent = async () => {
  try {
    loading.value = true
    const response = await getSysConfigByCodeApi({ code: 'privacy' })
    if (response && response.data && response.data.config) {
      disclaimerContent.value = response.data.config
    }
  } catch (error) {
    console.error('获取隐私协议失败:', error)
    // 如果获取失败，使用默认内容
    disclaimerContent.value = defaultContent
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDisclaimerContent()
})

// 进入编辑模式
const handleEdit = () => {
  isEditing.value = true
  editContent.value = disclaimerContent.value
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  editContent.value = ''
}

// 保存免责声明
const handleSave = async () => {
  try {
    saveLoading.value = true
    
    // 调用API保存到后端
    await updateSysConfigByCodeApi({
      config: editContent.value,
      keyName: 'privacy',
    })
    
    // 更新内容和时间
    disclaimerContent.value = editContent.value
    updateTime.value = new Date().toLocaleDateString('zh-CN')
    
    message.success('隐私协议保存成功')
    isEditing.value = false
    editContent.value = ''
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败，请稍后重试')
  } finally {
    saveLoading.value = false
  }
}
</script>

<style scoped lang="less">
.disclaimer-container {
  padding: 20px;
  
  .content {
    font-size: 14px;
    line-height: 1.8;
    
    :deep(h3) {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #1890ff;
    }
    
    :deep(p) {
      margin-bottom: 16px;
      text-align: justify;
      color: #595959;
    }
    
    :deep(ul) {
      padding-left: 24px;
      margin-bottom: 16px;
      
      li {
        margin-bottom: 8px;
        color: #595959;
      }
    }
    
    .update-time {
      margin-top: 32px;
      text-align: right;
    }
  }

  .edit-mode {
    .save-tip {
      margin-top: 16px;
    }
  }
}
</style>

