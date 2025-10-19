import { ref, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { h } from 'vue'
// @ts-ignore
import hljs from 'highlight.js/lib/core'
import type { FileTreeNode, SelectedFile } from '../types'

export function useFileTree() {
  // 文件树数据
  const fileTreeData = ref<FileTreeNode[]>([
    {
      title: 'src',
      key: '0-0',
      children: [
        {
          title: 'components',
          key: '0-0-0',
          children: [
            { title: 'Header.vue', key: '0-0-0-0', isLeaf: true },
            { title: 'Footer.vue', key: '0-0-0-1', isLeaf: true },
          ],
        },
        {
          title: 'views',
          key: '0-0-1',
          children: [
            { title: 'Home.vue', key: '0-0-1-0', isLeaf: true },
            { title: 'About.vue', key: '0-0-1-1', isLeaf: true },
          ],
        },
        { title: 'App.vue', key: '0-0-2', isLeaf: true },
        { title: 'main.ts', key: '0-0-3', isLeaf: true },
      ],
    },
    {
      title: 'public',
      key: '0-1',
      children: [
        { title: 'index.html', key: '0-1-0', isLeaf: true },
        { title: 'favicon.ico', key: '0-1-1', isLeaf: true },
      ],
    },
    { title: 'package.json', key: '0-2', isLeaf: true },
    { title: 'README.md', key: '0-3', isLeaf: true },
  ])

  // 展开的节点
  const expandedKeys = ref<(string | number)[]>(['0-0', '0-0-0'])

  // 选中的文件
  const selectedFile = ref<SelectedFile | null>(null)

  // 动态文件内容存储
  const dynamicFileContents = ref<Record<string, string>>({})

  // 文件内容映射
  const getFileContent = (key: string): string => {
    if (dynamicFileContents.value[key]) {
      return dynamicFileContents.value[key]
    }
    
    const contents: Record<string, string> = {
      '0-0-0-0': '// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"',
      '0-0-0-1': '// Footer.vue\n<div class="app-footer">\n  <p>&copy; 2024 My App. All rights reserved.</p>\n</div>\n\n// Component styles\n.app-footer {\n  padding: 2rem;\n  text-align: center;\n}',
      '0-0-1-0': '// Home.vue\n<div class="home-page">\n  <h1>Welcome to Home Page</h1>\n  <p>This is the home page content.</p>\n</div>\n\nimport { ref } from "vue"\nconst message = ref("Hello World!")',
      '0-0-1-1': '// About.vue\n<div class="about-page">\n  <h1>About Us</h1>\n  <p>Learn more about our application.</p>\n</div>',
      '0-0-2': '// App.vue\n<div id="app">\n  <Header />\n  <router-view />\n  <Footer />\n</div>\n\nimport Header from "./components/Header.vue"\nimport Footer from "./components/Footer.vue"',
      '0-0-3': 'import { createApp } from "vue"\nimport App from "./App.vue"\nimport router from "./router"\n\nconst app = createApp(App)\napp.use(router)\napp.mount("#app")',
      '0-1-0': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n</head>\n<body>\n  <div id="app"></div>\n</body>\n</html>',
      '0-2': '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "description": "A Vue 3 application",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "vue": "^3.3.0"\n  }\n}',
      '0-3': '# My App\n\nVue 3 application.\n\n## Setup\nnpm install\n\n## Development\nnpm run dev\n\n## Build\nnpm run build',
    }
    return contents[key] || '// File content'
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
  const handleSelectFile = (_selectedKeys: any[], e: any) => {
    const node = e.node
    if (node.isLeaf === true || (node.isLeaf !== false && !node.children)) {
      const content = getFileContent(node.key)
      selectedFile.value = {
        key: node.key,
        title: node.title,
        content: content,
      }
    }
  }

  // 高亮后的代码
  const highlightedCode = computed(() => {
    if (!selectedFile.value) return ''
    const language = getLanguageByFilename(selectedFile.value.title)
    try {
      return hljs.highlight(selectedFile.value.content, { language }).value
    } catch (e) {
      return hljs.highlightAuto(selectedFile.value.content).value
    }
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
    
    if (parentPath === '/') {
      fileTreeData.value.push(newFile)
    } else {
      const findAndAddToParent = (nodes: FileTreeNode[], targetPath: string): boolean => {
        for (const node of nodes) {
          const nodePath = getNodePath(node.key)
          if (nodePath === targetPath) {
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
      children: [],
    }
    
    if (parentPath === '/') {
      fileTreeData.value.push(newFolder)
    } else {
      const findAndAddToParent = (nodes: FileTreeNode[], targetPath: string): boolean => {
        for (const node of nodes) {
          const nodePath = getNodePath(node.key)
          if (nodePath === targetPath) {
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
  }
}

