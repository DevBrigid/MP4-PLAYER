

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
            songsList = data.results; // iTunes uses 'results' not 'data'
            playSongs(songsList);
        });
}

function playSongs(songs){
    //if song is an array of multiple songs; pick first song, if its a single song, use it as it is
    const song = Array.isArray(songs) ? songs[0] : songs;
    if (!song) return;

    localStorage.setItem('currentSong', JSON.stringify(song)); //stores song locally as string so that when page refreshes it remembers the current song
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

    // check if the song is already in the DB to avoid duplicates
    fetch("http://localhost:3000/recentSongs")
        .then(res => res.json())
        .then(existingSongs => {
            const alreadyExists = existingSongs.some(s => s.id === newSong.id);

            if (!alreadyExists) {
                //Use POST to add just the NEW song
                fetch("http://localhost:3000/recentSongs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newSong)
                })
                .then(res => res.json())
                .then(() => {
                    // Refresh the UI list after the save is successful
                    loadPlaylistFromServer();
                });
            }
        });
}

// Separate function to keep the sidebar updated
function loadPlaylistFromServer() {
    fetch("http://localhost:3000/recentSongs")
        .then(res => res.json())
        .then(songs => renderPlaylist(songs))
        .catch(err => console.log("Database fetch error:", err));
}

//Pause/play button feature
function togglePlayPause() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
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

function adjustVolume(volume){

}

//load the recently played songs to the playlist page
function renderPlaylist(songs) {
    const playlist = document.getElementById("song-list");
    if (!playlist) return;

    playlist.innerHTML = "";
    
    songs.forEach(song => {
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
playToggle.addEventListener('click',togglePlayPause);

//next song event listener
const next = document.querySelector(".next");
next.addEventListener('click',nextSong);

//previous song event lisener
const prev = document.querySelector('.prev');
prev.addEventListener('click',previousSong);

//volume event listener
const vol = document.querySelector('.volume');
vol.addEventListener('click',adjustVolume)

//"when the page loads, check if there's a saved song(in browser memory) and restore it"
window.addEventListener('load', () => {
    const saved = localStorage.getItem('currentSong');
    if (saved) {
        const song = JSON.parse(saved); //convert from string to object
        cover.src = song.artworkUrl100;
        songTitle.textContent = song.trackName;
        artist.textContent = song.artistName;
        audio.src = song.previewUrl;
    }
    loadPlaylistFromServer();
});
