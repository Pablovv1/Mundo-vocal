// Configura tu API key de Last.fm aquí
const API_KEY = '4c1a588f6f4c4eb178b17cae021ae540'; // Reemplaza con tu API key real

// Lista de artistas a mostrar
const artistas = [
    'Adele',
    'Freddie Mercury',
    'Shakira',
    'Michael Jackson',
    'Beyoncé',
    'Elvis Presley',
    'Lady Gaga',
    'Whitney Houston',
    'Bruno Mars',
    'Madonna',
    'Luis Miguel',
    'Selena',
    'Rihanna',
    'Paul McCartney',
    'David Bowie',
    'Amy Winehouse',
    'Juan Gabriel',
    'Celia Cruz',
    'Frank Sinatra',
    'Ed Sheeran',
    'Ariana Grande',
    'Billie Eilish',
    'Taylor Swift',
    'Dua Lipa',
    'Bad Bunny',
    'Karol G',
    'Rosalía',
    'The Weeknd',
    'Justin Bieber',
    'Camila Cabello',
    'Sam Smith',
    'Sia',
    'Andrea Bocelli',
    'Plácido Domingo',
    'Luciano Pavarotti',
    'Thalía',
    'Chayanne',
    'Marc Anthony',
    'Enrique Iglesias',
    'Juanes',
    'Alejandro Sanz',
    'Raphael',
    'Joan Manuel Serrat',
    'Julio Iglesias',
    'Vicente Fernández',
    'José José',
    'Gloria Trevi',
    'Lola Flores',
    'Pablo Alborán',
    'Maluma',
    'Ozuna',
    'Daddy Yankee',
    'Don Omar',
    'Natti Natasha',
    'Anuel AA',
    'J Balvin',
    'Shawn Mendes',
    'Miley Cyrus',
    'Harry Styles',
    'Demi Lovato',
    'Selena Gomez',
    'Nicki Minaj',
    'Katy Perry',
    'Christina Aguilera',
    'Britney Spears',
    'Celine Dion',
    'Barbra Streisand',
    'Cher',
    'Prince',
    'Stevie Wonder',
    'Aretha Franklin',
    'Bob Dylan',
    'Elton John',
    'John Lennon',
    'Mick Jagger',
    'Bon Jovi',
    'Jonas Brothers',
    'Florence Welch',
    'Lana Del Rey',
    'Tina Turner',
    'Gloria Estefan',
    'Maná',
    'Fher Olvera',
    'Alejandra Guzmán',
    'Paulina Rubio',
    'Rocío Dúrcal',
    'Isabel Pantoja',
    'Raphael',
    'Serrat',
    'Sabina',
    'Mónica Naranjo',
    'Pastora Soler',
    'Vanesa Martín',
    'India Martínez',
    'Rosario',
    'Antonio Orozco',
    'David Bisbal',
    'Pablo López',
    'Melendi',
    'Manuel Carrasco',
    'Aitana',
    'Lola Índigo',
    'Ana Mena',
    'Beret',
    'Nil Moliner',
    'Cepeda',
    'Miriam Rodríguez',
    'Alfred García',
    'Amaia',
    'Agoney',
    'Roi Méndez',
    'Miki Núñez',
    'Natalia Lacunza',
    'Julia Medina',
    'Carlos Right',
    'Marilia',
    'Dave Zulueta',
    'Noelia Franco',
    'Sabela',
    'Joan Garrido',
    'Damion',
    'Alba Reche',
    'Famous Oberogo',
    'Marta Sango',
    'María Villar',
    'África',
    'Luis Cepeda',
    'Ricky Merino',
    'Nerea Rodríguez',
    'Raoul Vázquez',
    'Mimi Doblas',
    'Ana Guerra',
    'Miriam Rodríguez',
    'Alfred García',
    'Amaia Romero',
    'Aitana Ocaña',
    'Agoney Hernández',
    'Roi Méndez',
    'Miki Núñez',
    'Natalia Lacunza',
    'Julia Medina',
    'Carlos Right',
    'Marilia Monzón',
    'Dave Zulueta',
    'Noelia Franco',
    'Sabela Ramil',
    'Joan Garrido',
    'Damion',
    'Alba Reche',
    'Famous Oberogo',
    'Marta Sango',
    'María Villar',
    'África Adalia',
];

