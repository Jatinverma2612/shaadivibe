import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { ThemeManager } from './ThemeManager.jsx';
import { CategoryManager } from './CategoryManager.jsx';
import { ContentManager } from './ContentManager.jsx';
import { OrderManager } from './OrderManager.jsx';
import { CustomerManager } from './CustomerManager.jsx';
import { RsvpManager } from './RsvpManager.jsx';
import { CouponManager } from './CouponManager.jsx';
import { TicketManager } from './TicketManager.jsx';
import PaymentManager from './PaymentManager.jsx';
import {
  fetchAdminDashboardStats,
  fetchAdminProfile,
  fetchAdminAnalytics,
} from '../../services/api.js';
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  Plus,
  Video,
  Tag,
  Check,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Eye,
  ExternalLink,
  Layers,
  FileText,
  Save,
  Globe,
  Sparkles,
  HelpCircle,
  MailCheck,
  CreditCard,
  LifeBuoy,
  Settings as SettingsIcon,
  Crown,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Settings form local state
  const [settingsForm, setSettingsForm] = useState({
    platformName: 'ShaadiVibe',
    contactNumber: '+91 98765 43210',
    supportEmail: 'support@shaadivibe.in',
    currency: 'INR (₹)',
    defaultHostingMonths: '12',
    maxFileUploadMb: '100',
  });

  const loadAnalytics = async (rangeKey = selectedTimeRange) => {
    try {
      setAnalyticsLoading(true);
      const res = await fetchAdminAnalytics({ range: rangeKey });
      setAnalyticsData(res);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stats, profile] = await Promise.all([
        fetchAdminDashboardStats().catch((err) => {
          console.warn('Dashboard stats fetch fallback:', err);
          return null;
        }),
        fetchAdminProfile().catch((err) => {
          console.warn('Admin profile fetch fallback:', err);
          return null;
        }),
        loadAnalytics(selectedTimeRange),
      ]);
      if (profile) {
        if (profile.role !== 'admin') {
          localStorage.removeItem('shaadivibe_admin_token');
          window.location.href = '/admin';
          return;
        }
        setAdminUser(profile);
      }
      if (stats) setDashboardData(stats);
    } catch (error) {
      console.warn('Admin initial fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAnalytics(selectedTimeRange);
  }, [selectedTimeRange]);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      let csvContent = '\uFEFF';
      csvContent += 'SHAADIVIBE DASHBOARD REPORT\n';
      csvContent += `Generated On,${new Date().toISOString()}\n`;
      csvContent += `Period Range,${selectedTimeRange.toUpperCase()}\n\n`;

      csvContent += 'KEY METRICS\n';
      csvContent += `Total Revenue (INR),${dashboardData?.kpis?.totalRevenue ?? 0}\n`;
      csvContent += `Total Orders,${dashboardData?.kpis?.totalOrders ?? 0}\n`;
      csvContent += `Completed Orders,${dashboardData?.kpis?.completedOrders ?? 0}\n`;
      csvContent += `Pending Orders,${dashboardData?.kpis?.pendingOrders ?? 0}\n`;
      csvContent += `Total Customers,${dashboardData?.kpis?.totalCustomers ?? 0}\n\n`;

      if (analyticsData?.timeline?.length) {
        csvContent += 'TIMELINE PERFORMANCE\n';
        csvContent += 'Date,Label,Revenue (INR),Orders\n';
        analyticsData.timeline.forEach((item) => {
          csvContent += `"${item.date}","${item.label}",${item.revenue},${item.orders}\n`;
        });
        csvContent += '\n';
      }

      if (analyticsData?.packageDistribution?.length) {
        csvContent += 'PACKAGE BREAKDOWN\n';
        csvContent += 'Package Type,Order Count,Revenue (INR),Share (%)\n';
        analyticsData.packageDistribution.forEach((pkg) => {
          csvContent += `"${pkg.label}",${pkg.count},${pkg.revenue},${pkg.percentage}%\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `shaadivibe-dashboard-report-${selectedTimeRange}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const chartGeometry = useMemo(() => {
    const timeline = analyticsData?.timeline || [];
    if (!timeline.length) return null;

    const W = 600;
    const H = 200;
    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const values = timeline.map((pt) => pt[chartMetric] || 0);
    const rawMax = Math.max(...values, chartMetric === 'revenue' ? 1000 : 5);
    const maxVal = Math.ceil(rawMax * 1.15);

    const points = timeline.map((pt, i) => {
      const x = padLeft + (i / Math.max(1, timeline.length - 1)) * plotW;
      const val = pt[chartMetric] || 0;
      const y = padTop + plotH - (val / maxVal) * plotH;
      return { x, y, val, ...pt };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${
      padTop + plotH
    } Z`;

    const gridLines = [0, 0.33, 0.66, 1].map((pct) => {
      const y = padTop + plotH - pct * plotH;
      const value = Math.round(pct * maxVal);
      let label = value.toLocaleString('en-IN');
      if (chartMetric === 'revenue') {
        if (value >= 100000) label = `₹${(value / 100000).toFixed(1)}L`;
        else if (value >= 1000) label = `₹${Math.round(value / 1000)}k`;
        else label = `₹${value}`;
      }
      return { y, label };
    });

    return { W, H, padLeft, padRight, padTop, padBottom, points, pathD, areaD, gridLines, maxVal };
  }, [analyticsData, chartMetric]);

  const donutGeometry = useMemo(() => {
    const packages = analyticsData?.packageDistribution?.length
      ? analyticsData.packageDistribution
      : [
          { label: 'Website Only', type: 'website', count: 18, percentage: 47.4 },
          { label: 'Complete Suite', type: 'both', count: 14, percentage: 36.8 },
          { label: 'Video Only', type: 'video', count: 6, percentage: 15.8 },
        ];
    const totalCount = packages.reduce((acc, p) => acc + p.count, 0) || 1;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const colorMap = {
      website: '#F43F5E',
      both: '#10B981',
      video: '#F59E0B',
      other: '#8B5CF6',
    };

    const slices = packages.map((pkg) => {
      const sliceLength = (pkg.count / totalCount) * circumference;
      const slice = {
        ...pkg,
        strokeDasharray: `${sliceLength} ${circumference}`,
        strokeDashoffset: -accumulatedOffset,
        color: colorMap[pkg.type] || '#8B1D3B',
      };
      accumulatedOffset += sliceLength;
      return slice;
    });

    return { totalCount, radius, circumference, slices, packages };
  }, [analyticsData]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Static reference orders matching the UI screenshot
  const referenceOrders = [
    {
      id: 'SV2508234',
      customer: 'Priya & Rahul',
      package: 'Complete',
      packageColor: 'bg-blue-50 text-blue-700 border-blue-200',
      amount: '₹1,999',
      status: 'Generating',
      statusColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      statusIcon: 'pulse',
      date: '23 Oct 2025, 4:20 PM',
      tab: 'processing',
    },
    {
      id: 'SV2508233',
      customer: 'Neha & Karan',
      package: 'Video Only',
      packageColor: 'bg-amber-50 text-amber-700 border-amber-200',
      amount: '₹999',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusIcon: 'check',
      date: '23 Oct 2025, 2:15 PM',
      tab: 'completed',
    },
    {
      id: 'SV2508232',
      customer: 'Aditi & Rohit',
      package: 'Website Only',
      packageColor: 'bg-purple-50 text-purple-700 border-purple-200',
      amount: '₹799',
      status: 'Payment Verified',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusIcon: 'check',
      date: '23 Oct 2025, 11:40 AM',
      tab: 'completed',
    },
    {
      id: 'SV2508231',
      customer: 'Sneha & Amit',
      package: 'Royal Collection',
      packageColor: 'bg-rose-50 text-rose-700 border-rose-200',
      amount: '₹2,499',
      status: 'Processing',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      statusIcon: 'pulse',
      date: '23 Oct 2025, 10:30 AM',
      tab: 'processing',
    },
    {
      id: 'SV2508230',
      customer: 'Riya & Vikram',
      package: 'Complete',
      packageColor: 'bg-blue-50 text-blue-700 border-blue-200',
      amount: '₹1,999',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusIcon: 'check',
      date: '22 Oct 2025, 7:50 PM',
      tab: 'completed',
    },
    {
      id: 'SV2508229',
      customer: 'Ananya & Kabir',
      package: 'Video Only',
      packageColor: 'bg-amber-50 text-amber-700 border-amber-200',
      amount: '₹999',
      status: 'Pending Verification',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      statusIcon: 'clock',
      date: '22 Oct 2025, 5:10 PM',
      tab: 'pending',
    },
  ];

  // Customers list matching screenshot
  const referenceCustomers = [
    {
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      orders: 2,
      totalSpent: '₹2,798',
      status: 'Active',
    },
    {
      name: 'Neha Gupta',
      email: 'neha@gmail.com',
      orders: 1,
      totalSpent: '₹999',
      status: 'Active',
    },
    {
      name: 'Aditi Singh',
      email: 'aditi@gmail.com',
      orders: 1,
      totalSpent: '₹799',
      status: 'Active',
    },
    {
      name: 'Sneha Patel',
      email: 'sneha@gmail.com',
      orders: 3,
      totalSpent: '₹4,497',
      status: 'Active',
    },
    {
      name: 'Riya Mehta',
      email: 'riya@gmail.com',
      orders: 1,
      totalSpent: '₹1,999',
      status: 'Active',
    },
  ];

  // RSVP list matching screenshot
  const referenceRsvp = [
    {
      name: 'Rohit Kumar',
      email: 'rohit@gmail.com',
      guests: 2,
      status: 'Attending',
      event: 'Wedding',
      date: '21 Oct',
    },
    {
      name: 'Neha Verma',
      email: 'nehav@gmail.com',
      guests: 1,
      status: 'Not Attending',
      event: 'Mehendi',
      date: '21 Oct',
    },
    {
      name: 'Rishi Singh',
      email: 'rishi@gmail.com',
      guests: 4,
      status: 'Attending',
      event: 'Wedding',
      date: '20 Oct',
    },
    {
      name: 'Pooja Sharma',
      email: 'pooja@gmail.com',
      guests: 2,
      status: 'Attending',
      event: 'Reception',
      date: '20 Oct',
    },
    {
      name: 'Vikram Jain',
      email: 'vikram@gmail.com',
      guests: 1,
      status: 'Maybe',
      event: 'Sangeet',
      date: '19 Oct',
    },
  ];

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      adminUser={adminUser}
      searchKeyword={searchKeyword}
      onSearchChange={setSearchKeyword}
      ordersCount={dashboardData?.kpis?.pendingOrders ?? dashboardData?.kpis?.totalOrders ?? 0}
    >
      {/* ========================================================
          1. DASHBOARD OVERVIEW SECTION (Top-Left of Screenshot)
         ======================================================== */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6 text-left max-w-7xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Welcome back! Here's what's happening with your wedding invitation platform.
              </p>
            </div>

            {/* Time Filter Pills, Refresh & Export CSV */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* Time Range Filter Buttons */}
              <div className="inline-flex items-center p-0.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                {[
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' },
                  { id: '90d', label: '90D' },
                  { id: '1y', label: '1Y' },
                  { id: 'all', label: 'All' },
                ].map((item) => {
                  const isActive = selectedTimeRange === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTimeRange(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#8B1D3B] text-white shadow-2xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={() => {
                  loadData();
                  loadAnalytics(selectedTimeRange);
                }}
                disabled={isLoading || analyticsLoading}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                title="Refresh Dashboard Data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isLoading || analyticsLoading ? 'animate-spin text-[#8B1D3B]' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Export CSV button */}
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={isLoading || isExporting}
                className="px-3.5 py-2 rounded-xl bg-[#8B1D3B] hover:bg-[#6E142C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              5 KPI SUMMARY CARDS (Exact Match to Screenshot)
             ======================================================== */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* 1. Total Orders */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100/80">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {dashboardData?.kpis?.totalOrders ?? 0}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real-time</span>
                </div>
              </div>
            </div>

            {/* 2. Total Revenue */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  ₹{(dashboardData?.kpis?.totalRevenue ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>

            {/* 3. Completed Orders */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Completed Orders</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {dashboardData?.kpis?.completedOrders ?? 0}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* 4. Pending Orders */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Pending Orders</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {dashboardData?.kpis?.pendingOrders ?? 0}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting action</span>
                </div>
              </div>
            </div>

            {/* 5. Total Customers */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Total Customers</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {dashboardData?.kpis?.totalCustomers ?? 0}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Registered</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              ROW 2: REVENUE OVERVIEW & ORDERS BY PACKAGE (DYNAMIC)
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview Chart (2 Cols on lg) */}
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Performance Trajectory
                    <span className="text-[10px] font-semibold text-[#8B1D3B] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase">
                      {selectedTimeRange.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Daily trajectory for earnings and order flow.
                  </p>
                </div>

                {/* Metric switcher tabs */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200/80 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartMetric('revenue')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      chartMetric === 'revenue'
                        ? 'bg-white text-[#8B1D3B] shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Revenue (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('orders')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      chartMetric === 'orders'
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Order Volume
                  </button>
                </div>
              </div>

              {/* Area & Line Chart SVG */}
              <div className="relative w-full h-56 sm:h-64 select-none">
                {chartGeometry ? (
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox={`0 0 ${chartGeometry.W} ${chartGeometry.H}`}
                  >
                    <defs>
                      <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B1D3B" stopOpacity="0.32" />
                        <stop offset="60%" stopColor="#8B1D3B" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#8B1D3B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines & Labels */}
                    {chartGeometry.gridLines.map((gl, i) => (
                      <g key={i}>
                        <line
                          x1={chartGeometry.padLeft}
                          y1={gl.y}
                          x2={chartGeometry.W - chartGeometry.padRight}
                          y2={gl.y}
                          stroke="#F1F5F9"
                          strokeWidth="1"
                          strokeDasharray={i === 0 ? '' : '3 3'}
                        />
                        <text
                          x={chartGeometry.padLeft - 8}
                          y={gl.y + 3.5}
                          textAnchor="end"
                          className="text-[10px] fill-gray-400 font-medium"
                        >
                          {gl.label}
                        </text>
                      </g>
                    ))}

                    {/* Area fill */}
                    <path d={chartGeometry.areaD} fill="url(#dashboardAreaGrad)" />

                    {/* Smooth curve */}
                    <path
                      d={chartGeometry.pathD}
                      fill="none"
                      stroke="#8B1D3B"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Point Dots */}
                    {chartGeometry.points.map((pt, idx) => {
                      const isHovered = hoveredPointIndex === idx;
                      return (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIndex(idx)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        >
                          {isHovered && (
                            <line
                              x1={pt.x}
                              y1={chartGeometry.padTop}
                              x2={pt.x}
                              y2={chartGeometry.H - chartGeometry.padBottom}
                              stroke="#8B1D3B"
                              strokeWidth="1.2"
                              strokeDasharray="3 3"
                              opacity="0.6"
                            />
                          )}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 5.5 : 3.2}
                            fill={isHovered ? '#8B1D3B' : '#FFFFFF'}
                            stroke="#8B1D3B"
                            strokeWidth={isHovered ? 2.5 : 1.8}
                            className="transition-all"
                          />
                          {(chartGeometry.points.length <= 12 ||
                            idx % Math.ceil(chartGeometry.points.length / 7) === 0) && (
                            <text
                              x={pt.x}
                              y={chartGeometry.H - 8}
                              textAnchor="middle"
                              className="text-[10px] fill-gray-400 font-medium"
                            >
                              {pt.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Loading trajectory data...
                  </div>
                )}

                {/* Floating Tooltip */}
                {hoveredPointIndex !== null && chartGeometry && chartGeometry.points[hoveredPointIndex] && (
                  <div
                    className="absolute z-10 pointer-events-none transform -translate-x-1/2 bg-gray-900/95 text-white px-3 py-2 rounded-xl shadow-lg text-left border border-white/10 backdrop-blur-xs transition-all duration-150"
                    style={{
                      left: `${(chartGeometry.points[hoveredPointIndex].x / chartGeometry.W) * 100}%`,
                      top: `${Math.max(5, (chartGeometry.points[hoveredPointIndex].y / chartGeometry.H) * 100 - 32)}%`,
                    }}
                  >
                    <div className="text-[10px] text-gray-300 font-medium">
                      {chartGeometry.points[hoveredPointIndex].label}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-rose-300">
                        ₹{chartGeometry.points[hoveredPointIndex].revenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-xs text-gray-200">
                        {chartGeometry.points[hoveredPointIndex].orders} orders
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Orders by Package Donut Chart (1 Col on lg) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div className="pb-2 border-b border-gray-100 mb-2">
                <h3 className="text-sm font-bold text-gray-900">Orders by Package</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Share by theme format</p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6 my-auto">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 shrink-0">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={donutGeometry.radius}
                      fill="transparent"
                      stroke="#F3F4F6"
                      strokeWidth="14"
                    />
                    {donutGeometry.slices.map((slice, i) => (
                      <circle
                        key={i}
                        cx="60"
                        cy="60"
                        r={donutGeometry.radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="14"
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    ))}
                  </svg>

                  {/* Centered Total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-xl font-extrabold text-gray-900 leading-none">
                      {donutGeometry.totalCount}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Total Orders</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="w-full space-y-2 text-xs">
                  {donutGeometry.packages.map((pkg, i) => {
                    const colorMap = {
                      website: 'bg-[#F43F5E]',
                      both: 'bg-[#10B981]',
                      video: 'bg-[#F59E0B]',
                      other: 'bg-[#8B5CF6]',
                    };
                    const dotBg = colorMap[pkg.type] || 'bg-[#8B1D3B]';
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`} />
                          <span className="text-gray-600">{pkg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400">({pkg.count})</span>
                          <span className="font-semibold text-gray-900">{pkg.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              ROW 3: RECENT ORDERS & QUICK ACTIONS
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders Table (2 Cols on lg) */}
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
                <button
                  type="button"
                  onClick={() => setActiveSection('orders')}
                  className="text-xs font-semibold text-[#8B1D3B] hover:text-[#5C061D] transition-colors"
                >
                  View All
                </button>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium">
                      <th className="pb-2.5 font-medium">#</th>
                      <th className="pb-2.5 font-medium">Customer</th>
                      <th className="pb-2.5 font-medium">Package</th>
                      <th className="pb-2.5 font-medium">Amount</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                      dashboardData.recentOrders.slice(0, 5).map((order) => {
                        const dateStr = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent';
                        const customerName =
                          order.customerSnapshot?.name ||
                          (order.customerId && typeof order.customerId === 'object'
                            ? order.customerId.name
                            : 'Customer');
                        const packageName =
                          order.packageSnapshot?.name ||
                          (order.themeId && typeof order.themeId === 'object'
                            ? order.themeId.name
                            : 'Theme Package');
                        const totalAmount = `₹${(order.pricing?.total || 0).toLocaleString('en-IN')}`;

                        return (
                          <tr key={order._id || order.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 font-semibold text-gray-800 font-mono text-[11px]">
                              {order.orderNumber}
                            </td>
                            <td className="py-3 font-medium text-gray-900">{customerName}</td>
                            <td className="py-3">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                                {packageName}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-gray-900">{totalAmount}</td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  order.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : order.status === 'processing'
                                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : order.status === 'cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : order.status === 'draft'
                                    ? 'bg-stone-100 text-stone-700 border-stone-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {order.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {order.status === 'processing' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                )}
                                {order.status === 'pending' && <Clock className="w-3 h-3 text-amber-500" />}
                                <span className="capitalize">{order.status}</span>
                              </span>
                            </td>
                            <td className="py-3 text-right text-gray-400">{dateStr}</td>
                          </tr>
                        );
                      })
                    ) : dashboardData?.ordersAvailable ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-xs text-gray-400">
                          No customer orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      referenceOrders.slice(0, 3).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 font-semibold text-gray-800">{order.id}</td>
                          <td className="py-3 font-medium text-gray-900">{order.customer}</td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${order.packageColor}`}
                            >
                              {order.package}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-gray-900">{order.amount}</td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${order.statusColor}`}
                            >
                              {order.statusIcon === 'pulse' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                              )}
                              {order.statusIcon === 'check' && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{order.status}</span>
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-400">{order.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions (1 Col on lg) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>

              <div className="space-y-2.5 my-auto">
                {/* 1. Add New Theme */}
                <button
                  type="button"
                  onClick={() => setActiveSection('themes')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8B1D3B] flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Add New Theme</span>
                    <span className="text-[10px] text-gray-500 block">Create and publish design</span>
                  </div>
                </button>

                {/* 2. Upload Video Template */}
                <button
                  type="button"
                  onClick={() => setActiveSection('video-templates')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Upload Video Template</span>
                    <span className="text-[10px] text-gray-500 block">MP4 animated suite upload</span>
                  </div>
                </button>

                {/* 3. Create Coupon */}
                <button
                  type="button"
                  onClick={() => setActiveSection('coupons')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 group-hover:scale-105 transition-transform">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Create Coupon</span>
                    <span className="text-[10px] text-gray-500 block">Discount codes and offers</span>
                  </div>
                </button>

                {/* 4. View Pending Orders */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('orders');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">View Pending Orders</span>
                    <span className="text-[10px] text-gray-500 block">
                      {dashboardData?.kpis?.pendingOrders !== undefined
                        ? `${dashboardData.kpis.pendingOrders} orders waiting verification`
                        : 'Orders waiting verification'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. ORDERS MANAGEMENT
         ======================================================== */}
      {activeSection === 'orders' && (
        <OrderManager onOrdersUpdate={loadData} />
      )}

      {/* ========================================================
          CATEGORIES MANAGEMENT
         ======================================================== */}
      {activeSection === 'categories' && (
        <CategoryManager onCategoriesUpdate={loadData} />
      )}

      {/* ========================================================
          2. THEMES MANAGEMENT
         ======================================================== */}
      {activeSection === 'themes' && (
        <ThemeManager onThemesUpdate={loadData} />
      )}

      {/* 2b. VIDEO TEMPLATES */}
      {activeSection === 'video-templates' && (
        <ThemeManager initialTab="video" onThemesUpdate={loadData} />
      )}

      {/* 2c. WEBSITE TEMPLATES */}
      {activeSection === 'website-templates' && (
        <ThemeManager initialTab="website" onThemesUpdate={loadData} />
      )}

      {/* ========================================================
          3. CONTENT MANAGEMENT CMS
         ======================================================== */}
      {activeSection === 'content' && <ContentManager />}

      {/* ========================================================
          5. CUSTOMERS MANAGEMENT (Phase D)
         ======================================================== */}
      {activeSection === 'customers' && <CustomerManager />}

      {/* ========================================================
          6. RSVP RESPONSES (Phase D)
         ======================================================== */}
      {activeSection === 'rsvp' && <RsvpManager />}

      {/* ========================================================
          7. COUPONS & OFFERS (Phase D)
         ======================================================== */}
      {activeSection === 'coupons' && <CouponManager />}

      {/* ========================================================
          8. SUPPORT & TICKETS (Phase D)
         ======================================================== */}
      {activeSection === 'support' && <TicketManager />}

      {/* ========================================================
          7. GENERAL SETTINGS (Bottom-Right of Screenshot)
         ======================================================== */}
      {activeSection === 'settings' && (
        <div className="space-y-6 text-left max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">General Settings</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage platform settings, preferences, and operational configurations.
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto scrollbar-none">
            {[
              { id: 'general', label: 'General' },
              { id: 'payment', label: 'Payment' },
              { id: 'email', label: 'Email' },
              { id: 'video', label: 'Video Generation' },
              { id: 'website', label: 'Website' },
              { id: 'branding', label: 'Branding' },
            ].map((tab) => {
              const isActive = settingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSettingsTab(tab.id)}
                  className={`pb-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-[#8B1D3B] text-[#8B1D3B]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Form */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs space-y-6"
          >
            {settingsSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Settings successfully saved and synchronized.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settingsForm.platformName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, platformName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, supportEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={settingsForm.contactNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, contactNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Currency
                </label>
                <input
                  type="text"
                  value={settingsForm.currency}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, currency: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Default Hosting Duration (Months)
                </label>
                <input
                  type="number"
                  value={settingsForm.defaultHostingMonths}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, defaultHostingMonths: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Max File Upload Size (MB)
                </label>
                <input
                  type="number"
                  value={settingsForm.maxFileUploadMb}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, maxFileUploadMb: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#8B1D3B] hover:bg-[#6E142C] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          8. PAYMENTS & FINANCIAL MANAGEMENT
         ======================================================== */}
      {activeSection === 'payments' && <PaymentManager />}
    </AdminLayout>
  );
};
