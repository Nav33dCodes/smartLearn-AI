import { useState } from 'react'
import api from '../api/client'

function PdfUploader({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    setFile(selected || null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a PDF file.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload', formData)
      onUploaded(response.data)
      setFile(null)
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = err.message
      setError(detail || message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="pdf-file">PDF file</label>
      <input
        id="pdf-file"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        disabled={loading}
      />
      {file && <p>Selected: {file.name}</p>}

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading || !file}>
        {loading ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  )
}

export default PdfUploader
