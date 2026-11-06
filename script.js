/* =========================================
   Buscador de GitHub — Estilo Retro 90s
   Lógica: búsqueda, historial, favoritos,
   tema, reintento, README, metadatos de repos.
   ========================================= */

// ---------------------------
// Referencias al DOM
// ---------------------------
const form = document.getElementById('form-buscar');
const inputUsuario = document.getElementById('usuario');
const btnBuscar = document.getElementById('btn-buscar');
const cargando = document.getElementById('cargando');
const mensajeError = document.getElementById('mensaje-error');
const textoError = document.getElementById('texto-error');
const btnReintentar = document.getElementById('btn-reintentar');
const alertaValidacion = document.getElementById('alerta-validacion');
const seccionPerfil = document.getElementById('perfil');
const seccionReadme = document.getElementById('readme-seccion');

// Perfil
const imgAvatar = document.getElementById('img-avatar');
const insigniaVerificada = document.getElementById('insignia-verificada');
const nombreUsuario = document.getElementById('nombre-usuario');
const nicknameEl = document.getElementById('nickname');
const bio = document.getElementById('bio');
const enlacePerfil = document.getElementById('enlace-perfil');
const statRepos = document.getElementById('stat-repos');
const statSeguidores = document.getElementById('stat-seguidores');
const statSiguiendo = document.getElementById('stat-siguiendo');
const statGists = document.getElementById('stat-gists');
const listaRepos = document.getElementById('lista-repos');
const contadorRepos = document.getElementById('contador-repos');

// Datos extra
const datoCreado = document.getElementById('dato-creado');
const datoUbicacion = document.getElementById('dato-ubicacion');
const enlaceBlog = document.getElementById('enlace-blog');
const textoBlog = document.getElementById('texto-blog');
const enlaceTwitter = document.getElementById('enlace-twitter');
const textoTwitter = document.getElementById('texto-twitter');
const enlaceEmpresa = document.getElementById('enlace-empresa');
const textoEmpresa = document.getElementById('texto-empresa');

// Favorito
const btnFavorito = document.getElementById('btn-favorito');

// README
const btnCopiarReadme = document.getElementById('btn-copiar-readme');
const contenidoReadme = document.getElementById('readme-contenido');

// Historial
const historialSeccion = document.getElementById('historial-seccion');
const listaHistorial = document.getElementById('lista-historial');
const btnLimpiarHistorial = document.getElementById('btn-limpiar-historial');

// Tema
const btnTema = document.getElementById('btn-tema');

// ---------------------------
// Configuración de la API
// ---------------------------
const API_BASE = 'https://api.github.com';
const CABECERAS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'Retro-GitHub-Buscador-App'
};

// ---------------------------
// Estado (localStorage)
// ---------------------------
const STORAGE_KEY_HISTORIAL = 'gh_retro_historial';
const STORAGE_KEY_FAVORITOS = 'gh_retro_favoritos';
const STORAGE_KEY_TEMA = 'gh_retro_tema';

let historial = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORIAL) || '[]');
let favoritos = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITOS) || '[]'));

// ---------------------------
// Tema claro/oscuro (mantiene la paleta retro)
// ---------------------------
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
  localStorage.setItem(STORAGE_KEY_TEMA, tema);
}

function initTema() {
  const guardado = localStorage.getItem(STORAGE_KEY_TEMA);
  const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const tema = guardado || (prefiereOscuro ? 'oscuro' : 'claro');
  aplicarTema(tema);
}

// En modo retro el tema es más sutil; el botón está disponible si se quiere extender.
btnTema.addEventListener('click', () => {
  const actual = document.documentElement.getAttribute('data-tema');
  const nuevo = actual === 'claro' ? 'oscuro' : 'claro';
  aplicarTema(nuevo);
});

// ---------------------------
// Historial de búsquedas
// ---------------------------
function guardarHistorial(username) {
  historial = historial.filter((h) => h.toLowerCase() !== username.toLowerCase());
  historial.unshift(username);
  historial = historial.slice(0, 8);
  localStorage.setItem(STORAGE_KEY_HISTORIAL, JSON.stringify(historial));
  renderizarHistorial();
}

