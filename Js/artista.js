// Obtener nombre del artista de la URL
function getArtistNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('nombre') || '';
}

async function getArtistInfo(nombre) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(nombre)}&api_key=4c1a588f6f4c4eb178b17cae021ae540&format=json`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.artist;
}

async function getArtistAlbums(nombre) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(nombre)}&api_key=4c1a588f6f4c4eb178b17cae021ae540&format=json&limit=8`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.topalbums && data.topalbums.album ? data.topalbums.album : [];
}

async function getWikipediaImage(nombre) {
    try {
        const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=${encodeURIComponent(nombre)}&pithumbsize=400`;
        const resp = await fetch(url);
        const data = await resp.json();
        const pages = data.query.pages;
        const page = Object.values(pages)[0];
        if (page && page.thumbnail && page.thumbnail.source) {
            return page.thumbnail.source;
        }
    } catch (e) {}
    return '';
}

async function getWikipediaSocialLinks(nombre) {
    // Buscar el artículo más relevante en español
    let wikidataId = await getWikidataIdFromWikipediaSearch(nombre, 'es');
    if (!wikidataId) {
        // Si no, buscar en inglés
        wikidataId = await getWikidataIdFromWikipediaSearch(nombre, 'en');
    }
    if (wikidataId) {
        return await getWikidataSocialLinksById(wikidataId);
    }
    return {};
}

async function getWikidataIdFromWikipediaSearch(nombre, lang) {
    try {
        const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(nombre)}&srlimit=1`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.query && data.query.search && data.query.search.length > 0) {
            const pageTitle = data.query.search[0].title;
            // Obtener Wikidata ID del artículo
            const url2 = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageprops&titles=${encodeURIComponent(pageTitle)}`;
            const resp2 = await fetch(url2);
            const data2 = await resp2.json();
            const pages = data2.query.pages;
            const page = Object.values(pages)[0];
            if (page && page.pageprops && page.pageprops.wikibase_item) {
                return page.pageprops.wikibase_item;
            }
        }
    } catch (e) {}
    return '';
}

async function getWikidataSocialLinksById(wikidataId) {
    try {
        const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&format=json&origin=*&props=claims`;
        const resp = await fetch(url);
        const data = await resp.json();
        const claims = data.entities[wikidataId].claims;
        const links = {};
        // Wikidata properties for social media
        const props = {
            instagram: 'P2003',
            twitter: 'P2002',
            facebook: 'P2013',
            youtube: 'P2397',
            spotify: 'P1902'
        };
        for (const [red, prop] of Object.entries(props)) {
            if (claims[prop] && claims[prop][0] && claims[prop][0].mainsnak && claims[prop][0].mainsnak.datavalue) {
                const val = claims[prop][0].mainsnak.datavalue.value;
                switch (red) {
                    case 'instagram': links.instagram = `https://instagram.com/${val}`; break;
                    case 'twitter': links.twitter = `https://twitter.com/${val}`; break;
                    case 'facebook': links.facebook = `https://facebook.com/${val}`; break;
                    case 'youtube': links.youtube = `https://youtube.com/${val}`; break;
                    case 'spotify': links.spotify = `https://open.spotify.com/artist/${val}`; break;
                }
            }
        }
        return links;
    } catch (e) { return {}; }
}

function setBackgroundByArtist(imgUrl) {
    if (!imgUrl) return;
    const bg = document.body;
    bg.style.background = `linear-gradient(120deg, #f8fafc 0%, #6366f1 100%), url('${imgUrl}') center/cover no-repeat`;
    bg.style.backgroundBlendMode = 'multiply';
}

function getSocialLinksFromBio(bio) {
    const links = {};
    if (!bio) return links;
    const patterns = {
        instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(\w+)/i,
        twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/(\w+)/i,
        facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(\w+)/i,
        youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c\/|user\/|channel\/)?([\w-]+)/i,
        spotify: /(?:https?:\/\/)?(?:open\.)?spotify\.com\/artist\/([\w]+)/i
    };
    for (const [key, regex] of Object.entries(patterns)) {
        const match = bio.match(regex);
        if (match) {
            links[key] = match[0];
        }
    }
    return links;
}

