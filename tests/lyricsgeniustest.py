import lyricsgenius

token = "xETlSxv5I6pzofoa_10dXNAn576-3rePdnE4lM0O4aPHhYqYTnud8Hr0x14LcY_B"
genius = lyricsgenius.Genius(token)

song = genius.search_song("Country Roads")
print(song.lyrics)