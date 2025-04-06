"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, Users, Video } from "lucide-react"
import { createTeamsMeeting } from "@/lib/graph-api"

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newEvent: any) => void
}

export default function CreateMeetingModal({ isOpen, onClose, onSuccess }: CreateMeetingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    subject: "",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endDate: new Date().toISOString().split("T")[0],
    endTime: "10:00",
    location: "",
    attendees: "",
    description: "",
    isTeamsMeeting: true,
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Format attendees
      const attendeesList = formData.attendees
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email)
        .map((email) => ({
          emailAddress: {
            address: email,
          },
          type: "required",
        }))

      // Create meeting details object
      const meetingDetails = {
        subject: formData.subject,
        start: {
          dateTime: `${formData.startDate}T${formData.startTime}:00`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: `${formData.endDate}T${formData.endTime}:00`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: {
          displayName: formData.location,
        },
        attendees: attendeesList,
        body: {
          contentType: "text",
          content: formData.description,
        },
        isOnlineMeeting: formData.isTeamsMeeting,
      }

      // Create the meeting
      const newMeeting = await createTeamsMeeting(meetingDetails)

      // Call the success callback with the new meeting
      onSuccess(newMeeting)

      // Close the modal
      onClose()
    } catch (err) {
      console.error("Error creating meeting:", err)
      setError("Failed to create meeting. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Meeting</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-white text-sm mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter meeting title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-white text-sm mb-1">
                <Calendar className="inline-block h-4 w-4 mr-1" /> Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-white text-sm mb-1">
                <Clock className="inline-block h-4 w-4 mr-1" /> Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-white text-sm mb-1">
                <Calendar className="inline-block h-4 w-4 mr-1" /> End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-white text-sm mb-1">
                <Clock className="inline-block h-4 w-4 mr-1" /> End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-white text-sm mb-1">
              <MapPin className="inline-block h-4 w-4 mr-1" /> Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label htmlFor="attendees" className="block text-white text-sm mb-1">
              <Users className="inline-block h-4 w-4 mr-1" /> Attendees (comma separated)
            </label>
            <input
              type="text"
              id="attendees"
              name="attendees"
              value={formData.attendees}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="email1@example.com, email2@example.com"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-white text-sm mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter meeting description"
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTeamsMeeting"
              name="isTeamsMeeting"
              checked={formData.isTeamsMeeting}
              onChange={handleChange}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/50"
            />
            <label htmlFor="isTeamsMeeting" className="ml-2 text-white text-sm">
              <Video className="inline-block h-4 w-4 mr-1" /> Create as Microsoft Teams meeting
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-70"
            >
              {isLoading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

