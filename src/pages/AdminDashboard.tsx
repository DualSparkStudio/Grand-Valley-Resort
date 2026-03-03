import {
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import {
  CalendarIcon as CalendarSolidIcon,
  CheckCircleIcon as CheckSolidIcon,
  CurrencyRupeeIcon as CurrencySolidIcon
} from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/supabase'

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    totalRooms: 0,
    totalRoomTypes: 0,
    availableRooms: 0,
    availableRoomTypes: 0,
    confirmedBookings: 0
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Loading dashboard with date range:', dateRange.startDate, 'to', dateRange.endDate)
      const [statsData] = await Promise.all([
        api.getDashboardStats(dateRange.startDate, dateRange.endDate),
        api.getBookings()
      ])
      console.log('Stats received:', statsData)
      setStats({
        totalUsers: statsData?.totalUsers ?? 0,
        totalBookings: statsData?.totalBookings ?? 0,
        totalRevenue: (statsData as any)?.totalRevenue ?? 0,
        activeBookings: (statsData as any)?.activeBookings ?? 0,
        totalRooms: statsData?.totalRooms ?? 0,
        totalRoomTypes: statsData?.totalRoomTypes ?? 0,
        availableRooms: statsData?.availableRooms ?? 0,
        availableRoomTypes: statsData?.availableRoomTypes ?? 0,
        confirmedBookings: statsData?.confirmedBookings ?? 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyDateRange = () => {
    loadDashboardData()
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    solidIcon: React.ElementType
    color: string
    bgColor: string
    trend?: string
    trendUp?: boolean
  }> = ({ title, value, solidIcon: SolidIcon, color, bgColor, trend, trendUp }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className={`flex items-center text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowTrendingUpIcon 
                className={`h-4 w-4 mr-1 ${trendUp ? '' : 'rotate-180'}`} 
              />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`relative ${bgColor} rounded-full p-4`}>
          <SolidIcon className={`h-8 w-8 ${color}`} />
          <div className="absolute inset-0 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  const QuickActionCard: React.FC<{
    title: string
    description: string
    icon: React.ElementType
    href: string
    color: string
    bgColor: string
  }> = ({ title, description, icon: Icon, href, color, bgColor }) => (
    <Link
      to={href}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`${bgColor} rounded-xl p-3 group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all duration-200">
            <span>Manage now</span>
            <ArrowTrendingUpIcon className="h-4 w-4 ml-2 rotate-90" />
          </div>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening at Resort Booking System today</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Website
              </Link>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Check Availability:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px] cursor-pointer"
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  min={dateRange.startDate}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px] cursor-pointer"
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>

              <button
                onClick={applyDateRange}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                Apply
              </button>

              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  setDateRange({ startDate: today, endDate: today })
                  setTimeout(() => loadDashboardData(), 100)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Today
              </button>

              <button
                onClick={() => {
                  const today = new Date()
                  const nextWeek = new Date(today)
                  nextWeek.setDate(today.getDate() + 7)
                  setDateRange({
                    startDate: today.toISOString().split('T')[0],
                    endDate: nextWeek.toISOString().split('T')[0]
                  })
                  setTimeout(() => loadDashboardData(), 100)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Next 7 Days
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            solidIcon={CalendarSolidIcon}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend="+12% this month"
            trendUp={true}
          />
          <StatCard
            title="Revenue Generated"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            solidIcon={CurrencySolidIcon}
            color="text-green-600"
            bgColor="bg-green-100"
            trend="+8% this month"
            trendUp={true}
          />
          <StatCard
            title="Active Bookings"
            value={stats.confirmedBookings}
            solidIcon={CheckSolidIcon}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend="2 pending"
            trendUp={false}
          />

          {/* Booking Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Booking Status</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Confirmed</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.activeBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalBookings - stats.confirmedBookings - stats.activeBookings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Stats - New Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Rooms Card with dual metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Rooms</p>
              </div>
              <div className="relative bg-orange-100 rounded-full p-4">
                <BuildingOfficeIcon className="h-8 w-8 text-orange-600" />
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Room Types:</span>
                <span className="text-2xl font-bold text-gray-900">{stats.totalRoomTypes}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Total Rooms:</span>
                <span className="text-2xl font-bold text-gray-900">{stats.totalRooms}</span>
              </div>
            </div>
          </div>

          {/* Available Rooms Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800 mb-1">
                  {dateRange.startDate === dateRange.endDate 
                    ? `Available on ${new Date(dateRange.startDate).toLocaleDateString()}`
                    : 'Available in Range'}
                </p>
              </div>
              <div className="relative bg-emerald-200 rounded-full p-4">
                <CheckCircleIcon className="h-8 w-8 text-emerald-700" />
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-emerald-700">Room Types:</span>
                <span className="text-2xl font-bold text-emerald-900">{stats.availableRoomTypes}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-emerald-700">Rooms:</span>
                <span className="text-2xl font-bold text-emerald-900">{stats.availableRooms}</span>
              </div>
            </div>
          </div>

          {/* Occupancy Rate Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow-sm border border-indigo-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-800 mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-indigo-900 mb-2">
                  {stats.totalRooms > 0 
                    ? Math.round(((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100)
                    : 0}%
                </p>
                <div className="flex items-center text-sm text-indigo-700">
                  <span>{stats.totalRooms - stats.availableRooms} of {stats.totalRooms} occupied</span>
                </div>
              </div>
              <div className="relative bg-indigo-200 rounded-full p-4">
                <BuildingOfficeIcon className="h-8 w-8 text-indigo-700" />
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">System Status</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Website</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Booking</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Payment</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Today's Priority */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Today's Priority
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-blue-800">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Check new bookings</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-blue-800">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Review room availability</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-blue-800">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Respond to reviews</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-5 bg-blue-600 rounded-full mr-3"></div>
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link to="/admin/bookings" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage Bookings</span>
                </div>
                <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all rotate-90" />
              </Link>
              <Link to="/admin/rooms" className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">Room Management</span>
                </div>
                <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all rotate-90" />
              </Link>
              <Link to="/admin/reviews" className="flex items-center justify-between p-3 rounded-lg hover:bg-yellow-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <StarIcon className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-600">Guest Reviews</span>
                </div>
                <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all rotate-90" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 
