# Proyecto Integrador: CRUD con Node.js y MongoDB

## Alumno: José Barone

## Descripción del Proyecto

Este proyecto desarrolla una aplicación basada en Node.js y MongoDB que permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en una base de datos de mobiliarios. Además, utilizamos MongoDB Compass para visualizar y administrar los datos de manera eficiente.

## Dependencias

Las dependencias utilizadas en este proyecto son:

- **express**: Un framework minimalista para aplicaciones web en Node.js.
- **morgan**: Un middleware de registro de solicitudes HTTP.
- **jsonwebtoken**: Para la autenticación basada en tokens JWT.
- **mongoose**: Una biblioteca de modelado de datos para MongoDB y Node.js.
- **bcrypt**: Biblioteca para hash de contraseñas.

Las dependencias de desarrollo instaladas son:

- **standard**: Un linter de JavaScript que utiliza la configuración de estilo de codificación estándar.

## Instrucciones para correr el proyecto

### Prerrequisitos

Antes de empezar, asegúrate de tener instalado Node.js y MongoDB en tu máquina. Si no los tienes, puedes descargarlos e instalarlos desde los siguientes enlaces:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Uso de MongoDB Compass

Para visualizar y administrar los datos en tu base de datos MongoDB, utiliza [MongoDB Compass](https://www.mongodb.com/products/compass).

### Instalación

1. **Fork del Repositorio**:

   - Haz un fork de este repositorio en tu cuenta de GitHub.

2. **Clonar el Repositorio**:

   - Clona el repositorio forkeado a tu máquina local.
     ```bash
     git clone https://github.com/tu-usuario/nombre-del-repositorio.git
     ```

3. **Instalar Dependencias**:

   - Navega al directorio del proyecto y ejecuta el siguiente comando para instalar las dependencias necesarias:
     ```bash
     npm install
     ```

### Configuración

1. Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables de entorno:

     ```env
    PORT=3008
    MONGODB_URISTRING=mongodb+srv://tunombredeusuario:contraseña@nosqldatabase.xwwhxd3.mongodb.net/
    DATABASE_NAME=nombre_de_la_base_de_datos
    COLLECTION_NAME_1=nombre_de_la_coleccion_1
    COLLECTION_NAME_2=nombre_de_la_coleccion_2
    SALT_ROUNDS=numero_de_salt_rounds
    SECRET_KEY=tu_clave_secreta
    ```

    - `PORT`: El puerto en el que se ejecutará la aplicación.
    - `MONGODB_URISTRING`: La URI de conexión a tu base de datos MongoDB.
    - `DATABASE_NAME`: El nombre de la base de datos.
    - `COLLECTION_NAME_1`: El nombre de la colección 1.
    - `COLLECTION_NAME_2`: El nombre de la colección 2.
    - `SALT_ROUNDS`: Un número que representa las vueltas de salt para bcrypt.
    - `SECRET_KEY`: Una clave secreta para la firma de los tokens JWT.

### Configuración del `package.json`

- `"type": "module"`: Esto permite el uso de módulos ES en lugar de CommonJS.
- `"scripts"`: Define los comandos para iniciar el servidor.
  - `"start": "node --watch app.js"`: Este comando inicia el servidor y lo reinicia automáticamente cuando hay cambios en el archivo `app.js`.
- `"eslintConfig"`: Configuración de ESLint.
  - `"extends": "standard"`: Utiliza la configuración de standard para ESLint.

### Ejecutar el Proyecto

1. Inicia el servidor:

    ```bash
    npm start
    ```

    Esto iniciará la aplicación en el puerto especificado (por defecto, 3008). Puedes acceder a la aplicación en tu navegador en `http://localhost:3008`.

## Funcionalidades del CRUD

1. **Obtener todos los productos**
   - Endpoint: `GET /productos`
   - Descripción: Obtiene todos los productos de la colección.

2. **Obtener un producto por su ID**
   - Endpoint: `GET /productos/id/:id`
   - Descripción: Obtiene un producto por su ID.

3. **Filtrar productos**
   - Endpoint: `GET /productos/nombre/:nombre`
   - Descripción: Filtra productos por nombre (búsqueda parcial).

4. **Agregar un nuevo producto**
   - Endpoint: `POST /productos`
   - Descripción: Agrega un nuevo producto.

5. **Modificar el precio de un producto**
   - Endpoint: `PATCH /productos/:id`
   - Descripción: Modifica el precio de un producto usando PATCH.

6. **Modificar un producto completamente**
   - Endpoint: `PUT /productos/:id`
   - Descripción: Modifica un producto completamente usando PUT.

7. **Borrar un producto**
   - Endpoint: `DELETE /productos/eliminar/:id`
   - Descripción: Elimina un producto usando DELETE.

### Funcionalidades adicionales

1. **Registrar un usuario**
   - Endpoint: `POST /registro`
   - Descripción: Registra a un nuevo usuario.

2. **Login de usuario**
   - Endpoint: `POST /login`
   - Descripción: Logea a un usuario y devuelve un token JWT.

3. **Verificar el Token JWT**
   - Middleware: `verifyToken`
   - Descripción: Verifica si el token JWT es válido.

4. **Rutas protegidas**
   - Endpoint: `GET /perfil`
     - Descripción: Muestra el perfil del usuario si el token es válido.
   - Endpoint: `GET /usuarios`
     - Descripción: Muestra la lista de todos los usuarios registrados si el token es válido.

### Descripción de Archivos

- **/json**: Carpeta que contiene los datasets JSON.
- **/README.md**: Archivo con la descripción del proyecto.
- **/app.js**: Archivo principal de la aplicación Node.js donde se define toda la lógica de rutas y la conexión a la base de datos.
- **/database.js**: Archivo para configurar la conexión a la base de datos MongoDB.
- **/product.js**: Archivo que contiene el esquema (schema) del producto y el esquema de usuario utilizando Mongoose. Además, incluye funciones para validar al usuario y validar las credenciales.

## Autor

Este proyecto fue creado por José Barone. Este es el link del trabajo en GitHub:

- [GitHub](https://github.com/Joseargentina/Trabajo-Integrador-Backend-Diplomatura-UNTREF)