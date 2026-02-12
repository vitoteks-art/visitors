import React, { useEffect, useState } from 'react';
import { User as UserIcon, MapPin, Clock, Briefcase, CheckCircle, XCircle, UserPlus, Info } from 'lucide-react';
import { getVisitors, updateVisitorStatus, saveVisitor } from '../services/storage';
import { Visitor, VisitorStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

const HostSimulation: React.FC = () => {
   const [requests, setRequests] = useState<Visitor[]>([]);
   const [showPreReg, setShowPreReg] = useState(false);
   const [preRegData, setPreRegData] = useState({ fullName: '', email: '', company: '' });
   const [generatedCode, setGeneratedCode] = useState<string | null>(null);
   const { user } = useAuth();

   const loadRequests = async () => {
      const all = await getVisitors();
      if (all) {
         // Filter: Must be PENDING AND (if user is staff, must match hostName)
         setRequests(all.filter(v => {
            const isPending = v.status === VisitorStatus.PENDING;
            const matchesHost = user?.role === 'staff' ? v.hostName === user.name : true;
            return isPending && matchesHost;
         }));
      }
   };

   useEffect(() => {
      loadRequests();
      const interval = setInterval(loadRequests, 3000);
      return () => clearInterval(interval);
   }, [user]);

   const handleAction = async (id: string, action: 'approve' | 'decline') => {
      await updateVisitorStatus(id, action === 'approve' ? VisitorStatus.APPROVED : VisitorStatus.DECLINED);
      loadRequests();
   };

   const handlePreRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newPreReg: Visitor = {
         id: crypto.randomUUID(),
         fullName: preRegData.fullName,
         email: preRegData.email,
         phoneNumber: '',
         company: preRegData.company,
         purpose: 'Meeting',
         hostName: user?.name || '',
         hostDepartment: user?.department || '',
         idType: 'Driver License',
         idNumber: '',
         checkInTime: new Date().toISOString(),
         status: VisitorStatus.PENDING,
         inviteCode: inviteCode
      };

      try {
         await saveVisitor(newPreReg);
         setGeneratedCode(inviteCode);
      } catch (err) {
         alert("Failed to pre-register");
      }
   };

   // Main View Selection
   const renderMainContent = () => {
      if (requests.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center h-[500px] text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
               <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 transition-colors">
                  <CheckCircle className="h-10 w-10 text-gray-300 dark:text-gray-600" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Pending Approvals</h2>
               <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mb-8">
                  You're all caught up! When a visitor checks in to see you, their request will appear here.
               </p>
               <button
                  onClick={() => setShowPreReg(true)}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
               >
                  <UserPlus className="h-5 w-5" /> Pre-register a Guest Now
               </button>
            </div>
         );
      }

      const request = requests[0];
      return (
         <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-10">
               <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Photo */}
                  <div className="shrink-0">
                     {request.photoUrl ? (
                        <img src={request.photoUrl} className="w-32 h-32 rounded-2xl object-cover shadow-sm bg-gray-100 dark:bg-gray-700" alt="Visitor" />
                     ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-colors">
                           <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                     )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 w-full">
                     <div className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                        Awaiting Response
                     </div>
                     <h2 className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-1">{request.fullName}</h2>
                     <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{request.company}</p>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                           <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Purpose</span>
                           <span className="font-semibold text-gray-900 dark:text-white">{request.purpose}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                           <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Arrival</span>
                           <span className="font-semibold text-gray-900 dark:text-white">{new Date(request.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                           <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                           <span className="font-semibold text-gray-900 dark:text-white">Main Reception Desk</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex gap-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
               <button
                  onClick={() => handleAction(request.id, 'approve')}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-3 px-6 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
               >
                  <CheckCircle className="w-5 h-5" /> Approve Entry
               </button>
               <button
                  onClick={() => handleAction(request.id, 'decline')}
                  className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold text-lg py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
               >
                  <XCircle className="w-5 h-5" /> Decline
               </button>
            </div>

            <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors">
               Declining will notify the reception team to escort the visitor.
            </div>
         </div>
      );
   };

   return (
      <div className="max-w-4xl mx-auto py-10">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <div className="text-center sm:text-left">
               <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Host Portal</h1>
               <p className="text-lg text-slate-600 dark:text-gray-400">Manage your guest arrivals and pre-registrations.</p>
            </div>
            <button
               onClick={() => setShowPreReg(true)}
               className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-200 dark:shadow-none transition"
            >
               <UserPlus className="h-5 w-5" /> Pre-register Guest
            </button>
         </div>

         {showPreReg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-8">
                     {generatedCode ? (
                        <div className="text-center py-6">
                           <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle className="h-10 w-10" />
                           </div>
                           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guest Pre-registered!</h2>
                           <p className="text-gray-500 dark:text-gray-400 mb-8">Share this unique invite code with your guest for express check-in:</p>

                           <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl mb-8">
                              <span className="text-4xl font-black tracking-[0.2em] text-brand-600 dark:text-brand-400">{generatedCode}</span>
                           </div>

                           <button
                              onClick={() => { setShowPreReg(false); setGeneratedCode(null); setPreRegData({ fullName: '', email: '', company: '' }); }}
                              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold transition"
                           >
                              Got it, thanks!
                           </button>
                        </div>
                     ) : (
                        <>
                           <div className="flex justify-between items-center mb-6">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pre-register Guest</h2>
                              <button onClick={() => setShowPreReg(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                 <XCircle className="h-6 w-6" />
                              </button>
                           </div>

                           <form onSubmit={handlePreRegister} className="space-y-4">
                              <div>
                                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Guest Full Name</label>
                                 <input
                                    required
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                                    value={preRegData.fullName}
                                    onChange={e => setPreRegData({ ...preRegData, fullName: e.target.value })}
                                    placeholder="e.g. John Smith"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                 <input
                                    type="email"
                                    required
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                                    value={preRegData.email}
                                    onChange={e => setPreRegData({ ...preRegData, email: e.target.value })}
                                    placeholder="guest@example.com"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Company</label>
                                 <input
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                                    value={preRegData.company}
                                    onChange={e => setPreRegData({ ...preRegData, company: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                 />
                              </div>
                              <button
                                 type="submit"
                                 className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition"
                              >
                                 Generate Invite Code
                              </button>
                           </form>
                        </>
                     )}
                  </div>
               </div>
            </div>
         )}

         {requests.length > 0 && (
            <div className="text-center mb-10">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold mb-4">
                  <Info className="h-4 w-4" /> You have {requests.length} pending visitor{requests.length > 1 ? 's' : ''}
               </div>
            </div>
         )}

         {renderMainContent()}

         <div className="flex justify-center flex-wrap gap-6 mt-8 text-sm font-medium text-brand-700 dark:text-brand-400">
            <button className="hover:underline">Contact Reception Desk</button>
            <button className="hover:underline">Reschedule Meeting</button>
            <button className="hover:underline">View History</button>
         </div>
      </div>
   );
};

export default HostSimulation;