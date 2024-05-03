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
        // This initial check is to make sure the textboxes for lyrics aren't
        // displaying already; if they are, get rid of them
        const lyricsDisplayStatus = document.getElementById('lyricsDisplay').style.display
        const remixDisplayStatus = document.getElementById('remixDisplay').style.display
        if (lyricsDisplayStatus !== "none" && remixDisplayStatus !== "none") {
            toggleVisibility();
        }


        // Starts a function that basically serves as animated loading text
        animateGenerating();

        // Start grabbing values from the html sheet (shockingly this still works)
        const songTitle = $('#songTitleInput').val();
        const artistName = $('#artistNameInput').val();
        const newGenre = $('#newGenreInput').val();

        // Make some API calls to Genius
        const getLyricsResponse = await getLyrics(songTitle, artistName);
        console.log(getLyricsResponse.lyrics);

        // Make some API calls to MongoDB
        const findRemixResponse = await findRemix(getLyricsResponse.title, getLyricsResponse.artist, newGenre);

        if (findRemixResponse.found) {
            // We've remixed in this style before; find the old remix and use it
            // First get the values and put them inside the containers
            newLyrics = getLyricsResponse.lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            newRemixed = findRemixResponse.remixed_lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            const lyricsDisplay = document.getElementById('lyricsDisplay');
            lyricsDisplay.innerHTML = newLyrics;
            const remixDisplay = document.getElementById('remixDisplay');
            remixDisplay.innerHTML = newRemixed;

            // Then get rid of the loading text; 
            clearInterval(animationInterval);
            dots = 0 // Solves issues involving loading text starting with
            // more dots than it should
            document.getElementById('loadingText').style.display = 'none';

            // Finally print out the lyrics we stored earlier
            toggleVisibility();
        } else {
            // We haven't done this style of remix for this song yet
            // First make an API call to ChatGPT to remix the lyrics
            const remixLyricsResponse = await remixLyrics(getLyricsResponse.lyrics, newGenre);
            console.log(remixLyricsResponse.remixed_lyrics);

            // Then make an API call to MongoDB to store the lyrics
            const storeLyricsResponse = await storeLyrics(getLyricsResponse.title, getLyricsResponse.artist, newGenre, remixLyricsResponse.remixed_lyrics);
            console.log("Lyrics stored successfully");

            // Now shove our data inside the containers
            newLyrics = getLyricsResponse.lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            newRemixed = remixLyricsResponse.remixed_lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            const lyricsDisplay = document.getElementById('lyricsDisplay');
            lyricsDisplay.innerHTML += newLyrics;
            const remixDisplay = document.getElementById('remixDisplay');
            remixDisplay.innerHTML = newRemixed;

            // Get rid of the loading text
            clearInterval(animationInterval);
            dots = 0 // Solves issues involving loading text starting with
            // more dots than it should
            document.getElementById('loadingText').style.display = 'none';

            // Then print out the lyrics we just made
            toggleVisibility();
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

// Animates the "Generating..." text
let dots = 0;
let animationInterval;
function animateGenerating() {
    document.getElementById('loadingText').style.display = 'block';
    document.getElementById('loadingText').textContent = 'Generating';
    animationInterval = setInterval(function () {
        dots++;
        if (dots > 3) {
            dots = 0;
        }
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = 'Generating' + '.'.repeat(dots);
    }, 500);
}


// Makes the lyrics and remix display (in)visible
function toggleVisibility() {
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    const remixDisplay = document.getElementById('remixDisplay');

    // Original lyrics display block
    if (lyricsDisplay.style.display === 'none') {
        lyricsDisplay.style.display = 'inline-block';
    } else {
        lyricsDisplay.style.display = 'none';
    }

    // Remixed lyrics display block
    if (remixDisplay.style.display === 'none') {
        remixDisplay.style.display = 'inline-block';
    } else {
        remixDisplay.style.display = 'none';
    }
}