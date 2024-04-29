from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import lyricsgenius
from openai import OpenAI
import dotenv

dotenv.load_dotenv()

# token = "xETlSxv5I6pzofoa_10dXNAn576-3rePdnE4lM0O4aPHhYqYTnud8Hr0x14LcY_B"
genius = lyricsgenius.Genius()

song = genius.search_song("Country Roads")

print(song.artist)
print(song.title)

client = OpenAI()

genre = input("Enter a music genre: ")
prompt = "Change the lyrics of this song into a " + genre + " song, return only the new lyrics: " + song.lyrics

completion = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are a musical assistant, skilled in writing lyrics with creative flair."},
    {"role": "user", "content": prompt}
  ]
)

print(completion.choices[0].message.content)