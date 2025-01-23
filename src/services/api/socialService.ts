import { Post, Comment, UserProfile, Message, Conversation, FriendRequest } from '../../types/social';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export class SocialService {
  private getStorageKey(key: string): string {
    return `metal_aloud_social_${key}`;
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(this.getStorageKey(key));
      if (!stored || stored === 'undefined' || stored === 'null') {
        this.setItem(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch (err) {
      console.warn(`Error reading from localStorage for key ${key}:`, err);
      this.setItem(key, defaultValue);
      return defaultValue;
    }
  }

  private initializeMockData() {
    // Initialize mock users if none exist
    const users = this.getItem<UserProfile[]>('users', []);
    if (users.length === 0) {
      this.setItem('users', [{
        id: 'mock-user-1',
        name: 'Metal Fan',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        bio: 'Just here for the metal 🤘',
        favoriteGenres: ['Heavy Metal', 'Thrash Metal'],
        following: [],
        followers: [],
        posts: [],
        joinedAt: new Date().toISOString()
      }]);
    }

    // Initialize mock posts if none exist
    const posts = this.getItem<Post[]>('posts', []);
    if (posts.length === 0) {
      this.setItem('posts', []);
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing to localStorage: ${err}`);
    }
  }

  async createPost(userId: string, content: string, type: Post['type'], metadata?: Post['metadata']): Promise<Post> {
    this.initializeMockData();
    const posts = this.getItem<Post[]>('posts', []);
    const users = this.getItem<UserProfile[]>('users', []);
    let user = users.find(u => u.id === userId);

    if (!user) {
      // Create a default user profile if not found
      user = {
        id: userId,
        name: 'Metal Fan',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        bio: '',
        favoriteGenres: [],
        following: [],
        followers: [],
        posts: [],
        joinedAt: new Date().toISOString()
      };
      users.push(user);
      this.setItem('users', users);
    }

    const newPost: Post = {
      id: crypto.randomUUID(),
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      type,
      metadata
    };

    posts.unshift(newPost);
    this.setItem('posts', posts);
    return newPost;
  }

  async addComment(postId: string, userId: string, content: string, parentId?: string): Promise<Comment> {
    const posts = this.getItem<Post[]>('posts', []);
    const user = this.getItem<UserProfile[]>('users', []).find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId
    };

    if (parentId) {
      const parentComment = post.comments.find(c => c.id === parentId);
      if (parentComment) {
        if (!parentComment.replies) parentComment.replies = [];
        parentComment.replies.push(newComment);
      }
    } else {
      post.comments.push(newComment);
    }

    this.setItem('posts', posts);
    return newComment;
  }

  async getFeed(userId: string): Promise<Post[]> {
    this.initializeMockData();
    const posts = this.getItem<Post[]>('posts', []);
    const users = this.getItem<UserProfile[]>('users', []) || [];
    const user = users.find(u => u.id === userId) || {
      id: userId,
      name: 'Metal Fan',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
      following: [],
      followers: [],
      posts: [],
      favoriteGenres: [],
      joinedAt: new Date().toISOString()
    };

    if (!users.find(u => u.id === userId)) {
      users.push(user);
      this.setItem('users', users);
    }

    // Get posts from followed users and own posts
    return posts
      .filter(post => post.userId === userId || user.following.includes(post.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async toggleFollow(userId: string, targetUserId: string): Promise<void> {
    const users = this.getItem<UserProfile[]>('users', []);
    const user = users.find(u => u.id === userId);
    const targetUser = users.find(u => u.id === targetUserId);

    if (!user || !targetUser) {
      throw new Error('User not found');
    }

    const isFollowing = user.following.includes(targetUserId);
    if (isFollowing) {
      user.following = user.following.filter(id => id !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id !== userId);
    } else {
      user.following.push(targetUserId);
      targetUser.followers.push(userId);
    }

    this.setItem('users', users);
  }

  getUserProfile(userId: string): UserProfile | null {
    const users = this.getItem<UserProfile[]>('users', []);
    return users.find(u => u.id === userId) || null;
  }

  async toggleLike(userId: string, postId: string): Promise<void> {
    const posts = this.getItem<Post[]>('posts', []);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      throw new Error('Post not found');
    }

    const likedPosts = this.getItem<string[]>(`liked_posts_${userId}`, []);
    const isLiked = likedPosts.includes(postId);

    if (isLiked) {
      post.likes--;
      this.setItem(`liked_posts_${userId}`, likedPosts.filter(id => id !== postId));
    } else {
      post.likes++;
      this.setItem(`liked_posts_${userId}`, [...likedPosts, postId]);
    }

    this.setItem('posts', posts);
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const users = this.getItem<UserProfile[]>('users', []);
    const normalizedQuery = query.toLowerCase();
    
    return users.filter(user =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.bio?.toLowerCase().includes(normalizedQuery)
    );
  }

  async getFollowers(userId: string): Promise<UserProfile[]> {
    this.initializeMockData();
    const users = this.getItem<UserProfile[]>('users', []);
    const user = users.find(u => u.id === userId);
    return user ? user.followers.map(id => users.find(u => u.id === id)).filter((u): u is UserProfile => !!u) : [];
  }

  async getFollowing(userId: string): Promise<UserProfile[]> {
    this.initializeMockData();
    const users = this.getItem<UserProfile[]>('users', []);
    const user = users.find(u => u.id === userId);
    return user ? user.following.map(id => users.find(u => u.id === id)).filter((u): u is UserProfile => !!u) : [];
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = this.getItem<Conversation[]>('conversations', []);
    return conversations
      .filter(conv => conv.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const messages = this.getItem<Message[]>(`messages_${conversationId}`, []);
    return messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const conversations = this.getItem<Conversation[]>('conversations', []);
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    // Find or create conversation
    let conversation = conversations.find(conv =>
      conv.participants.includes(message.senderId) &&
      conv.participants.includes(message.receiverId)
    );

    if (!conversation) {
      conversation = {
        id: crypto.randomUUID(),
        participants: [message.senderId, message.receiverId],
        updatedAt: newMessage.createdAt
      };
      conversations.push(conversation);
    }

    // Update conversation
    conversation.lastMessage = newMessage;
    conversation.updatedAt = newMessage.createdAt;

    // Save message
    const messages = this.getItem<Message[]>(`messages_${conversation.id}`, []);
    messages.push(newMessage);

    // Persist changes
    this.setItem('conversations', conversations);
    this.setItem(`messages_${conversation.id}`, messages);

    return newMessage;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const messages = this.getItem<Message[]>(`messages_${conversationId}`, []);
    const updatedMessages = messages.map(msg => 
      msg.receiverId === userId ? { ...msg, read: true } : msg
    );
    this.setItem(`messages_${conversationId}`, updatedMessages);
  }

  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    const requests = this.getItem<FriendRequest[]>(`friend_requests_${userId}`, []);
    return requests.filter(req => req.receiverId === userId && req.status === 'pending');
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    const request = this.getItem<FriendRequest[]>('friend_requests', [])
      .find(req => req.id === requestId);
    
    if (!request) {
      throw new Error('Friend request not found');
    }

    // Update request status
    const requests = this.getItem<FriendRequest[]>('friend_requests', [])
      .map(req => req.id === requestId ? { ...req, status: 'accepted' } : req);
    this.setItem('friend_requests', requests);

    // Add to followers/following
    const users = this.getItem<UserProfile[]>('users', []);
    const sender = users.find(u => u.id === request.senderId);
    const receiver = users.find(u => u.id === request.receiverId);

    if (sender && receiver) {
      sender.following.push(receiver.id);
      receiver.followers.push(sender.id);
      this.setItem('users', users);
    }
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    const requests = this.getItem<FriendRequest[]>('friend_requests', [])
      .map(req => req.id === requestId ? { ...req, status: 'rejected' } : req);
    this.setItem('friend_requests', requests);
  }
}