## Day 2 Implementation Boundary

### Done When

1. `POST /upload` accepts one PDF only.
2. The server extracts a list shaped like `[{"page": 1, "text": "..."}]`.
3. The response includes a `document_id`, file name, page count, and non-empty page count.
4. `POST /ask` accepts `document_id` and `question`.
5. The answer is grounded only in uploaded text and contains `[Page X]` citations.
6. A missing document, wrong file type, empty PDF, or oversized PDF produces a useful error.


### Not Building Today

- no OCR for scanned PDFs;
- no RAG or embeddings;
- no database or login;
- no multiple users;
- no permanent storage guarantee;
- no more than 30 pages.


UploadFile
  → validate PDF name
  → create document ID
  → save safe local filename
  → extract page records
  → store document metadata
  → return small JSON response