/* =========================================
   Buscador de GitHub — Lógica de la aplicación
   Explicación paso a paso incluida en comentarios
   ========================================


/**
 * Función auxiliar: muestra u oculta el indicador de carga.
 */
function setCargando(activo) {
  if (activo) {
    cargando.classList.add('mostrar');
    btnBuscar.disabled = true;
    btnBuscar.textContent = 'Buscando...';
  } else {
    cargando.classList.remove('mostrar');
    btnBuscar.disabled = false;
    btnBuscar.textContent = 'Buscar usuario';
  }
}

/**
 * Función auxiliar: muestra un mensaje de error en la interfaz.
 */
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.remove('oculto');
  seccionPerfil.classList.add('oculto');
  seccionReadme.classList.add('oculto');
}

/**
 * Función auxiliar: oculta mensajes de error y la tarjeta previamente mostrada.
 */
function limpiarEstado() {
  mensajeError.classList.add('oculto');
  seccionPerfil.classList.add('oculto');
  seccionReadme.classList.add('oculto');
  contenidoReadme.innerHTML = '';
  alertaValidacion.textContent = '';
  alertaValidacion.classList.remove('error');
}


/**
 * 4. HACER LA PETICIÓN CON FETCH
 *
 * fetch() devuelve una Promesa. Usamos async/await para escribir el código
 * como si fuera síncrono y más fácil de leer.
 *
 * Pasamos los encabezados (User-Agent, Accept) para que GitHub acepte la
 * petición y nos devuelva JSON.
 */
async function obtenerPerfilUsuario(username) {
  const url = `${API_BASE}/users/${encodeURIComponent(username)}`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: CABECERAS
  });

  // Comprobación de errores HTTP
  if (!respuesta.ok) {
    if (respuesta.status === 404) {
      throw new Error('USUARIO_NO_EXISTE');
    }
    if (respuesta.status === 403) {
      throw new Error('LIMITE_ACHICADO');
    }
    throw new Error(`Error del servidor (${respuesta.status})`);
  }

  // 5. INTERPRETAR LA RESPUESTA JSON
  // response.json() lee el cuerpo de la respuesta y lo convierte en un
  // objeto JavaScript que podemos usar para pintar en pantalla.
  return await respuesta.json();
}

async function obtenerRepositorios(username) {
  const url = `${API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: CABECERAS
  });

  if (!respuesta.ok) {
    // Si falla la lista de repos, no es crítico: mostramos el perfil igual
    return [];
  }

  return await respuesta.json();
}

/**
 * README DEL PERFIL
 *
 * En GitHub, el README que aparece en el perfil de una persona vive en un
 * repositorio especial cuyo nombre es IGUAL al nombre de usuario
 * (ej.: github.com/torvalds/torvalds). Endpoint:
 *   /repos/{usuario}/{usuario}/readme
 *
 * Con el encabezado Accept "application/vnd.github.html+json" GitHub nos
 * devuelve el README ya convertido a HTML. Si el repo o el README no existen
 * responde 404 y simplemente no mostramos la sección.
 */
async function obtenerReadme(username) {
  const url = `${API_BASE}/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/readme`;

  try {
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: { ...CABECERAS, 'Accept': 'application/vnd.github.html+json' }
    });

    if (!respuesta.ok) return null; // 404 = no tiene README de perfil
    return await respuesta.text();
  } catch (error) {
    return null; // El README es opcional: un fallo no debe romper la búsqueda
  }
}

/**
 * Muestra el README en pantalla. Si no hay, oculta la sección.
 * Corrige imágenes y enlaces relativos (que apuntarían a nuestra página).
 */
function renderizarReadme(html, username) {
  if (!html) {
    seccionReadme.classList.add('oculto');
    contenidoReadme.innerHTML = '';
    return;
  }

  // <template> mantiene el contenido "inerte": no carga imágenes ni ejecuta nada
  const plantilla = document.createElement('template');
  plantilla.innerHTML = html;
  const doc = plantilla.content;

  // Seguridad extra (GitHub ya sanitiza el HTML)
  doc.querySelectorAll('script, style, iframe, object, embed, form').forEach((el) => el.remove());

  const baseRaw = `https://raw.githubusercontent.com/${username}/${username}/HEAD/`;
  const baseRepo = `https://github.com/${username}/${username}/blob/HEAD/`;
  const esAbsoluta = (valor) => /^(https?:)?\/\/|^data:|^mailto:/i.test(valor);
  const limpiarRuta = (valor) => valor.replace(/^\.?\//, '');

  // Imágenes: rutas relativas -> raw.githubusercontent.com
  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!esAbsoluta(src)) img.setAttribute('src', baseRaw + limpiarRuta(src));
    img.setAttribute('loading', 'lazy');
  });

  // Quitar el icono de "enlace permanente" que GitHub agrega a cada título
  doc.querySelectorAll('a.anchor').forEach((a) => a.remove());

  // Enlaces: abrir en pestaña nueva y resolver rutas relativas
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) return; // saltos internos
    if (!esAbsoluta(href)) a.setAttribute('href', baseRepo + limpiarRuta(href));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  contenidoReadme.replaceChildren(doc);
  seccionReadme.classList.remove('oculto');
}

