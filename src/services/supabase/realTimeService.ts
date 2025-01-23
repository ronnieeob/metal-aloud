import { supabase } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealTimeService {
  private static instance: RealTimeService;
  private channels: Map<string, RealtimeChannel> = new Map();

  private constructor() {}

  static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  subscribeFeed(userId: string, onPost: (post: any) => void) {
    const channel = supabase
      .channel(`feed:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${userId}`
      }, payload => {
        onPost(payload.new);
      })
      .subscribe();

    this.channels.set(`feed:${userId}`, channel);
    return channel;
  }

  subscribeToMessages(userId: string, onMessage: (message: any) => void) {
    const channel = supabase
      .channel(`messages:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, payload => {
        onMessage(payload.new);
      })
      .subscribe();

    this.channels.set(`messages:${userId}`, channel);
  }

  subscribeToNotifications(userId: string, onNotification: (notification: any) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => {
        onNotification(payload.new);
      })
      .subscribe();

    this.channels.set(`notifications:${userId}`, channel);
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }
}