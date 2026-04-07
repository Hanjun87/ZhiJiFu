import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Phone, User, Building2, ShieldCheck, Award } from 'lucide-react';

interface DoctorRegisterProps {
  apiBaseUrl: string;
  onNavigate: (page: any) => void;
}

export default function DoctorRegisterPage({ apiBaseUrl, onNavigate }: DoctorRegisterProps) {
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [hospital, setHospital] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!realName.trim()) { setError('请输入真实姓名'); return; }
    if (!phone.trim()) { setError('请输入手机号'); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入正确的11位手机号码'); return; }
    if (!hospital.trim()) { setError('请输入执业医院'); return; }
    if (!password || password.length < 6) { setError('密码不能少于6位'); return; }

    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + '/api/auth/register-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realName: realName.trim(), phone, hospital: hospital.trim(), password }),
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
        <span className="text-[#1677FF] font-medium text-base">知己肤</span>
      </div>

      {/* Title */}
      <div className="px-5 mt-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">医生注册</h1>
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
          请完成初步注册，后续需上传身份证及医师执业证进行审核
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="mx-5 bg-white rounded-2xl shadow-sm p-5"
      >
        {/* Real Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">真实姓名</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="请输入您的真实姓名"
              value={realName}
              onChange={e => { setRealName(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

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

        {/* Hospital */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">执业医院</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="请输入您当前执业的医院全称"
              value={hospital}
              onChange={e => { setHospital(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1677FF] placeholder:text-gray-400 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">设置密码</label>
          <div className="relative">
            <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            <Award size={24} className="text-amber-500 mx-auto mb-1" />
            <div className="text-sm font-semibold text-gray-800">权威认证</div>
            <div className="text-xs text-gray-400 mt-0.5">实名审核保障职业权益</div>
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
          {loading ? '提交中...' : '提交申请'}
        </button>
      </motion.div>

      {/* Bottom */}
      <div className="mt-auto pb-6 px-5 text-center">
        <p className="text-gray-400 text-xs leading-5">
          点击"提交申请"即表示您同意我们的{' '}
          <span className="text-[#1677FF]">《医生服务协议》</span>{' '}
          与{' '}
          <span className="text-[#1677FF]">《隐私保护指引》</span>
        </p>
      </div>
    </div>
  );
}
