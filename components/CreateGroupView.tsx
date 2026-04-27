'use client';

import { useChat } from '@/context/ChatContext';
import { ArrowLeft, Search, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import Image from 'next/image';

const getAvatarColor = (id: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#E63946', '#457B9D', '#F77F00', '#06FFA5', '#8338EC'
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function CreateGroupView() {
  const { setView, addContact, setActiveChatId, themeColor } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      const queryText = debouncedQuery.toLowerCase();
      const usernameQuery = queryText.startsWith('@') ? queryText : `@${queryText}`;
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '>=', usernameQuery),
          where('username', '<=', `${usernameQuery}\uf8ff`)
        );
        const snapshot = await getDocs(usersQuery);
        if (!isMounted) return;

        const results = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((user) => user.id !== auth.currentUser?.uid)
          .filter((user) => !selectedUsers.some((selected) => selected.id === user.id))
          .filter((user) => {
            const nameMatch = String(user.name || '').toLowerCase().includes(queryText);
            const usernameMatch = String(user.username || '').toLowerCase().includes(queryText);
            return nameMatch || usernameMatch;
          });

        setSearchResults(results);
      } catch (error) {
        console.error('Create group search failed', error);
      }
    };

    searchUsers();

    return () => { isMounted = false; };
  }, [debouncedQuery, selectedUsers]);

  const handleSelectUser = (user: any) => {
    if (selectedUsers.some((item) => item.id === user.id)) return;
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((item) => item.id !== userId));
  };

  const canCreateGroup = name.trim().length > 0 && selectedUsers.length >= 2;

  const handleCreateGroup = async () => {
    if (!auth.currentUser || !canCreateGroup) return;
    setIsCreating(true);

    const groupId = `group_${Date.now()}`;
    const participants = [auth.currentUser.uid, ...selectedUsers.map((user) => user.id)];

    try {
      await setDoc(doc(db, 'chats', groupId), {
        id: groupId,
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        description: description.trim(),
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        participants,
        isGroup: true,
        lastMessage: '',
        lastMessageSenderId: '',
      });

      addContact({
        id: groupId,
        name: name.trim(),
        initial: name.trim().charAt(0).toUpperCase(),
        avatarColor: getAvatarColor(groupId),
        avatarUrl: avatarUrl.trim(),
        statusOnline: `${participants.length} участников`,
        statusOffline: `${participants.length} участников`,
        phone: '',
        bio: description.trim(),
        username: '',
        messages: [],
        isTyping: false,
        unread: 0,
        isGroup: true,
        participants,
      });

      setActiveChatId(groupId);
      setView('chat');
    } catch (error) {
      console.error('Failed to create group', error);
      alert('Не удалось создать группу. Попробуйте ещё раз.');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCountLabel = `${selectedUsers.length + 1} участников`;

  return (
    <div className="absolute inset-0 bg-white z-30 flex flex-col">
      <div
        className="flex items-center gap-4 p-4 text-white transition-colors"
        style={{ backgroundColor: themeColor }}
      >
        <button onClick={() => setView('menu')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-medium">Новая группа</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-5">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_92px]">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название группы</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название группы"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Аватар URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="URL аватарки"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание группы"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700">Участники</div>
              <div className="text-xs text-gray-500">Вы и минимум 2 человека</div>
            </div>
            <div className="rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">
              {selectedCountLabel}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 text-xs font-bold overflow-hidden">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="rounded-full object-cover" unoptimized />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <span className="font-medium truncate max-w-[140px]">{user.name}</span>
                <button onClick={() => handleRemoveUser(user.id)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Поиск пользователей</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Имя или @username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden text-sm font-semibold text-gray-700">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.name} width={44} height={44} className="object-cover" unoptimized />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-sm text-gray-500 truncate">{user.username || 'без username'}</div>
                  </div>
                  <UserPlus size={18} className="text-blue-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleCreateGroup}
          disabled={!canCreateGroup || isCreating}
          className="w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: canCreateGroup && !isCreating ? themeColor : '#A3BFFA' }}
        >
          {isCreating ? 'Создание группы...' : 'Создать группу'}
        </button>
      </div>
    </div>
  );
}
