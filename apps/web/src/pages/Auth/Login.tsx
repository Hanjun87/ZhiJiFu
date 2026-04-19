import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Lock, Eye, EyeOff, ShieldCheck, ClipboardList } from 'lucide-react';

interface LoginPageProps {
  apiBaseUrl: string;
  onNavigate: (page: any, data?: { accountId: string; role: string }) => void;
}

export default function LoginPage({ apiBaseUrl, onNavigate }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'doctor'>('user');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!phone.trim()) { setError('请输入手机号'); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入正确的11位手机号'); return; }
    if (!password) { setError('请输入密码'); return; }

    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role: activeTab }),
      });
      const data = await res.json();
      if (data.success) {
        if (activeTab === 'user') {
          onNavigate('home', { accountId: data.data.accountId, role: data.data.role });
        } else {
          onNavigate('home', { accountId: data.data.accountId, role: data.data.role });
        }
      } else {
        setError(data.message || '登录失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f0f5ff 0%, #f8fafc 40%, #f1f5f9 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-2">
        <img src="/ZhiJiFu.png" alt="知己肤" className="w-9 h-9 rounded-xl object-contain" />
        <span className="text-[#1677FF] font-bold text-lg">知己肤</span>
      </div>

      {/* Icon & Title */}
      <div className="flex flex-col items-center mt-4 mb-5">
        <img src="/ZhiJiFu.png" alt="知己肤" className="w-20 h-20 rounded-full object-contain mb-3 shadow-lg" />
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
        <p className="text-gray-400 text-sm mt-1">请登录您的专业皮肤健康管理账户</p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-5 bg-white rounded-2xl shadow-sm p-5"
      >
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setActiveTab('user'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'user' ? 'bg-white text-[#1677FF] shadow-sm' : 'text-gray-500'
            }`}
          >
            用户登录
          </button>
          <button
            onClick={() => { setActiveTab('doctor'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'doctor' ? 'bg-white text-[#1677FF] shadow-sm' : 'text-gray-500'
            }`}
          >
            医生登录
          </button>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号码</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="请输入手机号"
              maxLength={11}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入您的登录密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-3 py-2 bg-red-50 rounded-lg text-red-500 text-xs"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-[#1677FF] hover:bg-[#1560D8] active:bg-[#1254BC] text-white font-medium rounded-xl text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
        >
          {loading ? '登录中...' : '立即登录'}
        </button>

        {/* Divider */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-center gap-1">
          {activeTab === 'user' ? (
            <>
              <span className="text-gray-400 text-sm">还没有账号？</span>
              <button
                onClick={() => onNavigate('register_user')}
                className="text-[#1677FF] text-sm font-medium hover:underline"
              >
                立即注册
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('register_doctor')}
              className="text-[#1677FF] text-sm font-medium hover:underline"
            >
              注册医生账号
            </button>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-auto pb-6 px-5 text-center">
        <p className="text-gray-400 text-xs leading-5">
          登录即代表您已阅读并同意{' '}
          <span className="text-gray-600 underline">服务协议</span>{' '}
          和{' '}
          <span className="text-gray-600 underline">隐私政策</span>
        </p>
      </div>
    </div>
  );
}
