import os                          # Built-in Python module for reading environment variables
from dotenv import load_dotenv     # Loads environment variables from the .env file
import openai                      # Official OpenAI SDK for calling AI models

load_dotenv()                      # Read the API Key from the .env file

client = openai.OpenAI(            # Create a "client" object
    base_url="https://openrouter.ai/api/v1",   # Point it at OpenRouter
    api_key=os.getenv("OPENROUTER_API_KEY"),    # Read the Key from .env
)

response = client.chat.completions.create(      # Send the request to the AI
    model="tencent/hy3:free",        # Which model to use
    messages=[                                   # The conversation content
        {"role": "user", "content": "What is Python in 2 sentences?"}
    ],
)

print(response.choices[0].message.content)      # Extract and print the AI's answer