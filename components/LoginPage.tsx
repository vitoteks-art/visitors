import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Building2, UserPlus, AlertCircle, Phone } from 'lucide-react';
import { login, signup } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { DEPARTMENTS } from '../constants';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState<'admin' | 'staff' | 'reception'>('staff');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            const res = await login(email, password);
            if (res.success && res.user) {
                authLogin(res.user);
                onLoginSuccess();
            } else {
                setError(res.message || 'Login failed');
            }
        } else {
            const res = await signup({ name, email, phoneNumber, department, role, password });
            if (res.success) {
                // Auto login after signup or ask to login
                setIsLogin(true);
                setError('');
                alert("Account created! Please log in.");
            } else {
                setError(res.message || 'Signup failed');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-8 text-center bg-brand-600 text-white">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-brand-100 mt-2">
                        {isLogin ? 'Sign in to access the dashboard' : 'Join the staff portal'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" placeholder="John Doe" />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" placeholder="+2348000000000" />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" placeholder="name@company.com" />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white transition-colors">
                                    <option value="staff">Staff (Host)</option>
                                    <option value="reception">Reception</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Department</label>
                                <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white transition-colors">
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" placeholder="••••••••" />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-200 dark:shadow-none">
                        {loading ? 'Processing...' : (isLogin ? <>Sign In <ArrowRight className="h-5 w-5" /></> : <>Create Account <UserPlus className="h-5 w-5" /></>)}
                    </button>

                    <div className="text-center mt-6">
                        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline text-sm">
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
