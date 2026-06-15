# 1. Use a lightweight Python base image instead of the massive official Playwright image
FROM python:3.11-slim

# 2. Set environment variables for production Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set the working directory
WORKDIR /app

# 4. Install base utilities needed by Playwright's dependency installer
RUN apt-get update && apt-get install -y curl gnupg && rm -rf /var/lib/apt/lists/*

# 5. Copy requirements first to leverage Docker layer caching
COPY requirements.txt .

# 6. Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 7. Install ONLY Chromium and its specific OS dependencies (Saves ~1GB vs installing all browsers)
RUN playwright install --with-deps chromium

# 8. Copy the rest of your application code
COPY . .

# 9. Security Best Practice: Create a non-root user to run the app
RUN useradd -m smartlearn && chown -R smartlearn /app
USER smartlearn

# 10. Expose port (Railway will override dynamically)
EXPOSE 8000

# 11. Boot the server using the shell form to evaluate the $PORT variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
