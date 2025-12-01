import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from '@supabase/supabase-js';

// Define the types based on your schema
type SyncStateRow = {
  created_at: string;
  id: number;
  mode: number;
  slider_1: number;
  slider_10: number;
  slider_11: number;
  slider_12: number;
  slider_13: number;
  slider_14: number;
  slider_15: number;
  slider_16: number;
  slider_2: number;
  slider_3: number;
  slider_4: number;
  slider_5: number;
  slider_6: number;
  slider_7: number;
  slider_8: number;
  slider_9: number;
};

type SyncStateUpdate = Omit<Partial<SyncStateRow>, 'id' | 'created_at'>;

type UseSyncStateReturn = {
  data: SyncStateRow | null;
  setData: (updates: SyncStateUpdate) => void;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  connectionCount: number;
};

type BroadcastPayload = {
  rowId: number;
  updates: SyncStateUpdate;
  timestamp: string;
  source: string;
};

const DEBOUNCE_DELAY = 1000;
const BROADCAST_THROTTLE_DELAY = 30;
const BROADCAST_CHANNEL = 'rive-state-updates';

export function useSyncState(rowId: number): UseSyncStateReturn {
  const [data, setDataState] = useState<SyncStateRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);

  // Refs for managing state and cleanup
  const supabaseRef = useRef<any>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pendingUpdatesRef = useRef<SyncStateUpdate>({});
  const pendingBroadcastsRef = useRef<SyncStateUpdate>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastThrottleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastTimeRef = useRef<number>(0);
  const instanceIdRef = useRef<string>('');

  // Initialize instance ID on client side only
  useEffect(() => {
    if (!instanceIdRef.current) {
      instanceIdRef.current = Math.random().toString(36).substring(7);
    }
  }, []);

  // Initialize Supabase client and fetch initial data
  useEffect(() => {
    const initSupabaseAndFetchData = async () => {
      try {
        // Initialize Supabase client
        // console.log('[Supabase] Creating client');
        supabaseRef.current = await createClient();
        // console.log('[Supabase] Client created successfully');
        setIsSupabaseReady(true);

        // Fetch initial data
        setIsLoading(true);
        setError(null);

        const { data: rowData, error: fetchError } = await supabaseRef.current
          .from('rive-state')
          .select('*')
          .eq('id', rowId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Row doesn't exist, create it with default values
            const defaultData: SyncStateUpdate = {
              mode: 0,
              slider_1: 0,
              slider_2: 0,
              slider_3: 0,
              slider_4: 0,
              slider_5: 0,
              slider_6: 0,
              slider_7: 0,
              slider_8: 0,
              slider_9: 0,
              slider_10: 0,
              slider_11: 0,
              slider_12: 0,
              slider_13: 0,
              slider_14: 0,
              slider_15: 0,
              slider_16: 0,
            };

            const { data: newRowData, error: insertError } = await supabaseRef.current
              .from('rive-state')
              .insert([{ id: rowId, ...defaultData }])
              .select()
              .single();

            if (insertError) {
              throw insertError;
            }

            setDataState(newRowData);
          } else {
            throw fetchError;
          }
        } else {
          setDataState(rowData);
        }

        setLastUpdated(new Date());
      } catch (err) {
        setError(`Failed to initialize or fetch data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initSupabaseAndFetchData();
  }, [rowId]);

  // Send accumulated broadcast updates (effect event pattern)
  const sendBroadcastEvent = useRef<() => void>(() => {});
  sendBroadcastEvent.current = () => {
    if (!channelRef.current || Object.keys(pendingBroadcastsRef.current).length === 0) {
      return;
    }

    const updates = { ...pendingBroadcastsRef.current };
    pendingBroadcastsRef.current = {};

    const payload: BroadcastPayload = {
      rowId,
      updates,
      timestamp: new Date().toISOString(),
      source: instanceIdRef.current,
    };

    // console.log('[Broadcast] Sending update:', {
    //   source: instanceIdRef.current,
    //   rowId,
    //   updates,
    // });

    channelRef.current.send({
      type: 'broadcast',
      event: 'state-update',
      payload,
    });

    lastBroadcastTimeRef.current = Date.now();
  };

  const sendBroadcast = useCallback(() => {
    sendBroadcastEvent.current?.();
  }, []);

  // Throttled broadcast function (max once every 30ms)
  const throttledBroadcast = useCallback(() => {
    const now = Date.now();
    const timeSinceLastBroadcast = now - lastBroadcastTimeRef.current;

    // If enough time has passed, send immediately
    if (timeSinceLastBroadcast >= BROADCAST_THROTTLE_DELAY) {
      sendBroadcast();
    } else {
      // Otherwise, schedule for later if not already scheduled
      if (!broadcastThrottleTimeoutRef.current) {
        const remainingTime = BROADCAST_THROTTLE_DELAY - timeSinceLastBroadcast;
        broadcastThrottleTimeoutRef.current = setTimeout(() => {
          broadcastThrottleTimeoutRef.current = null;
          sendBroadcast();
        }, remainingTime);
      }
    }
  }, [sendBroadcast]);

  // Queue updates for broadcast
  const broadcastUpdate = useCallback((updates: SyncStateUpdate) => {
    // Accumulate updates for broadcast
    pendingBroadcastsRef.current = { ...pendingBroadcastsRef.current, ...updates };

    // Trigger throttled broadcast
    throttledBroadcast();
  }, [throttledBroadcast]);

  // Save pending updates to database (effect event pattern)
  const savePendingUpdatesEvent = useRef<() => Promise<void>>(async () => {});
  savePendingUpdatesEvent.current = async () => {
    if (!supabaseRef.current || Object.keys(pendingUpdatesRef.current).length === 0) {
      return;
    }

    try {
      const updates = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};
      // console.log('[Database] Saving updates to rowId:', rowId, 'Updates:', updates);

      const { error: updateError } = await supabaseRef.current
        .from('rive-state')
        .update(updates)
        .eq('id', rowId);

      if (updateError) {
        throw updateError;
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(`Failed to save updates: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const savePendingUpdates = useCallback(async () => {
    await savePendingUpdatesEvent.current();
  }, []);

  // Debounced database save function
  const debouncedSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      savePendingUpdates();
    }, DEBOUNCE_DELAY);
  }, [savePendingUpdates]);

  // Set data function that updates local state, broadcasts immediately, and queues database update
  const setData = useCallback((updates: SyncStateUpdate) => {
    // Update local state immediately
    setDataState(prevData => {
      if (!prevData) return prevData;
      return { ...prevData, ...updates };
    });

    // Broadcast changes immediately to other clients
    broadcastUpdate(updates);

    // Queue updates for debounced database save
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };

    // Trigger debounced database save
    debouncedSave();
  }, [debouncedSave, broadcastUpdate]);

  // Setup real-time subscription
  useEffect(() => {
    // console.log('[Broadcast] Setup effect running, isSupabaseReady:', isSupabaseReady);
    if (!isSupabaseReady || !supabaseRef.current) {
      // console.log('[Broadcast] Supabase client not ready, skipping setup');
      return;
    }

    const setupRealtimeSubscription = () => {
      try {
        // console.log('[Broadcast] Setting up channel:', BROADCAST_CHANNEL, 'for rowId:', rowId);
        const channel = supabaseRef.current.channel(BROADCAST_CHANNEL);

        // Listen for broadcasts from other instances
        channel.on('broadcast', { event: 'state-update' }, (payload: { payload: BroadcastPayload }) => {
          const { rowId: broadcastRowId, updates, source } = payload.payload;

          console.log('[Broadcast] Received update:', {
            from: source,
            rowId: broadcastRowId,
            updates,
            ourRowId: rowId,
            ourInstanceId: instanceIdRef.current,
            willProcess: broadcastRowId === rowId && source !== instanceIdRef.current,
          });

          // Only process updates for our specific row and ignore our own broadcasts
          if (broadcastRowId === rowId && source !== instanceIdRef.current) {
            // console.log('[Broadcast] Processing update from:', source);
            setDataState(prevData => {
              if (!prevData) return prevData;
              return { ...prevData, ...updates };
            });
            setLastUpdated(new Date());
          }
        });

        // Track presence - sync event fires when presence state changes
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          // console.log('[Presence] Updated connection count:', count);
          setConnectionCount(count);
        });

        // Track joins
        // channel.on('presence', { event: 'join' }, ({ newPresences }: { newPresences: unknown }) => {
        //   console.log('[Presence] User(s) joined:', newPresences);
        // });

        // Track leaves
        // channel.on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: unknown }) => {
        //   console.log('[Presence] User(s) left:', leftPresences);
        // });

        channel.subscribe(async (status: string) => {
          // console.log('[Broadcast] Channel status:', status, 'Instance:', instanceIdRef.current);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setError(null);

            // Track this client's presence
            await channel.track({
              instanceId: instanceIdRef.current,
              rowId,
              online_at: new Date().toISOString(),
            });
            // console.log('[Presence] Tracking presence for instance:', instanceIdRef.current);
          } else if (status === 'CLOSED') {
            setIsConnected(false);
          }
        });

        channelRef.current = channel;
      } catch (err) {
        setError(`Failed to setup real-time subscription: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsConnected(false);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        // console.log('[Broadcast] Cleaning up channel');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [rowId, isSupabaseReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear database save timeout and save pending updates
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        savePendingUpdates();
      }

      // Clear broadcast throttle timeout and send pending broadcasts
      if (broadcastThrottleTimeoutRef.current) {
        clearTimeout(broadcastThrottleTimeoutRef.current);
        sendBroadcast();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    setData,
    isLoading,
    error,
    isConnected,
    lastUpdated,
    connectionCount,
  };
}