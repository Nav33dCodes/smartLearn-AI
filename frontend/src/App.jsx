import { useState } from 'react'
import PdfUploader from './components/PdfUploader'
import ChatPanel from './components/ChatPanel'

function App() {
  const [document, setDocument] = useState(null)

  return (
    <>
      <h1>SmartLearn Lite</h1>
      <p>Upload a PDF (under 30 pages) and ask questions about its content.</p>

      <PdfUploader onUploaded={setDocument} />

      {document ? (
        <ChatPanel document={document} />
      ) : (
        <p>Upload a PDF above to unlock the question box.</p>
      )}
    </>
  )
}

export default App
