const lista = document.getElementById('top10-lista');
const spinner = document.getElementById('top10-spinner');

async function cargarTop10() {
    spinner.style.display = 'block';
    lista.innerHTML = '';
    
    try {
        const url = 'http://localhost:3000/api/top10';
        const resp = await fetch(url);
        const data = await resp.json();
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(track => {
                const card = document.createElement('div');
                card.className = 'top10-card';
                card.setAttribute('data-track', track.name);
                card.setAttribute('data-artist', track.artist);
                let img = track.image || 'img/logo.png';
                if (!img || img.includes('2a96cbd8b46e442fc41c2b86b821562f')) img = 'img/logo.png';
                card.innerHTML = `
                    <div class="top10-pos">${track.position}</div>
                    <img class="top10-img" src="${img}" alt="${track.name}">
                    <div class="top10-info">
                        <div class="top10-titulo">${track.name}</div>
                        <div class="top10-artista">${track.artist}</div>
                    </div>
                `;
                lista.appendChild(card);
            });
            
            // Mostrar información de actualización
            if (data.lastUpdate) {
                const lastUpdate = new Date(data.lastUpdate);
                const nextUpdate = new Date(data.nextUpdate);
                console.log(`Top 10 actualizado: ${lastUpdate.toLocaleString()}`);
                console.log(`Próxima actualización: ${nextUpdate.toLocaleString()}`);
            }
        } else {
            lista.innerHTML = '<div style="text-align:center;color:#6366f1;font-size:1.2rem;">No se encontraron canciones.</div>';
        }
    } catch (e) {
        console.error('Error al cargar Top 10:', e);
        lista.innerHTML = `<div style="text-align:center;color:#f43f5e;font-size:1.2rem;">Error al cargar el Top 10.</div>`;
    }
    
    spinner.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', cargarTop10); 