let songsList = [];
let currentSongIndex = 0;

const cover = document.getElementById('album-cover');
const songTitle = document.getElementById('song-title');
const artist = document.getElementById('artist-name');
const audio = document.getElementById('audio-player');
const range = document.getElementById('range');

function searchSong() {
    const searchInput = document.getElementById('search-txt').value;

    fetch(`https://itunes.apple.com/search?term=${searchInput}&entity=song&limit=20`)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) return;

            songsList = data.results; 

            //Save the search results so they survive the reload
            localStorage.setItem('lastSearchResult', JSON.stringify(songsList));// iTunes uses 'results' not 'data'
            playSongs(songsList[0]);
        })
        .catch(err => console.error("iTunes search failed:", err)); //error handling
}

function playSongs(songs){
    //if song is an array of multiple songs; pick first song, if its a single song, use it as it is
    const song = Array.isArray(songs) ? songs[0] : songs;
    if (!song) return;

    //update UI
    cover.src = song.artworkUrl100; 
    songTitle.textContent = song.trackName; 
    artist.textContent = song.artistName;  
    audio.src = song.previewUrl; 

    //set audio
    audio.play();
    saveAndUpdatePlaylist(song);
}

function saveAndUpdatePlaylist(song) {
    const newSong = {
        id: song.trackId,
        title: song.trackName,
        artist: song.artistName,
        cover: song.artworkUrl100,
        preview: song.previewUrl
    };

    //Save to browser memory (for the player)
    localStorage.setItem('currentSong', JSON.stringify(song));

    //Save to localStorage recent list (works everywhere)
    let recentSongs = JSON.parse(localStorage.getItem('recentSongs') || '[]');
    recentSongs = recentSongs.filter(s => s.id !== newSong.id); // remove duplicate if exists
    recentSongs.push(newSong);
    localStorage.setItem('recentSongs', JSON.stringify(recentSongs));

    //Try saving to JSON server (only works locally)
    fetch("http://localhost:3000/recentSongs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSong)
    })
    .then(res => {
        if (res.ok) {
            loadPlaylistFromServer();
        }
    })
    .catch(() => {
        // JSON server not available, fall back to localStorage
        renderPlaylist(JSON.parse(localStorage.getItem('recentSongs') || '[]'));
    });
}

// Separate function to keep the sidebar updated
function loadPlaylistFromServer() {
    fetch("http://localhost:3000/recentSongs", { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
            console.log("Current DB Array:", data);
            return data; // return data so the next .then() receives it
        })
        .then(songs => renderPlaylist(songs))
        .catch(() => {
            // JSON server not available, fall back to localStorage
            renderPlaylist(JSON.parse(localStorage.getItem('recentSongs') || '[]'));
        });
}

//Pause/play button feature
function togglePlayPause() {
    const statusText = document.querySelector('#pause');
    if (audio.paused) {
        audio.play();
        statusText.textContent = "||";
    } else {
        audio.pause();
        statusText.textContent = "▶";
    }
}

//shuffle feature
function shuffleSongs(){
    if (songsList.length === 0) return;
    let randomIndex = Math.floor(Math.random() * songsList.length);
    currentSongIndex = randomIndex;

    playSongs(songsList[currentSongIndex])
}

//next button
function nextSong(){
    if (songsList.length === 0) return;
    currentSongIndex++;

    if (currentSongIndex >= songsList.length) {
        currentSongIndex = 0;
    }
    playSongs(songsList[currentSongIndex])
}

//previous song
function previousSong(){
    if (songsList.length === 0) return;
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = songsList.length - 1;
    }
    playSongs(songsList[currentSongIndex]);
}

const volSlider = document.getElementById('volume-slider');
const volWrap = document.getElementById('volume-wrap');

function adjustVolume() {
    // This toggles the visibility
    if (volWrap.classList.contains('show-vol')) {
        volWrap.classList.remove('show-vol');
    } else {
        volWrap.classList.add('show-vol');
    }
}

//load the recently played songs to the playlist page
function renderPlaylist(songs) {
    const playlist = document.getElementById("song-list");
    if (!playlist) return;

    if (!Array.isArray(songs)) {
        console.log("renderPlaylist expected an array but got:", songs);
        songs = songs ? [songs] : []; 
    }

    playlist.innerHTML = "";
    const recentOnTop = [...songs].reverse();
    
    recentOnTop.forEach(song => {
        playlist.innerHTML += `
            <div class="song-item">
                <img src="${song.cover}" alt="">
                <div class="song-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;
    });
}


// update slider while playing
audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.duration)) {
        range.value = (audio.currentTime / audio.duration) * 100;
    }
});
// seek audio when user drags slider
range.addEventListener("input", () => {
    audio.currentTime = (range.value / 100) * audio.duration;
});

//search button event listener
const searchForm = document.querySelector('.search form');
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchSong();
});

//play event listener
const playToggle = document.querySelector('.center-btn');
if(playToggle){
    playToggle.addEventListener('click',togglePlayPause);
}

//next song event listener
const next = document.querySelector(".next");
if(next){
    next.addEventListener('click',nextSong);
}

//previous song event lisener
const prev = document.querySelector('.prev');
if(prev){
    prev.addEventListener('click',previousSong);
}

//volume button event listener
const volBtn = document.querySelector('.volume');
if (volBtn) {
    volBtn.addEventListener('click', adjustVolume);
}

// Listen for slider movement
volSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value; 
});
//close volume slider when clicking outside of it
document.addEventListener('click', (e) => {
    if (!volWrap.contains(e.target) && !e.target.closest('.volume')) {
        volWrap.classList.remove('show-vol');
    }
});

//shuffle event listener
const shuffleBtn = document.querySelector('.shuffle');
if (shuffleBtn){
    shuffleBtn.addEventListener('click',shuffleSongs);
}

//"when the page loads, check if there's a saved song(in browser memory) and restore it"
window.addEventListener('load', () => {
    // Restore single song for the player
    const saved = localStorage.getItem('currentSong');
    if (saved) {
        const song = JSON.parse(saved);
        cover.src = song.artworkUrl100;
        songTitle.textContent = song.trackName;
        artist.textContent = song.artistName;
        audio.src = song.previewUrl;
    }

    // Restore the search list for the buttons
    const savedList = localStorage.getItem('lastSearchResult');
    if (savedList) {
        songsList = JSON.parse(savedList);
    }

    loadPlaylistFromServer(); // tries JSON server, falls back to localStorage automatically
});