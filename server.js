const express = require('express');
const cors = require('cors');
const lyricsFinder = require('lyrics-finder');
const nodemailer = require('nodemailer');
require('dotenv').config();
// Mover fetch aquí para que esté disponible en todo el archivo
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Cache para el Top 10
let top10Cache = {
    data: null,
    lastUpdate: null,
    isUpdating: false
};

// Configuración de email (usar variables de entorno)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicacion'
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('.'));

// Función para obtener Top 10 de Last.fm
async function fetchTop10FromLastFM() {
    try {
        const API_KEY = '4c1a588f6f4c4eb178b17cae021ae540';
        const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${API_KEY}&format=json&limit=10`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.tracks && data.tracks.track) {
            return data.tracks.track.map((track, index) => ({
                position: index + 1,
                name: track.name,
                artist: track.artist.name,
                image: track.image?.find(img => img.size === 'extralarge')?.['#text'] || null,
                url: track.url
            }));
        }
        return null;
    } catch (error) {
        console.error('Error al obtener Top 10 de Last.fm:', error);
        return null;
    }
}

// Función para verificar si el cache necesita actualización
function shouldUpdateCache() {
    if (!top10Cache.lastUpdate) return true;
    
    const now = new Date();
    const lastUpdate = new Date(top10Cache.lastUpdate);
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
}

// Función para actualizar el cache
async function updateTop10Cache() {
    if (top10Cache.isUpdating) return top10Cache.data;
    
    top10Cache.isUpdating = true;
    console.log('Actualizando cache del Top 10...');
    
    try {
        const top10 = await fetchTop10FromLastFM();
        if (top10) {
            top10Cache.data = top10;
            top10Cache.lastUpdate = new Date();
            console.log('Top 10 actualizado correctamente');
        }
    } catch (error) {
        console.error('Error al actualizar Top 10:', error);
    } finally {
        top10Cache.isUpdating = false;
    }
    
    return top10Cache.data;
}

// Endpoint para obtener Top 10
app.get('/api/top10', async (req, res) => {
    try {
        // Verificar si necesitamos actualizar el cache
        if (shouldUpdateCache()) {
            await updateTop10Cache();
        }
        
        if (top10Cache.data) {
            res.json({
                success: true,
                data: top10Cache.data,
                lastUpdate: top10Cache.lastUpdate,
                nextUpdate: new Date(new Date(top10Cache.lastUpdate).getTime() + 24 * 60 * 60 * 1000)
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'No se pudo obtener el Top 10'
            });
        }
    } catch (error) {
        console.error('Error en endpoint /api/top10:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Endpoint para enviar emails de contacto
app.post('/api/contact', async (req, res) => {
    try {
        const { nombre, email, asunto, mensaje, fecha } = req.body;
        
        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }
        
        // Configurar el email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'tu-email@gmail.com',
            to: process.env.EMAIL_USER || 'tu-email@gmail.com', // Email donde recibirás los mensajes
            subject: `🎵 Nuevo mensaje de contacto: ${asunto}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        }
                        .container {
                            background: white;
                            border-radius: 15px;
                            padding: 30px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #f0f0f0;
                        }
                        .logo {
                            font-size: 2.5em;
                            margin-bottom: 10px;
                        }
                        .title {
                            color: #6366f1;
                            font-size: 1.8em;
                            margin: 0;
                            font-weight: 600;
                        }
                        .subtitle {
                            color: #666;
                            font-size: 1.1em;
                            margin: 5px 0 0 0;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 25px;
                        }
                        .info-item {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 10px;
                            border-left: 4px solid #6366f1;
                        }
                        .info-label {
                            font-weight: 600;
                            color: #6366f1;
                            font-size: 0.9em;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                        }
                        .info-value {
                            color: #333;
                            font-size: 1.1em;
                        }
                        .message-section {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 10px;
                            margin-top: 20px;
                        }
                        .message-title {
                            color: #6366f1;
                            font-size: 1.3em;
                            margin-bottom: 15px;
                            font-weight: 600;
                        }
                        .message-content {
                            background: white;
                            padding: 15px;
                            border-radius: 8px;
                            border: 1px solid #e0e0e0;
                            white-space: pre-line;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 2px solid #f0f0f0;
                            color: #666;
                            font-size: 0.9em;
                        }
                        @media (max-width: 600px) {
                            .info-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🎵</div>
                            <h1 class="title">Mundo Vocal</h1>
                            <p class="subtitle">Nuevo mensaje de contacto</p>
                        </div>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Nombre</div>
                                <div class="info-value">${nombre}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value">${email}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Asunto</div>
                                <div class="info-value">${asunto}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Fecha</div>
                                <div class="info-value">${new Date(fecha).toLocaleString('es-ES')}</div>
                            </div>
                        </div>
                        
                        <div class="message-section">
                            <h3 class="message-title">📝 Mensaje</h3>
                            <div class="message-content">${mensaje.replace(/\n/g, '<br>')}</div>
                        </div>
                        
                        <div class="footer">
                            <p>Este mensaje fue enviado desde el formulario de contacto de Mundo Vocal</p>
                            <p>© 2024 Mundo Vocal - Tu portal de música</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        // Enviar email
        await transporter.sendMail(mailOptions);
        
        console.log(`Email de contacto enviado de ${nombre} (${email})`);
        
        res.json({
            success: true,
            message: 'Mensaje enviado correctamente'
        });
        
    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar el mensaje'
        });
    }
});

// Endpoint para obtener letras
app.get('/api/lyrics', async (req, res) => {
    try {
        const { artist, track } = req.query;
        
        if (!artist || !track) {
            return res.status(400).json({ 
                error: 'Se requieren los parámetros artist y track' 
            });
        }

        console.log(`Buscando letra para: ${artist} - ${track}`);
        
        const lyrics = await lyricsFinder(artist, track);
        
        if (lyrics) {
            res.json({ 
                success: true, 
                lyrics: lyrics,
                artist: artist,
                track: track
            });
        } else {
            res.json({ 
                success: false, 
                message: 'No se encontró la letra para esta canción',
                artist: artist,
                track: track
            });
        }
    } catch (error) {
        console.error('Error al buscar letra:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

// Actualizar cache al iniciar el servidor
updateTop10Cache().then(() => {
    console.log('Cache inicial del Top 10 cargado');
});

// Actualizar cache cada 24 horas
setInterval(() => {
    updateTop10Cache();
}, 24 * 60 * 60 * 1000); // 24 horas en milisegundos

// === Endpoint de traducción proxy ===
app.post('/api/traducir', async (req, res) => {
    const { texto, source, target } = req.body;
    if (!texto || !source || !target) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }
    try {
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: texto, source, target, format: 'text' })
        });
        if (!response.ok) {
            return res.status(500).json({ error: 'Error en LibreTranslate', status: response.status });
        }
        const data = await response.json();
        res.json({ translatedText: data.translatedText });
    } catch (error) {
        res.status(500).json({ error: 'Error de red o LibreTranslate', details: error.message });
    }
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`API de letras disponible en http://localhost:${PORT}/api/lyrics`);
    console.log(`API de Top 10 disponible en http://localhost:${PORT}/api/top10`);
    console.log(`API de contacto disponible en http://localhost:${PORT}/api/contact`);
}); 