require('dotenv').config()

const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const requestPromise = require('request-promise')
const cors = require('cors')

const app = express()
const router = express.Router()

const credentials = {
  username: process.env.KLARNA_USERNAME,
  password: process.env.KLARNA_PASSWORD
}

const config = {
  purchase_country: "se",
  purchase_currency: "sek",
  locale: "sv-se"
}

router.all('*', cors())

router.get('/', function (req, res, next) {
  next()
})

router.post('/orders', function (req, res) {
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

app.use(bodyParser.json())
app.use('/.netlify/functions/server', router)

module.exports = app
module.exports.handler = serverless(app)