import React from 'react';
import { UserPlus, LogOut, Building2, Clock, ShieldCheck } from 'lucide-react';

interface KioskLandingProps {
    onSelectAction: (action: 'check-in' | 'check-out') => void;
}

const KioskLanding: React.FC<KioskLandingProps> = ({ onSelectAction }) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6">
            <div className="max-w-4xl w-full text-center space-y-12">
                {/* Branding */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-brand-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand-200 dark:shadow-none">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome to <span className="text-brand-600">Kosmos Energy</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Please select an action to proceed with your visit.</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <button
                        onClick={() => onSelectAction('check-in')}
                        className="group relative bg-white dark:bg-gray-800 p-10 rounded-3xl border-2 border-transparent hover:border-brand-500 shadow-2xl hover:shadow-brand-100 dark:hover:shadow-none transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <UserPlus className="h-32 w-32 text-brand-600" />
                        </div>
                        <div className="bg-brand-100 dark:bg-brand-900/40 p-4 rounded-2xl w-fit mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                            <UserPlus className="h-8 w-8 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Check In</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                            Arriving for a meeting or delivery? Start your registration here.
                        </p>
                    </button>

                    <button
                        onClick={() => onSelectAction('check-out')}
                        className="group relative bg-white dark:bg-gray-800 p-10 rounded-3xl border-2 border-transparent hover:border-red-500 shadow-2xl hover:shadow-red-50 dark:hover:shadow-none transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LogOut className="h-32 w-32 text-red-600" />
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/40 p-4 rounded-2xl w-fit mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                            <LogOut className="h-8 w-8 text-red-600 dark:text-red-400 group-hover:text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Check Out</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                            Leaving the premises? Quickly sign out of the building.
                        </p>
                    </button>
                </div>

                {/* Footer Info */}
                <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-gray-500 dark:text-gray-400 animate-in fade-in duration-1000 delay-500">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-bold text-gray-700 dark:text-gray-200">{currentTime}</span>
                        <span className="opacity-40">|</span>
                        <span className="text-gray-600 dark:text-gray-300">{currentDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Secure Entry & Exit</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KioskLanding;
