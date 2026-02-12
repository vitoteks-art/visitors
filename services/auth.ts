import { User } from '../types';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '/backend';

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/auth.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password })
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
};

export const signup = async (user: Partial<User> & { password: string }): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/auth.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'signup', ...user })
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
};

export const getStuffList = async (role?: string): Promise<User[]> => {
    try {
        const url = role ? `${API_BASE}/staff.php?role=${role}` : `${API_BASE}/staff.php`;
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        return [];
    }
};

export const saveStaff = async (staff: Partial<User> & { password?: string }): Promise<void> => {
    await fetch(`${API_BASE}/staff.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
    });
};

export const deleteStaff = async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/staff.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
    });
};
