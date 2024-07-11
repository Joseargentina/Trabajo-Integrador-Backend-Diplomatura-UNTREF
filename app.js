import express from 'express'
import jwt from 'jsonwebtoken'
import morgan from 'morgan'
import { connectDB } from './dataBase.js'
import { ProductModel, UsuarioModel, validarUsuario, validarCredenciales } from './product.js'
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser'
connectDB()
process.loadEnvFile()
const SECRET_KEY = process.env.SECRET_KEY
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) // parseo el numero  de SALT porque  las variables de entorno siempre se leen como cadenas de texto
const PORT = process.env.PORT ?? 3000

const app = express()
app.disable('x-powered-by')
app.use(morgan('dev'))

// Midleware para parsear JSON
app.use(express.json())
// Midleware para parsar cookies
app.use(cookieParser())

// Middleware para verificar el token JWT en las cookies y almacenar los datos del usuario en la sesión
app.use((req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_KEY)
    req.session.user = data
  } catch (error) {
    console.error('Error verifying JWT token:', error)
  }

  next()
})

app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API de inmobiliaria!')
})

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

// Ruta para obtener un producto por su ID
app.get('/productos/id/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      res.status(400).json({ message: 'ID de producto no proporcionado' })
      return
    }
    const producto = await ProductModel.findById(id)
    if (producto) return res.status(200).json({ message: 'Producto encontrado', producto })
    res.status(404).json({ message: 'Producto no encontrado' })
  } catch (err) {
    console.error('Error al obtener producto:', err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Ruta para filtrar productos por nombre (busqueda parcial)
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
    if (productosEncontrados) {
      res.status(200).json({ message: 'Productos encontrados: ', productosEncontrados })
    } else {
      return res.status(404).json({ message: 'No se encontraron productos con ese nombre' })
    }
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

// Modificar un producto parcialmente
app.patch('/productos/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      res.status(400).json({ message: 'Error se necesita un ID valido' })
      return
    }
    const producto = await ProductModel.findByIdAndUpdate(id, req.body, { new: true })
    producto
      ? res.status(200).json({ message: 'Producto actualizado con éxito', producto })
      : res.status(404).json({ message: 'No se encontró el producto' })
  } catch (err) {
    console.error('Error al obtener producto por ID:', err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Modificar un producto completamente
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params
  console.log(id)
  try {
    if (!id) {
      res.status(400).json({ message: 'Error se necesita un ID valido' })
      return
    }
    const productoActualizado = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
      overwrite: true
    })
    productoActualizado
      ? res.status(200).json({ message: 'Producto actualizado completamente con éxito', productoActualizado })
      : res.status(404).json({ message: 'No se encontró el producto para actualizar' })
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
    if (productoAeliminar) {
      res.status(204).json({ message: 'Producto eliminado con éxito' })
    } else {
      res.status(404).json({ message: 'No se encontró el producto para eliminar' })
    }
  } catch (err) {
    console.error('Error al eliminar el producto:', err)
    res.status(500).json({ message: 'Error interno en el servidor' })
  }
})

// ------ Ruta para el registro de usuario -------
app.post('/registro', async (req, res) => {
  const { usuario, email, contraseña } = req.body
  console.log(usuario, email)
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
      }).status(201).json({ message: 'Usuario registrado con éxito', token })
    } else {
      return res.status(404).send('Error al registrar el usuario')
    }
  } catch (error) {
    console.error(error) // Mantén el registro del error en el servidor
    return res.status(500).send({ error: 'Error interno en el servidor' })
  }
})

// Ruta para login de usuario
app.post('/login', async (req, res) => {
  const { usuario, contraseña } = req.body
  try {
    // Verificar si las credenciales son correctas
    const resultadoValidacion = await validarCredenciales(usuario, contraseña)
    if (!resultadoValidacion.success) {
      return res.status(400).json({ message: resultadoValidacion.error })
    }
    // Si las credenciales son válidas, generar un token
    const token = jwt.sign({ usuario }, SECRET_KEY, { expiresIn: '1h' })
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60
    }).json({ message: `Usuario ${usuario} logueado con éxito`, token })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error: 'Error interno del servidor' })
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('access_token').send({ message: 'Logout Successful' })
})

// Middleware para manejar rutas protegidas
const verifyToken = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Acceso no autorizado' })
  }
  next()
}

// -------- Ruta Protegida -------------
app.get('/perfil', verifyToken, (req, res) => {
  res.status(200).json({ message: `Bienvenido a tu perfil, ${req.session.user.usuario}` })
})

// Midleware para manejo de rutas incorrectas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

app.listen(PORT, (req, res) => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Middleware global para manejo de errores
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).json({ message: 'Error interno en el servidor' })
// })
