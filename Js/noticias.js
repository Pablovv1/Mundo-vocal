console.log("Noticias.js cargado correctamente");
const API_KEY = 'a859e01e9a69a562bbdfa4252f81c246'; // Clave de Mediastack
const noticiasLista = document.getElementById('noticias-lista');
const spinner = document.getElementById('noticias-spinner');
const inputBuscar = document.getElementById('input-buscar-noticia');
const btnBuscar = document.getElementById('btn-buscar-noticia');

let paginaArtistas = 1;
let paginaMusica = 1;
let termino = '';
let cargando = false;
let finNoticiasArtistas = false;
let finNoticiasMusica = false;
const PAGE_SIZE = 8;

function construirQueryArtistas() {
    return termino ? termino : 'cantante';
}
function construirQueryMusica() {
    return termino ? termino : 'musica';
}

async function cargarNoticiasSeccion(tipo, reset = false) {
    let pagina = tipo === 'artistas' ? paginaArtistas : paginaMusica;
    let finNoticias = tipo === 'artistas' ? finNoticiasArtistas : finNoticiasMusica;
    if (cargando || finNoticias) return;
    cargando = true;
    spinner.style.display = 'block';
    if (reset) {
        if (tipo === 'artistas') {
            document.getElementById('seccion-artistas').innerHTML = '';
            paginaArtistas = 1;
            finNoticiasArtistas = false;
        } else {
            document.getElementById('seccion-musica').innerHTML = '';
            paginaMusica = 1;
            finNoticiasMusica = false;
        }
    }
    const keywords = tipo === 'artistas' ? construirQueryArtistas() : construirQueryMusica();
    const url = `http://api.mediastack.com/v1/news?access_key=${API_KEY}&keywords=${encodeURIComponent(keywords)}&languages=es,en&limit=${PAGE_SIZE}&offset=${(pagina-1)*PAGE_SIZE}`;
    console.log('Consultando Mediastack:', url);
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log('Respuesta Mediastack', tipo, data);
        if (data.error) {
            const errorMsg = `<div style="grid-column:1/-1;text-align:center;color:#f43f5e;font-size:1.2rem;">Error: ${data.error.message || 'No se pudo cargar noticias.'}</div>`;
            if (tipo === 'artistas') document.getElementById('seccion-artistas').innerHTML = errorMsg;
            else document.getElementById('seccion-musica').innerHTML = errorMsg;
            if (tipo === 'artistas') finNoticiasArtistas = true;
            else finNoticiasMusica = true;
        } else if (data.data && data.data.length > 0) {
            data.data.forEach(noticia => {
                const card = document.createElement('div');
                card.className = 'noticia-card';
                card.innerHTML = `
                    <img class="noticia-img" src="${noticia.image || 'img/logo.png'}" alt="Imagen noticia">
                    <div class="noticia-info">
                        <div class="noticia-titulo">${noticia.title || 'Sin título'}</div>
                        <div class="noticia-desc">${noticia.description || 'Sin descripción.'}</div>
                        <div class="noticia-meta">${noticia.published_at ? new Date(noticia.published_at).toLocaleString('es-ES', {dateStyle:'medium', timeStyle:'short'}) : ''}</div>
                        <div class="noticia-fuente">${noticia.source || ''}</div>
                        <a class="noticia-link" href="${noticia.url}" target="_blank">Leer más</a>
                    </div>
                `;
                if (tipo === 'artistas') {
                    document.getElementById('seccion-artistas').appendChild(card);
                } else {
                    document.getElementById('seccion-musica').appendChild(card);
                }
            });
            if (tipo === 'artistas') paginaArtistas++;
            else paginaMusica++;
        } else {
            const vacio = '<div style="grid-column:1/-1;text-align:center;color:#6366f1;font-size:1.2rem;">No se encontraron noticias.</div>';
            if (tipo === 'artistas') document.getElementById('seccion-artistas').innerHTML = vacio;
            else document.getElementById('seccion-musica').innerHTML = vacio;
            if (tipo === 'artistas') finNoticiasArtistas = true;
            else finNoticiasMusica = true;
        }
    } catch (e) {
        const error = `<div style="grid-column:1/-1;text-align:center;color:#f43f5e;font-size:1.2rem;">Error de red: ${e.message}</div>`;
        if (tipo === 'artistas') document.getElementById('seccion-artistas').innerHTML = error;
        else document.getElementById('seccion-musica').innerHTML = error;
        if (tipo === 'artistas') finNoticiasArtistas = true;
        else finNoticiasMusica = true;
    }
    spinner.style.display = 'none';
    cargando = false;
}

btnBuscar.addEventListener('click', () => {
    termino = inputBuscar.value.trim();
    cargarNoticiasSeccion('artistas', true);
    cargarNoticiasSeccion('musica', true);
});
inputBuscar.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        termino = inputBuscar.value.trim();
        cargarNoticiasSeccion('artistas', true);
        cargarNoticiasSeccion('musica', true);
    }
});

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        cargarNoticiasSeccion('artistas');
        cargarNoticiasSeccion('musica');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarNoticiasSeccion('artistas');
    cargarNoticiasSeccion('musica');
}); 