import lyricsgenius

genius = lyricsgenius.Genius()

song = genius.search_song("Country Roads")
print(song.lyrics)