/**
 * Renderiza los datos del perfil en la tarjeta HTML.
 * Distingue claramente entre datos de GitHub y valores calculados.
 */
function renderizarPerfil(perfil, repositorios) {
  // --- Datos que entrega GitHub (campos reales del JSON) ---
  const avatarUrl = perfil.avatar_url;             // URL del avatar de GitHub
  const nombre = perfil.name || perfil.login;      // nombre real o nombre de usuario
  const nombreLogin = perfil.login;                // nombre de usuario (@usuario)
  const biografia = perfil.bio;                    // puede ser null si no hay bio
  const urlPerfil = perfil.html_url;               // enlace al perfil en github.com

  // Estadísticas reales de GitHub
  const reposPublicos = perfil.public_repos;       // número de repositorios públicos
  const seguidores = perfil.followers;             // seguidores
  const siguiendo = perfil.following;              // personas que sigue
  const gistsPublicos = perfil.public_gists;       // gists públicos

  // --- Datos calculados / no disponibles (no vienen de GitHub) ---
  // Ejemplo: si no hay bio, mostramos un texto por defecto (no es dato de GitHub)
  const textoBio = biografia ? biografia : 'Sin biografía disponible';

  // Pintar en el DOM
  imgAvatar.src = avatarUrl;
  imgAvatar.alt = `Avatar de ${nombreLogin}`;
  nombreUsuario.textContent = nombre;
  bio.textContent = textoBio;
  enlacePerfil.href = urlPerfil;
  enlacePerfil.textContent = `Ver perfil de ${nombreLogin} en GitHub →`;

  statRepos.textContent = reposPublicos;
  statSeguidores.textContent = seguidores;
  statSiguiendo.textContent = siguiendo;
  statGists.textContent = gistsPublicos;

  // Renderizar lista de repositorios
  listaRepos.innerHTML = '';

  if (repositorios && repositorios.length > 0) {
    repositorios.forEach((repo) => {
      const item = document.createElement('li');
      item.className = 'repo-item';

      const nombreRepo = repo.name;                              // de GitHub
      const descRepo = repo.description || 'Sin descripción';    // de GitHub o por defecto
      const urlRepo = repo.html_url;                             // de GitHub

      item.innerHTML = `
        <div>
          <a href="${urlRepo}" target="_blank" rel="noopener noreferrer">${nombreRepo}</a>
          <p class="repo-desc">${descRepo}</p>
        </div>
        <a href="${urlRepo}" target="_blank" rel="noopener noreferrer" class="repo-link">Ver</a>
      `;

      listaRepos.appendChild(item);
    });
  } else {
    const item = document.createElement('li');
    item.className = 'repo-item';
    item.innerHTML = `<span style="color:#6d4c41; font-style:italic;">Este usuario no tiene repositorios públicos.</span>`;
    listaRepos.appendChild(item);
  }

  // Mostrar la tarjeta y ocultar errores
  seccionPerfil.classList.remove('oculto');
  mensajeError.classList.add('oculto');
}

