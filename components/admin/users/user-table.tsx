"use client"

import React from 'react'
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Shield, 
  Crown, 
  UserIcon, 
  UserCheck, 
  UserX, 
  Clock,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react'
import { useTheme } from '@lib/hooks/use-theme'
import { useProfile } from '@lib/hooks/use-profile'
import { cn } from '@lib/utils'
import { Dropdown } from '@components/ui/dropdown'
import type { EnhancedUser } from '@lib/db/users'

interface UserTableProps {
  users: EnhancedUser[]
  selectedUserIds: string[]
  isLoading: boolean
  onSelectUser: (userId: string) => void
  onSelectAll: (selected: boolean) => void
  onEditUser: (user: EnhancedUser) => void
  onViewUser: (user: EnhancedUser) => void
  onDeleteUser: (user: EnhancedUser) => void
  onChangeRole: (user: EnhancedUser, role: 'admin' | 'manager' | 'user') => void
  onChangeStatus: (user: EnhancedUser, status: 'active' | 'suspended' | 'pending') => void
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUserIds,
  isLoading,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onViewUser,
  onDeleteUser,
  onChangeRole,
  onChangeStatus
}) => {
  const { isDark } = useTheme()
  const { profile: currentUserProfile } = useProfile() // 获取当前用户信息

  // --- BEGIN COMMENT ---
  // 检查是否可以更改用户角色（防止管理员降级其他管理员）
  // --- END COMMENT ---
  const canChangeUserRole = (targetUser: EnhancedUser, newRole: 'admin' | 'manager' | 'user') => {
    // 如果当前用户不是管理员，不允许任何角色更改
    if (currentUserProfile?.role !== 'admin') {
      return false
    }
    
    // 防止管理员修改自己的角色
    if (targetUser.id === currentUserProfile?.id) {
      return false
    }
    
    // 防止非超级管理员降级其他管理员
    if (targetUser.role === 'admin' && newRole !== 'admin') {
      return false
    }
    
    return true
  }

  // --- BEGIN COMMENT ---
  // 检查是否可以删除用户（防止删除管理员账号）
  // --- END COMMENT ---
  const canDeleteUser = (targetUser: EnhancedUser) => {
    // 如果当前用户不是管理员，不允许删除
    if (currentUserProfile?.role !== 'admin') {
      return false
    }
    
    // 防止删除自己
    if (targetUser.id === currentUserProfile?.id) {
      return false
    }
    
    // 防止删除其他管理员
    if (targetUser.role === 'admin') {
      return false
    }
    
    return true
  }

  // --- BEGIN COMMENT ---
  // 检查是否可以编辑用户
  // --- END COMMENT ---
  const canEditUser = (targetUser: EnhancedUser) => {
    // 管理员可以编辑所有用户（包括自己）
    if (currentUserProfile?.role === 'admin') {
      return true
    }
    
    // 其他角色只能编辑自己
    return targetUser.id === currentUserProfile?.id
  }

  // --- BEGIN COMMENT ---
  // 获取角色显示信息 - 使用stone主题配色
  // --- END COMMENT ---
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { 
          label: '管理员', 
          icon: <Shield className="h-4 w-4" />, 
          variant: 'danger' as const
        }
      case 'manager':
        return { 
          label: '经理', 
          icon: <Crown className="h-4 w-4" />, 
          variant: 'warning' as const
        }
      default:
        return { 
          label: '普通用户', 
          icon: <UserIcon className="h-4 w-4" />, 
          variant: 'neutral' as const
        }
    }
  }

  // --- BEGIN COMMENT ---
  // 获取状态显示信息 - 使用stone主题配色
  // --- END COMMENT ---
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          label: '活跃', 
          icon: <UserCheck className="h-4 w-4" />, 
          variant: 'success' as const
        }
      case 'suspended':
        return { 
          label: '已暂停', 
          icon: <UserX className="h-4 w-4" />, 
          variant: 'danger' as const
        }
      case 'pending':
        return { 
          label: '待激活', 
          icon: <Clock className="h-4 w-4" />, 
          variant: 'warning' as const
        }
      default:
        return { 
          label: '未知', 
          icon: <Clock className="h-4 w-4" />, 
          variant: 'neutral' as const
        }
    }
  }

  // --- BEGIN COMMENT ---
  // 获取stone主题标签样式
  // --- END COMMENT ---
  const getBadgeClasses = (variant: 'success' | 'warning' | 'danger' | 'neutral') => {
    const variantMap = {
      success: isDark 
        ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: isDark 
        ? 'bg-amber-900/30 text-amber-300 border-amber-700' 
        : 'bg-amber-50 text-amber-700 border-amber-200',
      danger: isDark 
        ? 'bg-red-900/30 text-red-300 border-red-700' 
        : 'bg-red-50 text-red-700 border-red-200',
      neutral: isDark 
        ? 'bg-stone-700/50 text-stone-300 border-stone-600' 
        : 'bg-stone-100 text-stone-700 border-stone-300'
    }
    return variantMap[variant]
  }

  // --- BEGIN COMMENT ---
  // 格式化日期
  // --- END COMMENT ---
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '从未'
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // --- BEGIN COMMENT ---
  // 检查是否全选
  // --- END COMMENT ---
  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length
  const isPartiallySelected = selectedUserIds.length > 0 && !isAllSelected

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-xl border overflow-hidden shadow-sm",
        isDark ? "bg-stone-800/50 border-stone-700/50" : "bg-white border-stone-200/50"
      )}>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-400 mx-auto mb-6"></div>
          <p className={cn(
            "font-serif text-lg",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            加载用户数据中...
          </p>
          <p className={cn(
            "font-serif text-sm mt-2",
            isDark ? "text-stone-500" : "text-stone-500"
          )}>
            请稍候，正在获取最新的用户信息
          </p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className={cn(
        "rounded-xl border p-12 text-center shadow-sm",
        isDark ? "bg-stone-800/50 border-stone-700/50" : "bg-white border-stone-200/50"
      )}>
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
          isDark ? "bg-stone-700/50" : "bg-stone-100"
        )}>
          <UserIcon className={cn(
            "h-8 w-8",
            isDark ? "text-stone-500" : "text-stone-400"
          )} />
        </div>
        <h3 className={cn(
          "text-xl font-semibold mb-3 font-serif",
          isDark ? "text-stone-300" : "text-stone-700"
        )}>
          暂无用户数据
        </h3>
        <p className={cn(
          "font-serif text-base mb-4",
          isDark ? "text-stone-500" : "text-stone-500"
        )}>
          没有找到符合条件的用户，请尝试调整筛选条件
        </p>
        <p className={cn(
          "font-serif text-sm",
          isDark ? "text-stone-600" : "text-stone-400"
        )}>
          您可以重置筛选条件或联系管理员添加新用户
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden shadow-sm",
      isDark ? "bg-stone-800/50 border-stone-700/50" : "bg-white border-stone-200/50"
    )}>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          {/* --- BEGIN COMMENT ---
          表头 - 优化样式和列宽分配
          --- END COMMENT --- */}
          <thead className={cn(
            "border-b",
            isDark ? "bg-stone-900/50 border-stone-700/50" : "bg-stone-50/80 border-stone-200/50"
          )}>
            <tr>
              <th className="w-12 px-4 py-4">
                <button
                  onClick={() => onSelectAll(!isAllSelected)}
                  className={cn(
                    "flex items-center justify-center transition-colors rounded-md p-1",
                    isDark ? "text-stone-400 hover:text-stone-300 hover:bg-stone-700/50" : "text-stone-600 hover:text-stone-700 hover:bg-stone-100/50"
                  )}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : isPartiallySelected ? (
                    <Square className="h-4 w-4 border-2" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className={cn(
                "w-48 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                用户信息
              </th>
              <th className={cn(
                "w-44 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                联系方式
              </th>
              <th className={cn(
                "w-40 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                组织信息
              </th>
              <th className={cn(
                "w-28 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                角色权限
              </th>
              <th className={cn(
                "w-24 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                状态
              </th>
              <th className={cn(
                "w-32 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                最后登录
              </th>
              <th className={cn(
                "w-32 px-4 py-4 text-left text-sm font-semibold font-serif",
                isDark ? "text-stone-300" : "text-stone-700"
              )}>
                注册时间
              </th>
              <th className="w-16 px-4 py-4"></th>
            </tr>
          </thead>
          
          {/* --- BEGIN COMMENT ---
          表格内容 - 优化行样式、固定行高和悬停效果
          --- END COMMENT --- */}
          <tbody>
            {users.map((user) => {
              const isSelected = selectedUserIds.includes(user.id)
              const roleInfo = getRoleInfo(user.role)
              const statusInfo = getStatusInfo(user.status)
              
              return (
                <tr
                  key={user.id}
                  className={cn(
                    "border-b transition-all duration-200 h-20", // 固定行高
                    isDark ? "border-stone-700/50" : "border-stone-200/50",
                    isSelected 
                      ? (isDark ? "bg-stone-700/30" : "bg-stone-100/70") 
                      : (isDark ? "hover:bg-stone-800/50" : "hover:bg-stone-50/70"),
                    "hover:shadow-sm"
                  )}
                >
                  {/* --- BEGIN COMMENT ---
                  选择框列
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onSelectUser(user.id)}
                      className={cn(
                        "flex items-center justify-center transition-colors rounded-md p-1",
                        isDark ? "text-stone-400 hover:text-stone-300 hover:bg-stone-700/50" : "text-stone-600 hover:text-stone-700 hover:bg-stone-100/50"
                      )}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  用户信息列 - 优化布局和截断处理
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* --- 用户头像 --- */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0",
                        isDark ? "bg-stone-700 text-stone-300" : "bg-stone-200 text-stone-700"
                      )}>
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name || '用户头像'} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-serif">
                            {(user.full_name || user.username || user.email || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* --- 用户名称和用户名 --- */}
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "font-medium font-serif truncate text-sm",
                          isDark ? "text-stone-100" : "text-stone-900"
                        )} title={user.full_name || user.username || '未设置姓名'}>
                          {user.full_name || user.username || '未设置姓名'}
                        </p>
                        {user.username && (
                          <p className={cn(
                            "text-xs font-serif truncate mt-0.5",
                            isDark ? "text-stone-500" : "text-stone-500"
                          )} title={`@${user.username}`}>
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  联系方式列 - 优化布局和截断
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <div className="space-y-1 min-w-0">
                      <p className={cn(
                        "text-sm font-serif truncate flex items-center gap-1",
                        isDark ? "text-stone-300" : "text-stone-700"
                      )} title={user.email || '未设置邮箱'}>
                        <span className="text-xs">📧</span>
                        <span className="truncate">{user.email || '未设置'}</span>
                      </p>
                      <p className={cn(
                        "text-sm font-serif truncate flex items-center gap-1",
                        isDark ? "text-stone-400" : "text-stone-600"
                      )} title={user.phone || '未设置手机'}>
                        <span className="text-xs">📱</span>
                        <span className="truncate">{user.phone || '未设置'}</span>
                      </p>
                    </div>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  组织信息列 - 优化布局，限制高度，使用tooltip显示完整信息
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    {user.organization_name ? (
                      <div className="space-y-0.5 min-w-0" title={`组织: ${user.organization_name}${user.department ? `\n部门: ${user.department}` : ''}${user.job_title ? `\n职位: ${user.job_title}` : ''}`}>
                        <p className={cn(
                          "text-sm font-medium font-serif truncate flex items-center gap-1",
                          isDark ? "text-stone-200" : "text-stone-800"
                        )}>
                          <span className="text-xs">🏢</span>
                          <span className="truncate">{user.organization_name}</span>
                        </p>
                        {user.department && (
                          <p className={cn(
                            "text-xs font-serif truncate flex items-center gap-1",
                            isDark ? "text-stone-400" : "text-stone-600"
                          )}>
                            <span className="text-xs">🏛️</span>
                            <span className="truncate">{user.department}</span>
                          </p>
                        )}
                        {user.job_title && (
                          <p className={cn(
                            "text-xs font-serif truncate flex items-center gap-1",
                            isDark ? "text-stone-400" : "text-stone-600"
                          )}>
                            <span className="text-xs">💼</span>
                            <span className="truncate">{user.job_title}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center h-16">
                        <p className={cn(
                          "text-sm font-serif",
                          isDark ? "text-stone-500" : "text-stone-500"
                        )}>
                          未加入组织
                        </p>
                      </div>
                    )}
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  角色权限列 - 优化标签设计，确保不换行
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium font-serif border whitespace-nowrap",
                      getBadgeClasses(roleInfo.variant)
                    )}>
                      {roleInfo.icon}
                      <span className="truncate">{roleInfo.label}</span>
                    </span>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  账户状态列 - 优化标签设计，确保不换行
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium font-serif border whitespace-nowrap",
                      getBadgeClasses(statusInfo.variant)
                    )}>
                      {statusInfo.icon}
                      <span className="truncate">{statusInfo.label}</span>
                    </span>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  最后登录时间列 - 优化时间显示
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <p className={cn(
                      "text-sm font-serif truncate",
                      isDark ? "text-stone-300" : "text-stone-700"
                    )} title={formatDate(user.last_sign_in_at)}>
                      {formatDate(user.last_sign_in_at)}
                    </p>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  注册时间列 - 优化时间显示
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <p className={cn(
                      "text-sm font-serif truncate",
                      isDark ? "text-stone-300" : "text-stone-700"
                    )} title={formatDate(user.created_at)}>
                      {formatDate(user.created_at)}
                    </p>
                  </td>
                  
                  {/* --- BEGIN COMMENT ---
                  操作菜单列 - 优化按钮样式
                  --- END COMMENT --- */}
                  <td className="px-4 py-4">
                    <Dropdown
                      trigger={
                        <button className={cn(
                          "p-2 rounded-lg transition-colors",
                          isDark 
                            ? "text-stone-400 hover:text-stone-300 hover:bg-stone-700/50" 
                            : "text-stone-600 hover:text-stone-700 hover:bg-stone-100/50"
                        )}>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                    >
                      <div className="py-1">
                        {/* --- 查看用户 --- */}
                        <button
                          onClick={() => onViewUser(user)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm font-serif transition-colors",
                            isDark 
                              ? "text-stone-300 hover:bg-stone-700 hover:text-stone-100" 
                              : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                          )}
                        >
                          <Eye className="h-4 w-4" />
                          查看详情
                        </button>
                        
                        {/* --- 编辑用户 --- */}
                        <button
                          onClick={() => onEditUser(user)}
                          disabled={!canEditUser(user)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm font-serif transition-colors",
                            !canEditUser(user)
                              ? (isDark ? "text-stone-600 cursor-not-allowed" : "text-stone-400 cursor-not-allowed")
                              : (isDark 
                                  ? "text-stone-300 hover:bg-stone-700 hover:text-stone-100" 
                                  : "text-stone-700 hover:bg-stone-100 hover:text-stone-900")
                          )}
                        >
                          <Edit2 className="h-4 w-4" />
                          编辑信息
                        </button>
                        
                        <div className={cn(
                          "h-px my-1",
                          isDark ? "bg-stone-700" : "bg-stone-200"
                        )} />
                        
                        {/* --- 角色更改子菜单 --- */}
                        <div className={cn(
                          "px-4 py-2 text-xs font-semibold font-serif uppercase tracking-wider",
                          isDark ? "text-stone-500" : "text-stone-500"
                        )}>
                          更改角色
                        </div>
                        
                        {(['admin', 'manager', 'user'] as const).map((role) => {
                          const roleInfo = getRoleInfo(role)
                          const canChange = canChangeUserRole(user, role)
                          const isCurrent = user.role === role
                          
                          return (
                            <button
                              key={role}
                              onClick={() => onChangeRole(user, role)}
                              disabled={!canChange || isCurrent}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-sm font-serif transition-colors",
                                (!canChange || isCurrent)
                                  ? (isDark ? "text-stone-600 cursor-not-allowed" : "text-stone-400 cursor-not-allowed")
                                  : (isDark 
                                      ? "text-stone-300 hover:bg-stone-700 hover:text-stone-100" 
                                      : "text-stone-700 hover:bg-stone-100 hover:text-stone-900")
                              )}
                            >
                              {roleInfo.icon}
                              {roleInfo.label}
                              {isCurrent && (
                                <span className="ml-auto text-xs">(当前)</span>
                              )}
                              {!canChange && !isCurrent && user.id === currentUserProfile?.id && (
                                <span className="ml-auto text-xs">(自己)</span>
                              )}
                              {!canChange && !isCurrent && user.role === 'admin' && user.id !== currentUserProfile?.id && (
                                <span className="ml-auto text-xs">(管理员)</span>
                              )}
                            </button>
                          )
                        })}
                        
                        <div className={cn(
                          "h-px my-1",
                          isDark ? "bg-stone-700" : "bg-stone-200"
                        )} />
                        
                        {/* --- 状态更改子菜单 --- */}
                        <div className={cn(
                          "px-4 py-2 text-xs font-semibold font-serif uppercase tracking-wider",
                          isDark ? "text-stone-500" : "text-stone-500"
                        )}>
                          更改状态
                        </div>
                        
                        {(['active', 'suspended', 'pending'] as const).map((status) => {
                          const statusInfo = getStatusInfo(status)
                          const isCurrent = user.status === status
                          
                          return (
                            <button
                              key={status}
                              onClick={() => onChangeStatus(user, status)}
                              disabled={isCurrent}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-sm font-serif transition-colors",
                                isCurrent
                                  ? (isDark ? "text-stone-600 cursor-not-allowed" : "text-stone-400 cursor-not-allowed")
                                  : (isDark 
                                      ? "text-stone-300 hover:bg-stone-700 hover:text-stone-100" 
                                      : "text-stone-700 hover:bg-stone-100 hover:text-stone-900")
                              )}
                            >
                              {statusInfo.icon}
                              {statusInfo.label}
                              {isCurrent && (
                                <span className="ml-auto text-xs">(当前)</span>
                              )}
                            </button>
                          )
                        })}
                        
                        <div className={cn(
                          "h-px my-1",
                          isDark ? "bg-stone-700" : "bg-stone-200"
                        )} />
                        
                        {/* --- 删除用户 --- */}
                        <button
                          onClick={() => onDeleteUser(user)}
                          disabled={!canDeleteUser(user)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm font-serif transition-colors",
                            !canDeleteUser(user)
                              ? (isDark ? "text-stone-600 cursor-not-allowed" : "text-stone-400 cursor-not-allowed")
                              : (isDark 
                                  ? "text-red-400 hover:bg-red-900/20 hover:text-red-300" 
                                  : "text-red-600 hover:bg-red-50 hover:text-red-700")
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                          删除用户
                          {!canDeleteUser(user) && user.id === currentUserProfile?.id && (
                            <span className="ml-auto text-xs">(自己)</span>
                          )}
                          {!canDeleteUser(user) && user.role === 'admin' && user.id !== currentUserProfile?.id && (
                            <span className="ml-auto text-xs">(管理员)</span>
                          )}
                        </button>
                      </div>
                    </Dropdown>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 