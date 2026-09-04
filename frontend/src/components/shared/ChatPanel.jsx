import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '../shared/UI'

/**
 * A 1:1 chat thread between one patient and one caregiver.
 * Works for both sides — pass in whichever ids/names apply.
 */
export default function ChatPanel({ patientId, caregiverId, currentUserId, otherPersonName }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!patientId || !caregiverId) return
    loadMessages()

    // Live updates: new messages from either side appear instantly.
    const channel = supabase
      .channel(`messages-${patientId}-${caregiverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          if (payload.new.caregiver_id === caregiverId) {
            setMessages((prev) => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [patientId, caregiverId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('patient_id', patientId)
      .eq('caregiver_id', caregiverId)
      .order('created_at', { ascending: true })

    if (error) console.error('Failed to load messages:', error.message)
    setMessages(data || [])
    setLoading(false)
  }

  async function sendMessage(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')

    const { error } = await supabase.from('messages').insert({
      patient_id: patientId,
      caregiver_id: caregiverId,
      sender_id: currentUserId,
      content,
    })
    if (error) console.error('Failed to send message:', error.message)
  }

  if (!patientId || !caregiverId) {
    return <p className="text-ink/50 text-sm">Select a conversation to start chatting.</p>
  }

  return (
    <div className="flex flex-col h-[500px]">
      <h3 className="font-semibold mb-3">Chat with {otherPersonName}</h3>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {loading && <p className="text-sm text-ink/40">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-ink/40">No messages yet — say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-paper text-ink rounded-bl-sm'
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1 ${isMine ? 'text-brand-100' : 'text-ink/40'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}