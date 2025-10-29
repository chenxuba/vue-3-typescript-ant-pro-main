<template>
  <div class="copyright-container">
    <a-card title="版权声明" :bordered="false">
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
          <div v-html="copyrightContent"></div>
        </a-spin>
        
        <!-- <div class="copyright-info">
          <a-divider />
          <div class="info-box">
            <p><strong>版权所有</strong> © {{ currentYear }} 所有权利保留</p>
            <p class="text-gray-500">本声明最后更新日期：{{ updateTime }}</p>
          </div>
        </div> -->
      </div>

      <!-- 编辑模式 -->
      <div v-else class="edit-mode">
        <RichTextEditor
          v-model="editContent"
          :height="600"
          :show-ai-embellish="false"
          placeholder="请输入版权声明内容"
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

// 默认版权声明内容
const defaultContent = `
<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">版权所有</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统的所有内容，包括但不限于文字、图形、图片、照片、音频、视频、图表、色彩组合、版面设计、数据、软件等，
  均受《中华人民共和国著作权法》及相关法律法规和国际条约的保护。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">版权归属</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统及其所有组成部分的版权归本公司所有。未经本公司书面许可，任何单位和个人不得以任何方式或理由对本系统的任何部分进行使用、复制、修改、抄录、传播或与其它产品捆绑使用、销售。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">使用授权</h3>
<ul style="padding-left: 24px; margin-bottom: 16px;">
  <li style="margin-bottom: 8px; color: #595959;">授权用户可以在本系统范围内使用相关功能和服务。</li>
  <li style="margin-bottom: 8px; color: #595959;">未经授权，不得将系统内容用于商业目的。</li>
  <li style="margin-bottom: 8px; color: #595959;">不得擅自复制、传播或修改系统内的任何内容。</li>
  <li style="margin-bottom: 8px; color: #595959;">禁止对系统进行反向工程、反编译或反汇编。</li>
</ul>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">第三方内容</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统中可能包含第三方提供的内容，这些内容的版权归原作者所有。我们尊重并保护所有版权持有者的合法权益。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">侵权投诉</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  如果您认为本系统的内容侵犯了您的合法权益，请及时与我们联系，我们将在核实后采取相应的措施。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">法律适用</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本版权声明的解释、效力及纠纷的解决，适用于中华人民共和国法律。若有任何条款与国家法律法规相抵触时，则以国家法律法规为准。
</p>
`

const isEditing = ref(false)
const saveLoading = ref(false)
const loading = ref(false)
const copyrightContent = ref<string>(defaultContent)
const editContent = ref<string>('')

const updateTime = ref(new Date().toLocaleDateString('zh-CN'))

// 获取版权声明内容
const fetchCopyrightContent = async () => {
  try {
    loading.value = true
    const response = await getSysConfigByCodeApi({ code: 'copyright' })
    if (response && response.data && response.data.config) {
      copyrightContent.value = response.data.config
    }
  } catch (error) {
    console.error('获取版权声明失败:', error)
    // 如果获取失败，使用默认内容
    copyrightContent.value = defaultContent
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCopyrightContent()
})

// 进入编辑模式
const handleEdit = () => {
  isEditing.value = true
  editContent.value = copyrightContent.value
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  editContent.value = ''
}

// 保存版权声明
const handleSave = async () => {
  try {
    saveLoading.value = true
    
    // 调用API保存到后端
    await updateSysConfigByCodeApi({
      config: editContent.value,
      keyName: 'copyright',
    })
    
    // 更新内容和时间
    copyrightContent.value = editContent.value
    updateTime.value = new Date().toLocaleDateString('zh-CN')
    
    message.success('版权声明保存成功')
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
.copyright-container {
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
    
    .copyright-info {
      margin-top: 32px;
      
      .info-box {
        text-align: center;
        
        p {
          margin-bottom: 8px;
        }
      }
    }
  }

  .edit-mode {
    .save-tip {
      margin-top: 16px;
    }
  }
}
</style>

