'use client';

import { ChatProvider, useChat } from '@/context/ChatContext';
import { AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { isDemoMode } from '@/lib/firebase';

// Компонент для отображения демо-режима
function DemoBanner() {
  if (!isDemoMode) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-center text-sm font-medium z-50 shadow-lg">
      🎭 ДЕМО РЕЖИМ: Приложение работает с тестовыми данными. Для полной функциональности настройте Firebase.
    </div>
  );
}

// Динамический импорт компонентов для быстрой загрузки
const DesktopLayout = dynamic(() => import('@/components/DesktopLayout'));
const ModeToggleButton = dynamic(() => import('@/components/ModeToggleButton'));
const ChatList = dynamic(() => import('@/components/ChatList'), {
  loading: () => <LoadingSpinner />
});
const ChatView = dynamic(() => import('@/components/ChatView'), {
  loading: () => <LoadingSpinner />
});
const ProfileView = dynamic(() => import('@/components/ProfileView'), {
  loading: () => <LoadingSpinner />
});
const SideMenu = dynamic(() => import('@/components/SideMenu'));
const SettingsView = dynamic(() => import('@/components/SettingsView'), {
  loading: () => <LoadingSpinner />
});
const ChatSettingsView = dynamic(() => import('@/components/ChatSettingsView'), {
  loading: () => <LoadingSpinner />
});
const FeaturesView = dynamic(() => import('@/components/FeaturesView'), {
  loading: () => <LoadingSpinner />
});
const PrivacyView = dynamic(() => import('@/components/PrivacyView'), {
  loading: () => <LoadingSpinner />
});
const PrivacySettingsView = dynamic(() => import('@/components/PrivacySettingsView'), {
  loading: () => <LoadingSpinner />
});
const NotificationsView = dynamic(() => import('@/components/NotificationsView'), {
  loading: () => <LoadingSpinner />
});
const SecurityView = dynamic(() => import('@/components/SecurityView'), {
  loading: () => <LoadingSpinner />
});
const PasscodeScreen = dynamic(() => import('@/components/PasscodeScreen'));
const AuthView = dynamic(() => import('@/components/AuthView'));
const AdminView = dynamic(() => import('@/components/AdminView'), {
  loading: () => <LoadingSpinner />
});
const InfoView = dynamic(() => import('@/components/InfoView'), {
  loading: () => <LoadingSpinner />
});
const FaqView = dynamic(() => import('@/components/FaqView'), {
  loading: () => <LoadingSpinner />
});
const TermsView = dynamic(() => import('@/components/TermsView'), {
  loading: () => <LoadingSpinner />
});
const CreateChannelView = dynamic(() => import('@/components/CreateChannelView'), {
  loading: () => <LoadingSpinner />
});
const CreateGroupView = dynamic(() => import('@/components/CreateGroupView'), {
  loading: () => <LoadingSpinner />
});
const ChannelInfoView = dynamic(() => import('@/components/ChannelInfoView'), {
  loading: () => <LoadingSpinner />
});
const NotificationStatsView = dynamic(() => import('@/components/NotificationStatsView'), {
  loading: () => <LoadingSpinner />
});
const ServerStatusView = dynamic(() => import('@/components/ServerStatusView'), {
  loading: () => <LoadingSpinner />
});
const StarsView = dynamic(() => import('@/components/StarsView'), {
  loading: () => <LoadingSpinner />
});
const SendGiftView = dynamic(() => import('@/components/SendGiftView'), {
  loading: () => <LoadingSpinner />
});
const MyGiftsView = dynamic(() => import('@/components/MyGiftsView'), {
  loading: () => <LoadingSpinner />
});
const UserGiftsView = dynamic(() => import('@/components/UserGiftsView'), {
  loading: () => <LoadingSpinner />
});
const PremiumView = dynamic(() => import('@/components/PremiumView'), {
  loading: () => <LoadingSpinner />
});
const BuyStarsView = dynamic(() => import('@/components/BuyStarsView'), {
  loading: () => <LoadingSpinner />
});
const WalletView = dynamic(() => import('@/components/WalletView'), {
  loading: () => <LoadingSpinner />
});
const MiniGamesView = dynamic(() => import('@/components/MiniGamesView'), {
  loading: () => <LoadingSpinner />
});
const MyStoriesView = dynamic(() => import('@/components/MyStoriesView'), {
  loading: () => <LoadingSpinner />
});
const NewsView = dynamic(() => import('@/components/NewsView'), {
  loading: () => <LoadingSpinner />
});
const ProxyView = dynamic(() => import('@/components/ProxyView'), {
  loading: () => <LoadingSpinner />
});
const ConnectionLoader = dynamic(() => import('@/components/ConnectionLoader'));

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 bg-tg-bg-light flex items-center justify-center z-10">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Маппинг view к компонентам
const viewComponents: Record<string, React.ComponentType> = {
  menu: ChatList,
  chat: ChatView,
  profile: ProfileView,
  settings: SettingsView,
  'chat-settings': ChatSettingsView,
  features: FeaturesView,
  privacy: PrivacyView,
  'privacy-settings': PrivacySettingsView,
  notifications: NotificationsView,
  security: SecurityView,
  admin: AdminView,
  info: InfoView,
  faq: FaqView,
  terms: TermsView,
  'create-channel': CreateChannelView,
  'create-group': CreateGroupView,
  'channel-info': ChannelInfoView,
  'notification-stats': NotificationStatsView,
  'server-status': ServerStatusView,
  stars: StarsView,
  premium: PremiumView,
  'send-gift': SendGiftView,
  'my-gifts': MyGiftsView,
  'user-gifts': UserGiftsView,
  'buy-stars': BuyStarsView,
  wallet: WalletView,
  'mini-games': MiniGamesView,
  'my-stories': MyStoriesView,
  news: NewsView,
  proxy: ProxyView,
};

