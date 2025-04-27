import { useEffect } from 'react'
import './App.css'

// 导入主布局组件
import MainLayout from './components/layout/MainLayout'

// 导入状态管理
import useChatStore from './store/chatStore'
import useTaskStore from './store/taskStore'
import useAuthStore from './store/authStore'

function App() {
  // 获取状态及方法
  const { initialize: initializeChat } = useChatStore()
  const { fetchTasks } = useTaskStore()
  const { user, checkAuthStatus } = useAuthStore()

  // 组件挂载时初始化
  useEffect(() => {
    // 检查用户认证状态
    checkAuthStatus()

    // 初始化聊天状态
    initializeChat()

    // 如果用户已认证，获取任务列表
    if (user) {
      fetchTasks()
    }
  }, [user])

  return (
    <div className="app-container">
      <MainLayout />
    </div>
  )
}

export default App
