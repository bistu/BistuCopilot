'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { BarChart3, MessageSquare, TrendingUp, Users } from 'lucide-react';

import React from 'react';

export default function AnalyticsPage() {
  const { isDark } = useTheme();

  return (
    <div className="p-6">
      {/* --- BEGIN COMMENT ---
      页面标题区域
      --- END COMMENT --- */}
      <div className="mb-8">
        <h1
          className={cn(
            'mb-2 text-2xl font-bold',
            isDark ? 'text-stone-100' : 'text-stone-900'
          )}
        >
          数据统计
        </h1>
        <p
          className={cn(
            'text-sm',
            isDark ? 'text-stone-400' : 'text-stone-600'
          )}
        >
          查看系统使用情况、用户活跃度和性能指标
        </p>
      </div>

      {/* --- BEGIN COMMENT ---
      统计卡片
      --- END COMMENT --- */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                总用户数
              </p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                1,234
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg p-3',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                对话总数
              </p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                5,678
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg p-3',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                活跃用户
              </p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                892
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg p-3',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-stone-400' : 'text-stone-600'
                )}
              >
                API 调用
              </p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                12.3K
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg p-3',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            >
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      图表占位区域
      --- END COMMENT --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <h3
            className={cn(
              'mb-4 text-lg font-semibold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            用户活跃度趋势
          </h3>
          <div
            className={cn(
              'flex h-64 items-center justify-center rounded-lg border-2 border-dashed',
              isDark
                ? 'border-stone-700 bg-stone-800/50'
                : 'border-stone-300 bg-stone-50'
            )}
          >
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              📊 图表组件开发中
            </p>
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border p-6',
            isDark
              ? 'border-stone-700 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <h3
            className={cn(
              'mb-4 text-lg font-semibold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            API 使用统计
          </h3>
          <div
            className={cn(
              'flex h-64 items-center justify-center rounded-lg border-2 border-dashed',
              isDark
                ? 'border-stone-700 bg-stone-800/50'
                : 'border-stone-300 bg-stone-50'
            )}
          >
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              📈 图表组件开发中
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
