$(document).ready(function () {
    $('#submitName').click(function () {
        var firstName = $('#firstNameInput').val();
        var lastName = $('#lastNameInput').val();

        $.ajax({
            type: 'POST',
            url: '/db/addUser',
            contentType: 'application/json',
            data: JSON.stringify({ "first_name": firstName, "last_name": lastName }),
            success: function (response) {
                console.log(response.message);
            },
            error: function (xhr) {
                console.log('Error:', xhr.responseText);
            }
        });
    });
});

$(document).ready(function () {
    $('#submitSong').click(handleRemixSubmission);
});

async function handleRemixSubmission() {
    try {
        const songTitle = $('#songTitleInput').val();
        const artistName = $('#artistNameInput').val();
        const newGenre = $('#newGenreInput').val();

        const getLyricsResponse = await getLyrics(songTitle, artistName);
        console.log(getLyricsResponse.lyrics);

        const findRemixResponse = await findRemix(getLyricsResponse.title, getLyricsResponse.artist, newGenre);

        if (findRemixResponse.found) {
            $('#lyricsDisplay').val(getLyricsResponse.lyrics);
            $('#remixDisplay').val(findRemixResponse.remixed_lyrics);
        } else {
            const remixLyricsResponse = await remixLyrics(getLyricsResponse.lyrics, newGenre);
            console.log(remixLyricsResponse.remixed_lyrics);

            const storeLyricsResponse = await storeLyrics(getLyricsResponse.title, getLyricsResponse.artist, newGenre, remixLyricsResponse.remixed_lyrics);
            console.log("Lyrics stored successfully");

            $('#lyricsDisplay').val(getLyricsResponse.lyrics);
            $('#remixDisplay').val(remixLyricsResponse.remixed_lyrics);
        }

    }
    catch (error) {
        console.log('Error:', error.responseText);
    }
}

function getLyrics(songTitle, artistName) {
    return $.ajax({
        type: 'POST',
        url: '/lyricgenius/getLyrics',
        contentType: 'application/json',
        data: JSON.stringify({ "song_name": songTitle, "artist_name": artistName })
    });
}

function remixLyrics(lyrics, genre) {
    return $.ajax({
        type: 'POST',
        url: '/openai/remixLyrics',
        contentType: 'application/json',
        data: JSON.stringify({ "lyrics": lyrics, "new_genre": genre })
    });
}

function storeLyrics(songName, artistName, newGenre, remixedLyrics) {
    return $.ajax({
        type: 'POST',
        url: '/db/storeLyrics',
        contentType: 'application/json',
        data: JSON.stringify({
            "song_name": songName,
            "artist_name": artistName,
            "new_genre": newGenre,
            "remixed_lyrics": remixedLyrics
        })
    });
}

function findRemix(songName, artistName, newGenre) {
    return $.ajax({
        type: 'GET',
        url: '/db/getRemix',
        data: {
            song_name: songName,
            artist_name: artistName,
            new_genre: newGenre
        }
    });
}