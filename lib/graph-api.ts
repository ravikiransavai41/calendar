import { Client } from "@microsoft/microsoft-graph-client"
import { getTokenSilently } from "./auth"

// Create an authentication provider for Microsoft Graph
const getAuthenticatedClient = async () => {
  // Get the access token
  const accessToken = await getTokenSilently()

  // Initialize the Graph client
  const graphClient = Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })

  return graphClient
}

// Get calendar events from Microsoft Graph
export const getCalendarEvents = async (startDateTime: string, endDateTime: string) => {
  try {
    const client = await getAuthenticatedClient()

    // Query for calendar events
    const events = await client
      .api("/me/calendarView")
      .query({
        startDateTime,
        endDateTime,
        $select: "subject,organizer,start,end,location,attendees,bodyPreview,onlineMeetingUrl,isOnlineMeeting",
        $orderby: "start/dateTime",
        $top: 100,
      })
      .get()

    return events.value
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    throw error
  }
}

// Create a new Teams meeting
export const createTeamsMeeting = async (meetingDetails: {
  subject: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  location?: { displayName: string }
  attendees?: { emailAddress: { address: string; name?: string } }[]
  body?: { contentType: string; content: string }
  isOnlineMeeting: boolean
}) => {
  try {
    const client = await getAuthenticatedClient()

    // Create the event with online meeting
    const event = await client.api("/me/events").post({
      ...meetingDetails,
      onlineMeetingProvider: "teamsForBusiness",
    })

    return event
  } catch (error) {
    console.error("Error creating Teams meeting:", error)
    throw error
  }
}

// Get available calendars
export const getCalendars = async () => {
  try {
    const client = await getAuthenticatedClient()

    const calendars = await client.api("/me/calendars").get()

    return calendars.value
  } catch (error) {
    console.error("Error fetching calendars:", error)
    throw error
  }
}

// Format Graph API events to match our app's event format
interface GraphEvent {
  id: string
  subject: string
  start: {
    dateTime: string
  }
  end: {
    dateTime: string
  }
  body?: {
    content: string
  }
  location?: {
    displayName: string
  }
  attendees?: Array<{
    emailAddress: {
      name: string
    }
  }>
  organizer?: {
    emailAddress: {
      name: string
    }
  }
  onlineMeeting?: {
    joinUrl: string
  }
}

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  description: string
  location: string
  attendees: string[]
  organizer: string
  start: {
    dateTime: string
  }
  end: {
    dateTime: string
  }
  isTeamsMeeting?: boolean
  meetingUrl?: string
}

export function formatGraphEvents(graphEvents: GraphEvent[]): CalendarEvent[] {
  // Simplify to just use blue for all meetings
  const defaultColor = 'bg-blue-500'

  const formattedEvents: CalendarEvent[] = []

  graphEvents.forEach(event => {
    const startTime = new Date(event.start.dateTime)
    const endTime = new Date(event.end.dateTime)

    formattedEvents.push({
      id: event.id,
      title: event.subject,
      startTime: startTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      }),
      endTime: endTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      }),
      color: defaultColor,  // Use blue for all meetings
      description: event.body?.content || '',
      location: event.location?.displayName || '',
      attendees: event.attendees?.map(a => a.emailAddress.name) || [],
      organizer: event.organizer?.emailAddress.name || '',
      start: event.start,
      end: event.end,
      isTeamsMeeting: event.onlineMeeting?.joinUrl !== undefined,
      meetingUrl: event.onlineMeeting?.joinUrl
    })
  })

  return formattedEvents
}

