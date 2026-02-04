'use client';

import { useState, useEffect } from 'react';
import { YouTubeLiveChat } from '@/components/youtube-live-chat';
import { LiveStreamLoginPrompt } from '@/components/live-stream-login-prompt';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Radio, RefreshCw } from 'lucide-react';

interface SelectedAuction {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  image: any;
  Price?: number;
  badge?: string;
  stat: 'active' | 'closed' | 'upcoming';
  quantity?: string;
  measurements?: string;
}

interface LiveStreamConfig {
  liveStreamActive: boolean;
  youtubeLiveUrl: string;
  activeAuctionId: string;
  selectedAuction: SelectedAuction | null;
}

interface UserSession {
  userId: number;
  username: string;
  email: string;
  credits: number;
}

export default function LivePage() {
  const [config, setConfig] = useState<LiveStreamConfig | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/live-stream/config', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Error al cargar la configuracion del stream');
    }
  };

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setSession({
            userId: data.user.id,
            username: data.user.username,
            email: data.user.email,
            credits: data.user.credits || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchConfig(), fetchSession(), fetchFavorites()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Cargando stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config?.liveStreamActive || !config?.youtubeLiveUrl) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-lg mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Radio className="w-16 h-16 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-700">Stream Offline</h2>
                <p className="text-gray-600">No hay transmision en vivo en este momento.</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 py-8">
          <LiveStreamLoginPrompt />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-8">
        <YouTubeLiveChat
          youtubeUrl={config.youtubeLiveUrl}
          username={session.username}
          userId={session.userId.toString()}
          selectedAuction={config.selectedAuction}
          userFavorites={userFavorites}
          initialCredits={session.credits}
        />
      </main>
      <Footer />
    </>
  );
}
