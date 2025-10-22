import { ref, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { h } from 'vue'
// @ts-ignore
import hljs from 'highlight.js/lib/core'
import type { FileTreeNode, SelectedFile } from '../types'

export function useFileTree() {
  // 文件树数据（初始为空，等待从仓库加载）
  const fileTreeData = ref<FileTreeNode[]>([])

  // 展开的节点
  const expandedKeys = ref<(string | number)[]>([])

  // 选中的文件
  const selectedFile = ref<SelectedFile | null>(null)

  // 动态文件内容存储
  const dynamicFileContents = ref<Record<string, string>>({})
  
  // 节点路径映射 (key -> path)
  const nodePathMap = ref<Record<string, string>>({})

  // 文件内容映射
  const getFileContent = (key: string): string => {
    if (dynamicFileContents.value[key]) {
      return dynamicFileContents.value[key]
    }
    
    // 如果没有内容，返回提示信息
    return '// 文件内容加载中...\n// 请从Git仓库加载文件'
  }

  // 根据文件扩展名获取语言类型
  const getLanguageByFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      'vue': 'vue',
      'js': 'javascript',
      'ts': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
    }
    return langMap[ext || ''] || 'javascript'
  }

  // 处理文件选择
  const handleSelectFile = (selectedKeys: any[], e: any) => {
    if (selectedKeys.length === 0 || !e.node) return
    
    const node = e.node
    
    // 如果是文件夹，不处理
    if (!node.isLeaf) return
    
    const key = selectedKeys[0]
    const title = node.title
    const fileUrl = node.dataRef?.fileUrl || node.fileUrl
    
    // 设置选中的文件（用于显示下载按钮）
    selectedFile.value = {
      key,
      title,
      content: '', // 不需要内容，只需要下载按钮
      fileUrl: fileUrl || null
    }
    
    console.log('选中文件:', { key, title, fileUrl })
  }

  // 高亮后的代码（现在不再使用，保留接口兼容性）
  const highlightedCode = computed(() => {
    return ''
  })

  // 获取节点的完整路径
  const getNodePath = (nodeKey: string): string => {
    const findPath = (nodes: FileTreeNode[], targetKey: string, currentPath: string = ''): string | null => {
      for (const node of nodes) {
        const nodePath = currentPath + '/' + node.title
        
        if (node.key === targetKey) {
          return nodePath
        }
        
        if (node.children) {
          const result = findPath(node.children, targetKey, nodePath)
          if (result) return result
        }
      }
      return null
    }
    
    return findPath(fileTreeData.value, nodeKey) || '/'
  }

  // 添加文件到树
  const addFileToTree = (fileName: string, fileContent: string, parentPath: string) => {
    const newKey = `0-new-file-${Date.now()}`
    const newFile: FileTreeNode = {
      title: fileName,
      key: newKey,
      isLeaf: true,
    }
    
    // 保存文件内容
    dynamicFileContents.value[newKey] = fileContent
    
    // 计算并保存文件路径
    const filePath = parentPath === '/' ? fileName : `${parentPath.replace(/^\//, '')}/${fileName}`
    nodePathMap.value[newKey] = filePath
    
    if (parentPath === '/') {
      fileTreeData.value.push(newFile)
    } else {
      const findAndAddToParent = (nodes: FileTreeNode[], targetPath: string): boolean => {
        for (const node of nodes) {
          // 优先使用路径映射
          const nodePath = nodePathMap.value[node.key] || getNodePath(node.key)
          if (nodePath === targetPath || nodePath === targetPath.replace(/^\//, '')) {
            if (!node.children) {
              node.children = []
            }
            node.children.push(newFile)
            if (!expandedKeys.value.includes(node.key)) {
              expandedKeys.value.push(node.key)
            }
            return true
          }
          if (node.children && findAndAddToParent(node.children, targetPath)) {
            return true
          }
        }
        return false
      }
      
      findAndAddToParent(fileTreeData.value, parentPath)
    }
  }

  // 添加文件夹到树
  const addFolderToTree = (folderName: string, parentPath: string) => {
    const newKey = `0-new-folder-${Date.now()}`
    const newFolder: FileTreeNode = {
      title: folderName,
      key: newKey,
      isLeaf: false,
      children: [],
    }
    
    // 计算并保存文件夹路径
    const folderPath = parentPath === '/' ? folderName : `${parentPath.replace(/^\//, '')}/${folderName}`
    nodePathMap.value[newKey] = folderPath
    
    if (parentPath === '/') {
      fileTreeData.value.push(newFolder)
    } else {
      const findAndAddToParent = (nodes: FileTreeNode[], targetPath: string): boolean => {
        for (const node of nodes) {
          // 优先使用路径映射
          const nodePath = nodePathMap.value[node.key] || getNodePath(node.key)
          if (nodePath === targetPath || nodePath === targetPath.replace(/^\//, '')) {
            if (!node.children) {
              node.children = []
            }
            node.children.push(newFolder)
            if (!expandedKeys.value.includes(node.key)) {
              expandedKeys.value.push(node.key)
            }
            return true
          }
          if (node.children && findAndAddToParent(node.children, targetPath)) {
            return true
          }
        }
        return false
      }
      
      findAndAddToParent(fileTreeData.value, parentPath)
    }
    
    expandedKeys.value.push(newKey)
  }

  // 重命名节点
  const handleRenameNode = (nodeData: any) => {
    Modal.confirm({
      title: '重命名',
      content: h('div', [
        h('p', `当前名称：${nodeData.title}`),
        h('input', {
          id: 'rename-input',
          placeholder: '请输入新名称',
          style: 'width: 100%; padding: 4px 11px; border: 1px solid #d9d9d9; border-radius: 2px;',
        }),
      ]),
      onOk: () => {
        const input = document.getElementById('rename-input') as HTMLInputElement
        const newName = input?.value.trim()
        if (!newName) {
          message.error('请输入新名称')
          return Promise.reject()
        }
        
        const updateNodeName = (nodes: FileTreeNode[]): boolean => {
          for (const node of nodes) {
            if (node.key === nodeData.key) {
              node.title = newName
              message.success('重命名成功')
              return true
            }
            if (node.children && updateNodeName(node.children)) {
              return true
            }
          }
          return false
        }
        
        updateNodeName(fileTreeData.value)
        
        if (selectedFile.value && selectedFile.value.key === nodeData.key) {
          selectedFile.value.title = newName
        }
      },
    })
  }

  // 复制路径
  const handleCopyPath = (nodeData: any) => {
    const path = getNodePath(nodeData.key)
    navigator.clipboard.writeText(path).then(() => {
      message.success(`路径已复制到剪贴板: ${path}`)
    }).catch(() => {
      message.error('复制失败')
    })
  }

  // 删除节点
  const handleDeleteNode = (nodeData: any) => {
    const isFolder = nodeData.children !== undefined || nodeData.isLeaf === false
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除${isFolder ? '文件夹' : '文件'} "${nodeData.title}" 吗？${isFolder ? '文件夹下的所有内容也会被删除。' : ''}`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        const deleteNode = (nodes: FileTreeNode[]): boolean => {
          const index = nodes.findIndex(node => node.key === nodeData.key)
          if (index !== -1) {
            nodes.splice(index, 1)
            message.success('删除成功')
            
            if (selectedFile.value?.key === nodeData.key) {
              selectedFile.value = null
            }
            
            if (dynamicFileContents.value[nodeData.key]) {
              delete dynamicFileContents.value[nodeData.key]
            }
            
            return true
          }
          
          for (const node of nodes) {
            if (node.children && deleteNode(node.children)) {
              return true
            }
          }
          return false
        }
        
        deleteNode(fileTreeData.value)
      },
    })
  }

  // 将API返回的文件列表转换为树形结构
  const convertApiDataToTreeNodes = (apiData: any[], keyPrefix: string = '0', parentPath: string = ''): FileTreeNode[] => {
    if (!apiData || !Array.isArray(apiData)) {
      console.warn('convertApiDataToTreeNodes: apiData is not an array', apiData)
      return []
    }
    
    return apiData.map((item, index) => {
      const key = `${keyPrefix}-${index}`
      const currentPath = parentPath ? `${parentPath}/${item.fileName}` : item.fileName
      
      const node: FileTreeNode = {
        title: item.fileName || 'untitled',
        key: key,
        fileUrl: item.fileUrl || null, // 保存文件URL
      }
      
      // 保存节点路径映射
      nodePathMap.value[key] = currentPath
      
      // 根据文件类型设置不同的属性
      if (item.fileType === 'dir') {
        // 文件夹：明确设置为非叶子节点，children 设为空数组（表示可展开但未加载）
        node.isLeaf = false
        node.children = []
      } else {
        // 文件：明确设置 isLeaf 为 true，不设置 children
        node.isLeaf = true
      }
      
      return node
    })
  }

  // 加载远程文件树数据（根目录）
  const loadRemoteFileTree = (apiData: any[]) => {
    try {
      console.log('加载远程文件树，原始数据:', apiData)
      nodePathMap.value = {} // 清空路径映射
      dynamicFileContents.value = {} // 清空文件内容缓存
      const treeNodes = convertApiDataToTreeNodes(apiData, '0', '')
      console.log('转换后的树节点:', treeNodes)
      fileTreeData.value = treeNodes
      expandedKeys.value = []
      selectedFile.value = null
    } catch (error) {
      console.error('加载文件树失败:', error)
      fileTreeData.value = []
    }
  }
  
  // 加载子文件夹数据
  const loadChildrenData = (nodeKey: string, apiData: any[]) => {
    try {
      console.log('加载子文件夹数据:', { nodeKey, apiData })
      const parentPath = nodePathMap.value[nodeKey] || ''
      const newChildren = convertApiDataToTreeNodes(apiData, nodeKey, parentPath)
      console.log('转换后的子节点:', newChildren)
      
      // 在树中找到对应节点并更新children
      const updateNodeChildren = (nodes: FileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.key === nodeKey) {
            node.children = newChildren
            return true
          }
          if (node.children && updateNodeChildren(node.children)) {
            return true
          }
        }
        return false
      }
      
      const updated = updateNodeChildren(fileTreeData.value)
      if (!updated) {
        console.warn('未找到对应的节点进行更新:', nodeKey)
      }
    } catch (error) {
      console.error('加载子文件夹失败:', error)
    }
  }
  
  // 获取节点路径（从路径映射中获取）
  const getNodePathFromMap = (nodeKey: string): string => {
    return nodePathMap.value[nodeKey] || ''
  }

  return {
    fileTreeData,
    expandedKeys,
    selectedFile,
    dynamicFileContents,
    highlightedCode,
    getFileContent,
    getLanguageByFilename,
    handleSelectFile,
    getNodePath,
    addFileToTree,
    addFolderToTree,
    handleRenameNode,
    handleCopyPath,
    handleDeleteNode,
    loadRemoteFileTree,
    loadChildrenData,
    getNodePathFromMap,
  }
}

