import React from 'react';
import { NavLink } from 'react-router-dom';
import { Camera, FileText, Users, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center z-50 safe-bottom">
      <NavLink to="/identify" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
        <Camera size={24} />
        <span className="text-[10px]">识别</span>
      </NavLink>
      <NavLink to="/records" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
        <FileText size={24} />
        <span className="text-[10px]">档案</span>
      </NavLink>
      <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
        <Users size={24} />
        <span className="text-[10px]">社区</span>
      </NavLink>
      <NavLink to="/mine" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
        <User size={24} />
        <span className="text-[10px]">我的</span>
      </NavLink>
    </nav>
  );
};
