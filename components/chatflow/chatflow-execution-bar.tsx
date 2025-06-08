"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, RotateCcw, GitBranch, Zap } from 'lucide-react'
import type { ChatflowNode, ChatflowIteration, ChatflowParallelBranch } from '@lib/stores/chatflow-execution-store'
import { useChatflowExecutionStore } from '@lib/stores/chatflow-execution-store'

interface ChatflowExecutionBarProps {
  node: ChatflowNode
  index: number
  delay?: number
}

/**
 * Chatflow 执行条组件 - 显示节点执行信息的长条
 * 
 * 特点：
 * - fade-in 动画进入
 * - 左侧状态图标（spinner/完成/失败）
 * - 中间显示节点名称和状态描述
 * - 右侧显示执行时间
 * - 适配 chatflow 的视觉风格
 * - 临时UI，刷新后消失
 */
export function ChatflowExecutionBar({ node, index, delay = 0 }: ChatflowExecutionBarProps) {
  const { isDark } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // 🎯 使用store中的展开状态
  const { iterationExpandedStates, toggleIterationExpanded } = useChatflowExecutionStore()
  const isExpanded = iterationExpandedStates[node.id] || false
  
  // --- 延迟显示动画 ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  // --- 计时器 ---
  useEffect(() => {
    if (node.status === 'running' && node.startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - node.startTime!)
      }, 100)
      
      return () => clearInterval(interval)
    } else if (node.status === 'completed' && node.startTime && node.endTime) {
      setElapsedTime(node.endTime - node.startTime)
    }
  }, [node.status, node.startTime, node.endTime])
  
  // --- 自动展开逻辑已移至store中的iteration_started事件处理 ---
  
  // --- 🎯 调试：监听节点变化 ---
  useEffect(() => {
    if (node.isIterationNode) {
      console.log('[ChatflowExecutionBar] 🔍 迭代节点状态更新:', {
        id: node.id,
        title: node.title,
        isIterationNode: node.isIterationNode,
        totalIterations: node.totalIterations,
        currentIteration: node.currentIteration,
        iterationsCount: node.iterations?.length || 0,
        status: node.status
      })
    }
  }, [node])
  
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    const seconds = (ms / 1000).toFixed(1)
    return `${seconds}s`
  }
  
  const getStatusIcon = () => {
    switch (node.status) {
      case 'running':
        return <Loader2 className={cn(
          "h-4 w-4 animate-spin",
          isDark ? "text-stone-400" : "text-stone-600"
        )} />
      case 'completed':
        return <CheckCircle className={cn(
          "h-4 w-4",
          isDark ? "text-stone-400" : "text-stone-600"
        )} />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className={cn(
          "h-4 w-4",
          isDark ? "text-stone-500" : "text-stone-400"
        )} />
      default:
        return <AlertCircle className={cn(
          "h-4 w-4",
          isDark ? "text-stone-500" : "text-stone-400"
        )} />
    }
  }
  
  const getStatusText = () => {
    // 🎯 迭代节点显示特殊状态文本
    if (node.isIterationNode) {
      switch (node.status) {
        case 'running':
          return '正在迭代...'
        case 'completed':
          return '迭代完成'
        case 'failed':
          return '迭代失败'
        default:
          return '等待迭代'
      }
    }
    
    switch (node.status) {
      case 'running':
        return node.description || '正在处理...'
      case 'completed':
        return '处理完成'
      case 'failed':
        return '处理失败'
      case 'pending':
        return '等待处理'
      default:
        return '未知状态'
    }
  }
  
  const getNodeTitle = () => {
    // 根据节点类型返回友好的中文名称
    switch (node.type) {
      case 'start':
        return '开始节点'
      case 'llm':
        return 'LLM 推理'
      case 'knowledge-retrieval':
        return '知识检索'
      case 'question-classifier':
        return '问题分类器'
      case 'if-else':
        return '条件分支'
      case 'code':
        return '代码执行'
      case 'template-transform':
        return '模板转换'
      case 'variable-assigner':
        return '变量赋值'
      case 'variable-aggregator':
        return '变量聚合器'
      case 'document-extractor':
        return '文档提取器'
      case 'parameter-extractor':
        return '参数提取器'
      case 'http-request':
        return 'HTTP 请求'
      case 'list-operator':
        return '列表操作'
      case 'iteration':
      case 'loop':
        return '循环迭代'
      case 'end':
        return '结束节点'
      default:
        return node.title || `节点 ${index + 1}`
    }
  }
  
  // --- 移除节点类型图标，保持原来的文字显示 ---
  
  const getBarStyles = () => {
    const baseStyles = cn(
      "flex items-center gap-3 px-3 py-2 rounded-md border transition-all duration-300", // 🎯 恢复细bar样式
      "transform font-serif",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      // 🎯 迭代中的节点添加缩进和特殊样式
      node.isInIteration && "ml-6 border-l-2 border-stone-300 dark:border-stone-600 bg-stone-50/30 dark:bg-stone-800/30"
    )
    
    switch (node.status) {
      case 'running':
        return cn(
          baseStyles,
          isDark
            ? "bg-stone-700/50 border-stone-600 shadow-lg shadow-stone-900/30"
            : "bg-stone-200/50 border-stone-300 shadow-lg shadow-stone-200/50"
        )
      case 'completed':
        return cn(
          baseStyles,
          isDark
            ? "bg-stone-600/30 border-stone-500"
            : "bg-stone-100 border-stone-300"
        )
      case 'failed':
        return cn(
          baseStyles,
          isDark
            ? "bg-red-900/20 border-red-700/50"
            : "bg-red-50 border-red-200"
        )
      case 'pending':
        return cn(
          baseStyles,
          isDark
            ? "bg-stone-800/50 border-stone-700/50"
            : "bg-stone-50 border-stone-200"
        )
      default:
        return cn(
          baseStyles,
          isDark
            ? "bg-stone-800/50 border-stone-700/50"
            : "bg-stone-50 border-stone-200"
        )
    }
  }
  
  return (
    <div className="space-y-1">
      <div className={getBarStyles()}>
        {/* 左侧：状态图标 */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        
        {/* 中间：节点信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap"> {/* 🎯 添加flex-wrap允许换行 */}
            {/* 节点标题行 */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={cn(
                "font-medium text-sm font-serif truncate", // 🎯 添加truncate防止过长
                isDark ? "text-stone-200" : "text-stone-800"
              )}>
                {getNodeTitle()}
              </span>
              
              {/* 🎯 缩进的子节点不显示轮次信息，只有迭代容器节点显示 */}
            </div>
            
            {/* 状态标签行 */}
            <div className="flex items-center gap-2 flex-shrink-0">
                          {/* 迭代计数显示 */}
            {node.isIterationNode && node.totalIterations && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-serif",
                isDark && "bg-stone-700/50 text-stone-300"
              )}>
                {node.currentIteration || 0}/{node.totalIterations}
              </span>
            )}
              
              {/* 并行分支进度指示 */}
              {node.isParallelNode && node.totalBranches && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-serif",
                  isDark && "bg-stone-700/50 text-stone-300"
                )}>
                  {node.completedBranches || 0}/{node.totalBranches}
                </span>
              )}
              
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-serif",
                node.status === 'running'
                  ? isDark
                    ? "bg-stone-600/40 text-stone-200"
                    : "bg-stone-300/60 text-stone-700"
                  : node.status === 'completed'
                    ? isDark
                      ? "bg-stone-500/40 text-stone-100"
                      : "bg-stone-200 text-stone-800"
                    : node.status === 'failed'
                      ? isDark
                        ? "bg-red-700/30 text-red-200"
                        : "bg-red-100 text-red-700"
                      : isDark
                        ? "bg-stone-700/50 text-stone-400"
                        : "bg-stone-200/80 text-stone-600"
              )}>
                {getStatusText()}
              </span>
              
              {/* 展开/折叠按钮 */}
              {(node.isIterationNode || node.isParallelNode) && (
                              <button
                onClick={() => toggleIterationExpanded(node.id)}
                className={cn(
                  "p-1 rounded transition-all duration-200",
                  isDark 
                    ? "hover:bg-stone-700 text-stone-400 hover:text-stone-200" 
                    : "hover:bg-stone-100 text-stone-500 hover:text-stone-700"
                )}
              >
                  <ChevronRight className={cn(
                    "h-3 w-3 chatflow-expand-button",
                    isExpanded && "expanded"
                  )} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 右侧：计时信息 */}
        <div className="flex-shrink-0 w-16 text-right"> {/* 🎯 固定宽度避免抖动 */}
          {(node.status === 'running' || node.status === 'completed') && elapsedTime > 0 && (
            <div className={cn(
              "text-xs font-serif",
              isDark ? "text-stone-400" : "text-stone-500"
            )}>
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>
      
      {/* 🎯 展开状态说明：展开/折叠控制的是迭代中的子节点显示 */}
      {/* 实际的子节点显示由父组件根据 isExpanded 状态控制 */}
      
      {/* 🎯 新增：展开的并行分支列表 */}
      {isExpanded && node.isParallelNode && node.parallelBranches && node.parallelBranches.length > 0 && (
        <div className="space-y-2 chatflow-expand-enter ml-4">
          {/* 并行分支进度条 */}
          {node.totalBranches && (
            <div className="px-3 py-2">
              <ProgressBar
                current={node.completedBranches || 0}
                total={node.totalBranches}
                type="branch"
                isDark={isDark}
              />
            </div>
          )}
          
          {/* 分支列表 */}
          <div className="space-y-1">
            {node.parallelBranches.map((branch, index) => (
              <ParallelBranchItem
                key={branch.id}
                branch={branch}
                index={index}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- 迭代项组件已移除，改为简化的展开信息显示 ---

// --- 🎯 新增：并行分支项组件 ---
interface ParallelBranchItemProps {
  branch: ChatflowParallelBranch
  index: number
  isDark: boolean
}

function ParallelBranchItem({ branch, index, isDark }: ParallelBranchItemProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    if (branch.status === 'running' && branch.startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - branch.startTime)
      }, 100)
      return () => clearInterval(interval)
    } else if (branch.status === 'completed' && branch.startTime && branch.endTime) {
      setElapsedTime(branch.endTime - branch.startTime)
    }
  }, [branch.status, branch.startTime, branch.endTime])
  
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    const seconds = (ms / 1000).toFixed(1)
    return `${seconds}s`
  }
  
  const getBranchIcon = () => {
    switch (branch.status) {
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin text-stone-500" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-stone-600" />
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-stone-400" />
    }
  }
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md border-l-2 ml-4 font-serif",
      branch.status === 'running' && cn(
        "border-l-stone-400",
        isDark ? "bg-stone-800/20" : "bg-stone-100"
      ),
      branch.status === 'completed' && cn(
        "border-l-stone-500",
        isDark ? "bg-stone-700/20" : "bg-stone-50"
      ),
      branch.status === 'failed' && cn(
        "border-l-red-500",
        isDark ? "bg-red-900/20" : "bg-red-50"
      ),
      branch.status === 'pending' && cn(
        "border-l-stone-300",
        isDark ? "bg-stone-800/20" : "bg-stone-50"
      )
    )}>
      <div className="flex-shrink-0">
        <GitBranch className="h-3 w-3 mr-1" />
        {getBranchIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            isDark ? "text-stone-200" : "text-stone-800"
          )}>
            分支 {String.fromCharCode(65 + branch.index)}
          </span>
          <span className={cn(
            "text-xs",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            {branch.description || '执行中...'}
          </span>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-12 text-right"> {/* 🎯 固定宽度避免抖动 */}
        {elapsedTime > 0 && (
          <span className={cn(
            "text-xs font-serif",
            isDark ? "text-stone-400" : "text-stone-500"
          )}>
            {formatTime(elapsedTime)}
          </span>
        )}
      </div>
    </div>
  )
}

// --- 🎯 新增：进度条组件 ---
interface ProgressBarProps {
  current: number
  total: number
  type: 'iteration' | 'branch'
  isDark: boolean
}

function ProgressBar({ current, total, type, isDark }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-xs font-medium font-serif",
          isDark ? "text-stone-300" : "text-stone-700"
        )}>
          {type === 'iteration' ? '迭代进度' : '分支进度'}
        </span>
        <span className={cn(
          "text-xs font-serif",
          isDark ? "text-stone-400" : "text-stone-500"
        )}>
          {current}/{total}
        </span>
      </div>
      
      <div className={cn(
        "w-full h-2 rounded-full overflow-hidden",
        isDark ? "bg-stone-700" : "bg-stone-200"
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out chatflow-progress-bar",
            "bg-gradient-to-r from-stone-400 to-stone-500" // 🎯 统一使用stone色系
          )}
          style={{ 
            width: `${percentage}%`,
            '--progress-width': `${percentage}%`
          } as React.CSSProperties}
        />
      </div>
    </div>
  )
} 