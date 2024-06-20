import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
  codigo: Number,
  nombre: { type: String, required: true },
  precio: Number,
  categoria: String
})

export const ProductModel = mongoose.model('Mobiliarios', productSchema)
