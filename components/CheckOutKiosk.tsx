import React, { useState, useEffect } from 'react';
import { Search, LogOut, ArrowLeft, User as UserIcon, Phone, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { Visitor, VisitorStatus } from '../types';
import { searchVisitors, updateVisitorStatus } from '../services/storage';

interface CheckOutKioskProps {
    onCancel: () => void;
    onComplete: () => void;
}

const CheckOutKiosk: React.FC<CheckOutKioskProps> = ({ onCancel, onComplete }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Visitor[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 3) {
                setIsSearching(true);
                const data = await searchVisitors(query);
                setResults(data);
                setIsSearching(false);
            } else {
                setResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleCheckOut = async () => {
        if (!selectedVisitor) return;
        setIsProcessing(true);
        try {
            await updateVisitorStatus(selectedVisitor.id, VisitorStatus.CHECKED_OUT);
            setIsFinished(true);
            setTimeout(() => {
                onComplete();
            }, 3000);
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Something went wrong during checkout. Please see reception.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">You're All Set!</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    Thank you for visiting <span className="text-brand-600 font-bold">TechCorp</span>.<br />
                    We've recorded your departure at {new Date().toLocaleTimeString()}.
                </p>
                <p className="mt-8 text-sm text-gray-400">Returning to home screen...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" /> Back to Home
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-red-600 p-1.5 rounded-lg">
                        <LogOut className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Self-Service Checkout</h1>
                </div>
            </div>

            {!selectedVisitor ? (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Find Your Record</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Enter your name or phone number as registered during check-in.</p>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className={`h-6 w-6 ${isSearching ? 'text-brand-500 animate-pulse' : 'text-gray-400 group-focus-within:text-brand-500'}`} />
                        </div>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Start typing your name..."
                            className="w-full pl-16 pr-6 py-6 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {results.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                {results.map((visitor) => (
                                    <button
                                        key={visitor.id}
                                        onClick={() => setSelectedVisitor(visitor)}
                                        className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center overflow-hidden">
                                                {visitor.photoUrl ? (
                                                    <img src={visitor.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{visitor.fullName}</p>
                                                <p className="text-gray-500 dark:text-gray-400">Visiting {visitor.hostName}</p>
                                            </div>
                                        </div>
                                        <div className="bg-brand-50 dark:bg-brand-900/40 px-4 py-2 rounded-xl text-brand-600 dark:text-brand-400 font-bold text-sm uppercase group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                            Select
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : query.length >= 3 && !isSearching ? (
                            <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">No active visits found for "{query}".</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 space-y-8 animate-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-inner">
                            {selectedVisitor.photoUrl ? (
                                <img src={selectedVisitor.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><UserIcon className="h-10 w-10 text-gray-300" /></div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{selectedVisitor.fullName}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">{selectedVisitor.company}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <Building className="h-5 w-5" />
                                <span className="font-medium">Host</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedVisitor.hostName}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <Calendar className="h-5 w-5" />
                                <span className="font-medium">Check-in Time</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {new Date(selectedVisitor.checkInTime).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-6 rounded-2xl flex gap-4">
                        <div className="text-2xl">💡</div>
                        <p className="text-yellow-800 dark:text-yellow-300 leading-relaxed">
                            <strong>Confirm Identity:</strong> Please ensure the details above are correct before checking out. If this is not you, click the cancel button below.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            disabled={isProcessing}
                            onClick={() => setSelectedVisitor(null)}
                            className="flex-1 py-4 border-2 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            This isn't me
                        </button>
                        <button
                            disabled={isProcessing}
                            onClick={handleCheckOut}
                            className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-100 dark:shadow-none flex items-center justify-center gap-3 transition transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><LogOut className="h-6 w-6" /> Complete Checkout</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOutKiosk;
