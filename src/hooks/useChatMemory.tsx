import { useState, useEffect } from 'react';
import { Message } from '@/pages/ChatPage';

type ChatSession = {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
};

interface UseChatMemoryProps {
  enabled: boolean;
  saveHistory: boolean;
}

export function useChatMemory({ enabled = true, saveHistory = true }: UseChatMemoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    sessionId: string;
    messages: Message[];
  }[]>([]);
  
  useEffect(() => {
    if (!enabled || !saveHistory) return;
    
    try {
      const savedSessions = localStorage.getItem('chat-sessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          if (key === 'messages') {
            return value.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          }
          return value;
        });
        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  }, [enabled, saveHistory]);
  
  const createSession = (messages: Message[] = []) => {
    if (!enabled) return '';
    
    const id = Date.now().toString();
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg 
      ? firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
      : `Chat session ${new Date().toLocaleString()}`;
    
    const newSession: ChatSession = {
      id,
      title,
      timestamp: new Date(),
      messages
    };
    
    setSessions(prev => {
      const updated = [...prev, newSession];
      if (saveHistory) {
        saveSessionsToStorage(updated);
      }
      return updated;
    });
    
    setCurrentSessionId(id);
    return id;
  };
  
  const updateSession = (sessionId: string, messages: Message[]) => {
    if (!enabled || !sessionId) return;
    
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === sessionId) {
          let title = session.title;
          if (session.messages.length === 0 && messages.length > 0) {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
            }
          }
          
          return {
            ...session,
            title,
            messages
          };
        }
        return session;
      });
      
      if (saveHistory) {
        saveSessionsToStorage(updated);
      }
      return updated;
    });
  };
  
  const getSession = (sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  };
  
  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(session => session.id !== sessionId);
      if (saveHistory) {
        saveSessionsToStorage(updated);
      }
      return updated;
    });
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId('');
    }
  };
  
  const clearAllSessions = () => {
    setSessions([]);
    setCurrentSessionId('');
    if (saveHistory) {
      localStorage.removeItem('chat-sessions');
    }
  };
  
  const searchSessions = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchQuery(query);
    
    const results: {
      sessionId: string;
      messages: Message[];
    }[] = [];
    
    sessions.forEach(session => {
      const matchingMessages = session.messages.filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      
      if (matchingMessages.length > 0) {
        results.push({
          sessionId: session.id,
          messages: matchingMessages
        });
      }
    });
    
    setSearchResults(results);
    return results;
  };
  
  const saveSessionsToStorage = (sessionsToSave: ChatSession[]) => {
    if (!saveHistory) return;
    
    try {
      localStorage.setItem('chat-sessions', JSON.stringify(sessionsToSave));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  };
  
  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createSession,
    updateSession,
    getSession,
    deleteSession,
    clearAllSessions,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchSessions
  };
}