function getSocialIcon(name) {
    const icons = {
        instagram: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25 1.25a1 1 0 1 1 0 2a1 1 0 0 1 0-2z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M22.46 5.92c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37a8.59 8.59 0 0 1-2.72 1.04a4.28 4.28 0 0 0-7.29 3.9A12.13 12.13 0 0 1 3.1 4.86a4.28 4.28 0 0 0 1.32 5.71a4.23 4.23 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.19a4.3 4.3 0 0 1-1.93.07a4.29 4.29 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2c0-.19 0-.37-.01-.56a8.72 8.72 0 0 0 2.15-2.22z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.5 9.95v-7.05h-2.1v-2.9h2.1V9.5c0-2.07 1.23-3.22 3.12-3.22c.9 0 1.84.16 1.84.16v2.02h-1.04c-1.03 0-1.35.64-1.35 1.3v1.56h2.3l-.37 2.9h-1.93v7.05A10 10 0 0 0 22 12z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.13 6 12 6 12 6s-6.13 0-7.86.061a2.75 2.75 0 0 0-1.94 1.94A28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999a2.75 2.75 0 0 0 1.94 1.94C5.87 18 12 18 12 18s6.13 0 7.86-.061a2.75 2.75 0 0 0 1.94-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15.5v-7l6 3.5l-6 3.5z"/></svg>',
        spotify: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm4.29 14.42a.75.75 0 0 1-1 .27a7.13 7.13 0 0 0-6.58-.25a.75.75 0 1 1-.66-1.36a8.63 8.63 0 0 1 7.97.3a.75.75 0 0 1 .27 1.04Zm1.43-2.7a.94.94 0 0 1-1.29.34a10.37 10.37 0 0 0-8.94-.32a.94.94 0 1 1-.76-1.72a12.25 12.25 0 0 1 10.57.37a.94.94 0 0 1 .42 1.33Zm.13-2.8A1.13 1.13 0 0 1 17 9.2a13.6 13.6 0 0 0-10-.36a1.13 1.13 0 1 1-.77-2.13a15.86 15.86 0 0 1 11.67.41a1.13 1.13 0 0 1 .48 1.5Z"/></svg>'
    };
    return icons[name] || '';
}

function crearCarrouselAlbumes(albumes) {
    const albumesDiv = document.getElementById('artista-albumes-lista');
    albumesDiv.innerHTML = '';
    albumes.forEach(album => {
        let img = album.image?.find(i => i.size === 'extralarge')?.['#text'] || '';
        if (!img || img.includes('2a96cbd8b46e442fc41c2b86b821562f')) img = 'img/logo.png';
        albumesDiv.innerHTML += `<div class='album-card'>
            <img src='${img}' alt='${album.name}'>
            <div class='album-title'>${album.name}</div>
            <div class='album-year'>${album['@attr']?.rank ? 'Top ' + album['@attr'].rank : ''}</div>
        </div>`;
    });
    // Flechas carrousel
    let leftBtn = document.getElementById('albumes-carrousel-left');
    let rightBtn = document.getElementById('albumes-carrousel-right');
    if (!leftBtn) {
        leftBtn = document.createElement('button');
        leftBtn.id = 'albumes-carrousel-left';
        leftBtn.className = 'albumes-carrousel-btn left';
        leftBtn.innerHTML = '&#8592;';
        albumesDiv.parentElement.appendChild(leftBtn);
    }
    if (!rightBtn) {
        rightBtn = document.createElement('button');
        rightBtn.id = 'albumes-carrousel-right';
        rightBtn.className = 'albumes-carrousel-btn right';
        rightBtn.innerHTML = '&#8594;';
        albumesDiv.parentElement.appendChild(rightBtn);
    }
    leftBtn.onclick = () => {
        albumesDiv.scrollBy({left: -300, behavior: 'smooth'});
    };
    rightBtn.onclick = () => {
        albumesDiv.scrollBy({left: 300, behavior: 'smooth'});
    };
}

