import React, { useEffect, useState } from 'react';
import { Clock, Users, Inbox, Filter, MoreHorizontal, Bell, Search, RefreshCw, XCircle, CheckCircle, Eye, EyeOff, User, Building, Mail, FileText, X } from 'lucide-react';
import { getVisitors, updateVisitorStatus, getStats } from '../services/storage';
import { Visitor, VisitorStatus } from '../types';

const ReceptionDashboard: React.FC = () => {
   const [visitors, setVisitors] = useState<Visitor[]>([]);
   const [stats, setStats] = useState<any>({ total: 0, pending: 0, approved: 0, declined: 0, checkedOut: 0 });
   const [search, setSearch] = useState('');
   const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

   const loadData = async () => {
      const allVisitors = await getVisitors();
      if (allVisitors) {
         setVisitors(allVisitors.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()));
      }
      const newStats = await getStats();
      if (newStats) setStats(newStats);
   };

   useEffect(() => {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
   }, []);

   const handleStatusChange = async (id: string, newStatus: VisitorStatus) => {
      await updateVisitorStatus(id, newStatus);
      loadData();
   };

   const filteredVisitors = visitors.filter(v =>
      v.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.hostName.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase())
   );

   const getStatusBadge = (status: VisitorStatus) => {
      switch (status) {
         case VisitorStatus.APPROVED:
            return (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800 uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 mr-1" /> APPROVED
               </span>
            );
         case VisitorStatus.PENDING:
            return (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 uppercase tracking-wider">
                  <Clock className="w-3 h-3 mr-1" /> WAITING
               </span>
            );
         case VisitorStatus.DECLINED:
            return (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800 uppercase tracking-wider">
                  <XCircle className="w-3 h-3 mr-1" /> DECLINED
               </span>
            );
         default:
            return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 uppercase tracking-wider">{status}</span>;
      }
   };

   return (
      <div className="space-y-6">
         {/* KPI Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition">
               <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Today</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalToday || stats.total || 0}</h3>
               </div>
               <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-brand-600 dark:text-brand-400" />
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition">
               <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Currently Waiting</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.waitingApproval || stats.pending || 0}</h3>
               </div>
               <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
               </div>
            </div>
         </div>

         {/* Main Table Card */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Visitors</h3>
               <div className="flex gap-3">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search guests..."
                        className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                     />
                  </div>
                  <button onClick={loadData} className="p-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition">
                     <RefreshCw className="h-4 w-4" />
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-5">Visitor</th>
                        <th className="px-6 py-5">Host Details</th>
                        <th className="px-6 py-5">Arrival</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                     {filteredVisitors.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 italic">
                              No visitors found matching your criteria.
                           </td>
                        </tr>
                     ) : filteredVisitors.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 {visitor.photoUrl ? (
                                    <div className="relative">
                                       <img src={visitor.photoUrl} className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-600" alt="" />
                                       {visitor.inviteCode && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 border-2 border-white dark:border-gray-800 rounded-full" title="Express Check-in"></div>
                                       )}
                                    </div>
                                 ) : (
                                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-black text-xs">
                                       {visitor.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                 )}
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{visitor.fullName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{visitor.company}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div>
                                 <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{visitor.hostName}</p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{visitor.hostDepartment}</p>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-gray-900 dark:text-white text-sm font-bold">
                                 {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </td>
                           <td className="px-6 py-4">
                              {getStatusBadge(visitor.status)}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button
                                    onClick={() => setSelectedVisitor(visitor)}
                                    className="p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                                 >
                                    <Eye className="h-5 w-5" />
                                 </button>
                                 {visitor.status === VisitorStatus.APPROVED && (
                                    <button
                                       onClick={() => handleStatusChange(visitor.id, VisitorStatus.CHECKED_OUT)}
                                       className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                    >
                                       Checkout
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Visitor Detail Modal */}
         {selectedVisitor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                           <div className="bg-brand-100 dark:bg-brand-900/40 p-3 rounded-2xl">
                              <User className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visitor Profile</h2>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">Security review for {selectedVisitor.fullName}</p>
                           </div>
                        </div>
                        <button onClick={() => setSelectedVisitor(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                           <X className="h-6 w-6" />
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Check-in Photo</label>
                              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                 {selectedVisitor.photoUrl ? (
                                    <img src={selectedVisitor.photoUrl} className="w-full h-full object-cover" alt="Visitor" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 italic">No image captured</div>
                                 )}
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Electronic Signature</label>
                              <div className="h-32 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center p-4">
                                 {selectedVisitor.signature ? (
                                    <img src={selectedVisitor.signature} className="max-h-full dark:invert" alt="Signature" />
                                 ) : (
                                    <div className="text-gray-400 italic text-sm">No signature captured</div>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="grid grid-cols-1 gap-4">
                              <div>
                                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Organization</label>
                                 <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selectedVisitor.company}</p>
                              </div>
                              <div>
                                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Visit Purpose</label>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedVisitor.purpose}</p>
                              </div>
                              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Identity Provided</label>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedVisitor.idType}</p>
                                 <p className="text-xs text-gray-500">Number: {selectedVisitor.idNumber ? `**** ${selectedVisitor.idNumber.slice(-4)}` : 'N/A'}</p>
                              </div>
                              {selectedVisitor.inviteCode && (
                                 <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-900/30 mt-2">
                                    <p className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest mb-1">Invite Code</p>
                                    <p className="text-xl font-black text-brand-600 dark:text-brand-300 tracking-wider transition-colors">{selectedVisitor.inviteCode}</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <button onClick={() => setSelectedVisitor(null)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition">Close Review</button>
                        <button className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 dark:shadow-none hover:bg-brand-700 transition">Print Security Badge</button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ReceptionDashboard;