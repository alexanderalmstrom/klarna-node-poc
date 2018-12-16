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

if (process.env.NODE_ENV == 'production') {
  router.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
    next()
  })
} else {
  router.all('/*', cors())
}

router.get('/', function (req, res, next) {
  next()
})

router.post('/orders', function (req, res, next) {
  const token = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`

  requestPromise({
    method: 'POST',
    uri: 'https://api.playground.klarna.com/checkout/v3/orders',
    body: req.body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    json: true
  }).then(response => {
    console.log(response)
    res.send({
      html_snippet: response.html_snippet,
      order_id: response.order_id
    })
  }).catch(error => {
    console.log(error)
  })
})

router.get('/orders/:id', function (req, res, next) {
  const token = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`

  requestPromise({
    method: 'GET',
    uri: `https://api.playground.klarna.com/checkout/v3/orders/${req.params.id}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    json: true
  }).then(response => {
    console.log(response)
    res.send({
      html_snippet: response.html_snippet
    })
  }).catch(error => {
    console.log(error)
  })
})

app.use(bodyParser.json())
app.use('/api', router)
app.use('/.netlify/functions/server', router)

module.exports = app
module.exports.handler = serverless(app)