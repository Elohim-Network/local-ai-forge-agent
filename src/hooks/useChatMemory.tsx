
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
  
  // Load sessions from localStorage on init
  useEffect(() => {
    if (!enabled || !saveHistory) return;
    
    try {
      const savedSessions = localStorage.getItem('chat-sessions');
      if (savedSessions) {
        // Parse dates that were stored as strings back to Date objects
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
  
  // Create a new session
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
  
  // Update an existing session
  const updateSession = (sessionId: string, messages: Message[]) => {
    if (!enabled || !sessionId) return;
    
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === sessionId) {
          // If this is update #1, set a title based on first user message
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
  
  // Get a session by ID
  const getSession = (sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  };
  
  // Delete a session
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
  
  // Clear all sessions
  const clearAllSessions = () => {
    setSessions([]);
    setCurrentSessionId('');
    if (saveHistory) {
      localStorage.removeItem('chat-sessions');
    }
  };
  
  // Search across all sessions
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
    
    // Search in all sessions
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
  
  // Helper to save to localStorage
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
    searchResults,
    searchSessions
  };
}