const ARTISTAS_POR_PAGINA = 6;
let paginaActual = 1;
let artistasPopulares = [];
let artistasBusqueda = [];
let modoBusqueda = false;
let terminoBusqueda = '';
let cargando = false;
let finResultados = false;
let timeoutSugerencias;
let generoActual = 'pop';

// === Traducción de la página ===
const traducciones = {
    es: {
        'cantantes_destacados': 'Cantantes Destacados',
        'buscar_placeholder': 'Buscar cantante...',
        'buscar_boton': 'Buscar',
        'ver_mas_generos': 'Ver más géneros',
        'menu_cantantes': 'Cantantes',
        'menu_noticias': 'Noticias',
        'menu_top10': 'Top 10',
        'menu_contacto': 'Contacto',
    },
    en: {
        'cantantes_destacados': 'Featured Singers',
        'buscar_placeholder': 'Search singer...',
        'buscar_boton': 'Search',
        'ver_mas_generos': 'Show more genres',
        'menu_cantantes': 'Singers',
        'menu_noticias': 'News',
        'menu_top10': 'Top 10',
        'menu_contacto': 'Contact',
    }
};

function traducirPagina(idioma) {
    // Título sección
    const h2 = document.querySelector('#cantantes h2');
    if(h2) h2.textContent = traducciones[idioma]['cantantes_destacados'];
    // Placeholder y botón buscador
    const inputBuscar = document.getElementById('input-buscar-cantante');
    if(inputBuscar) inputBuscar.placeholder = traducciones[idioma]['buscar_placeholder'];
    const btnBuscar = document.getElementById('btn-buscar-cantante');
    if(btnBuscar) btnBuscar.textContent = traducciones[idioma]['buscar_boton'];
    // Botón ver más géneros
    const btnVerMas = document.getElementById('btn-ver-mas-generos');
    if(btnVerMas) btnVerMas.textContent = traducciones[idioma]['ver_mas_generos'];
    // Menú navegación
    const navLinks = document.querySelectorAll('.nav-list li a');
    if(navLinks.length >= 4) {
        navLinks[0].textContent = traducciones[idioma]['menu_cantantes'];
        navLinks[1].textContent = traducciones[idioma]['menu_noticias'];
        navLinks[2].textContent = traducciones[idioma]['menu_top10'];
        navLinks[3].textContent = traducciones[idioma]['menu_contacto'];
    }
}

// === Traducción de biografías ===
const cacheBiografiasTraducidas = {};
async function traducirTextoLibreTranslate(texto, source, target) {
    // Usar el endpoint local del servidor para evitar CORS
    try {
        const res = await fetch('/api/traducir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, source, target })
        });
        if (!res.ok) {
            console.error('[Traducir] Error HTTP:', res.status, res.statusText);
            return `[Error de traducción: ${res.status}]`;
        }
        const data = await res.json();
        console.log('[Traducir] Respuesta del servidor:', data);
        return data.translatedText || texto;
    } catch (e) {
        console.error('[Traducir] Error de red o servidor:', e);
        return '[Error de red o servidor al traducir]';
    }
}

async function traducirBiografiasGaleria(idioma) {
    const ps = document.querySelectorAll('.galeria-cantantes .cantante p');
    for (const p of ps) {
        const original = p.getAttribute('data-original') || p.textContent;
        let source = idioma === 'es' ? 'en' : 'es';
        let target = idioma;
        // Si ya está traducida, usar cache
        const cacheKey = original + '_' + target;
        if (cacheBiografiasTraducidas[cacheKey]) {
            p.textContent = cacheBiografiasTraducidas[cacheKey];
            continue;
        }
        // Mostrar spinner temporal
        p.textContent = idioma === 'es' ? 'Traduciendo...' : 'Translating...';
        // Traducir
        const traducida = await traducirTextoLibreTranslate(original, source, target);
        p.textContent = traducida;
        p.setAttribute('data-original', original);
        cacheBiografiasTraducidas[cacheKey] = traducida;
        // Si hay error, mostrarlo en rojo
        if (traducida.startsWith('[')) {
            p.style.color = 'red';
        } else {
            p.style.color = '';
        }
    }
}

// Extender traducirPagina para traducir biografías
const traducirPaginaOriginal = traducirPagina;
traducirPagina = function(idioma) {
    traducirPaginaOriginal(idioma);
    traducirBiografiasGaleria(idioma);
}

