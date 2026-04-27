'use client';

import { useChat } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Phone, MapPin, Bookmark, Settings, HelpCircle, Lock, User, Shield, LogOut, BadgeCheck, Info, Radio, PlusCircle, UsersRound, Star, Wallet, Gamepad2 } from 'lucide-react';
import Image from 'next/image';

export default function SideMenu() {
  const { isSideMenuOpen, setSideMenuOpen, setView, themeColor, userProfile, setActiveChatId, isAdmin, logout } = useChat();

  return (
    <AnimatePresence>
      {isSideMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSideMenuOpen(false)}
            className="absolute inset-0 bg-overlay-bg z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 w-[85%] max-w-[340px] h-full bg-side-menu-bg z-50 flex flex-col shadow-2xl"
          >
            {/* Header with gradient */}
            <div 
              className="p-5 pt-12 pb-6 flex flex-col gap-3 text-white relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-[64px] h-[64px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-medium overflow-hidden ring-2 ring-white/30 shadow-lg">
                  {userProfile.avatarUrl ? (
                    <Image 
                      src={userProfile.avatarUrl} 
                      alt="Avatar" 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User size={32} className="text-white/90" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-[16px] flex items-center gap-1.5 drop-shadow-sm">
                    {userProfile.name}
                    {userProfile.isOfficial && <BadgeCheck size={18} className="text-blue-400 fill-white" />}
                  </div>
                  <div className="text-xs text-white/80 mt-0.5 font-medium">онлайн</div>
                </div>
              </div>
            </div>
            
            {/* Menu items */}
            <ul className="py-2 flex-grow overflow-y-auto px-2">
              {/* Create Section */}
              <li className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Создать</div>
              </li>
              <MenuItem 
                icon={<PlusCircle size={22} strokeWidth={2} />} 
                text="Создать канал" 
                onClick={() => { setView('create-channel'); setSideMenuOpen(false); }}
                accent
              />
              <MenuItem 
                icon={<UsersRound size={22} strokeWidth={2} />} 
                text="Новая группа" 
                onClick={() => { setView('create-group'); setSideMenuOpen(false); }}
                accent
              />
              
              {/* Contacts Section */}
              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
              <li className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Общение</div>
              </li>
              <MenuItem icon={<Users size={22} strokeWidth={2} />} text="Контакты" locked />
              <MenuItem icon={<Phone size={22} strokeWidth={2} />} text="Звонки" locked />
              <MenuItem icon={<MapPin size={22} strokeWidth={2} />} text="Люди рядом" locked />
              
              {/* Saved & Settings Section */}
              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
              <li className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Приложение</div>
              </li>
              <MenuItem 
                icon={<Wallet size={22} strokeWidth={2} />} 
                text="Кошелёк" 
                onClick={() => { setView('wallet'); setSideMenuOpen(false); }}
                accent
              />
              <MenuItem 
                icon={<Gamepad2 size={22} strokeWidth={2} />} 
                text="Мини-игры" 
                onClick={() => { setView('mini-games'); setSideMenuOpen(false); }}
                accent
              />
              <MenuItem 
                icon={<Star size={22} strokeWidth={2} />} 
                text="Избранное" 
                onClick={() => { setActiveChatId('saved_messages'); setView('chat'); setSideMenuOpen(false); }} 
              />
              <MenuItem 
                icon={<Settings size={22} strokeWidth={2} />} 
                text="Настройки" 
                onClick={() => { setView('settings'); setSideMenuOpen(false); }} 
              />
              <MenuItem 
                icon={<HelpCircle size={22} strokeWidth={2} />} 
                text="Возможности HouseGram" 
                onClick={() => { setView('features'); setSideMenuOpen(false); }} 
              />
              <MenuItem 
                icon={<Info size={22} strokeWidth={2} />} 
                text="О приложении" 
                onClick={() => { setView('info'); setSideMenuOpen(false); }} 
              />
              
              {/* Admin & Logout Section */}
              {isAdmin && (
                <>
                  <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
                  <MenuItem 
                    icon={<Shield size={22} strokeWidth={2} />} 
                    text="Админ Панель" 
                    onClick={() => { setView('admin'); setSideMenuOpen(false); }}
                    danger
                  />
                </>
              )}
              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
              <MenuItem 
                icon={<LogOut size={22} strokeWidth={2} />} 
                text="Выйти" 
                onClick={() => { logout(); setSideMenuOpen(false); }}
                danger
              />
            </ul>
            
            {/* Footer */}
            <div className="p-4 text-center text-gray-400 text-xs border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="font-semibold text-gray-600 dark:text-gray-300">HouseGram Web</div>
              <div className="mt-1 text-[10px] text-gray-400">v2.2 beta • Быстро. Безопасно. Удобно.</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuItem({ icon, text, locked, onClick, accent, danger }: { 
  icon: React.ReactNode; 
  text: string; 
  locked?: boolean; 
  onClick?: () => void;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <li 
      onClick={!locked ? onClick : undefined} 
      className={`flex items-center px-4 py-2.5 gap-4 rounded-xl mb-1 transition-all duration-200 group relative
        ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]'}
        ${accent ? 'bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20' : ''}
        ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-side-menu-text-color'}
      `}
    >
      <div className={`${danger ? 'text-red-500' : accent ? 'text-blue-500' : 'text-side-menu-icon-color'} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[15px] font-medium flex-grow">{text}</span>
      {locked && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-full shadow-sm">
          <Lock size={11} strokeWidth={2.5} />
          <span>Soon</span>
        </div>
      )}
    </li>
  );
}
