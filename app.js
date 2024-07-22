import express from 'express'
import jwt from 'jsonwebtoken'
import morgan from 'morgan'
import { connectDB } from './dataBase.js'
import { ProductModel, UsuarioModel, validarUsuario, validarCredenciales } from './product.js'
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

process.loadEnvFile()
const SECRET_KEY = process.env.SECRET_KEY
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) // parseo el numero de SALT porque las variables de entorno siempre se leen como cadenas de texto
const PORT = process.env.PORT ?? 3000

const app = express()
app.disable('x-powered-by')
app.use(morgan('dev'))

connectDB() // Conectar a la base de datos

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', `${__dirname}/views`)

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Middleware para verificar el token JWT en las cookies y almacenar los datos del usuario en la sesión
app.use((req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }

  if (!token) {
    console.log('No JWT token provided')
    return next()
  }

  try {
    const data = jwt.verify(token, SECRET_KEY)
    // Si la verificación es exitosa, almacena los datos decodificados en req.session.user
    req.session.user = data
  } catch (error) {
    console.error('Error verifying JWT token:', error)
    return res.status(401).json({ error: 'Token inválido o no proporcionado' })
  }

  next()
})

// Ruta Raíz
app.get('/', (req, res) => {
  res.render('index', { title: '¡Bienvenido a mi API de inmobiliaria!' })
})

// -------Rutas CRUD para productos------------
// Ruta para obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await ProductModel.find()
    productos
      ? res.status(200).json({ message: 'Bienvenidos a mi API de Inmoviliaria', productos })
      : res.status(404).json({ message: 'No se encontraron productos' })
  } catch (err) {
    console.error('Error al traer los productos:', err)
    res.status(500).json({ message: 'Error interno en el servidor' })
  }
})

// Busca un producto por su ID
app.get('/productos/id/:id', async (req, res) => {
  const { id } = req.params
  try {
    const producto = await ProductModel.findById(id)
    if (producto) return res.status(200).json({ message: 'Producto encontrado', producto })
    res.status(404).json({ message: 'Producto no encontrado' })
  } catch (err) {
    console.error('Error al obtener producto:', err)
    res.status(500).json({ message: 'Error interno en el servidor' })
  }
})

// Filtrar productos por su nombre (busqueda parcial)
app.get('/productos/nombre/:nombre', async (req, res) => {
  const { nombre } = req.params
  try {
    if (!nombre) {
      res.status(400).json({ message: 'Nombre de producto no proporcionado' })
      return
    }
    // Usar una expresión regular para buscar nombres que contengan la parte específica
    const query = { nombre: { $regex: `^${nombre}`, $options: 'i' } }
    const productosEncontrados = await ProductModel.find(query)
    !productosEncontrados
      ? res.status(404).json({ message: 'No se encontraron productos con ese nombre' })
      : res.status(200).json({ message: 'Productos encontrados', productosEncontrados })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Agregar un nuevo producto
app.post('/productos', async (req, res) => {
  const { categoria, nombre, precio } = req.body
  try {
    // Obtengo la cantidad total de los productos
    const totalProductos = await ProductModel.countDocuments()

    // Calcular el codigo del nuevo producto
    const nuevoCodigo = totalProductos + 1

    // Crear el nuevo producto con el código asignado
    const nuevoProducto = new ProductModel({
      codigo: nuevoCodigo,
      nombre,
      categoria,
      precio
    })

    // Guardar el nuevo producto en la base de datos y enviamos el producto creado
    const productoGuardado = await nuevoProducto.save()
    if (productoGuardado) {
      res.status(201).json({ message: 'Producto creado con éxito', productoGuardado })
    } else {
      res.status(404).send('Error al agregar el producto')
    }
  } catch (err) {
    console.error('Error al agregar un producto:', err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Modificar parcialmente un producto
app.patch('/productos/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      res.status(400).json({ message: 'Error se necesita un ID valido' })
      return
    }
    const producto = await ProductModel.findByIdAndUpdate(id, req.body, { new: true })
    if (!producto) {
      return res.status(404).json({ message: 'No se encontró el producto' })
    }
    res.status(200).json({ message: 'Producto actualizado con éxito', producto })
  } catch (err) {
    console.error('Error al obtener producto por ID:', err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Modificar completamente un producto
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      res.status(400).json({ message: 'Error se necesita un ID valido' })
      return
    }
    const productoActualizado = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      overwrite: true
    })
    !productoActualizado
      ? res.status(404).json({ message: 'No se encontró el producto para actualizar' })
      : res.status(200).json({ message: 'Producto actualizado completamente con éxito', productoActualizado })
  } catch (err) {
    console.error('Error al modificar el producto:', err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Eliminar un producto por su id
app.delete('/productos/eliminar/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      res.status(400).json({ message: 'Error se necesita un ID valido' })
      return
    }
    const productoAeliminar = await ProductModel.findByIdAndDelete(id)
    !productoAeliminar
      ? res.status(404).json({ message: 'No se encontró el producto para eliminar' })
      : res.status(200).json({ message: 'Producto eliminado con éxito' })
  } catch (err) {
    console.error('Error al eliminar el producto:', err)
    res.status(500).json({ message: 'Error interno en el servidor' })
  }
})

// -------- Rutas para el registro de usuario ---------
app.get('/registro', (req, res) => {
  res.render('registro')
})
app.post('/registro', async (req, res) => {
  const { usuario, email, contraseña } = req.body

  // Verificar si todos los campos están completos
  if (!usuario || !email || !contraseña) {
    return res.render('registro', { error: 'Todos los campos son obligatorios' })
  }
  // Verificar si las credenciales son correctas
  const resultadoValidacion = await validarUsuario({ usuario, email })
  if (!resultadoValidacion.success) {
    return res.status(400).json({ message: resultadoValidacion.error })
  }

  try {
    // Generar el hash de la contraseña
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt)
    const nuevoUsuario = new UsuarioModel({
      usuario,
      email,
      contraseña: contraseñaHasheada // Asignar la contraseña hasheada
    })
    const usuarioRegistrado = await nuevoUsuario.save()
    console.log(usuarioRegistrado.usuario)
    if (usuarioRegistrado) {
      // Crear un JWT con información relevante (por ejemplo, el ID del usuario)
      const token = jwt.sign({ usuario: usuarioRegistrado._id }, SECRET_KEY, { expiresIn: '1h' })
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60
      })
      return res.status(201).redirect('/login')
    } else {
      return res.render('registro', { error: 'Error al registrar el usuario' })
    }
  } catch (error) {
    console.error(error) // Mantén el registro del error en el servidor
    return res.status(500).send({ error: 'Error interno en el servidor' })
  }
})