// Evento cambio de idioma
const selectorIdioma = document.getElementById('selector-idioma');
if(selectorIdioma) {
    selectorIdioma.addEventListener('change', function() {
        traducirPagina(this.value);
    });
    // Traducción inicial
    traducirPagina(selectorIdioma.value);
}

function renderPaginacion(totalPaginas) {
    const paginacion = document.getElementById('paginacion-cantantes');
    paginacion.innerHTML = '';
    // Botón Anterior
    const btnPrev = document.createElement('button');
    btnPrev.innerHTML = '&#8592;';
    btnPrev.className = 'btn-flecha';
    btnPrev.disabled = paginaActual === 1;
    btnPrev.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarCantantes();
        }
    });
    paginacion.appendChild(btnPrev);

    // Lógica para mostrar solo algunos botones de página
    let maxBotones = 5;
    let start = Math.max(1, paginaActual - 2);
    let end = Math.min(totalPaginas, paginaActual + 2);
    if (paginaActual <= 3) {
        end = Math.min(totalPaginas, maxBotones);
    }
    if (paginaActual >= totalPaginas - 2) {
        start = Math.max(1, totalPaginas - maxBotones + 1);
    }

    if (start > 1) {
        addBtnPagina(1);
        if (start > 2) {
            addEllipsis();
        }
    }
    for (let i = start; i <= end; i++) {
        addBtnPagina(i);
    }
    if (end < totalPaginas) {
        if (end < totalPaginas - 1) {
            addEllipsis();
        }
        addBtnPagina(totalPaginas);
    }

    // Botón Siguiente
    const btnNext = document.createElement('button');
    btnNext.innerHTML = '&#8594;';
    btnNext.className = 'btn-flecha';
    btnNext.disabled = paginaActual === totalPaginas;
    btnNext.addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarCantantes();
        }
    });
    paginacion.appendChild(btnNext);

    function addBtnPagina(i) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'btn-pagina' + (i === paginaActual ? ' activa' : '');
        btn.addEventListener('click', () => {
            paginaActual = i;
            mostrarCantantes();
        });
        paginacion.appendChild(btn);
    }
    function addEllipsis() {
        const span = document.createElement('span');
        span.textContent = '...';
        span.style.margin = '0 0.3rem';
        span.style.color = '#6366f1';
        span.style.fontWeight = 'bold';
        paginacion.appendChild(span);
    }
}

async function obtenerInfoArtista(nombre) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(nombre)}&api_key=${API_KEY}&format=json`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos.artist;
}

// Buscar imagen en Wikipedia si no hay imagen válida en Last.fm
async function obtenerImagenWikipedia(nombre) {
    try {
        const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=${encodeURIComponent(nombre)}&pithumbsize=400`;
        const resp = await fetch(url);
        const data = await resp.json();
        const pages = data.query.pages;
        const page = Object.values(pages)[0];
        if (page && page.thumbnail && page.thumbnail.source) {
            return page.thumbnail.source;
        }
    } catch (e) {
        // Ignorar errores
    }
    return 'img/logo.png';
}

async function obtenerArtistasPopulares(limit = 30, page = 1) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=${limit}&page=${page}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.artists.artist.map(a => a.name);
}

async function obtenerArtistasPorGenero(genero, limit = 30, page = 1) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${encodeURIComponent(genero)}&api_key=${API_KEY}&format=json&limit=${limit}&page=${page}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.topartists && data.topartists.artist) {
        return data.topartists.artist.map(a => a.name);
    }
    return [];
}

async function buscarArtistas(nombre, limit = 30, page = 1) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(nombre)}&api_key=${API_KEY}&format=json&limit=${limit}&page=${page}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.results && data.results.artistmatches && data.results.artistmatches.artist) {
        return data.results.artistmatches.artist.map(a => a.name);
    }
    return [];
}

