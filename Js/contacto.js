const form = document.getElementById('contacto-form');
const btnEnviar = document.getElementById('btn-enviar');
const mensajeEnvio = document.getElementById('mensaje-envio');

function mostrarMensaje(texto, tipo) {
    mensajeEnvio.textContent = texto;
    mensajeEnvio.className = `mensaje-envio ${tipo}`;
    mensajeEnvio.style.display = 'block';
    
    if (tipo === 'exito') {
        setTimeout(() => {
            mensajeEnvio.style.display = 'none';
        }, 5000);
    }
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    if (!nombre) {
        mostrarMensaje('Por favor, ingresa tu nombre completo.', 'error');
        return false;
    }
    
    if (!email || !validarEmail(email)) {
        mostrarMensaje('Por favor, ingresa un email válido.', 'error');
        return false;
    }
    
    if (!asunto) {
        mostrarMensaje('Por favor, ingresa un asunto.', 'error');
        return false;
    }
    
    if (!mensaje || mensaje.length < 10) {
        mostrarMensaje('El mensaje debe tener al menos 10 caracteres.', 'error');
        return false;
    }
    
    return true;
}

async function enviarFormulario(datos) {
    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensaje('¡Mensaje enviado correctamente! Te responderemos pronto.', 'exito');
            form.reset();
        } else {
            mostrarMensaje(result.error || 'Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión. Verifica que el servidor esté funcionando.', 'error');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
        return;
    }
    
    const formData = new FormData(form);
    const datos = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        asunto: formData.get('asunto'),
        mensaje: formData.get('mensaje'),
        fecha: new Date().toISOString()
    };
    
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';
    
    await enviarFormulario(datos);
    
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar mensaje';
});

// Limpiar mensajes al cambiar campos
form.addEventListener('input', () => {
    if (mensajeEnvio.style.display === 'block') {
        mensajeEnvio.style.display = 'none';
    }
}); 