// Rutas para el login del usuario
app.get('/login', (req, res) => {
  res.render('login')
})
app.post('/login', async (req, res) => {
  const { usuario, contraseña } = req.body
  // Verificar si todos los campos están completos
  if (!usuario || !contraseña) {
    return res.render('login', { error: 'Todos los campos son obligatorios' })
  }
  try {
    // Verificar si las credenciales son correctas
    const resultadoValidacion = await validarCredenciales(usuario, contraseña)
    if (!resultadoValidacion.success) {
      return res.status(400).json({ message: resultadoValidacion.error })
    }

    // Obtener el usuario desde la base de datos
    const usuarioDB = await UsuarioModel.findOne({ usuario })

    if (!usuarioDB) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Si las credenciales son válidas, generar un token con usuarioDB._id
    const token = jwt.sign({ usuario: usuarioDB.usuario, email: usuarioDB.email }, SECRET_KEY, { expiresIn: '1h' })
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60
    })

    req.session.user = {
      usuario: usuarioDB.usuario,
      email: usuarioDB.email
    }

    // Renderiza la vista del perfil usuario (ruta protegida)
    return res.render('perfilUsuario', { usuario: req.session.user })
  } catch (error) {
    console.error(error)
    return res.status(500).render('login', { error: 'Error interno del servidor' })
  }
})

// Middleware para verificar si hay un token de sesión válido
const verifyToken = (req, res, next) => {
  // Verifica si existe un usuario en la sesión
  if (!req.session.user) {
    // Si no hay usuario en la sesión, devuelve un error de acceso no autorizado
    return res.status(401).json({ error: 'Acceso no autorizado' })
  }
  // Si hay un usuario en la sesión, permite continuar con la siguiente función de middleware
  next()
}

// Ruta para el cierre de sesión
app.post('/logout', verifyToken, (req, res) => {
  try {
    res.clearCookie('access_token')
    res.redirect('/logout') // Redirige a la vista de confirmación de cierre de sesión
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
    res.status(500).send('Error interno al cerrar sesión')
  }
})

// Ruta para la vista de confirmación de cierre de sesión
app.get('/logout', (req, res) => {
  res.render('logout')
})

// ----------- Rutas Protegidas ----------------
// Perfil de usuario (requiere autenticación)
app.get('/perfilUsuario', verifyToken, (req, res) => {
  res.render('perfilUsuario', { usuario: req.session.user })
})

// Listado de productos (requiere autenticación)
app.get('/listadoProductos', verifyToken, async (req, res) => {
  try {
    const productos = await ProductModel.find() || []

    res.render('listadoProductos', { productos }) // Renderiza la vista del listado de productos
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error interno en el servidor' })
  }
})

// Midleware para manejo de rutas incorrectas
app.use((req, res, next) => {
  res.status(404).render('404')
})

app.listen(PORT, (req, res) => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Middleware global para manejo de errores
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).json({ message: 'Error interno en el servidor' })
// })
