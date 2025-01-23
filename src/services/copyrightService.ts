import { supabase } from '../lib/supabase';

interface CopyrightRegistration {
  id: string;
  songId: string;
  artistId: string;
  registrationDate: string;
  copyrightId: string;
  status: 'pending' | 'active' | 'rejected';
  type: 'automatic' | 'manual';
  protectionLevel: 'basic' | 'standard' | 'premium';
  metadata: {
    title: string;
    artist: string;
    releaseDate: string;
    fingerprint?: string;
    contentHash?: string;
    blockchainHash?: string;
  };
}

export class CopyrightService {
  private static instance: CopyrightService;
  private readonly REGISTRATION_FEE = 9.99;
  private readonly AUTOMATIC_COPYRIGHT_FEE = 29.99;

  private constructor() {}

  static getInstance(): CopyrightService {
    if (!CopyrightService.instance) {
      CopyrightService.instance = new CopyrightService();
    }
    return CopyrightService.instance;
  }

  async registerCopyright(
    songId: string, 
    artistId: string, 
    type: 'automatic' | 'manual',
    subscriptionId?: string
  ): Promise<CopyrightRegistration> {
    try {
      // Validate song ownership
      const { data: song, error: songError } = await supabase
        .from('songs')
        .select('artist_id')
        .eq('id', songId)
        .single();

      if (songError || song.artist_id !== artistId) {
        throw new Error('Unauthorized: You can only register copyright for your own songs');
      }

      // Check subscription status and quota
      if (subscriptionId) {
        const { data: quotaCheck, error: quotaError } = await supabase
          .rpc('check_copyright_quota', {
            p_artist_id: artistId,
            p_subscription_id: subscriptionId
          });

        if (quotaError) throw quotaError;
        if (!quotaCheck) throw new Error('Copyright quota exceeded');
      }

      // Generate unique copyright ID
      const copyrightId = this.generateCopyrightId();

      // Generate audio fingerprint for automatic registration
      const fingerprint = type === 'automatic' ? await this.generateAudioFingerprint(song.audio_url) : undefined;

      // Calculate content hash
      const contentHash = await this.calculateContentHash(song);

      // Generate blockchain hash for premium protection
      const blockchainHash = await this.generateBlockchainHash(song, fingerprint);
      
      // Start transaction
      const { data: registrationData, error: registrationError } = await supabase
        .rpc('register_copyright_with_transaction', {
          p_song_id: songId,
          p_artist_id: artistId,
          p_type: type,
          p_protection_level: this.determineProtectionLevel(type, subscriptionId),
          p_metadata: {
            fingerprint,
            contentHash,
            blockchainHash
          }
        });

      if (registrationError) throw registrationError;

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = `Copyright registration ${registrationData.copyrightId} successful`;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

      return registrationData;
    } catch (err) {
      console.error('Copyright registration failed:', err);
      // Show error message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = err instanceof Error ? err.message : 'Failed to register copyright';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

      throw new Error('Failed to register copyright');
    }
  }

  private determineProtectionLevel(type: 'automatic' | 'manual', subscriptionId?: string): 'basic' | 'standard' | 'premium' {
    if (!subscriptionId) return 'basic';
    return type === 'automatic' ? 'premium' : 'standard';
  }

  private async generateBlockchainHash(song: any, fingerprint?: string): Promise<string> {
    // In production, implement actual blockchain integration
    const content = JSON.stringify({
      title: song.title,
      artist: song.artist,
      fingerprint,
      timestamp: Date.now()
    });
    
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generateAudioFingerprint(audioUrl: string): Promise<string> {
    try {
      // In production, implement actual audio fingerprinting
      // For now, generate a mock fingerprint
      const data = new TextEncoder().encode(audioUrl + Date.now());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.error('Failed to generate audio fingerprint:', err);
      throw new Error('Failed to generate audio fingerprint');
    }
  }

  private async calculateContentHash(song: any): Promise<string> {
    try {
      // Create a hash of the song metadata and content
      const content = JSON.stringify({
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        timestamp: Date.now()
      });
      
      const data = new TextEncoder().encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.error('Failed to calculate content hash:', err);
      throw new Error('Failed to calculate content hash');
    }
  }

  private generateCopyrightId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CR-${timestamp}-${random}`.toUpperCase();
  }

  private async updateCopyrightUsage(artistId: string, subscriptionId: string): Promise<void> {
    const { error } = await supabase.rpc('update_copyright_usage', {
      p_artist_id: artistId,
      p_subscription_id: subscriptionId
    });

    if (error) throw error;
  }

  // ... (rest of the methods remain the same)
}