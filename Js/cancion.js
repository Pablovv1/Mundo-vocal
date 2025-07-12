const API_KEY = '4c1a588f6f4c4eb178b17cae021ae540'; // Clave de Last.fm

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        track: params.get('track') || '',
        artist: params.get('artist') || ''
    };
}

async function getTrackInfo(track, artist) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.track;
}

async function getLyricsFromServer(artist, track) {
    try {
        const url = `http://localhost:3000/api/lyrics?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        
        if (data.success && data.lyrics) {
            return data.lyrics;
        } else {
            return null;
        }
    } catch (e) {
        console.error('Error al obtener letra:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const { track, artist } = getParams();
    if (!track || !artist) return;
    document.getElementById('cancion-titulo').textContent = track;
    try {
        const info = await getTrackInfo(track, artist);
        // Imagen
        let img = info.album?.image?.find(i => i.size === 'extralarge')?.['#text'] || '';
        if (!img || img.includes('2a96cbd8b46e442fc41c2b86b821562f')) img = 'img/logo.png';
        document.getElementById('cancion-img').src = img;
        // Artista
        document.getElementById('cancion-artista').textContent = 'Artista: ' + (info.artist?.name || artist);
        // Álbum
        document.getElementById('cancion-album').textContent = info.album?.title ? 'Álbum: ' + info.album.title : '';
        // Duración
        let duracion = info.duration ? Math.round(info.duration/1000) : 0;
        if (duracion) {
            let min = Math.floor(duracion/60);
            let seg = duracion%60;
            document.getElementById('cancion-duracion').textContent = `Duración: ${min}:${seg.toString().padStart(2,'0')} min`;
        }
        // Enlaces
        let enlaces = `<a href="${info.url}" target="_blank" title="Last.fm"><img src='https://www.last.fm/static/images/lastfm_logo.svg' alt='Last.fm' style='width:22px;height:22px;vertical-align:middle;'></a>`;
        document.getElementById('cancion-enlaces').innerHTML = enlaces;
        // Buscar letra en nuestro servidor
        document.getElementById('cancion-letra-texto').textContent = 'Buscando letra...';
        const lyrics = await getLyricsFromServer(artist, track);
        if (lyrics) {
            document.getElementById('cancion-letra-texto').textContent = lyrics;
        } else {
            document.getElementById('cancion-letra-texto').textContent = 'Letra no disponible.';
        }
    } catch (e) {
        document.getElementById('cancion-img').src = 'img/logo.png';
        document.getElementById('cancion-artista').textContent = 'Artista: ' + artist;
        document.getElementById('cancion-letra-texto').textContent = 'No se pudo cargar la información de la canción.';
    }
}); 