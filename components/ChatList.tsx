'use client';

import { useChat } from '@/context/ChatContext';
import { Menu, Search, Bookmark, ArrowLeft, CheckCircle, BadgeCheck, Star, Monitor, Smartphone, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Stories from './Stories';
import PremiumBadge from './PremiumBadge';
import PremiumModal from './PremiumModal';

// Генерация цвета аватара на основе ID пользователя
const getAvatarColor = (userId: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#E63946', '#457B9D', '#F77F00', '#06FFA5', '#8338EC'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export default function ChatList() {
  const { contacts, setView, setActiveChatId, setSideMenuOpen, markAsRead, themeColor, isGlassEnabled, addContact } = useChat();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumUser, setSelectedPremiumUser] = useState<string>('');
  const [isDesktopMode, setIsDesktopMode] = useState(false);

  // Check if desktop mode on mount
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktopMode(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const toggleDesktopMode = () => {
    console.log('Toggle button clicked, current isDesktopMode:', isDesktopMode);
    window.dispatchEvent(new CustomEvent('toggleDesktopMode'));
    setIsDesktopMode(!isDesktopMode);
  };

  // Debounce поиска (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    if (debouncedQuery.trim().length > 0) {
      const searchUsers = async () => {
        const queryText = debouncedQuery.trim().toLowerCase();
        // Try searching by username (with or without @)
        const usernameQuery = queryText.startsWith('@') ? queryText : `@${queryText}`;

        const q = query(collection(db, 'users'), where('username', '>=', usernameQuery), where('username', '<=', usernameQuery + '\uf8ff'));
        const snapshot = await getDocs(q);
        if (!isMounted) return;
        const results = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== auth.currentUser?.uid);
        setSearchResults(results);
      };
      searchUsers();
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setSearchResults([]);
      });
    }
    return () => { isMounted = false; };
  }, [debouncedQuery]);

  const handleSearchResultClick = (user: any) => {
    let statusText = 'был(а) недавно';
    if (user.status === 'online') {
      statusText = 'в сети';
    } else if (user.lastSeen) {
      try {
        let date;
        if (user.lastSeen.toDate) {
          date = user.lastSeen.toDate();
        } else if (user.lastSeen instanceof Date) {
          date = user.lastSeen;
        } else {
          date = new Date(user.lastSeen);
        }
        const distance = formatDistanceToNow(date, { addSuffix: true, locale: ru });
        if (distance === 'меньше минуты назад') {
          statusText = 'был(а) только что';
        } else {
          statusText = `был(а) ${distance}`;
        }
      } catch (e) {
        statusText = 'был(а) недавно';
      }
    }

    addContact({
      id: user.id,
      name: user.name,
      initial: user.name.charAt(0).toUpperCase(),
      avatarColor: getAvatarColor(user.id),
      avatarUrl: user.avatarUrl,
      statusOnline: 'в сети',
      statusOffline: statusText,
      phone: user.phone || '',
      bio: user.bio || '',
      username: user.username || '',
      messages: [],
      isTyping: false,
      unread: 0,
      isChannel: false,
      isOfficial: user.role === 'admin' || user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      premium: user.premium === true
    });
    setActiveChatId(user.id);
    setView('chat');
    setIsSearching(false);
    setSearchQuery('');
  };

  const sortedContacts = Object.values(contacts)
    .filter(c => c.id === 'saved_messages' || c.isChannel || c.isGroup || c.messages.length > 0)
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(query);
      const usernameMatch = c.username?.toLowerCase().includes(query);
      return nameMatch || usernameMatch;
    })
    .sort((a, b) => {
      const lastA = a.messages[a.messages.length - 1];
      const lastB = b.messages[b.messages.length - 1];
      if (!lastA && !lastB) return 0;
      if (!lastA) return 1;
      if (!lastB) return -1;
      const timeA = lastA.time || '';
      const timeB = lastB.time || '';
      return timeB.localeCompare(timeA);
    });

  const handleChatClick = (id: string) => {
    setActiveChatId(id);
    markAsRead(id);
    setView('chat');
  };

  return (
    <motion.div 
      initial={{ x: '-20%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-20%', opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
      className="absolute inset-0 bg-tg-bg-light flex flex-col"
    >
      <div 
        className={`text-tg-header-text px-3 h-14 flex items-center gap-4 shrink-0 absolute top-0 left-0 w-full z-20 transition-all duration-300 ${isGlassEnabled ? 'backdrop-blur-xl border-b border-white/20 shadow-lg' : 'shadow-md'}`}
        style={{ backgroundColor: isGlassEnabled ? themeColor + 'DD' : themeColor }}
      >
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              className="flex items-center w-full gap-2"
            >
              <button 
                onClick={() => { setIsSearching(false); setSearchQuery(''); }} 
                className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-all duration-200"
              >
                <ArrowLeft size={22} />
              </button>
              <input 
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск пользователей..."
                className="flex-grow bg-white/10 border border-white/20 rounded-full px-4 py-2 outline-none text-white placeholder-white/60 text-[15px] focus:bg-white/15 focus:border-white/30 transition-all"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="header"
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              className="flex items-center w-full gap-4"
            >
              <button onClick={() => setSideMenuOpen(true)} className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-all duration-200">
                <Menu size={22} />
              </button>
              <div className="flex-grow text-[19px] font-semibold tracking-tight">
                HouseGram
              </div>
              <button 
                onClick={toggleDesktopMode}
                className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-all duration-200"
                title={isDesktopMode ? "Мобильный режим" : "Desktop режим"}
              >
                {isDesktopMode ? <Smartphone size={22} /> : <Monitor size={22} />}
              </button>
              <button 
                onClick={() => setView('news')}
                className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-all duration-200"
                title="Новости"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/>
                  <path d="M15 18h-5"/>
                  <path d="M10 6h8v4h-8z"/>
                </svg>
              </button>
              <button 
                onClick={() => setIsSearching(true)}
                className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-all duration-200"
              >
                <Search size={22} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-grow overflow-y-auto pt-14 no-scrollbar">
        {/* Stories - только когда не в режиме поиска */}
        {!isSearching && <Stories />}
        
        {isSearching && searchQuery.trim().length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 text-[13px] font-semibold text-gray-500 uppercase tracking-wide"
          >
            Результаты поиска
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {isSearching && searchQuery.trim().length > 2 && searchResults.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05, type: 'spring', bounce: 0.3 }}
              onClick={() => handleSearchResultClick(user)}
              className="flex items-center px-4 py-3 cursor-pointer border-b border-tg-divider hover:bg-gradient-to-r hover:from-blue-50 dark:hover:from-blue-900/30 hover:to-transparent active:bg-blue-100 dark:active:bg-blue-900/40 transition-all duration-200 gap-3 group"
            >
              <div className="relative">
                {user.avatarUrl ? (
                  <Image 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    width={52} 
                    height={52} 
                    className="rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-blue-200 transition-all" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div 
                    className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-md group-hover:shadow-lg transition-all"
                    style={{ backgroundColor: getAvatarColor(user.id) }}
                  >
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-grow overflow-hidden flex flex-col justify-center">
                <div className="font-semibold text-[16px] text-tg-text-primary mb-0.5 truncate flex items-center gap-1.5">
                  {user.name}
                  {(user.role === 'admin' || user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) && (
                    <BadgeCheck size={17} className="text-blue-500 fill-blue-500 text-white" />
                  )}
                </div>
                <div className="text-[14px] text-tg-secondary-text truncate leading-snug">
                  {user.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : ''}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {(!isSearching || searchQuery.trim().length <= 2) && sortedContacts.map((contact, index) => {
          const lastMsg = contact.messages[contact.messages.length - 1];
          let previewText = '';
          
          if (contact.isChannel) {
            previewText = lastMsg ? lastMsg.text : 'Постов пока нет';
          } else {
            previewText = lastMsg ? (lastMsg.type === 'sent' ? `Вы: ${lastMsg.text}` : lastMsg.text) : '';
          }
          
          return (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, type: 'spring', bounce: 0.3 }}
              onClick={() => handleChatClick(contact.id)}
              className="flex items-center px-4 py-3.5 cursor-pointer border-b border-tg-divider hover:bg-gradient-to-r hover:from-blue-50 dark:hover:from-blue-900/30 hover:to-transparent active:bg-blue-100 dark:active:bg-blue-900/40 transition-all duration-200 gap-3 group"
            >
              <div className="relative">
                {contact.id === 'saved_messages' ? (
                  <div 
                    className="w-[54px] h-[54px] rounded-full flex items-center justify-center text-white shrink-0 shadow-md group-hover:shadow-lg transition-all"
                    style={{ backgroundColor: contact.avatarColor }}
                  >
                    <Bookmark size={26} fill="currentColor" />
                  </div>
                ) : contact.avatarUrl ? (
                  <Image 
                    src={contact.avatarUrl} 
                    alt={contact.name} 
                    width={54} 
                    height={54} 
                    className="rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-blue-200 transition-all" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div 
                    className="w-[54px] h-[54px] rounded-full flex items-center justify-center text-white font-semibold text-xl shrink-0 shadow-md group-hover:shadow-lg transition-all"
                    style={{ backgroundColor: contact.avatarColor }}
                  >
                    {contact.initial}
                  </div>
                )}
                {contact.unread > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {contact.unread}
                  </motion.div>
                )}
              </div>
              <div className="flex-grow overflow-hidden flex flex-col justify-center">
                <div className="font-semibold text-[16px] text-tg-text-primary mb-1 truncate flex items-center gap-1.5">
                  {contact.name}
                  {contact.isOfficial && <BadgeCheck size={17} className="text-blue-500 fill-blue-500 text-white" />}
                  {contact.premium && (
                    <PremiumBadge 
                      size="sm" 
                      onClick={(e) => {
                        e?.stopPropagation();
                        setSelectedPremiumUser(contact.name);
                        setShowPremiumModal(true);
                      }}
                    />
                  )}
                </div>
                <div className="text-[14px] text-tg-secondary-text truncate leading-snug">{previewText}</div>
              </div>
              <div className="flex flex-col items-end text-[12px] text-tg-secondary-text ml-2 shrink-0 gap-1">
                <div className="font-medium">{lastMsg?.time}</div>
              </div>
            </motion.div>
          );
        })}
        {isSearching && searchQuery.trim().length > 2 && searchResults.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search size={48} className="opacity-30" />
            </div>
            <p className="text-[18px] font-semibold text-gray-700 mb-2">Ничего не найдено</p>
            <p className="text-[14px] text-gray-500">Попробуйте изменить запрос</p>
          </motion.div>
        )}
      </div>

      <motion.button
        onClick={() => setView('create-group')}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all text-white z-10"
        style={{ backgroundColor: themeColor }}
      >
        <Users size={24} />
      </motion.button>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userName={selectedPremiumUser}
        onUpgrade={() => {
          setShowPremiumModal(false);
          setView('premium');
        }}
      />
    </motion.div>
  );
}