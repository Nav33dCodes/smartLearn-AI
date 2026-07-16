import { useState } from 'react'
import api from '../api/client'

function ChatPanel({ document: doc }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [citations, setCitations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmed = question.trim()
    if (!trimmed) {
      setError('Please enter a question.')
      return
    }

    setError(null)
    setAnswer(null)
    setCitations(null)
    setLoading(true)

    try {
      const response = await api.post('/ask', {
        document_id: doc.document_id,
        question: trimmed,
      })
      setAnswer(response.data.answer)
      setCitations(response.data.citations)
      setQuestion('')
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = err.message
      setError(detail || message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Chat with your PDF</h2>

      {doc ? (
        <p>
          <strong>{doc.filename}</strong> ({doc.page_count} pages)
        </p>
      ) : (
        <p>Upload a PDF to start asking questions.</p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Your question</label>
        <textarea
          id="question"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading || !doc}
          placeholder={
            doc ? 'Ask something about the document…' : 'Upload a PDF first'
          }
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading || !doc}>
          {loading ? 'Asking…' : 'Ask'}
        </button>
      </form>

      {answer && (
        <div role="region" aria-label="Answer">
          <h3>Answer</h3>
          <p>{answer}</p>
          {citations && citations.length > 0 && (
            <p>Cited pages: {citations.join(', ')}</p>
          )}
        </div>
      )}
    </section>
  )
}

export default ChatPanel