async function cargarMasCantantes() {
    if (cargando || finResultados) return;
    cargando = true;
    document.getElementById('infinite-spinner').style.display = 'block';
    document.getElementById('infinite-spinner').classList.add('loading');
    let nuevos = [];
    if (modoBusqueda && terminoBusqueda) {
        nuevos = await buscarArtistas(terminoBusqueda, ARTISTAS_POR_PAGINA, paginaActual);
        if (nuevos.length === 0) finResultados = true;
        artistasBusqueda = artistasBusqueda.concat(nuevos);
    } else if (generoActual) {
        nuevos = await obtenerArtistasPorGenero(generoActual, ARTISTAS_POR_PAGINA, paginaActual);
        if (nuevos.length === 0) finResultados = true;
        artistasPopulares = artistasPopulares.concat(nuevos);
    } else {
        nuevos = await obtenerArtistasPopulares(ARTISTAS_POR_PAGINA, paginaActual);
        if (nuevos.length === 0) finResultados = true;
        artistasPopulares = artistasPopulares.concat(nuevos);
    }
    mostrarCantantes(true);
    cargando = false;
    document.getElementById('infinite-spinner').style.display = 'none';
    document.getElementById('infinite-spinner').classList.remove('loading');
}

async function mostrarCantantes(append = false) {
    const galeria = document.querySelector('.galeria-cantantes');
    if (!append) galeria.innerHTML = '';
    let lista = modoBusqueda && terminoBusqueda ? artistasBusqueda : artistasPopulares;
    const inicio = append ? lista.length - ARTISTAS_POR_PAGINA : 0;
    const fin = lista.length;
    const artistasPagina = lista.slice(inicio, fin);
    for (const nombre of artistasPagina) {
        try {
            const artista = await obtenerInfoArtista(nombre);
            let descripcion = artista.bio?.summary?.replace(/<a.*<\/a>/, '').trim() || 'Sin descripción.';
            const descripcionCorta = descripcion.length > 180 ? descripcion.slice(0, 180) + '...' : descripcion;
            const necesitaVerMas = descripcion.length > 180;
            const id = 'desc-' + Math.random().toString(36).substr(2, 9);
            // Obtener imagen válida y evitar la genérica de Last.fm
            let imagen = 'img/logo.png';
            if (Array.isArray(artista.image)) {
                const imgObj = artista.image.find(img => img.size === 'extralarge' && img['#text'] && img['#text'].trim() !== '');
                if (imgObj && imgObj['#text']) {
                    const urlGenerica = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';
                    if (imgObj['#text'] !== urlGenerica) {
                        imagen = imgObj['#text'];
                    }
                }
            }
            // Si la imagen sigue siendo la de logo, buscar en Wikipedia
            if (imagen === 'img/logo.png') {
                imagen = await obtenerImagenWikipedia(nombre);
            }
            const html = `
                <div class=\"cantante\" data-artista=\"${encodeURIComponent(artista.name)}\">
                    <img src=\"${imagen}\" alt=\"${artista.name}\">
                    <h3>${artista.name}</h3>
                    <p id=\"${id}\" data-original=\"${descripcionCorta.replace(/"/g, '&quot;')}\">${descripcionCorta}</p>
                    ${necesitaVerMas ? `<button class=\"ver-mas\" data-id=\"${id}\" data-full=\"${encodeURIComponent(descripcion)}\">Ver más</button>` : ''}
                </div>
            `;
            galeria.innerHTML += html;
        } catch (e) {
            galeria.innerHTML += `
                <div class=\"cantante\">
                    <img src=\"img/logo.png\" alt=\"${nombre}\">
                    <h3>${nombre}</h3>
                    <p>No se pudo obtener información.</p>
                </div>
            `;
        }
    }
    galeria.addEventListener('click', function(e) {
        const cantanteDiv = e.target.closest('.cantante');
        if (cantanteDiv && !e.target.classList.contains('ver-mas')) {
            const artista = cantanteDiv.getAttribute('data-artista');
            if (artista) {
                window.location.href = `artista.html?nombre=${artista}`;
            }
        }
        if (e.target.classList.contains('ver-mas')) {
            const id = e.target.getAttribute('data-id');
            const full = decodeURIComponent(e.target.getAttribute('data-full'));
            const p = document.getElementById(id);
            p.textContent = full;
            p.classList.add('expandido');
            e.target.style.display = 'none';
        }
    });
}

async function autocompletarSugerencias(valor) {
    const contenedor = document.getElementById('sugerencias-cantantes');
    contenedor.innerHTML = '';
    contenedor.classList.remove('visible');
    if (!valor) return;
    contenedor.innerHTML = '<div class="sugerencia-spinner">Buscando...</div>';
    contenedor.classList.add('visible');
    try {
        const sugerencias = await buscarArtistas(valor, 7);
        contenedor.innerHTML = '';
        if (sugerencias.length === 0) {
            contenedor.innerHTML = '<div class="sugerencia-mensaje">No se encontraron cantantes</div>';
        } else {
            sugerencias.forEach(nombre => {
                const div = document.createElement('div');
                div.className = 'sugerencia-cantante';
                div.textContent = nombre;
                div.addEventListener('mousedown', async function(e) {
                    e.preventDefault();
                    document.getElementById('input-buscar-cantante').value = nombre;
                    contenedor.classList.remove('visible');
                    modoBusqueda = true;
                    terminoBusqueda = nombre;
                    artistasBusqueda = [nombre];
                    paginaActual = 1;
                    mostrarCantantes();
                });
                contenedor.appendChild(div);
            });
        }
    } catch (e) {
        contenedor.innerHTML = '<div class="sugerencia-mensaje">Error de red</div>';
    }
}

function resetInfiniteScroll() {
    paginaActual = 1;
    finResultados = false;
    artistasPopulares = [];
    artistasBusqueda = [];
    document.querySelector('.galeria-cantantes').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', async () => {
    resetInfiniteScroll();
    await cargarMasCantantes();
    // Buscador avanzado
    const inputBuscar = document.getElementById('input-buscar-cantante');
    const sugerenciasCont = document.getElementById('sugerencias-cantantes');
    inputBuscar.addEventListener('input', function() {
        clearTimeout(timeoutSugerencias);
        const valor = this.value.trim();
        if (!valor) {
            sugerenciasCont.classList.remove('visible');
            modoBusqueda = false;
            terminoBusqueda = '';
            resetInfiniteScroll();
            cargarMasCantantes();
            return;
        }
        timeoutSugerencias = setTimeout(() => {
            autocompletarSugerencias(valor);
            // Búsqueda instantánea
            (async () => {
                modoBusqueda = true;
                terminoBusqueda = valor;
                resetInfiniteScroll();
                await cargarMasCantantes();
            })();
        }, 350);
    });
    // Cerrar sugerencias al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!sugerenciasCont.contains(e.target) && e.target !== inputBuscar) {
            sugerenciasCont.classList.remove('visible');
        }
    });
    // Mantener el botón buscar funcional
    document.getElementById('btn-buscar-cantante').addEventListener('click', async () => {
        const valor = inputBuscar.value.trim();
        if (valor) {
            modoBusqueda = true;
            terminoBusqueda = valor;
            resetInfiniteScroll();
            await cargarMasCantantes();
        } else {
            modoBusqueda = false;
            terminoBusqueda = '';
            resetInfiniteScroll();
            await cargarMasCantantes();
        }
        sugerenciasCont.classList.remove('visible');
    });
    inputBuscar.addEventListener('keyup', async (e) => {
        if (e.key === 'Enter') {
            document.getElementById('btn-buscar-cantante').click();
        }
    });
    // Infinite scroll
    window.addEventListener('scroll', async () => {
        const galeria = document.querySelector('.galeria-cantantes');
        const spinner = document.getElementById('infinite-spinner');
        if (finResultados || cargando) return;
        const scrollY = window.scrollY || window.pageYOffset;
        const windowH = window.innerHeight;
        const galeriaRect = galeria.getBoundingClientRect();
        const galeriaBottom = galeriaRect.bottom + scrollY;
        if (scrollY + windowH + 200 >= galeriaBottom) {
            paginaActual++;
            await cargarMasCantantes();
        }
    });
    // Menú de géneros
    document.querySelectorAll('.btn-genero').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (this.classList.contains('active')) return;
            document.querySelectorAll('.btn-genero').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            generoActual = this.getAttribute('data-genero');
            modoBusqueda = false;
            terminoBusqueda = '';
            document.getElementById('input-buscar-cantante').value = '';
            resetInfiniteScroll();
            await cargarMasCantantes();
        });
    });
    // Botón ver más géneros
    const btnVerMas = document.getElementById('btn-ver-mas-generos');
    const extra = document.querySelector('.generos-extra');
    btnVerMas.addEventListener('click', function() {
        if (extra.classList.contains('visible')) {
            extra.classList.remove('visible');
            extra.style.display = 'none';
            btnVerMas.textContent = 'Ver más géneros';
        } else {
            extra.classList.add('visible');
            extra.style.display = 'flex';
            btnVerMas.textContent = 'Ver menos géneros';
        }
    });
}); 