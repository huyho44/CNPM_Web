import { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Settings, 
  CreditCard, 
  Users, 
  AlertCircle, 
  Car, 
  ParkingCircle, 
  Clock, 
  Wrench,
  RefreshCw, 
  Download, 
  Plus, 
  Search, 
  Camera, 
  Power, 
  ChevronRight, 
  Menu, 
  X 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  ZONES, 
  MOCK_SLOTS, 
  MOCK_ALERTS, 
  MOCK_POLICIES, 
  MOCK_TRANSACTIONS, 
  MOCK_USERS, 
  TRAFFIC_DATA 
} from './constants';
import { ParkingStatus, Alert, PricingPolicy, Transaction, UserRecord } from './types';

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={cn("p-3 rounded-lg", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const DashboardTab = () => {
  const [selectedZone, setSelectedZone] = useState('All');
  
  const stats = useMemo(() => {
    const slots = selectedZone === 'All' ? MOCK_SLOTS : MOCK_SLOTS.filter(s => s.zone === selectedZone);
    return {
      total: slots.length,
      available: slots.filter(s => s.status === 'Available').length,
      occupied: slots.filter(s => s.status === 'Occupied').length,
      maintenance: slots.filter(s => s.status === 'Maintenance').length
    };
  }, [selectedZone]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Tổng quan hệ thống</h2>
        <select 
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
        >
          <option value="All">Tất cả khu vực</option>
          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Chỗ trống" value={stats.available} icon={ParkingCircle} color="bg-green-500" />
        <StatCard title="Đang đỗ" value={stats.occupied} icon={Car} color="bg-red-500" />
        <StatCard title="Bảo trì" value={stats.maintenance} icon={Wrench} color="bg-yellow-500" />
        <StatCard title="Tổng chỗ" value={stats.total} icon={LayoutDashboard} color="bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Lưu lượng xe theo giờ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#6B21A8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Bảng cảnh báo</h3>
          <div className="space-y-4">
            {MOCK_ALERTS.map(alert => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border-l-4 border-red-500">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RealTimeTab = () => {
  const [barriers, setBarriers] = useState({ A: false, B: false, C: false });

  const toggleBarrier = (gate: 'A' | 'B' | 'C') => {
    setBarriers(prev => ({ ...prev, [gate]: !prev[gate] }));
  };

  const GateCard = ({ gate, name }: { gate: 'A'|'B'|'C', name: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Trạng thái {name}</h3>
      <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <Camera className="w-8 h-8 text-gray-600" />
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">LIVE</div>
        <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/50 px-2 py-1 rounded">{name} - Camera 01</div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Trạng thái Barie:</span>
          <span className={cn("text-sm font-bold", barriers[gate] ? "text-green-600" : "text-red-600")}>
            {barriers[gate] ? "ĐANG MỞ" : "ĐANG ĐÓNG"}
          </span>
        </div>
        <button 
          onClick={() => toggleBarrier(gate)}
          className={cn(
            "w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors",
            barriers[gate] ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-purple-600 text-white hover:bg-purple-700"
          )}
        >
          <Power className="w-4 h-4" />
          <span>{barriers[gate] ? "Đóng Barie" : "Mở Barie khẩn cấp"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Sơ đồ bãi xe thời gian thực</h3>
            <div className="flex space-x-4 text-xs">
              <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Trống</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Có xe</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div> Bảo trì</div>
            </div>
          </div>
          <div className="space-y-8">
            {ZONES.map(zone => {
              const zoneSlots = MOCK_SLOTS.filter(s => s.zone === zone);
              return (
                <div key={zone} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-md font-bold text-purple-900 mb-4">{zone}</h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {zoneSlots.map(slot => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-colors",
                          slot.status === 'Available' ? 'bg-green-500' : 
                          slot.status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-500'
                        )}
                      >
                        {slot.id.split('-')[1]}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <GateCard gate="A" name="Cổng 1 (LTK)" />
          <GateCard gate="B" name="Cổng 2 (THT)" />
          <GateCard gate="C" name="Cổng 3 (THT)" />
        </div>
      </div>
    </div>
  );
};

const PolicyTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Quản lý chính sách vận hành</h2>
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Load Default
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New Policy</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Cấu hình giá gửi xe</h3>
          <div className="space-y-4">
            {MOCK_POLICIES.map(policy => (
              <div key={policy.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-purple-900">{policy.userType}</span>
                  <button className="text-purple-600 text-sm font-medium hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Giá theo lượt (VNĐ)</label>
                    <input type="number" defaultValue={policy.pricePerTurn} className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Giá theo giờ (VNĐ)</label>
                    <input type="number" defaultValue={policy.pricePerHour} className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Giờ hoạt động & Hiệu lực</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">Khung giờ mở cửa</label>
                <div className="flex items-center space-x-4">
                  <input type="time" defaultValue="06:00" className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm flex-1" />
                  <span className="text-gray-400">đến</span>
                  <input type="time" defaultValue="22:00" className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm flex-1" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Ngày có hiệu lực (Effective Date)</label>
                <input type="date" defaultValue="2026-04-02" className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Phân quyền lối vào</h3>
            <div className="space-y-3">
              {ZONES.map((gate, i) => {
                const isGateB = gate.includes('Bãi B');
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{gate}</span>
                    <div className="flex space-x-2">
                      {!isGateB && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] rounded font-bold">STUDENT</span>}
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded font-bold">STAFF</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinanceTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Tài chính & BKPay</h2>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-purple-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Trigger Billing Cycle</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Danh sách thanh toán tích lũy</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Mã sinh viên</th>
                <th className="px-6 py-4">Biển số</th>
                <th className="px-6 py-4">Số tiền tích lũy</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TRANSACTIONS.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.studentId}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{tx.plateNumber}</td>
                  <td className="px-6 py-4 font-bold text-purple-900">{tx.amount.toLocaleString()} VNĐ</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      tx.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      tx.status === 'Debt' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    )}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.timestamp}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-purple-600 hover:underline text-sm font-medium">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserRecordsTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Dữ liệu người dùng & Lịch sử</h2>
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm MSSV hoặc Biển số..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-purple-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync Now</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lịch sử vào/ra chi tiết</h3>
            <span className="text-xs text-gray-400 italic">Nguồn: HCMUT_DATACORE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Sinh viên</th>
                  <th className="px-6 py-4">Biển số</th>
                  <th className="px-6 py-4">Vào</th>
                  <th className="px-6 py-4">Ra</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_USERS.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                          {user.name.split(' ').pop()?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{user.plateNumber}</td>
                    <td className="px-6 py-4 text-sm">{user.lastEntry}</td>
                    <td className="px-6 py-4 text-sm">{user.lastExit}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold",
                        user.status === 'Inside' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      )}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Thông tin định danh</h3>
          <div className="space-y-6">
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                //src="https://picsum.photos/seed/hcmut/400/400" 
                src="/biensoxe.png"
                alt="ID Card" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-500">Họ tên:</span>
                <span className="text-sm font-bold">Nguyễn Văn A</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-500">MSSV:</span>
                <span className="text-sm font-bold">2110123</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-500">Khoa:</span>
                <span className="text-sm font-bold">Khoa học & Kỹ thuật Máy tính</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-500">Loại xe:</span>
                <span className="text-sm font-bold">Xe máy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'realtime', label: 'Giám sát thời gian thực', icon: Monitor },
    { id: 'policy', label: 'Quản lý chính sách', icon: Settings },
    { id: 'finance', label: 'Tài chính & BKPay', icon: CreditCard },
    { id: 'users', label: 'Người dùng & Dữ liệu', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-purple-800 text-white transition-transform duration-300 lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:hidden"
        )}
      >
        <div className="p-6 flex items-center space-x-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <ParkingCircle className="w-6 h-6 text-purple-800" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">HCMUT</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest">Smart Parking</p>
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-white/15 text-white shadow-inner" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Admin User</p>
              <p className="text-[10px] text-white/50">hieube17@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-lg font-bold text-gray-800 hidden sm:block">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Hệ thống trực tuyến</span>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'realtime' && <RealTimeTab />}
              {activeTab === 'policy' && <PolicyTab />}
              {activeTab === 'finance' && <FinanceTab />}
              {activeTab === 'users' && <UserRecordsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
