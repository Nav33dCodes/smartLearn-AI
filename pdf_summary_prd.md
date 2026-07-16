# PDF Summary Tool — Mini PRD

## Goal
A CLI tool that reads a PDF file and prints a structured summary.

## Usage
```
python pdf_summary.py <path-to-pdf>
```

## Requirements
1. Accept a PDF file path as a command-line argument
2. Extract text from the PDF
3. Send extracted text to an LLM via API
4. Print a readable summary that includes page references

## Tech Constraints
- Use `python-dotenv` to load API keys from `.env`
- Use `openai` SDK with OpenRouter as the base URL
- PDF library: (let AI decide the best option)

## Done When
- Running the command on any PDF prints a readable summary to the terminal
