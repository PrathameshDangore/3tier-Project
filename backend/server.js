const express = require('express')
const cors    = require('cors')
const db      = require('./db')
const app     = express()

app.use(cors())
app.use(express.json())

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => {
  console.log('Backend running on port 3000')
}) 