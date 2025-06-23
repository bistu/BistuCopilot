'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { SocialAuthButtons } from './social-auth-buttons';
import { BistuSSOCard } from './bistu-sso-button';
import { Eye, EyeOff } from 'lucide-react';
import { clearCacheOnLogin } from '@lib/utils/cache-cleanup';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark } = useTheme();
  
  // --- BEGIN COMMENT ---
  // 检查是否启用北信科专用模式
  // --- END COMMENT ---
  const ssoOnlyMode = process.env.NEXT_PUBLIC_SSO_ONLY_MODE === 'true';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[登录] 开始邮箱密码登录流程');
      
      // --- BEGIN COMMENT ---
      // 登录前先清理前一个用户的缓存，防止数据污染
      // --- END COMMENT ---
      clearCacheOnLogin();
      
      // 使用 Supabase Auth 进行登录
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        throw error;
      }
      
      console.log('[登录] 邮箱密码登录成功');
      
      // 登录成功，跳转到聊天页面
      router.push('/chat');
      router.refresh(); // 刷新页面以更新用户状态
    } catch (err: any) {
      console.error('[登录] 邮箱密码登录失败:', err);
      setError(err.message || '登录失败，请检查您的邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 rounded-xl shadow-lg border transition-all font-serif",
      isDark ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-200"
    )}>
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-stone-700 to-stone-500 bg-clip-text text-transparent font-serif">登录</h2>
        <p className={cn(
          "mt-2 text-sm font-serif",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
          欢迎使用智能助手
        </p>
      </div>



      {error && (
        <div className={cn(
          "p-4 rounded-lg text-sm border-l-4 border-red-500 font-serif",
          isDark ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-700"
        )}>
          {error}
        </div>
      )}

      {/* --- BEGIN COMMENT --- */}
      {/* 登录选项区域 */}
      {/* --- END COMMENT --- */}
      <div className="space-y-6">
        {/* --- BEGIN COMMENT --- */}
        {/* 北信科SSO登录区域 */}
        {/* --- END COMMENT --- */}
        <BistuSSOCard returnUrl="/chat" />

        {/* --- BEGIN COMMENT --- */}
        {/* 条件渲染：仅在非SSO专用模式下显示社交登录 */}
        {/* --- END COMMENT --- */}
        {!ssoOnlyMode && (
          <>
            {/* --- BEGIN COMMENT --- */}
            {/* 社交登录区域 */}
            {/* --- END COMMENT --- */}
            <SocialAuthButtons type="login" redirectTo="/chat" />
          </>
        )}

        {/* --- BEGIN COMMENT --- */}
        {/* 分割线 - 始终显示 */}
        {/* --- END COMMENT --- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={cn(
              "w-full border-t",
              isDark ? "border-stone-700" : "border-stone-300"
            )} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={cn(
              "px-2 font-serif",
              isDark ? "bg-stone-900 text-gray-400" : "bg-stone-50 text-gray-500"
            )}>
              或使用邮箱密码
            </span>
          </div>
        </div>

        {/* --- BEGIN COMMENT --- */}
        {/* 邮箱密码登录 - 始终显示 */}
        {/* --- END COMMENT --- */}
        <>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className={cn(
                    "block text-sm font-medium mb-1 font-serif",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    邮箱
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={cn(
                      "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                      isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                    )}
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className={cn(
                    "block text-sm font-medium mb-1 font-serif",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    密码
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className={cn(
                        "block w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                        isDark ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300"
                      )}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={cn(
                        "absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 focus:outline-none transition-colors",
                        isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-500 hover:text-stone-600"
                      )}
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link href="/forgot-password" className={cn(
                    "font-medium font-serif",
                    isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-700 hover:text-stone-600"
                  )}>
                    忘记密码？
                  </Link>
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="w-full h-12 text-base font-serif"
                  variant="gradient"
                >
                  登录
                </Button>
              </div>
            </form>

            {/* --- BEGIN COMMENT --- */}
            {/* 条件渲染：仅在非SSO专用模式下显示手机号登录和注册链接 */}
            {/* --- END COMMENT --- */}
            {!ssoOnlyMode && (
              <div className="mt-6 text-center space-y-3">
                {/* --- BEGIN COMMENT --- */}
                {/* 手机号登录链接 */}
                {/* --- END COMMENT --- */}
                <div>
                  <Link href="/phone-login" className={cn(
                    "text-sm font-medium font-serif hover:underline",
                    isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-600 hover:text-stone-700"
                  )}>
                    📱 使用手机号验证码登录
                  </Link>
                </div>
                
                <p className={cn(
                  "text-sm font-serif",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  还没有账号？{' '}
                  <Link href="/register" className={cn(
                    "font-medium font-serif",
                    isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-700 hover:text-stone-600"
                  )}>
                    立即注册
                  </Link>
                </p>
              </div>
            )}
          </>
      </div>
    </div>
  );
} 