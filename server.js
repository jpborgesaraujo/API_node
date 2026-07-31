import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'

const app = express()

app.use(express.json())

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  age: { type: Number, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

app.post('/usuarios', async (req, res) => {
  try {
    const name = req.body.name?.trim()
    const email = req.body.email?.trim()
    const ageValue = Number(req.body.age)
    const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'USER'

    if (!name) {
      return res.status(400).json({ error: 'O campo name é obrigatório.' })
    }

    if (!email) {
      return res.status(400).json({ error: 'O campo email é obrigatório.' })
    }

    if (!Number.isInteger(ageValue)) {
      return res.status(400).json({ error: 'O campo age deve ser um número inteiro.' })
    }

    const user = new User({
      name,
      email,
      age: ageValue,
      role,
    })

    await user.save()

    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/usuarios', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Conectado ao MongoDB')

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message)
    process.exit(1)
  }
}

startServer()