function renderizarHistorial() {
  listaHistorial.innerHTML = '';
  if (historial.length === 0) {
    historialSeccion.style.display = 'none';
    return;
  }
  historialSeccion.style.display = 'block';
  historial.forEach((user) => {
    const chip = document.createElement('li');
    chip.className = 'chip-historial';
    chip.title = `Buscar ${user}`;
    chip.innerHTML = `
      <span>@${user}</span>
      <button class="eliminar-chip" type="button" aria-label="Eliminar ${user} del historial">×</button>
    `;
    chip.querySelector('span').addEventListener('click', () => {
      inputUsuario.value = user;
      inputUsuario.focus();
    });
    chip.querySelector('.eliminar-chip').addEventListener('click', (e) => {
      e.stopPropagation();
      historial = historial.filter((h) => h !== user);
      localStorage.setItem(STORAGE_KEY_HISTORIAL, JSON.stringify(historial));
      renderizarHistorial();
    });
    listaHistorial.appendChild(chip);
  });
}

btnLimpiarHistorial.addEventListener('click', () => {
  historial = [];
  localStorage.removeItem(STORAGE_KEY_HISTORIAL);
  renderizarHistorial();
});

// ---------------------------
// Favoritos
// ---------------------------
function guardarFavoritos() {
  localStorage.setItem(STORAGE_KEY_FAVORITOS, JSON.stringify([...favoritos]));
}

function actualizarBtnFavorito(login) {
  if (favoritos.has(login)) {
    btnFavorito.textContent = '★';
    btnFavorito.classList.add('activo');
    btnFavorito.setAttribute('aria-pressed', 'true');
    btnFavorito.title = 'Quitar de favoritos';
  } else {
    btnFavorito.textContent = '☆';
    btnFavorito.classList.remove('activo');
    btnFavorito.setAttribute('aria-pressed', 'false');
    btnFavorito.title = 'Agregar a favoritos';
  }
}

btnFavorito.addEventListener('click', () => {
  const login = nicknameEl.textContent.replace('@', '');
  if (favoritos.has(login)) {
    favoritos.delete(login);
  } else {
    favoritos.add(login);
  }
  guardarFavoritos();
  actualizarBtnFavorito(login);
});

// ---------------------------
// Utilidades de UI
// ---------------------------
function setCargando(activo) {
  if (activo) {
    cargando.classList.add('mostrar');
    btnBuscar.disabled = true;
    btnBuscar.classList.add('busy');
  } else {
    cargando.classList.remove('mostrar');
    btnBuscar.disabled = false;
    btnBuscar.classList.remove('busy');
  }
}

function mostrarError(mensaje, username) {
  textoError.textContent = mensaje;
  mensajeError.classList.remove('oculto');
  seccionPerfil.classList.add('oculto');
  seccionReadme.classList.add('oculto');
  if (username) guardarHistorial(username);
}

function limpiarEstado() {
  mensajeError.classList.add('oculto');
  seccionPerfil.classList.add('oculto');
  seccionReadme.classList.add('oculto');
  contenidoReadme.innerHTML = '';
  alertaValidacion.textContent = '';
  alertaValidacion.classList.remove('error');
  btnFavorito.style.display = 'none';
}

// Formatear fecha al estilo retro
function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
}

// Formatear número grande
function formatearNumero(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}

// Colores de lenguajes (subset común, estilo retro)
const COLORES_LENGUAJE = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#0075EC',
  HTML: '#e34c26',
  CSS: '#264de4',
  Shell: '#494949',
  Lua: '#000080',
  Perl: '#0298c3',
  R: '#198ce7',
  Scala: '#c22d40',
  Dockerfile: '#384d54',
  JSON: '#292929',
  YAML: '#cb171e',
  Markdown: '#083fa1',
};

function colorLenguaje(lenguaje) {
  return COLORES_LENGUAJE[lenguaje] || '#8a8578';
}

// ---------------------------
// Peticiones a la API
// ---------------------------
async function obtenerPerfilUsuario(username) {
  const url = `${API_BASE}/users/${encodeURIComponent(username)}`;
  const respuesta = await fetch(url, { method: 'GET', headers: CABECERAS });

  if (!respuesta.ok) {
    if (respuesta.status === 404) throw new Error('USUARIO_NO_EXISTE');
    if (respuesta.status === 403) throw new Error('LIMITE_ACHICADO');
    throw new Error(`Error del servidor (${respuesta.status})`);
  }
  return await respuesta.json();
}

async function obtenerRepositorios(username) {
  const url = `${API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`;
  const respuesta = await fetch(url, { method: 'GET', headers: CABECERAS });
  if (!respuesta.ok) return [];
  return await respuesta.json();
}

async function obtenerReadme(username) {
  const url = `${API_BASE}/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/readme`;
  try {
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: { ...CABECERAS, Accept: 'application/vnd.github.html+json' },
    });
    if (!respuesta.ok) return null;
    return await respuesta.text();
  } catch (e) {
    return null;
  }
}

