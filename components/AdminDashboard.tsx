import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Users, Clock, CheckCircle, RefreshCw, Filter, MoreVertical, FileText } from 'lucide-react';
import { getVisitors, getStats } from '../services/storage';
import { Visitor, VisitorStatus } from '../types';

// Helper Search Icon
const Search = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
   </svg>
);

const AdminDashboard: React.FC = () => {
   const [stats, setStats] = useState<any>({ total: 0, pending: 0, approved: 0, declined: 0 });
   const [visitors, setVisitors] = useState<Visitor[]>([]);
   const [weeklyData, setWeeklyData] = useState<any[]>([]);
   const [categoryData, setCategoryData] = useState<any[]>([]);
   const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
      const fetchData = async () => {
         const data = await getVisitors();
         if (data) {
            setVisitors(data);
            processChartData(data);
         }
         const s = await getStats();
         if (s) setStats(s);
      };
      fetchData();
   }, []);

   const processChartData = (allVisitors: Visitor[]) => {
      // 1. Weekly Traffic (Last 7 Days)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const trafficCounts: { [key: string]: number } = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

      const now = new Date();
      const last7Days = allVisitors.filter(v => {
         const date = new Date(v.checkInTime || v.created_at || "");
         const diffTime = Math.abs(now.getTime() - date.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         return diffDays <= 7;
      });

      last7Days.forEach(v => {
         const date = new Date(v.checkInTime || v.created_at || "");
         const day = dayNames[date.getDay()];
         trafficCounts[day]++;
      });

      setWeeklyData([
         { name: 'Mon', count: trafficCounts['Mon'] },
         { name: 'Tue', count: trafficCounts['Tue'] },
         { name: 'Wed', count: trafficCounts['Wed'] },
         { name: 'Thu', count: trafficCounts['Thu'] },
         { name: 'Fri', count: trafficCounts['Fri'] },
         { name: 'Sat', count: trafficCounts['Sat'] },
         { name: 'Sun', count: trafficCounts['Sun'] },
      ]);

      // 2. Categories distribution (All time)
      const catCounts: { [key: string]: number } = {};
      allVisitors.forEach(v => {
         const p = v.purpose || 'Other';
         catCounts[p] = (catCounts[p] || 0) + 1;
      });

      const formattedCats = Object.keys(catCounts).map(name => ({
         name,
         value: catCounts[name]
      })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 categories

      setCategoryData(formattedCats);
   };

   const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

   const exportCSV = () => {
      alert("Exporting CSV...");
   };

   const filteredVisitors = visitors.filter(v =>
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.hostName.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const StatCard = ({ title, value, badge, icon: Icon, color }: any) => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-colors">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
               <Icon className="h-6 w-6 text-white" />
            </div>
            {badge && (
               <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full">
                  {badge}
               </span>
            )}
         </div>
         <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
         </div>
      </div>
   );

   return (
      <div className="space-y-8">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Visitor Insights</h1>
               <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" /> Last updated: Just now
               </p>
            </div>
            <div className="flex gap-3">
               <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
               >
                  <RefreshCw className="w-4 h-4" /> Refresh
               </button>
               <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 shadow-sm transition"
               >
                  <Download className="w-4 h-4" /> Export to CSV
               </button>
            </div>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
               title="Total Visitors"
               value={stats.total}
               badge="+12.5%"
               icon={Users}
               color="bg-brand-500"
            />
            <StatCard
               title="Currently Waiting"
               value={stats.pending}
               badge="Real-time"
               icon={Clock}
               color="bg-yellow-500"
            />
            <StatCard
               title="Approved Today"
               value={stats.approved}
               badge="+5.2%"
               icon={CheckCircle}
               color="bg-green-500"
            />
         </div>

         {/* Charts Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Visitor Traffic (Weekly)</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                           itemStyle={{ color: '#F9FAFB' }}
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Visitor Categories</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={categoryData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip
                           contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                        />
                        <Legend verticalAlign="bottom" align="center" />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Visitor Logs Table Section */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visitor Logs</h3>
               <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                     <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                     />
                     <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                     <Filter className="w-4 h-4" /> Filters
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                     <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Host Employee</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-In</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                     {filteredVisitors.slice(0, 8).map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${visitor.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                    {visitor.fullName.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{visitor.fullName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{visitor.company}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{visitor.purpose}</td>
                           <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{visitor.hostName}</td>
                           <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                              {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${visitor.status === VisitorStatus.APPROVED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                 visitor.status === VisitorStatus.PENDING ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                    visitor.status === VisitorStatus.DECLINED ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                 }`}>
                                 {visitor.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                                 <MoreVertical className="w-5 h-5" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
               <span className="text-sm text-gray-500 dark:text-gray-400">Showing 1 to {Math.min(filteredVisitors.length, 8)} of {filteredVisitors.length} results</span>
               <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">‹</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-brand-600 text-white rounded font-bold text-sm">1</button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">2</button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">›</button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;