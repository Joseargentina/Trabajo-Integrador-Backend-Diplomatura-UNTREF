import mongoose from 'mongoose'
process.loadEnvFile()

// Obtenemos la URI  de las variables de entorno
const URI = process.env.MONGODB_URLSTRING
const DATABASE_NAME = process.env.DATABASE_NAME

// Conectar a MongoDB usando Mongoose
export const connectDB = async () => {
  try {
    await mongoose
      .connect(URI + DATABASE_NAME)
    return console.log('Conectado a Mongo DB')
  } catch (err) {
    console.log('Error al conectar a MongoDB: ', err)
    return console.log('Error al conectarse : ', err)
  }
}