// ---------------------------
// Renderizado
// ---------------------------
function renderizarPerfil(perfil, repositorios) {
  const avatarUrl = perfil.avatar_url;
  const nombre = perfil.name || perfil.login;
  const nombreLogin = perfil.login;
  const biografia = perfil.bio;
  const urlPerfil = perfil.html_url;
  const esVerificado = perfil.type === 'Organization' || !!perfil.name;

  const reposPublicos = perfil.public_repos;
  const seguidores = perfil.followers;
  const siguiendo = perfil.following;
  const gistsPublicos = perfil.public_gists;

  // Datos extra
  const creadoEn = formatearFecha(perfil.created_at);
  const ubicacion = perfil.location;
  const blog = perfil.blog;
  const twitter = perfil.twitter_username;
  const empresa = perfil.company;

  // DOM principal
  imgAvatar.src = avatarUrl;
  imgAvatar.alt = `Avatar de ${nombreLogin}`;
  nombreUsuario.textContent = nombre;
  nicknameEl.textContent = `@${nombreLogin}`;
  bio.textContent = biografia || 'Sin biografía disponible';
  enlacePerfil.href = urlPerfil;
  enlacePerfil.textContent = `Ver perfil de ${nombreLogin} en GitHub →`;

  statRepos.textContent = formatearNumero(reposPublicos);
  statSeguidores.textContent = formatearNumero(seguidores);
  statSiguiendo.textContent = formatearNumero(siguiendo);
  statGists.textContent = formatearNumero(gistsPublicos);

  // Datos extra
  datoCreado.textContent = creadoEn;
  datoUbicacion.textContent = ubicacion || '—';
  datoUbicacion.parentElement.style.display = ubicacion ? 'flex' : 'none';

  // Contacto
  const tieneBlog = blog && blog.startsWith('http');
  enlaceBlog.style.display = tieneBlog ? 'inline-flex' : 'none';
  if (tieneBlog) {
    textoBlog.textContent = blog.replace(/^https?:\/\//, '');
    enlaceBlog.href = blog;
  }

  const tieneTwitter = twitter;
  enlaceTwitter.style.display = tieneTwitter ? 'inline-flex' : 'none';
  if (tieneTwitter) {
    textoTwitter.textContent = `@${twitter}`;
    enlaceTwitter.href = `https://x.com/${twitter}`;
  }

  const tieneEmpresa = empresa;
  enlaceEmpresa.style.display = tieneEmpresa ? 'inline-flex' : 'none';
  if (tieneEmpresa) {
    textoEmpresa.textContent = empresa;
    enlaceEmpresa.href = `https://www.google.com/search?q=${encodeURIComponent(empresa)}`;
  }

  // Insignia verificada (heurística visual)
  insigniaVerificada.classList.toggle('visible', esVerificado && biografia);

  // Favorito
  btnFavorito.style.display = 'inline-flex';
  actualizarBtnFavorito(nombreLogin);

  // Repositorios
  listaRepos.innerHTML = '';
  contadorRepos.textContent = formatearNumero(reposPublicos);

  if (repositorios && repositorios.length > 0) {
    repositorios.forEach((repo) => {
      const item = document.createElement('li');
      item.className = 'repo-item';

      const nombreRepo = repo.name;
      const descRepo = repo.description || 'Sin descripción';
      const urlRepo = repo.html_url;
      const lenguaje = repo.language;
      const estrellas = repo.stargazers_count;
      const forks = repo.forks_count;
      const actualizado = formatearFecha(repo.updated_at);
      const esPrivado = repo.private;

      item.innerHTML = `
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <a href="${urlRepo}" target="_blank" rel="noopener noreferrer">${nombreRepo}</a>
            ${lenguaje ? `
              <span class="repo-lenguaje">
                <span class="punto-lenguaje" style="background:${colorLenguaje(lenguaje)}"></span>
                ${lenguaje}
              </span>
            ` : ''}
            ${esPrivado ? '<span class="repo-lenguaje" style="color:var(--texto-suave);">🔒 Privado</span>' : ''}
          </div>
          <p class="repo-desc">${descRepo}</p>
          <div class="repo-metadatos">
            <span class="meta-item"><span class="icono-meta">⭐</span><span class="valor-meta">${formatearNumero(estrellas)}</span></span>
            <span class="meta-item"><span class="icono-meta">🍴</span><span class="valor-meta">${formatearNumero(forks)}</span></span>
            <span class="meta-item"><span class="icono-meta">🕒</span><span class="valor-meta">${actualizado}</span></span>
          </div>
        </div>
        <a href="${urlRepo}" target="_blank" rel="noopener noreferrer" class="btn-repo">Ver repositorio</a>
      `;

      listaRepos.appendChild(item);
    });
  } else {
    const item = document.createElement('li');
    item.className = 'repo-item';
    item.innerHTML = `<span style="color:var(--texto-suave); font-style:italic; text-align:center; padding:24px; display:block; font-family:var(--fuente-mono);">Este usuario no tiene repositorios públicos.</span>`;
    listaRepos.appendChild(item);
  }

  seccionPerfil.classList.remove('oculto');
  mensajeError.classList.add('oculto');

  // Guardar historial y scroll a la tarjeta
  if (nombreLogin) guardarHistorial(nombreLogin);
  seccionPerfil.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderizarReadme(html, username) {
  if (!html) {
    seccionReadme.classList.add('oculto');
    contenidoReadme.innerHTML = '';
    return;
  }

  const plantilla = document.createElement('template');
  plantilla.innerHTML = html;
  const doc = plantilla.content;

  // Seguridad
  doc.querySelectorAll('script, style, iframe, object, embed, form').forEach((el) => el.remove());

  const baseRaw = `https://raw.githubusercontent.com/${username}/${username}/HEAD/`;
  const baseRepo = `https://github.com/${username}/${username}/blob/HEAD/`;
  const esAbsoluta = (valor) => /^(https?:)?\/\/|^data:|^mailto:/i.test(valor);
  const limpiarRuta = (valor) => valor.replace(/^\.?\//, '');

  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!esAbsoluta(src)) img.setAttribute('src', baseRaw + limpiarRuta(src));
    img.setAttribute('loading', 'lazy');
    img.setAttribute('referrerpolicy', 'no-referrer');
  });

  doc.querySelectorAll('a.anchor').forEach((a) => a.remove());

  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) return;
    if (!esAbsoluta(href)) a.setAttribute('href', baseRepo + limpiarRuta(href));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  contenidoReadme.replaceChildren(doc);
  seccionReadme.classList.remove('oculto');
}

