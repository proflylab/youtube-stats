import axios from 'axios'
import compression from 'compression'
import cors from 'cors'
import express from 'express'

const app = express()
const http = require('http').createServer(app)

app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/watch', async (req, res) => {
  const { v: id } = req.query
  const { data } = await axios.get(`https://www.youtube.com/watch?v=${id}`)
  let likes =
    /"defaultText":{"accessibility":{"accessibilityData":{"label":"(.*?)"/g.exec(
      data
    )
  let viewCount = /viewCount":"(.*)","author/g.exec(data)
  if (viewCount) viewCount = +viewCount[1]
  if (likes) likes = +likes[1].replace(/\D/g, '')
  let averageRating = /averageRating":(.*),"allowRatings/g.exec(data)
  if (averageRating) averageRating = +averageRating[1]
  let dislikes = (likes * (5 - averageRating)) / (averageRating - 1)
  dislikes = Math.round(dislikes)
  return res.json({ id, viewCount, likes, dislikes, averageRating })
})

const ip = process.env.IP || '0.0.0.0'
const port = process.env.PORT || 3000
http.listen(port, ip, () => console.log(`Listening on ${ip}:${port}`))
