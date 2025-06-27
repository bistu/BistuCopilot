'use client'

import PhoneAuth from '@components/auth/phone-auth'
import Link from 'next/link'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { useTranslations } from 'next-intl'

export default function PhoneLoginPage() {
  const { isDark } = useTheme()
  const t = useTranslations('pages.auth.phoneLoginPage')
  
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      isDark 
        ? "bg-gradient-to-br from-stone-900 via-gray-900 to-stone-900" 
        : "bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50"
    )}>
      <div className="w-full max-w-md space-y-6">
        {/* --- 头部标题 --- */}
        <div className="text-center space-y-2">
          <h1 className={cn(
            "text-3xl font-bold tracking-tight font-serif",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            {t('title')}
          </h1>
          <p className={cn(
            "text-sm font-serif",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('subtitle')}
          </p>
        </div>

        {/* --- 手机号认证组件 --- */}
        <PhoneAuth />

        {/* --- 其他登录方式 --- */}
        <div className={cn(
          "p-6 rounded-xl shadow-lg border transition-all font-serif",
          isDark ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-200"
        )}>
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className={cn(
                  "w-full border-t",
                  isDark ? "border-stone-700" : "border-stone-300"
                )} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={cn(
                  "px-2 font-serif",
                  isDark 
                    ? "bg-stone-900 text-gray-400" 
                    : "bg-stone-50 text-gray-500"
                )}>
                  {t('orSeparator')}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Link 
                href="/login" 
                className={cn(
                  "text-sm hover:underline font-serif",
                  isDark 
                    ? "text-stone-400 hover:text-stone-300" 
                    : "text-stone-600 hover:text-stone-700"
                )}
              >
                {t('emailLoginLink')}
              </Link>
              <Link 
                href="/register" 
                className={cn(
                  "text-sm hover:underline font-serif",
                  isDark 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-600 hover:text-gray-700"
                )}
              >
                {t('registerLink')}
              </Link>
            </div>
          </div>
        </div>

        {/* --- 底部说明 --- */}
        <p className={cn(
          "text-xs text-center font-serif",
          isDark ? "text-gray-500" : "text-gray-500"
        )}>
          {t('termsText')}{' '}
          <Link href="/terms" className={cn(
            "underline",
            isDark ? "hover:text-gray-400" : "hover:text-gray-700"
          )}>
            {t('termsLink')}
          </Link>{' '}
          {t('andText')}{' '}
          <Link href="/privacy" className={cn(
            "underline",
            isDark ? "hover:text-gray-400" : "hover:text-gray-700"
          )}>
            {t('privacyLink')}
          </Link>
        </p>
      </div>
    </div>
  )
} 