btnCopiarReadme.addEventListener('click', async () => {
  const texto = contenidoReadme.innerText || contenidoReadme.textContent || '';
  if (!texto.trim()) return;
  try {
    await navigator.clipboard.writeText(texto);
    const original = btnCopiarReadme.textContent;
    btnCopiarReadme.textContent = '¡Copiado!';
    setTimeout(() => (btnCopiarReadme.textContent = original), 1500);
  } catch (e) {
    const area = document.createElement('textarea');
    area.value = texto;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
  }
});

// ---------------------------
// Flujo principal
// ---------------------------
async function manejarBusqueda(event) {
  event.preventDefault();
  limpiarEstado();

  const username = inputUsuario.value.trim();

  if (!username) {
    alertaValidacion.textContent = 'Escribe un nombre de usuario de GitHub.';
    alertaValidacion.classList.add('error');
    inputUsuario.focus();
    return;
  }

  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    alertaValidacion.textContent = 'Solo letras, números y guiones.';
    alertaValidacion.classList.add('error');
    inputUsuario.focus();
    return;
  }

  try {
    setCargando(true);

    const perfil = await obtenerPerfilUsuario(username);

    const [repositorios, readmeHtml] = await Promise.all([
      obtenerRepositorios(username),
      obtenerReadme(perfil.login),
    ]);

    renderizarPerfil(perfil, repositorios);
    renderizarReadme(readmeHtml, perfil.login);
  } catch (error) {
    const mensaje = error.message;
    if (mensaje === 'USUARIO_NO_EXISTE') {
      mostrarError(`No se encontró el usuario "${username}" en GitHub.`, username);
    } else if (mensaje === 'LIMITE_ACHICADO') {
      mostrarError('Límite de solicitudes a la API de GitHub alcanzado. Intenta más tarde.', username);
    } else if (mensaje.startsWith('Error del servidor')) {
      mostrarError('GitHub no respondió correctamente. Intenta en un momento.', username);
    } else {
      mostrarError('No se pudo conectar con GitHub. Revisa tu conexión a internet.', username);
    }
    console.error('Error en la búsqueda:', error);
  } finally {
    setCargando(false);
  }
}

btnReintentar.addEventListener('click', () => {
  if (inputUsuario.value.trim()) {
    manejarBusqueda(new Event('submit'));
  }
});

// ---------------------------
// Eventos
// ---------------------------
form.addEventListener('submit', manejarBusqueda);

inputUsuario.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    manejarBusqueda(new Event('submit'));
  }
});

inputUsuario.addEventListener('input', () => {
  if (alertaValidacion.textContent) {
    alertaValidacion.textContent = '';
    alertaValidacion.classList.remove('error');
  }
});

// ---------------------------
// Inicialización
// ---------------------------
initTema();
renderizarHistorial();
