# ============================================================
# cli_qa.py - CLI Q&A Tool with Paragraph Citations
# ============================================================
# This script lets the user paste a passage of text, ask a question,
# and calls an LLM to generate an answer with paragraph citations.
# ============================================================

import os                          # OS utilities (used here to read environment variables)
from openai import OpenAI          # OpenAI SDK, used to call the LLM API
from dotenv import load_dotenv     # Load environment variables from the .env file

# ---- Load environment variables ----
# load_dotenv() reads the .env file in the current directory
# and sets its key-value pairs as environment variables.
# This keeps the API key out of the source code.
load_dotenv()


def read_text():
    """
    Step 1: Read multi-line text from the user.
    The user types or pastes text line by line, then types END to finish.
    Returns: one complete string (all lines joined with newlines).
    """
    print("请粘贴文本（输入 END 结束）：")
    lines = []                     # Collect each line in a list
    while True:                    # Loop until we hit break
        line = input()             # Read one line of user input
        if line.strip() == "END":  # Compare after .strip() removes surrounding whitespace
            break                  # Exit the loop
        lines.append(line)         # Otherwise add the line to the list
    return "\n".join(lines)        # Join all lines into one string with newlines


def split_paragraphs(text):
    """
    Step 2: Split the text into paragraphs by blank lines.
    Two consecutive newline characters (\n\n) mark a paragraph boundary.
    Returns: a list where each element is one paragraph's text.
    """
    # split("\n\n") splits on double newlines
    # strip() removes surrounding whitespace from each paragraph
    # if p.strip() filters out empty paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    return paragraphs


def number_paragraphs(paragraphs):
    """
    Step 3: Add a number to each paragraph.
    Input: ['text of paragraph A', 'text of paragraph B', ...]
    Output: one formatted string, with [Paragraph 1] etc. before each paragraph.
    """
    numbered = []
    for i, para in enumerate(paragraphs, 1):   # enumerate starts numbering at 1
        numbered.append(f"[Paragraph {i}]\n{para}")
    return "\n\n".join(numbered)   # Separate paragraphs with a blank line


def ask_question(numbered_text, question):
    """
    Steps 5 + 6: Build the prompt and call the LLM API.
    - numbered_text: the numbered reference text
    - question: the user's question
    Returns: the LLM's answer (a string).
    """
    # ---- Create the API client ----
    # Use the OpenAI SDK, but point base_url at OpenRouter.
    # This lets us call many different models through OpenRouter.
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY"),  # Read the API key from environment variables
    )

    # ---- system prompt ----
    # The role instruction for the LLM: how it should answer
    system_prompt = (
        "You are a helpful assistant. "
        "Answer the user's question based ONLY on the provided text. "
        "Cite your sources by referencing [Paragraph X] where X is the paragraph number. "
        "If the answer is not in the text, say so."
    )

    # ---- user prompt ----
    # Combine the numbered text and the user's question into one message
    user_prompt = f"""Here is the text:

{numbered_text}

Question: {question}"""

    # ---- Call the API ----
    response = client.chat.completions.create(
        model="tencent/hy3:free",  # Use the free model
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    # response.choices[0].message.content is the text returned by the LLM
    return response.choices[0].message.content


def main():
    """
    Main function: tie all the steps together.
    """
    # Step 1: read the text
    text = read_text()

    # Step 2: split into paragraphs
    paragraphs = split_paragraphs(text)
    print(f"\n检测到 {len(paragraphs)} 个段落。\n")

    # Step 3: number the paragraphs
    numbered_text = number_paragraphs(paragraphs)

    # Step 4: read the question
    question = input("请输入你的问题：")

    # Steps 5 + 6: call the LLM
    print("\n正在思考...\n")
    answer = ask_question(numbered_text, question)

    # Step 7: print the answer
    print("回答：")
    print(answer)


# ---- Entry point ----
# Run main() only when this file is executed directly (rather than imported by another file)
if __name__ == "__main__":
    main()