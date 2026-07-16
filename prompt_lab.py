import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize the OpenAI client
# This uses the OpenAI API; any other OpenAI-compatible API works as well
client = OpenAI(            # Create a "client" object
    base_url="https://openrouter.ai/api/v1",   # Point it at OpenRouter
    api_key=os.getenv("OPENROUTER_API_KEY"),    # Read the Key from .env
)

def ask(prompt: str) -> str:
    """Send one prompt to the AI and return the answer text."""
    response = client.chat.completions.create(
        model="tencent/hy3:free",  # gpt-4o-mini is fast and inexpensive
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
    )
    return response.choices[0].message.content


# ============================================================
#  Three levels of prompts — topic: Python Lists
# ============================================================

# Level A: Vague Prompt
# TODO: write a vague question about Python lists
prompt_a = "Explain Python lists"  # <-- fill in the prompt here

# Level B: Structured Prompt (add a role + constraint)
# TODO: write a prompt with a role and a constraint
prompt_b = "You are a Python tutor for beginners. Explain Python lists in under 100 words."  # <-- fill in the prompt here

# Level C: Precise Prompt (role + constraint + output format)
# TODO: write a prompt with a role, a constraint, and an output format
prompt_c = """You are a Python tutor for beginners. Explain Python lists.
Format:
1) One-sentence definition
2) Three common operations with code examples
3) One common mistake to avoid"""  # <-- fill in the prompt here


# ============================================================
#  Run the experiment and print the results
# ============================================================
if __name__ == "__main__":
    prompts = {
        "Level A (Vague)": prompt_a,
        "Level B (Structured)": prompt_b,
        "Level C (Precise)": prompt_c,
    }

    for level, prompt in prompts.items():
        if not prompt:
            print(f"\n{'='*60}")
            print(f"  {level}: (empty -- fill in the TODO above!)")
            print(f"{'='*60}")
            continue

        print(f"\n{'='*60}")
        print(f"  {level}")
        print(f"  Prompt: {prompt[:80]}{'...' if len(prompt) > 80 else ''}")
        print(f"{'='*60}")
        answer = ask(prompt)
        print(answer)