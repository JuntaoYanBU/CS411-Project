# The Lyrics Remixer

The Lyrics Remixer is a web application that allows users to enter a song name, artist name, and a new genre, and it remixes the lyrics of the song into the specified genre using OpenAI's language model. The remixed lyrics are then stored in a MongoDB database for future retrieval.

## Prerequisites
Before running the application, make sure you have the following:

- Python 3.x installed
- MongoDB Atlas account with a valid connection URI
- OpenAI API key
- LyricsGenius API key

## Installation & Run
1. Open the terminal, clone the repository:
git clone https://github.com/JuntaoYanBU/CS411-Project.git

2. Install the required dependencies:
- pip install flask
- pip install pymongo
- pip install openai
- pip install lyricsgenius
- pip install python-dotenv

3. Navigate to your local repository directory, go to main branch, create a `.env` file there, containing the necessary environment variables as follow:
- OPENAI_API_KEY=your-openai-api-key
- GENIUS_ACCESS_TOKEN=your-lyricsgenius-api-key
Replace `your-openai-api-key` and `your-lyricsgenius-api-key` with your keys. 

4. Inside app.py, replace the value of `uri` with your URI

5. Run “python3 app.py”
