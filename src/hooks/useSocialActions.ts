import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SocialService } from '../services/api/socialService';
import { RealTimeService } from '../services/supabase/realTimeService';
import { useRewards } from './useRewards';
import { FriendRequest, UserProfile, Post } from '../types/social';

export function useRealtimePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();
  const realTimeService = RealTimeService.getInstance();
  const socialService = new SocialService();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user || initialized) return;

    // Load initial posts
    loadPosts();

    // Subscribe to real-time updates
    const subscription = realTimeService.subscribeFeed(user.id, (newPost) => {
      setPosts(prev => [newPost, ...prev]);
      setInitialized(true);
    });

    return () => {
      realTimeService.unsubscribe(`feed:${user.id}`);
    };
  }, [user, initialized]);

  const loadPosts = async () => {
    if (!user) return;
    const feed = await socialService.getFeed(user.id);
    setPosts(feed);
  };

  const createPost = async (userId: string, content: string, type: Post['type']) => {
    const newPost = await socialService.createPost(userId, content, type);
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  return { posts, createPost };
}

export function useSocialActions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [initialized, setInitialized] = useState(false);
  const socialService = new SocialService();
  const { handleArtistFollow } = useRewards();

  useEffect(() => {
    if (user && !initialized) {
      loadSocialData();
      setInitialized(true);
    }
  }, [user, initialized, loadSocialData]);

  const loadSocialData = async () => {
    if (!user) return;
    try {
      setError(null);
      const [requests, userFollowers, userFollowing] = await Promise.all([
        socialService.getPendingRequests(user.id),
        socialService.getFollowers(user.id),
        socialService.getFollowing(user.id)
      ]);
      setPendingRequests(requests);
      setFollowers(userFollowers);
      setFollowing(userFollowing);
      
      // Load feed posts
      const feed = await socialService.getFeed(user.id);
      setPosts(feed);
    } catch (err) {
      console.error('Failed to load social data:', err);
      setError('Failed to load social data');
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      await socialService.acceptFriendRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      await loadSocialData(); // Refresh followers/following
    } catch (err) {
      setError('Failed to accept friend request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      await socialService.rejectFriendRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      setError('Failed to reject friend request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await socialService.toggleFollow(user.id, targetUserId);
      handleArtistFollow(); // Award points for following
      await loadSocialData(); // Refresh followers/following
    } catch (err) {
      setError('Failed to follow user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await socialService.toggleFollow(user.id, targetUserId);
      await loadSocialData(); // Refresh followers/following
    } catch (err) {
      setError('Failed to unfollow user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = (targetUserId: string) => {
    return following.some(f => f.id === targetUserId);
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await socialService.toggleLike(user.id, postId);
      await loadSocialData(); // Refresh posts
    } catch (err) {
      setError('Failed to like post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId: string, content: string, parentId?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await socialService.addComment(postId, user.id, content, parentId);
      await loadSocialData(); // Refresh posts
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    pendingRequests,
    followers,
    following,
    posts,
    followUser,
    unfollowUser,
    acceptFriendRequest,
    rejectFriendRequest,
    isFollowing,
    likePost,
    addComment,
    loading,
    error
  };
}