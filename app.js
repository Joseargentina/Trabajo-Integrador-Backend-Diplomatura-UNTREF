import express from 'express'
import morgan from 'morgan'
import { connectDB } from './dataBase.js'
import { ProductModel } from './product.js'
connectDB()
const PORT = process.env.PORT ?? 3000

const app = express()
app.disable('x-powered-by')
app.use(morgan('dev'))

// Midleware para parsear JSON
app.use(express.json())

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
app.patch('/productos/parcial/:id', async (req, res) => {
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
app.put('/productos/completa/:id', async (req, res) => {
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
      res.status(200).json({ message: 'Producto eliminado con éxito' })
    } else {
      res.status(404).json({ message: 'No se encontró el producto para eliminar' })
    }
  } catch (err) {
    console.error('Error al eliminar el producto:', err)
    res.status(500).json({ message: 'Error interno en el seridor' })
  }
})

// Midleware para manejo de rutas incorrectas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

app.listen(PORT, (req, res) => {
  console.log(`Server running on http://localhost:${PORT}`)
})
