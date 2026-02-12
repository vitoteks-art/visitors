import React, { useEffect, useState } from 'react';
import { getStuffList, saveStaff, deleteStaff } from '../services/auth';
import { User } from '../types';
import { Trash2, UserPlus, Search, RefreshCw, Edit2 } from 'lucide-react';
import { DEPARTMENTS } from '../constants';

const AdminStaffManagement: React.FC = () => {
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<User>({
        id: '',
        name: '',
        email: '',
        phoneNumber: '',
        role: 'staff',
        department: ''
    });

    const loadStaff = async () => {
        setLoading(true);
        const list = await getStuffList();
        setStaff(list);
        setLoading(false);
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to remove this staff member?')) {
            await deleteStaff(id);
            loadStaff();
        }
    };

    const handleEdit = (user: User) => {
        setEditMode(true);
        setFormData({ ...user });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditMode(false);
        setFormData({ id: '', name: '', email: '', phoneNumber: '', role: 'staff', department: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = { ...formData };
        if (editMode) {
            payload.action = 'update';
        }

        await saveStaff(payload);
        setShowModal(false);
        loadStaff();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h2>
                <button onClick={handleAddNew} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                    <UserPlus className="h-5 w-5" /> Add Staff
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {staff.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{user.phoneNumber || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                            user.role === 'reception' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.department}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id!)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500">No staff members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {editMode ? 'Edit Staff Member' : 'Add New Staff Member'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                                <input required className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                                    <input required type="email" className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">WhatsApp Phone</label>
                                    <input className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+234..." value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                                    <select className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}>
                                        <option value="staff">Staff</option>
                                        <option value="reception">Reception</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Department</label>
                                    <select className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                                    {editMode ? 'Update Member' : 'Save Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaffManagement;
