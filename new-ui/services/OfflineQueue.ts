
export interface QueueItem {
  id: string;
  type: 'TRIP_REPORT' | 'PHOTO_UPLOAD' | 'STATUS_UPDATE' | 'MESSAGE';
  payload: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'ERROR' | 'CONFLICT';
  retryCount: number;
  error?: string;
}

class OfflineQueueService {
  private queue: QueueItem[] = [];
  private listeners: ((queue: QueueItem[]) => void)[] = [];
  private storageKey = 'gvbh_offline_queue';

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      } else {
        // Initialize with some mock data for demonstration if empty
        this.queue = [
          {
            id: 'mock-1',
            type: 'TRIP_REPORT',
            payload: { tripId: 'TRP-1022' },
            timestamp: Date.now() - 600000,
            status: 'PENDING',
            retryCount: 0
          }
        ];
      }
    } catch (e) {
      console.error('Failed to load queue', e);
    }
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      this.notify();
    } catch (e) {
      console.error('Failed to save queue', e);
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb([...this.queue]));
  }

  public subscribe(callback: (queue: QueueItem[]) => void) {
    this.listeners.push(callback);
    callback([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public enqueue(type: QueueItem['type'], payload: any) {
    const item: QueueItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      status: 'PENDING',
      retryCount: 0
    };
    this.queue.push(item);
    this.save();
    
    // Notify user of new item
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `${type.replace('_', ' ')} queued offline.`, type: 'info' }
    }));
    
    return item.id;
  }

  public async sync() {
    const pendingItems = this.queue.filter(i => i.status === 'PENDING' || i.status === 'ERROR');
    
    if (pendingItems.length === 0) return;

    let syncCount = 0;
    
    for (const item of pendingItems) {
      this.updateStatus(item.id, 'SYNCING');
      
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Random success/failure for demonstration
      const success = Math.random() > 0.1;
      
      if (success) {
        this.removeItem(item.id);
        syncCount++;
      } else {
        this.updateStatus(item.id, 'ERROR', 'Network timeout');
      }
    }

    if (syncCount > 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Synced ${syncCount} items successfully.`, type: 'success' }
      }));
    }
  }

  public updateStatus(id: string, status: QueueItem['status'], error?: string) {
    this.queue = this.queue.map(item => 
      item.id === id ? { ...item, status, error } : item
    );
    this.save();
  }

  public removeItem(id: string) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.save();
  }

  public getItems() {
    return [...this.queue];
  }
}

export const offlineQueue = new OfflineQueueService();
