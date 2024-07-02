import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

process.loadEnvFile()

// Esquema del producto
const productoSchema = new mongoose.Schema({
  codigo: { type: Number },
  nombre: { type: String, required: true },
  precio: { type: Number },
  categoria: { type: String }
})

// Esquema del usuario
const UsuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Validación de formato de correo electrónico y campo único
  contraseña: { type: String, required: true, minlength: 7 } // Validación de longitud mínima de contraseña
})

// Exportacion de los modelos
export const UsuarioModel = mongoose.model('Usuarios', UsuarioSchema)
export const ProductModel = mongoose.model('Mobiliarios', productoSchema)

// Función para validar un objeto de usuario
export async function validarUsuario (usuarioData) {
  try {
    const { usuario, email } = usuarioData
    console.log(usuario)
    // Verificar que el usuario exista
    const usuarioEncontrado = await UsuarioModel.findOne({ usuario })
    if (usuarioEncontrado) {
      throw new Error('El nombre de usuario ya existe, elige otro')
    }

    // Verificar si el correo electrónico ya está en uso
    const emailExistente = await UsuarioModel.findOne({ email })
    if (emailExistente) {
      throw new Error('El correo electrónico ya está en uso')
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function validarCredenciales (usuario, contraseña) {
  try {
    const usuarioEncontrado = await UsuarioModel.findOne({ usuario })
    if (!usuarioEncontrado) {
      throw new Error('El usuario ingresado no existe')
    }
    const esValido = await bcrypt.compare(contraseña, usuarioEncontrado.contraseña)
    if (!esValido) {
      throw new Error('Contraseña incorrecta')
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
