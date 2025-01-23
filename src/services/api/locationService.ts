import { supabase } from '../../lib/supabase';
import { LocationData, RegionStats } from '../../types/admin';

export class LocationService {
  async getLocationInsights(timeRange: 'week' | 'month' | 'year' = 'month') {
    try {
      const { data, error } = await supabase
        .from('location_insights')
        .select('*')
        .order('user_count', { ascending: false });

      if (error) throw error;

      return data.map(row => ({
        country: row.country,
        userCount: row.user_count,
        activeUsers: row.active_users,
        topGenres: row.top_genres,
        growth: row.growth_rate
      }));
    } catch (err) {
      console.error('Failed to fetch location insights:', err);
      throw err;
    }
  }

  async getRegionStats(): Promise<RegionStats[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_region_stats');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to fetch region stats:', err);
      throw err;
    }
  }

  async recordUserActivity(userId: string, country: string, activityType: string) {
    try {
      const { error } = await supabase
        .from('location_activity')
        .insert({
          user_id: userId,
          country,
          activity_type: activityType
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to record user activity:', err);
      throw err;
    }
  }
}