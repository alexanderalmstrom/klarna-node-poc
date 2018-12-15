require('dotenv').config()

const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const requestPromise = require('request-promise')

const app = express()
const server = http.createServer(app)
const router = express.Router()
const port = process.env.PORT || 5000

const credentials = {
  username: process.env.KLARNA_USERNAME,
  password: process.env.KLARNA_PASSWORD
}

const config = {
  purchase_country: "se",
  purchase_currency: "sek",
  locale: "sv-se"
}

app.use(bodyParser.json())

app.post('/orders', function (req, res) {
  const data = Object.assign(config, req.body)
  const token = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`

  requestPromise({
    method: 'POST',
    uri: 'https://api.playground.klarna.com/checkout/v3/orders',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    json: true
  }).then(response => {
    console.log(response)
    res.send({ html_snippet: response.html_snippet })
  }).catch(error => {
    console.log(error)
  })
})

app.use('/api', router)

server.listen(port, function () {
  console.log("Listening on port %s", server.address().port)
})
