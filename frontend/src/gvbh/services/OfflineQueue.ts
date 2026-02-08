
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
  private isSyncing = false;
  private listeners: ((queue: QueueItem[], syncing: boolean) => void)[] = [];
  private storageKey = 'gvbh_offline_queue';

  constructor() {
    this.load();
    // Auto-sync attempt when coming back online
    window.addEventListener('online', () => this.sync());
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
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
    this.listeners.forEach(cb => cb([...this.queue], this.isSyncing));
  }

  public subscribe(callback: (queue: QueueItem[], syncing: boolean) => void) {
    this.listeners.push(callback);
    callback([...this.queue], this.isSyncing);
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
    
    // Auto-attempt sync if online
    if (navigator.onLine) this.sync();
    
    return item.id;
  }

  public async sync() {
    if (this.isSyncing || !navigator.onLine) return;
    
    const pendingItems = this.queue.filter(i => i.status === 'PENDING' || i.status === 'ERROR');
    if (pendingItems.length === 0) return;

    this.isSyncing = true;
    this.notify();

    let syncCount = 0;
    for (const item of pendingItems) {
      this.updateStatus(item.id, 'SYNCING');
      
      // Simulate real-time network processing
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const success = Math.random() > 0.05; // 95% success rate simulation
      if (success) {
        this.removeItem(item.id);
        syncCount++;
      } else {
        this.updateStatus(item.id, 'ERROR', 'Secure transmission timeout');
      }
    }

    this.isSyncing = false;
    this.save();

    if (syncCount > 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Background Sync: ${syncCount} logs delivered.`, type: 'success' }
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
}

export const offlineQueue = new OfflineQueueService();
