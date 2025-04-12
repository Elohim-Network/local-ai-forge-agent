
import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/pages/ChatPage';
import { useToast } from '@/hooks/use-toast';

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
  const [storageErrors, setStorageErrors] = useState<string[]>([]);
  const { toast } = useToast();
  
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
        
        if (!Array.isArray(parsedSessions)) {
          throw new Error('Chat sessions storage is not an array');
        }
        
        setSessions(parsedSessions);
        setStorageErrors([]);
      } else {
        // Initialize storage if it doesn't exist
        localStorage.setItem('chat-sessions', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setStorageErrors([error instanceof Error ? error.message : 'Unknown error loading chat sessions']);
      
      // Add a hidden error indicator for diagnostics to find
      const errorIndicator = document.createElement('div');
      errorIndicator.className = 'chat-error-indicator hidden';
      errorIndicator.dataset.error = error instanceof Error ? error.message : 'Unknown error';
      document.body.appendChild(errorIndicator);
      
      toast({
        title: "Chat Storage Error",
        description: "There was a problem loading your chat history. Visit the Diagnostic Agent to fix it.",
        variant: "destructive",
      });
    }
  }, [enabled, saveHistory]);
  
  const createSession = useCallback((messages: Message[] = []) => {
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
  }, [enabled, saveHistory]);
  
  const updateSession = useCallback((sessionId: string, messages: Message[]) => {
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
  }, [enabled, saveHistory]);
  
  const getSession = useCallback((sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  }, [sessions]);
  
  const deleteSession = useCallback((sessionId: string) => {
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
  }, [currentSessionId, saveHistory]);
  
  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId('');
    if (saveHistory) {
      localStorage.removeItem('chat-sessions');
      localStorage.setItem('chat-sessions', JSON.stringify([]));
    }
  }, [saveHistory]);
  
  const searchSessions = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return [];
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
  }, [sessions]);
  
  const saveSessionsToStorage = useCallback((sessionsToSave: ChatSession[]) => {
    if (!saveHistory) return;
    
    try {
      localStorage.setItem('chat-sessions', JSON.stringify(sessionsToSave));
      setStorageErrors([]);
    } catch (error) {
      console.error('Error saving chat sessions:', error);
      setStorageErrors([error instanceof Error ? error.message : 'Unknown error saving chat sessions']);
      
      toast({
        title: "Error Saving Chat",
        description: "There was a problem saving your chat. Please visit the Diagnostic Agent.",
        variant: "destructive",
      });
    }
  }, [saveHistory]);
  
  const checkStorageHealth = useCallback(() => {
    try {
      // Test if localStorage is available
      const testKey = 'test-chat-storage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      // Check if chat sessions storage exists and is valid JSON array
      const savedSessions = localStorage.getItem('chat-sessions');
      if (!savedSessions) {
        localStorage.setItem('chat-sessions', JSON.stringify([]));
        return { healthy: true, fixed: true, message: 'Chat storage initialized' };
      }
      
      try {
        const parsed = JSON.parse(savedSessions);
        if (!Array.isArray(parsed)) {
          localStorage.setItem('chat-sessions', JSON.stringify([]));
          return { healthy: true, fixed: true, message: 'Chat storage reset (invalid format)' };
        }
        
        return { healthy: true, fixed: false, message: 'Chat storage is healthy' };
      } catch (e) {
        localStorage.setItem('chat-sessions', JSON.stringify([]));
        return { healthy: true, fixed: true, message: 'Chat storage reset (corrupted)' };
      }
    } catch (error) {
      return { 
        healthy: false, 
        fixed: false, 
        message: error instanceof Error ? error.message : 'Unknown storage error',
        error
      };
    }
  }, []);
  
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
    searchSessions,
    storageErrors,
    checkStorageHealth
  };
}