/**
 * Flujo principal: validar entrada, buscar perfil, mostrar resultados.
 * Maneja errores de red, de la API y de validación sin romper la app.
 */
async function manejarBusqueda(event) {
  event.preventDefault();

  limpiarEstado();

  const username = inputUsuario.value.trim();

  // Validación: campo no vacío
  if (!username) {
    alertaValidacion.textContent = 'Por favor, escribe un nombre de usuario de GitHub.';
    alertaValidacion.classList.add('error');
    inputUsuario.focus();
    return;
  }

  // Validación básica de formato (GitHub permite letras, números y guiones)
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    alertaValidacion.textContent = 'El nombre de usuario solo puede contener letras, números y guiones.';
    alertaValidacion.classList.add('error');
    inputUsuario.focus();
    return;
  }

  try {
    setCargando(true);

    // Ejecutamos ambas peticiones (perfil y repos) de forma secuencial.
    // El perfil se necesita primero para saber si el usuario existe.
    const perfil = await obtenerPerfilUsuario(username);

    // Solo si el perfil existe, pedimos repositorios y README (en paralelo)
    const [repositorios, readmeHtml] = await Promise.all([
      obtenerRepositorios(username),
      obtenerReadme(perfil.login)
    ]);

    renderizarPerfil(perfil, repositorios);
    renderizarReadme(readmeHtml, perfil.login);

  } catch (error) {
    // 6. TRY / CATCH: cualquier error arriba cae aquí y se muestra en pantalla
    const mensaje = error.message;

    if (mensaje === 'USUARIO_NO_EXISTE') {
      mostrarError(`No se encontró ningún usuario con el nombre "${username}" en GitHub.`);
    } else if (mensaje === 'LIMITE_ACHICADO') {
      mostrarError('Se alcanzó el límite de solicitudes a la API de GitHub. Intenta de nuevo más tarde.');
    } else if (mensaje.startsWith('Error del servidor')) {
      mostrarError('GitHub no respondió correctamente. Intenta de nuevo en un momento.');
    } else {
      // Error de red (sin internet, DNS, etc.)
      mostrarError('No se pudo conectar con GitHub. Revisa tu conexión a internet e intenta de nuevo.');
    }

    console.error('Error en la búsqueda:', error);
  } finally {
    setCargando(false);
  }
}

/**
 * 7. LÍMITES DE LA API PÚBLICA Y CUÁNDO SE NECESITA UN TOKEN
 *
 *   - Sin autenticación: hasta 60 peticiones por hora por dirección IP.
 *   - Con token (OAuth / Personal Access Token): hasta 5.000 peticiones por hora.
 *
 * En esta aplicación educativa NO usamos token, así que estamos sujetos al
 * límite de 60 peticiones/hora. Si se supera, GitHub responde 403 y mostramos
 * un mensaje claro al usuario.
 *
 * Un token sería necesario si:
 *   - Hacemos muchas peticiones en poco tiempo (más de 60/hora).
 *   - Necesitamos acceder a datos privados (requiere autorización del usuario).
 *   - Queremos evitar que el límite por IP afecte a varios usuarios de la app.
 */

/**
 * Eventos: clic en el botón y tecla Enter en el campo.
 */
form.addEventListener('submit', manejarBusqueda);

// Permitir buscar también presionando Enter dentro del input
inputUsuario.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    manejarBusqueda(new Event('submit'));
  }
});
