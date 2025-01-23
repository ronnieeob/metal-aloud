export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  parentId?: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  type: 'song' | 'album' | 'news' | 'general';
  metadata?: {
    songId?: string;
    albumId?: string;
    newsId?: string;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  tags: string[];
  band?: {
    name: string;
    id: string;
  };
  type: 'release' | 'announcement' | 'interview' | 'review';
  likes: number;
  comments: Comment[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  favoriteGenres: string[];
  following: string[];
  followers: string[];
  posts: Post[];
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  type: 'text' | 'song' | 'playlist';
  metadata?: {
    songId?: string;
    playlistId?: string;
    requestId?: string;
    orderId?: string;
    userId?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: string;
}