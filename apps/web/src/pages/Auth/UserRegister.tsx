import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Phone, ShieldCheck, Lock } from 'lucide-react';

interface UserRegisterProps {
  apiBaseUrl: string;
  onNavigate: (page: any) => void;
}

export default function UserRegisterPage({ apiBaseUrl, onNavigate }: UserRegisterProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = useCallback(() => {
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入正确的手机号'); return; }
    setCountdown(60);
    setError('');
  }, [phone]);

  const handleRegister = async () => {
    setError('');
    if (!phone.trim()) { setError('请输入手机号'); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入正确的11位手机号码'); return; }
    if (!password || password.length < 6) { setError('密码不能少于6位'); return; }
    if (!code.trim()) { setError('请输入验证码'); return; }
    if (!agreed) { setError('请先同意用户协议与隐私政策'); return; }

    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        onNavigate('login');
      } else {
        setError(data.message || '注册失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f0f5ff 0%, #f8fafc 40%, #f1f5f9 100%)' }}>
      {/* Nav */}
      <div className="px-5 pt-6 pb-2 flex items-center">
        <button onClick={() => onNavigate('login')} className="mr-3">
          <ArrowLeft size={22} className="text-[#1677FF]" />
        </button>
        <span className="text-[#1677FF] font-medium text-base">用户注册</span>
      </div>

      {/* Title */}
      <div className="px-5 mt-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">用户注册</h1>
      </div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mb-5 px-4 py-3 rounded-xl flex items-start gap-2.5"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
      >
        <ShieldCheck size={18} className="text-[#1677FF] mt-0.5 shrink-0" />
        <p className="text-[#1677FF] text-xs leading-5">
          请填写以下信息完成注册，开启您的专业皮肤健康管理之旅
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="mx-5 bg-white rounded-2xl shadow-sm p-5"
      >
        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="请输入11位手机号码"
              maxLength={11}
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Verification Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">验证码</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="请输入验证码"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all shrink-0 disabled:opacity-50"
              style={{ background: countdown > 0 ? '#e8f0fe' : '#eff6ff', color: countdown > 0 ? '#9ca3af' : '#1677FF' }}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">设置密码</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="请设置6位以上密码"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Security Cards */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <ShieldCheck size={24} className="text-[#1677FF] mx-auto mb-1" />
            <div className="text-sm font-semibold text-gray-800">隐私加密</div>
            <div className="text-xs text-gray-400 mt-0.5">医疗级数据保护协议</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-amber-600 text-xs font-bold">+</span>
            </div>
            <div className="text-sm font-semibold text-gray-800">安全保障</div>
            <div className="text-xs text-gray-400 mt-0.5">云端数据加密存储</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 px-3 py-2 bg-red-50 rounded-lg text-red-500 text-xs"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 bg-[#1677FF] hover:bg-[#1560D8] active:bg-[#1254BC] text-white font-medium rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
        >
          {loading ? '注册中...' : '立即注册'}
        </button>

        {/* Agreement */}
        <div className="mt-4 flex items-start gap-2">
          <button
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              agreed ? 'border-[#1677FF] bg-[#1677FF]' : 'border-gray-300'
            }`}
          >
            {agreed && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <p className="text-xs text-gray-500 leading-4">
            我已阅读并同意{' '}
            <span className="text-[#1677FF]">用户协议与隐私政策</span>。
            我们承诺保护您的个人健康数据安全。
          </p>
        </div>
      </motion.div>

      {/* Bottom */}
      <div className="mt-auto pb-6 text-center">
        <span className="text-gray-400 text-sm">已经有账号？</span>
        <button onClick={() => onNavigate('login')} className="text-[#1677FF] text-sm font-medium ml-1 hover:underline">
          直接登录
        </button>
      </div>
    </div>
  );
}
