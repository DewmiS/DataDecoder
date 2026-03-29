import requests
import os
from dotenv import load_dotenv

load_dotenv()


def call_ai(prompt):

    api_key = os.getenv("OPENROUTER_API_KEY")

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemma-3-12b-it:free",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
    )

    result = response.json()

    if "choices" in result:
        return result["choices"][0]["message"]["content"]

    return "AI unavailable"