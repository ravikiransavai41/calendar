"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
  LogOut,
  Video,
  ExternalLink,
} from "lucide-react"
import AuthModal from "@/components/auth-modal"
import CreateMeetingModal from "@/components/create-meeting-modal"
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth"
import { getCalendarEvents, formatGraphEvents } from "@/lib/graph-api"

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  day?: number
  description: string
  location: string
  attendees: string[]
  organizer: string
  start?: {
    dateTime: string
  }
  end?: {
    dateTime: string
  }
  isTeamsMeeting?: boolean
  meetingUrl?: string
  groupSize?: number
  positionInGroup?: number
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [graphEvents, setGraphEvents] = useState<CalendarEvent[]>([])
  const [currentView, setCurrentView] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const filteredEvents = graphEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    setIsLoaded(true)

    // Check if user is already authenticated
    const checkAuth = () => {
      const authStatus = isAuthenticated()
      setIsUserAuthenticated(authStatus)

      if (authStatus) {
        setCurrentUser(getCurrentUser())
      }
    }

    // Only check auth on client side
    if (typeof window !== "undefined") {
      checkAuth()
    }

    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "Looks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  // Fetch calendar events when authenticated
  useEffect(() => {
    if (isUserAuthenticated) {
      fetchCalendarEvents()
    }
  }, [isUserAuthenticated])

  // Function to get date range for current view
  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    
    if (currentView === 'day') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (currentView === 'week') {
      start.setDate(start.getDate() - start.getDay()) // Start of week
      end.setDate(end.getDate() - end.getDay() + 6) // End of week
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (currentView === 'month') {
      start.setDate(1) // Start of month
      end.setMonth(end.getMonth() + 1)
      end.setDate(0) // End of month
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }
    
    return { start, end }
  }

  // Function to handle view changes
  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    setCurrentView(view)
    fetchCalendarEvents()
  }

  // Function to handle date changes
  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
    setSelectedDate(date)
    fetchCalendarEvents()
  }

  // Function to handle Today button click
  const handleTodayClick = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    fetchCalendarEvents()
  }

  // Function to fetch calendar events
  const fetchCalendarEvents = async () => {
    if (!isUserAuthenticated) return
    
    setIsLoadingEvents(true)
    try {
      const { start, end } = getDateRange()
      const events = await getCalendarEvents(
        start.toISOString(),
        end.toISOString()
      )
      setGraphEvents(formatGraphEvents(events))
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Update events when view or date changes
  useEffect(() => {
    fetchCalendarEvents()
  }, [currentView, currentDate, isUserAuthenticated])

  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleAuthSuccess = () => {
    setIsUserAuthenticated(true)
    setCurrentUser(getCurrentUser())
    setIsAuthModalOpen(false)
    fetchCalendarEvents()
  }

  const handleLogout = async () => {
    await logout()
    setIsUserAuthenticated(false)
    setCurrentUser(null)
    setGraphEvents([])
  }

  const handleCreateMeeting = () => {
    if (isUserAuthenticated) {
      setIsCreateModalOpen(true)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleMeetingCreated = (newMeeting: any) => {
    // Refresh calendar events after creating a new meeting
    fetchCalendarEvents()
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  // Remove the events array and use only graphEvents
  const allEvents = graphEvents

  // Sample calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Update the calculateEventStyle function
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    const startHour = start.getUTCHours()
    const startMinute = start.getUTCMinutes()
    const endHour = end.getUTCHours()
    const endMinute = end.getUTCMinutes()
    
    const startPosition = (startHour * 60 + startMinute) / 60 * 20
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60 * 20
    
    return {
      top: `${startPosition}px`,
      height: `${Math.max(height, 40)}px`, // Ensure minimum height for readability
    }
  }

  // Function to format time consistently
  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Sample calendar for mini calendar
  const daysInMonth = 31
  const firstDayOffset = 5 // Friday is the first day of the month in this example
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  // Sample my calendars
  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically also control the actual audio playback
  }

  // Function to group overlapping events
  const groupOverlappingEvents = (events: CalendarEvent[]) => {
    if (!events.length) return []
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = new Date(a.start?.dateTime || '').getTime()
      const bStart = new Date(b.start?.dateTime || '').getTime()
      return aStart - bStart
    })

    const groups: CalendarEvent[][] = []
    let currentGroup: CalendarEvent[] = []
    let lastEndTime = 0

    sortedEvents.forEach((event) => {
      const startTime = new Date(event.start?.dateTime || '').getTime()
      
      if (startTime >= lastEndTime) {
        // If this event starts after the last group ends, start a new group
        if (currentGroup.length > 0) {
          groups.push([...currentGroup])
        }
        currentGroup = [event]
      } else {
        // Add to current group if overlapping
        currentGroup.push(event)
      }
      
      // Update lastEndTime if this event ends later
      const endTime = new Date(event.end?.dateTime || '').getTime()
      lastEndTime = Math.max(lastEndTime, endTime)
    })

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  // Function to calculate event position and width
  const calculateEventPosition = (event: CalendarEvent, group: CalendarEvent[]) => {
    const startTime = new Date(event.start?.dateTime || '')
    const endTime = new Date(event.end?.dateTime || '')
    
    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const endHour = endTime.getHours()
    const endMinute = endTime.getMinutes()
    
    const startPosition = (startHour + startMinute / 60) * 64
    const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 60
    const height = duration * 64
    
    // Find overlapping events in the same time slot
    const overlappingEvents = group.filter(e => {
      const eStart = new Date(e.start?.dateTime || '')
      const eEnd = new Date(e.end?.dateTime || '')
      return (startTime < eEnd && endTime > eStart)
    })
    
    const position = overlappingEvents.indexOf(event)
    const total = overlappingEvents.length
    
    // Calculate width and left position to prevent overlap
    const width = total > 1 ? `${95 / total}%` : '95%'
    const left = total > 1 ? `${(95 / total) * position + 2.5}%` : '2.5%'
    
    return {
      top: startPosition,
      height,
      width,
      left
    }
  }

  // Add settings modal component
  const SettingsModal = () => {
    if (!isSettingsOpen) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-96 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button onClick={() => setIsSettingsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Calendar Settings</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                  <span>Show weekends</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                  <span>24-hour format</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Notifications</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                  <span>Meeting reminders</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                  <span>Email notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
          {isUserAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                {currentUser?.name?.charAt(0) || currentUser?.username?.charAt(0) || "U"}
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/10 text-white" title="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
            >
              Sign in
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
              onClick={handleCreateMeeting}
            >
              <Plus className="h-5 w-5" />
              <span>Create Meeting</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">
                  {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                  <button 
                    className="p-1 rounded-full hover:bg-white/20"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      handleDateChange(newDate)
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button 
                    className="p-1 rounded-full hover:bg-white/20"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      handleDateChange(newDate)
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {Array.from({ length: 42 }).map((_, i) => {
                  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                  const date = new Date(firstDayOfMonth)
                  date.setDate(date.getDate() - date.getDay() + i)
                  
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        handleDateChange(date)
                        handleViewChange('day')
                      }}
                      className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer ${
                        date.toDateString() === currentDate.toDateString() ? "bg-blue-500 text-white" : 
                        date.getMonth() === currentDate.getMonth() ? "text-white hover:bg-white/20" : 
                        "text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
                {isUserAuthenticated && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                    <span className="text-white text-sm">Microsoft Calendar</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New position for the big plus button */}
          <button
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start"
            onClick={handleCreateMeeting}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button
                onClick={handleTodayClick}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Today
              </button>
              <div className="flex">
                <button 
                  className="p-2 text-white hover:bg-white/10 rounded-l-md"
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    if (currentView === 'day') newDate.setDate(newDate.getDate() - 1)
                    else if (currentView === 'week') newDate.setDate(newDate.getDate() - 7)
                    else newDate.setMonth(newDate.getMonth() - 1)
                    handleDateChange(newDate)
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 text-white hover:bg-white/10 rounded-r-md"
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    if (currentView === 'day') newDate.setDate(newDate.getDate() + 1)
                    else if (currentView === 'week') newDate.setDate(newDate.getDate() + 7)
                    else newDate.setMonth(newDate.getMonth() + 1)
                    handleDateChange(newDate)
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">
                {currentView === 'day' && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {currentView === 'week' && `${new Date(currentDate.getTime() - currentDate.getDay() * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(currentDate.getTime() + (6 - currentDate.getDay()) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                {currentView === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('day')}
                className={`px-4 py-1.5 rounded-md ${currentView === 'day' ? 'bg-blue-500' : 'hover:bg-white/10'}`}
              >
                Day
              </button>
              <button
                onClick={() => handleViewChange('week')}
                className={`px-4 py-1.5 rounded-md ${currentView === 'week' ? 'bg-blue-500' : 'hover:bg-white/10'}`}
              >
                Week
              </button>
              <button
                onClick={() => handleViewChange('month')}
                className={`px-4 py-1.5 rounded-md ${currentView === 'month' ? 'bg-blue-500' : 'hover:bg-white/10'}`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Month view header */}
          {currentView === "month" && (
            <div className="grid grid-cols-7 border-b border-white/20 bg-white/5">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center py-3 text-white/70 font-medium">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Calendar view content */}
          <div className="flex-1 overflow-auto p-4">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white">Loading calendar events...</div>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
                {currentView === "month" && (
                  <div className="grid grid-cols-7 gap-1 p-2">
                    {Array.from({ length: 42 }).map((_, day) => {
                      // Use currentDate instead of new Date() to get selected month
                      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                      const date = new Date(firstDayOfMonth)
                      date.setDate(date.getDate() - date.getDay() + day)
                      
                      const dayEvents = filteredEvents.filter(event => {
                        if (!event.start?.dateTime) return false
                        const eventDate = new Date(event.start.dateTime)
                        return eventDate.getDate() === date.getDate() &&
                               eventDate.getMonth() === date.getMonth() &&
                               eventDate.getFullYear() === date.getFullYear()
                      })
                      
                      return (
                        <div
                          key={day}
                          onClick={() => {
                            handleDateChange(date)
                            handleViewChange('day') // Switch to day view when clicking a date
                          }}
                          className={`p-2 min-h-[100px] border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 ${
                            date.getMonth() !== currentDate.getMonth() ? 'bg-white/10' : ''
                          } ${
                            date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-white mb-2">
                            {date.getDate()}
                          </div>
                          {dayEvents.map(event => {
                            const startTime = new Date(event.start?.dateTime || '')
                            const formattedTime = startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                            return (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventClick(event)
                                }}
                                className={`${event.color} p-1.5 mb-1 rounded-md cursor-pointer hover:translate-y-[-2px] transition-transform ${event.isTeamsMeeting ? "border-l-4 border-white" : ""}`}
                              >
                                <div className="text-xs font-medium text-white truncate">{event.title}</div>
                                <div className="text-[10px] text-white truncate">{formattedTime}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}
                {currentView === "day" && (
                  <div className="grid grid-cols-1">
                    {/* Time Labels */}
                    <div className="text-white/70">
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div key={hour} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                      ))}
                    </div>
                    {/* Events Column */}
                    <div className="border-l border-white/20 relative">
                      {Array.from({ length: 24 }).map((_, timeIndex) => (
                        <div key={timeIndex} className="h-20 border-b border-white/10"></div>
                      ))}
                      {groupOverlappingEvents(filteredEvents
                        .filter((event) => {
                          const eventDate = new Date(event.start?.dateTime || '')
                          return eventDate.getDate() === currentDate.getDate() &&
                                 eventDate.getMonth() === currentDate.getMonth() &&
                                 eventDate.getFullYear() === currentDate.getFullYear()
                        }))
                        .map((group) => 
                          group.map((event) => {
                            const position = calculateEventPosition(event, group)
                            
                            return (
                              <div
                                key={event.id}
                                className={`absolute ${event.color} rounded-lg p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg ${event.isTeamsMeeting ? "border-l-4 border-white" : ""}`}
                                style={{
                                  top: `${position.top}px`,
                                  height: `${Math.max(position.height, 40)}px`,
                                  width: position.width,
                                  left: position.left,
                                }}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className="font-medium flex items-center gap-1 truncate">
                                  {event.isTeamsMeeting && <Video className="h-3 w-3 flex-shrink-0" />}
                                  <span className="truncate">{event.title}</span>
                                </div>
                                <div className="text-[10px] mt-1 truncate">
                                  {formatTime(event.start?.dateTime || '')} - {formatTime(event.end?.dateTime || '')}
                                </div>
                              </div>
                            )
                          })
                        )}
                    </div>
                  </div>
                )}
                {currentView === "week" && (
                  <div className="grid grid-cols-8 h-full">
                    {/* Header with days */}
                    <div className="col-span-8 grid grid-cols-8 border-b border-white/20 bg-white/5">
                      <div className="p-4"></div> {/* Empty cell for time column */}
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const firstDayOfWeek = new Date(currentDate)
                        firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + dayIndex)
                        
                        return (
                          <div key={dayIndex} className="p-4 text-center border-l border-white/20">
                            <div className="text-xs text-white/70 font-medium mb-1">
                              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex]}
                            </div>
                            <div className="text-lg text-white font-medium">
                              {firstDayOfWeek.getDate()}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Time Labels */}
                    <div className="text-white/70">
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div key={hour} className="h-16 border-b border-white/10 pr-2 text-right text-xs flex items-start pt-1">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                      ))}
                    </div>

                    {/* Days Columns */}
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const currentDate = new Date()
                      const firstDayOfWeek = new Date(currentDate)
                      firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + dayIndex)
                      
                      return (
                        <div key={dayIndex} className="border-l border-white/20 relative">
                          {Array.from({ length: 24 }).map((_, timeIndex) => (
                            <div key={timeIndex} className="h-16 border-b border-white/10"></div>
                          ))}
                          {groupOverlappingEvents(filteredEvents
                            .filter((event) => {
                              const eventDate = new Date(event.start?.dateTime || '')
                              return eventDate.getDate() === firstDayOfWeek.getDate() &&
                                     eventDate.getMonth() === firstDayOfWeek.getMonth() &&
                                     eventDate.getFullYear() === firstDayOfWeek.getFullYear()
                            }))
                            .map((group) => 
                              group.map((event) => {
                                const position = calculateEventPosition(event, group)
                                
                                return (
                                  <div
                                    key={event.id}
                                    className={`absolute ${event.color} rounded-lg p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg ${event.isTeamsMeeting ? "border-l-4 border-white" : ""}`}
                                    style={{
                                      top: `${position.top}px`,
                                      height: `${Math.max(position.height, 40)}px`,
                                      width: `calc(${position.width} - 4px)`,
                                      left: `calc(${position.left} + 2px)`,
                                    }}
                                    onClick={() => handleEventClick(event)}
                                  >
                                    <div className="font-medium flex items-center gap-1 truncate">
                                      {event.isTeamsMeeting && <Video className="h-3 w-3 flex-shrink-0" />}
                                      <span className="truncate">{event.title}</span>
                                    </div>
                                    <div className="text-[10px] mt-1 truncate">
                                      {formatTime(event.start?.dateTime || '')} - {formatTime(event.end?.dateTime || '')}
                                    </div>
                                  </div>
                                )
                              })
                            )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                  {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.attendees.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {selectedEvent.attendees.join(", ")}
                  </div>
                )}
                {selectedEvent.description && (
                  <div className="text-sm text-gray-600">
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
                {selectedEvent.isTeamsMeeting && selectedEvent.meetingUrl && (
                    <a
                      href={selectedEvent.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                    <Video className="h-4 w-4 mr-2" />
                    Join Teams Meeting
                    </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />

        {/* Create Meeting Modal */}
        <CreateMeetingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleMeetingCreated}
        />

        {/* Add settings modal */}
        <SettingsModal />
      </main>
    </div>
  )
}

