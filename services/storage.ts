import { Visitor, VisitorStatus, DashboardStats, Notification } from '../types';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '/backend';

export const getVisitors = async (): Promise<Visitor[]> => {
  try {
    const response = await fetch(`${API_BASE}/visitors.php`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch visitors:", error);
    return [];
  }
};

export const saveVisitor = async (visitor: Visitor): Promise<void> => {
  try {
    await fetch(`${API_BASE}/visitors.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitor)
    });
  } catch (error) {
    console.error("Failed to save visitor:", error);
  }
};

export const updateVisitorStatus = async (id: string, status: VisitorStatus): Promise<void> => {
  try {
    const payload: any = {
      action: 'status_update',
      id,
      status
    };

    if (status === VisitorStatus.APPROVED) {
      payload.approvalTime = new Date().toISOString();
      payload.badgeNumber = `GK-${Math.floor(Math.random() * 10000)}`;
    }
    if (status === VisitorStatus.CHECKED_OUT) {
      payload.checkOutTime = new Date().toISOString();
    }

    await fetch(`${API_BASE}/visitors.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Failed to update status:", error);
  }
};

export const getStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE}/stats.php`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      totalToday: 0,
      currentlyOnSite: 0,
      waitingApproval: 0,
      declinedToday: 0
    };
  }
};

export const getVisitorByCode = async (code: string): Promise<Visitor | null> => {
  try {
    const response = await fetch(`${API_BASE}/visitors.php?invite_code=${code}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
};

export const searchVisitors = async (query: string): Promise<Visitor[]> => {
  try {
    const response = await fetch(`${API_BASE}/visitors.php?search=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    return [];
  }
};

export const checkNotifications = async (lastId: number, role?: string, userName?: string): Promise<{ has_new: boolean, latest_id: number, notifications: Notification[] }> => {
  try {
    const params = new URLSearchParams({
      last_id: lastId.toString(),
      role: role || '',
      user_name: userName || ''
    });
    const response = await fetch(`${API_BASE}/notifications.php?${params}`);
    return await response.json();
  } catch (e) {
    return { has_new: false, latest_id: lastId, notifications: [] };
  }
}
