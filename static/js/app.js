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
        const lyricsDisplayStatus = document.getElementById('lyricsDisplay').style.display
        const remixDisplayStatus = document.getElementById('remixDisplay').style.display
        // const lyricsRealStatus = window.getComputedStyle(lyricsDisplayStatus).display
        // const remixRealStatus = window.getComputedStyle(remixDisplayStatus).display

        // console.log(lyricsRealStatus)
        // console.log(remixRealStatus)
        if (lyricsDisplayStatus !== "none" && remixDisplayStatus !== "none") {
            toggleVisibility();
        }
        // Starts a function that basically serves as animated loading text
        animateGenerating();

        const songTitle = $('#songTitleInput').val();
        const artistName = $('#artistNameInput').val();
        const newGenre = $('#newGenreInput').val();

        const getLyricsResponse = await getLyrics(songTitle, artistName);
        console.log(getLyricsResponse.lyrics);

        const findRemixResponse = await findRemix(getLyricsResponse.title, getLyricsResponse.artist, newGenre);

        if (findRemixResponse.found) {
            // First get the values and put them inside the containers
            newLyrics = getLyricsResponse.lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            newRemixed = findRemixResponse.remixed_lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            const lyricsDisplay = document.getElementById('lyricsDisplay');
            lyricsDisplay.innerHTML = newLyrics;
            const remixDisplay = document.getElementById('remixDisplay');
            remixDisplay.innerHTML = newRemixed;
            // $('#lyricsDisplay').val(getLyricsResponse.lyrics);
            // $('#remixDisplay').val(findRemixResponse.remixed_lyrics);

            // Then get rid of the loading text; 
            clearInterval(animationInterval);
            dots = 0 // Solves issues involving loading text starting with
            // more dots than it should
            document.getElementById('loadingText').style.display = 'none';

            // Finally print out the lyrics we stored earlier
            toggleVisibility();
        } else {
            // First get the values
            const remixLyricsResponse = await remixLyrics(getLyricsResponse.lyrics, newGenre);
            console.log(remixLyricsResponse.remixed_lyrics);

            const storeLyricsResponse = await storeLyrics(getLyricsResponse.title, getLyricsResponse.artist, newGenre, remixLyricsResponse.remixed_lyrics);
            console.log("Lyrics stored successfully");

            // And put them inside the containers
            newLyrics = getLyricsResponse.lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            newRemixed = remixLyricsResponse.remixed_lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            const lyricsDisplay = document.getElementById('lyricsDisplay');
            lyricsDisplay.innerHTML += newLyrics;
            const remixDisplay = document.getElementById('remixDisplay');
            remixDisplay.innerHTML = newRemixed;
            // $('#lyricsDisplay').val(getLyricsResponse.lyrics);
            // $('#remixDisplay').val(remixLyricsResponse.remixed_lyrics);

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
    }, 500); // Change the interval as needed
}


// Makes the lyrics and remix display (in)visible
function toggleVisibility() {
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    const remixDisplay = document.getElementById('remixDisplay');

    if (lyricsDisplay.style.display === 'none') {
        lyricsDisplay.style.display = 'inline-block';
    } else {
        lyricsDisplay.style.display = 'none';
    }
    if (remixDisplay.style.display === 'none') {
        remixDisplay.style.display = 'inline-block';
    } else {
        remixDisplay.style.display = 'none';
    }
}