async function getArtistTopTracks(nombre) {
    // Limpia el nombre del artista para evitar errores en la API
    let nombreLimpio = (nombre || '').trim().replace(/\s+/g, ' ');
    // Consulta la API de Last.fm para obtener las canciones populares
    const apiKey = '4c1a588f6f4c4eb178b17cae021ae540';
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(nombreLimpio)}&api_key=${apiKey}&format=json&limit=8`;
    console.log('Consultando top tracks:', url);
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            console.warn('Error al consultar la API de Last.fm:', resp.status);
            return [];
        }
        const data = await resp.json();
        console.log('Respuesta top tracks:', data.toptracks?.track);
        if (data.toptracks && data.toptracks.track) {
            // Si es un solo objeto, lo convertimos en array
            if (Array.isArray(data.toptracks.track)) {
                return data.toptracks.track;
            } else {
                return [data.toptracks.track];
            }
        }
    } catch (e) {
        console.error('Error de red o parseo en top tracks:', e);
    }
    return [];
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '';
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

// --- SPOTIFY INTEGRACIÓN PARA PORTADAS ---
const SPOTIFY_CLIENT_ID = 'b094dfad5bf74494a8353287c09660fc';
const SPOTIFY_CLIENT_SECRET = '6cb9e1597c6c423aa1d1e7751eaabdeb';
let spotifyToken = '';

async function getSpotifyToken() {
    if (spotifyToken) return spotifyToken;
    const resp = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await resp.json();
    spotifyToken = data.access_token;
    setTimeout(() => { spotifyToken = ''; }, (data.expires_in - 60) * 1000); // Renueva antes de expirar
    return spotifyToken;
}

async function getSpotifyTrackImageAndPreview(artista, cancion) {
    try {
        const token = await getSpotifyToken();
        const query = encodeURIComponent(`${artista} ${cancion}`);
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;
        const resp = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await resp.json();
        if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
            const item = data.tracks.items[0];
            return {
                image: item.album.images[0]?.url || '',
                preview: item.preview_url || '',
                id: item.id || ''
            };
        }
    } catch (e) { console.warn('Spotify error:', e); }
    return { image: '', preview: '', id: '' };
}

async function renderTopTracks(nombre) {
    const tracks = await getArtistTopTracks(nombre);
    const cont = document.getElementById('artista-tracks-lista');
    if (!cont) return;
    if (!tracks.length) {
        cont.innerHTML = '<em>No hay canciones populares disponibles o hubo un error al consultar la API.</em>';
        return;
    }
    cont.innerHTML = '';
    let previews = [];
    for (const track of tracks) {
        let portada = 'img/logo.png';
        let preview = '';
        let spotifyTrackId = '';
        // Si sigue siendo logo, intenta buscar en Spotify
        if (portada === 'img/logo.png') {
            const spotifyData = await getSpotifyTrackImageAndPreview(nombre, track.name);
            if (spotifyData.image) portada = spotifyData.image;
            if (spotifyData.preview) preview = spotifyData.preview;
            if (spotifyData.id) spotifyTrackId = spotifyData.id;
        }
        // Si ya se obtuvo preview de Spotify, obtener el id del track
        if (!spotifyTrackId && preview) {
            // Extraer el id de la url de preview (formato: https://p.scdn.co/mp3-preview/{id}?cid=...)
            // Pero mejor buscar el id en la búsqueda de Spotify
            const spotifyData = await getSpotifyTrackImageAndPreview(nombre, track.name);
            if (spotifyData.id) spotifyTrackId = spotifyData.id;
        }
        previews.push(preview);
        cont.innerHTML += `
        <div class="track-card" data-preview="${preview}">
            <div class="track-cover-row">
                ${spotifyTrackId ? `<iframe style='border-radius:12px;margin-left:0.7rem;' src='https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0' width='80' height='80' frameBorder='0' allow='autoplay; clipboard-write; encrypted-media; picture-in-picture' loading='lazy'></iframe>` : ''}
            </div>
            <div class="track-title">${track.name}</div>
        </div>
        `;
    }
    // Reproductor de preview
    let audio = null;
    let lastBtn = null;
    cont.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.track-card');
            const preview = card.getAttribute('data-preview');
            const iconPlay = this.querySelector('.icon-play');
            const iconPause = this.querySelector('.icon-pause');
            if (!preview) return;
            if (audio && !audio.paused && lastBtn === this) {
                audio.pause();
                this.classList.remove('playing');
                iconPlay.style.display = '';
                iconPause.style.display = 'none';
                return;
            }
            if (audio) {
                audio.pause();
                if (lastBtn) {
                    lastBtn.classList.remove('playing');
                    lastBtn.querySelector('.icon-play').style.display = '';
                    lastBtn.querySelector('.icon-pause').style.display = 'none';
                }
            }
            audio = new Audio(preview);
            audio.play();
            this.classList.add('playing');
            iconPlay.style.display = 'none';
            iconPause.style.display = '';
            lastBtn = this;
            audio.onended = () => {
                this.classList.remove('playing');
                iconPlay.style.display = '';
                iconPause.style.display = 'none';
            };
        });
    });
}

async function main() {
    const nombre = getArtistNameFromURL();
    if (!nombre) return;
    document.getElementById('artista-nombre').textContent = nombre;
    // Info principal
    const artista = await getArtistInfo(nombre);
    // Foto
    let img = artista.image?.find(i => i.size === 'extralarge')?.['#text'] || '';
    if (!img || img.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
        img = await getWikipediaImage(nombre);
    }
    if (!img) img = 'img/logo.png';
    document.getElementById('artista-foto').src = img;
    setBackgroundByArtist(img);
    // Biografía
    document.getElementById('artista-bio').innerHTML = artista.bio?.content || 'Sin biografía.';
    // Géneros
    if (artista.tags && artista.tags.tag && artista.tags.tag.length > 0) {
        document.getElementById('artista-generos').textContent = 'Géneros: ' + artista.tags.tag.map(t => t.name).join(', ');
    }
    // País (si está en bio summary)
    let pais = '';
    if (artista.bio && artista.bio.placeformed) pais = artista.bio.placeformed;
    document.getElementById('artista-pais').textContent = pais ? 'País: ' + pais : '';
    // Enlaces y redes
    let enlaces = `<a href="${artista.url}" target="_blank" title="Last.fm"><img src='https://www.last.fm/static/images/lastfm_logo.svg' alt='Last.fm' style='width:22px;height:22px;vertical-align:middle;'></a>`;
    if (artista.bio && artista.bio.links && artista.bio.links.link && artista.bio.links.link.href) {
        enlaces += ` <a href="${artista.bio.links.link.href}" target="_blank" title="Wikipedia"><img src='https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png' alt='Wikipedia' style='width:22px;height:22px;vertical-align:middle;'></a>`;
    }
    // Redes sociales
    let redes = getSocialLinksFromBio(artista.bio?.content || '');
    if (Object.keys(redes).length === 0) {
        redes = await getWikipediaSocialLinks(nombre);
    }
    const redesList = ['instagram','twitter','facebook','youtube','spotify'];
    redesList.forEach(red => {
        if (redes[red]) {
            enlaces += `<a href="${redes[red]}" class="red-social" target="_blank" title="${red.charAt(0).toUpperCase()+red.slice(1)}">${getSocialIcon(red)}</a>`;
        } else {
            enlaces += `<span class="red-social inactiva" title="${red.charAt(0).toUpperCase()+red.slice(1)}">${getSocialIcon(red)}</span>`;
        }
    });
    document.getElementById('artista-enlaces').innerHTML = enlaces;
    // Álbumes
    const albumes = await getArtistAlbums(nombre);
    crearCarrouselAlbumes(albumes);
    // Canciones populares
    await renderTopTracks(nombre);
}

main(); 