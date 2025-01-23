import React, { useState, useEffect } from 'react';
import { Post } from '../../types/social';
import { SocialService } from '../../services/api/socialService';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { UserSearch } from './UserSearch';
import { useSocialActions, useRealtimePosts } from '../../hooks/useSocialActions';

export function Feed() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const { likePost, addComment, loading, error } = useSocialActions();
  const { posts, createPost } = useRealtimePosts();
  const socialService = new SocialService();
  const [, setShareUrl] = useState<string | null>(null);

  const reactions = ['🤘', '🔥', '⚡', '🎸', '🥁', '🎼'];

  const handleReaction = async (postId: string, reaction: string) => {
    try {
      await socialService.addReaction(postId, reaction);
      setShowReactions(null);
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleShare = async (postId: string) => {
    const shareData = {
      title: 'Check out this post on Metal Aloud',
      text: 'Awesome metal content!',
      url: `https://metalaloud.com/post/${postId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShareUrl(shareData.url);
        // Show copy to clipboard message
        navigator.clipboard.writeText(shareData.url);
        const message = document.createElement('div');
        message.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg';
        message.textContent = 'Link copied to clipboard!';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <div className="text-red-500">Loading feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const handlePost = async () => {
    if (!user || !newPost.trim()) return;
    try {
      await createPost(user.id, newPost, 'general');
      setNewPost('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg border border-red-900/20 shadow-lg h-[calc(100vh-8rem)] flex flex-col">
      {/* Create Post */}
      <div className="p-6 border-b border-red-900/20">
        <div className="flex items-start space-x-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-12 h-12 rounded-full border-2 border-red-500/20"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-zinc-700/50 border border-red-900/20 rounded-lg p-4 min-h-[120px] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || loading}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/20 shadow-lg hover:border-red-500/40 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-12 h-12 rounded-full border-2 border-red-500/20"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-red-400">{post.userName}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-3 text-lg">{post.content}</p>
                    
                <div className="flex items-center space-x-6 mt-4">
                  <button 
                    onClick={() => setShowReactions(showReactions === post.id ? null : post.id)}
                    className="relative flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                    {showReactions === post.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 rounded-lg p-2 shadow-lg flex space-x-2">
                        {reactions.map(reaction => (
                          <button
                            key={reaction}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(post.id, reaction);
                            }}
                            className="hover:scale-125 transition-transform"
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    )}
                  </button>
                  <button 
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {replyingTo === post.id && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      placeholder="Write a comment..."
                      className="w-full bg-zinc-700/50 border border-red-900/20 rounded-lg p-2 text-sm"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-6 space-y-4 border-t border-red-900/10 pt-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full border border-red-500/20"
                            />
                            <div className="flex-1 bg-zinc-900/50 rounded-lg p-4 hover:bg-zinc-900/70 transition-colors duration-300">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm text-red-400">{comment.userName}</h4>
                                <span className="text-xs text-gray-400">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}