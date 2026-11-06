# 🔎 Buscador de GitHub

Aplicación web desarrollada con **HTML5, CSS3 y JavaScript** que permite consultar información pública de usuarios de GitHub mediante la API REST oficial. Facilita la visualización de perfiles, estadísticas, repositorios y documentación README de cada usuario.

## 📌 Descripción del proyecto

**Buscador de GitHub** es una aplicación web que permite buscar cualquier usuario de GitHub a través de su nombre de usuario y consultar información relevante de su perfil sin necesidad de iniciar sesión.

El proyecto consume información directamente desde la API pública de GitHub y presenta los resultados mediante una interfaz organizada, intuitiva y adaptable.

Su desarrollo tiene como propósito poner en práctica conceptos fundamentales del desarrollo frontend, el consumo de servicios externos y la manipulación dinámica del DOM con JavaScript.

## ✨ Funcionalidades principales

- **Búsqueda de usuarios:** consulta perfiles utilizando el nombre de usuario de GitHub.
- **Información del perfil:** muestra nombre, nombre de usuario, biografía y avatar.
- **Estadísticas:** permite visualizar:
  - Repositorios públicos.
  - Número de seguidores.
  - Personas que sigue.
  - Gists públicos.
- **Repositorios:** muestra hasta 10 repositorios ordenados por última actualización, incluyendo su nombre, descripción y enlace.
- **README del perfil:** consulta y presenta el README del repositorio especial del usuario, cuando está disponible.
- **Validación de datos:** controla entradas incorrectas y campos vacíos.
- **Indicador de carga:** informa al usuario mientras se realizan las consultas.
- **Manejo de errores:** identifica usuarios inexistentes y problemas relacionados con los límites de solicitudes de la API.

## 🛠️ Tecnologías utilizadas

| Tecnología | Aplicación en el proyecto |
|---|---|
| HTML5 | Estructura y organización del contenido. |
| CSS3 | Diseño visual, estilos y adaptación de la interfaz. |
| JavaScript | Lógica de programación e interacción dinámica. |
| Fetch API | Comunicación con servicios externos. |
| Async / Await | Gestión de operaciones asíncronas. |
| GitHub REST API | Obtención de información pública de GitHub. |
| DOM | Actualización dinámica de los elementos HTML. |

## 📂 Estructura del proyecto

```text
Buscador-de-github/
│
├── index.html       # Estructura principal de la aplicación
├── style.css        # Estilos y diseño visual
├── script.js        # Lógica y funcionalidades
└── README.md        # Documentación del proyecto
```

## ⚙️ Instalación y ejecución

No es necesario instalar dependencias ni configurar un servidor backend.

**1. Clonar el repositorio**

```bash
git clone https://github.com/oscarchavesamorocho-wq/Buscador-de-github.git
```

**2. Ingresar a la carpeta**

```bash
cd Buscador-de-github
```

**3. Ejecutar la aplicación**

Abre el archivo `index.html` directamente en tu navegador o utiliza la extensión Live Server de Visual Studio Code.

**4. Realizar una búsqueda**

Escribe un nombre de usuario de GitHub, por ejemplo:

```text
torvalds
```

Presiona el botón **Buscar usuario** para consultar la información.

## 🌐 API utilizada

El proyecto utiliza la API REST pública de GitHub para obtener información en tiempo real.

Documentación oficial:

https://docs.github.com/es/rest

Principales endpoints utilizados:

| Endpoint | Función |
|---|---|
| `/users/{username}` | Consultar información del perfil. |
| `/users/{username}/repos` | Obtener repositorios públicos. |
| `/repos/{username}/{username}/readme` | Consultar el README del perfil. |

**Nota:** La aplicación no requiere tokens de autenticación para las consultas públicas implementadas. Sin embargo, las solicitudes sin autenticación están sujetas a los límites de uso establecidos por GitHub.

## 🎯 Objetivos de aprendizaje

Este proyecto permite fortalecer conocimientos en:

- Fundamentos de HTML, CSS y JavaScript.
- Manipulación del DOM.
- Consumo de API REST.
- Manejo de solicitudes HTTP.
- Programación asíncrona con `async` y `await`.
- Manejo de excepciones y validación de información.
- Organización y separación de responsabilidades en archivos frontend.

## 🚀 Despliegue

La aplicación puede publicarse gratuitamente mediante **GitHub Pages**.

Pasos generales:

1. Ingresar al repositorio en GitHub.
2. Abrir la sección `Settings`.
3. Seleccionar `Pages`.
4. En `Build and deployment`, seleccionar `Deploy from a branch`.
5. Elegir la rama `main` y la carpeta `/ (root)`.
6. Guardar los cambios y esperar la publicación.

## 👨‍💻 Autor

**Oscar Chaves**

Estudiante de Análisis y Desarrollo de Software (ADSO).

Proyecto desarrollado con fines educativos y de aprendizaje práctico en desarrollo web frontend.

---

**Desarrollado con HTML, CSS y JavaScript.**