function AppContent() {
  const { view, isLocked, user, isDarkMode, activeChatId } = useChat();
  const [showConnectionLoader, setShowConnectionLoader] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [forceDesktop, setForceDesktop] = useState(false);

  useEffect(() => {
    // Определяем desktop режим
    const checkDesktop = () => {
      const shouldBeDesktop = window.innerWidth >= 1024 || forceDesktop;
      setIsDesktop(shouldBeDesktop);
      console.log('Desktop mode:', shouldBeDesktop, 'Width:', window.innerWidth, 'Force:', forceDesktop);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => {
      window.removeEventListener('resize', checkDesktop);
    };
  }, [forceDesktop]);

  useEffect(() => {
    // Слушаем событие переключения режима
    const handleToggle = () => {
      console.log('Toggle event received, current forceDesktop:', forceDesktop);
      setForceDesktop(prev => {
        const newValue = !prev;
        console.log('Setting forceDesktop to:', newValue);
        return newValue;
      });
    };
    
    window.addEventListener('toggleDesktopMode', handleToggle);
    
    // Показываем лоадер только при первой загрузке
    const hasShownLoader = sessionStorage.getItem('housegram_loader_shown');
    if (hasShownLoader) {
      setShowConnectionLoader(false);
      setIsAppReady(true);
    }
    
    return () => {
      window.removeEventListener('toggleDesktopMode', handleToggle);
    };
  }, []);

  const handleConnectionComplete = () => {
    sessionStorage.setItem('housegram_loader_shown', 'true');
    setShowConnectionLoader(false);
    setIsAppReady(true);
  };

  // Контейнер-обёртка для мобильной версии
  const MobileShell = ({ children }: { children: React.ReactNode }) => (
    <div className={`relative w-full h-[100dvh] overflow-hidden sm:max-w-[420px] sm:shadow-2xl sm:rounded-[24px] sm:h-[800px] sm:max-h-[90vh] ${isDarkMode ? 'bg-[#0f0f0f] dark' : 'bg-tg-bg-light'}`}>
      {children}
    </div>
  );

  if (view === 'auth' || !user) {
    if (isDesktop) {
      return (
        <DesktopLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <AuthView />
          </Suspense>
        </DesktopLayout>
      );
    }
    
    return (
      <MobileShell>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthView />
        </Suspense>
      </MobileShell>
    );
  }

  if (isLocked) {
    if (isDesktop) {
      return (
        <DesktopLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <PasscodeScreen />
          </Suspense>
        </DesktopLayout>
      );
    }
    
    return (
      <MobileShell>
        <Suspense fallback={<LoadingSpinner />}>
          <PasscodeScreen />
        </Suspense>
      </MobileShell>
    );
  }

  // Рендерим активный view через маппинг
  const ActiveView = viewComponents[view];

  // Desktop Layout
  if (isDesktop) {
    return (
      <DesktopLayout>
        {/* Connection Loader */}
        <ConnectionLoader 
          isVisible={showConnectionLoader} 
          onComplete={handleConnectionComplete} 
        />

        {/* Main App Content */}
        {isAppReady && (
          <AnimatePresence initial={false} mode="popLayout">
            {ActiveView && <ActiveView key={`${view}-${activeChatId || 'none'}`} />}
          </AnimatePresence>
        )}
      </DesktopLayout>
    );
  }

  // Mobile Layout
  return (
    <MobileShell>
      {/* Connection Loader */}
      <ConnectionLoader 
        isVisible={showConnectionLoader} 
        onComplete={handleConnectionComplete} 
      />

      {/* Main App Content */}
      {isAppReady && (
        <AnimatePresence initial={false} mode="popLayout">
          {ActiveView && <ActiveView key={`${view}-${activeChatId || 'none'}`} />}
        </AnimatePresence>
      )}
      <SideMenu />
    </MobileShell>
  );
}

export default function Page() {
  return (
    <>
      <DemoBanner />
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </>
  );
}
