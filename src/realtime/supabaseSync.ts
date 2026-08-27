import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlayerCount } from '../engine/types';
import { StateListener, ErrorListener } from './broadcastSync';

/**
 * Supabase Realtime & RPC Synchronization Provider
 */
export class SupabaseSyncEngine {
  private supabase: SupabaseClient | null = null;
  private roomCode: string = '';
  private currentUserId: string = '';
  private currentNickname: string = '';
  private channel: any = null;
  private stateListeners: Set<StateListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  constructor(userId: string, nickname: string) {
    this.currentUserId = userId;
    this.currentNickname = nickname;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }

  public isAvailable(): boolean {
    return !!this.supabase;
  }

  public connect(roomCode: string): void {
    this.roomCode = roomCode.toUpperCase();
    if (!this.supabase) return;

    this.channel = this.supabase.channel(`room_${this.roomCode}`);
    this.channel
      .on('broadcast', { event: 'state_update' }, () => {
        this.fetchCurrentState();
      })
      .subscribe();

    this.fetchCurrentState();
  }

  public disconnect(): void {
    if (this.supabase && this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  public onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public async fetchCurrentState(): Promise<void> {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase.rpc('get_room_state', {
        p_room_code: this.roomCode,
        p_player_id: this.currentUserId,
      });
      if (error) throw error;
      if (data) {
        const { roomState, privateHand } = data;
        this.stateListeners.forEach((fn) => fn(roomState, privateHand || []));
      }
    } catch (err: any) {
      this.errorListeners.forEach((fn) => fn(err.message));
    }
  }

  public async createRoom(maxPlayers: PlayerCount): Promise<void> {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.rpc('create_room', {
        p_room_code: this.roomCode,
        p_host_id: this.currentUserId,
        p_nickname: this.currentNickname,
        p_max_players: maxPlayers,
      });
      if (error) throw error;
      await this.fetchCurrentState();
    } catch (err: any) {
      this.errorListeners.forEach((fn) => fn(err.message));
    }
  }

  public async joinRoom(nickname: string): Promise<void> {
    if (!this.supabase) return;
    this.currentNickname = nickname;
    try {
      const { error } = await this.supabase.rpc('join_room', {
        p_room_code: this.roomCode,
        p_player_id: this.currentUserId,
        p_nickname: nickname,
      });
      if (error) throw error;
      await this.fetchCurrentState();
    } catch (err: any) {
      this.errorListeners.forEach((fn) => fn(err.message));
    }
  }

  public async startGame(): Promise<void> {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.rpc('start_game', {
        p_room_code: this.roomCode,
        p_host_id: this.currentUserId,
      });
      if (error) throw error;
      await this.fetchCurrentState();
    } catch (err: any) {
      this.errorListeners.forEach((fn) => fn(err.message));
    }
  }

  public async playTile(tileId: string, side: 'left' | 'right'): Promise<void> {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.rpc('play_tile', {
        p_room_code: this.roomCode,
        p_player_id: this.currentUserId,
        p_tile_id: tileId,
        p_side: side,
      });
      if (error) throw error;
      await this.fetchCurrentState();
    } catch (err: any) {
      this.errorListeners.forEach((fn) => fn(err.message));
    }
  }

  public async passTurn(): Promise<void> {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.rpc('pass_turn', {
        p_room_code: this.roomCode,
        p_player_id: this.currentUserId,
      });
      if (error) throw error;
      await this.fetchCurrentState();
    } catch (err: any) {
      this.errorListeners.forEach((fn) => fn(err.message));
    }
  }
}
