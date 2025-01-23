import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SocialService } from '../../services/api/socialService';
import { Message, Conversation } from '../../types/social';
import { Send, Music, Play } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

export function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socialService = new SocialService();
  const { dispatch } = usePlayer();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userConversations = await socialService.getConversations(user.id);
      setConversations(userConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const conversationMessages = await socialService.getMessages(conversationId);
      setMessages(conversationMessages);
      
      // Mark messages as read
      if (user) {
        await socialService.markAsRead(conversationId, user.id);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      setLoading(true);
      const receiverId = selectedConversation.participants.find(id => id !== user.id);
      if (!receiverId) return;

      const message = await socialService.sendMessage({
        senderId: user.id,
        receiverId,
        content: newMessage,
        type: 'text',
        read: false
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-zinc-800/50 rounded-lg border border-red-900/20">
      {/* Conversations List */}
      <div className="w-80 border-r border-red-900/20">
        <div className="p-4">
          <h2 className="text-xl font-bold text-red-500 mb-4">Messages</h2>
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const otherParticipant = socialService.getUserProfile(
                conversation.participants.find(id => id !== user.id) || ''
              );
              if (!otherParticipant) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-red-900/30'
                      : 'hover:bg-red-900/20'
                  }`}
                >
                  <img
                    src={otherParticipant.avatarUrl}
                    alt={otherParticipant.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="font-medium">{otherParticipant.name}</h3>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-700 text-white'
                      }`}
                    >
                      {message.type === 'song' ? (
                        <div className="flex items-center space-x-2">
                          <Music className="w-4 h-4" />
                          <span>{message.content}</span>
                          <button className="p-1 rounded-full bg-white/10 hover:bg-white/20">
                            <Play className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        message.content
                      )}
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-red-900/20">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-700 border border-red-900/20 rounded-lg px-4 py-2 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}