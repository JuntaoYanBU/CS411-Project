from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from openai import OpenAI
from pymongo.server_api import ServerApi
import lyricsgenius
import dotenv

dotenv.load_dotenv()
genius = lyricsgenius.Genius()
# Connection URI
uri = "mongodb+srv://ericx:lZR7vBM3jGDBq35y@cluster0.uganlcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['farm']
users_collection = db['users']

app = Flask(__name__)

try:
    uri = "mongodb+srv://ericx:lZR7vBM3jGDBq35y@cluster0.uganlcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri, server_api=ServerApi('1'))
except Exception as e:
    app.logger.error("Failed to connect to MongoDB: %s", str(e))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/db/addUser', methods=['POST'])
def add_user():
    # Extract data from the request's JSON body
    user_data = request.get_json()
    first_name = user_data.get('first_name')
    last_name = user_data.get('last_name')
    
    # Create a new user document
    user_document = {
        "first_name": first_name,
        "last_name": last_name
    }
    
    # Insert the new user document into the 'users' collection
    try:
        users_collection.insert_one(user_document)
        return jsonify({"status": "success", "message": "User added successfully!"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/lyricgenius/getLyrics', methods=['POST'])
def get_lyrics():
    song_data = request.get_json()
    song_name = song_data.get('song_name')
    artist_name = song_data.get('artist_name')

    if not song_name or not artist_name:
        return jsonify({"status": "error", "message": "Missing song name or artist name"}), 400

    try:
        song = genius.search_song(title=song_name, artist=artist_name)
        lyrics = song.lyrics

        # Clean up the lyrics
        # Split the lyrics into lines
        lines = lyrics.split("\n")

        # Remove empty lines and metadata lines
        cleaned_lines = []
        for i, line in enumerate(lines):
            if i == len(lines) - 1:
                # If it's the last line, remove "You might also like" and "Embed" if present
                if "You might also like" in line:
                    line = line.split("You might also like")[0].strip()
                if "Embed" in line:
                    # Remove numbers immediately before "Embed" without any spaces
                    line = line.split("Embed")[0].strip().rstrip("0123456789")
            if " Lyrics" in line:
                # If " Lyrics" is present in the line, show only the part after " Lyrics"
                line = line.split(" Lyrics", 1)[1].strip()
            cleaned_lines.append(line)

        # Join the cleaned lines back into a single string
        cleaned_lyrics = "\n".join(cleaned_lines)

        artist = song.artist
        title = song.title
        return jsonify({"status": "success", "lyrics": cleaned_lyrics, "artist": artist, "title": title})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/openai/remixLyrics', methods=['POST'])
def remix_lyrics():
    data = request.get_json()
    lyrics = data.get('lyrics')
    newGenre = data.get('new_genre')
    try:
        client = OpenAI()
        prompt = "Change the lyrics of this song into a " + newGenre + " song, return only the new lyrics: " + lyrics

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a musical assistant, skilled in writing lyrics with creative flair."},
                {"role": "user", "content": prompt}
            ]
        )
        return jsonify({"status": "success", "remixed_lyrics": completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/db/storeLyrics', methods=['POST'])
def store_lyrics():
    data = request.get_json()
    songName = data.get('song_name')
    artistName = data.get('artist_name')
    newGenre = data.get('new_genre')
    remixedLyrics = data.get('remixed_lyrics')

    # Check if all required data is present
    if not (songName and artistName and newGenre and remixedLyrics):
        return jsonify({"status": "error", "message": "Missing required song data"}), 400

    try:
        db = client['farm']
        collection = db['remixed_songs']
        song_document = {
            "song_name": songName,
            "artist_name": artistName,
            "remix_genre": newGenre,
            "remixed_lyrics": remixedLyrics
        }
        collection.insert_one(song_document)
        return jsonify({"status": "success", "message": "Song added successfully!"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": "An error occured while adding the song"}), 400

@app.route('/db/getRemix', methods=['GET'])
def get_remix():
    # Retrieve query parameters
    songName = request.args.get('song_name')
    artistName = request.args.get('artist_name')
    newGenre = request.args.get('new_genre')

    # Check if all required data is present
    if not (songName and artistName and newGenre):
        return jsonify({"status": "error", "message": "Missing required song data"}), 400
    
    try:
        db = client['farm']
        collection = db['remixed_songs']
        
        # Querying the document
        song_document = collection.find_one({
            "song_name": songName,
            "artist_name": artistName,
            "remix_genre": newGenre
        })

        # Check if a document was found
        if song_document:
            # Return only the remixed_lyrics field
            return jsonify({
                "status": "success",
                "found": True,
                "remixed_lyrics": song_document.get('remixed_lyrics')
            })
        else:
            return jsonify({"status": "error",
                            "found": False,
                            "message": "No matching document found"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

    
