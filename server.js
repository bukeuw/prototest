const pusher = require('./pusher')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const morgan = require('morgan')
const protobuf = require('protobufjs')

const app = express()

const users = require('./data/db/users')
const customers = require('./data/db/customers')
const repairs = require('./data/db/repairs')
const histories = require('./data/db/histories')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(morgan('combined'))
app.use(compression())

let User = {}
let UserList = {}
let Customer = {}
let CustomerList = {}
let Repair = {}
let RepairList = {}

protobuf.load('./data/user.proto')
  .then(root => {
    User = root.lookupType('User')
    UserList = root.lookupType('UserList')
  })

protobuf.load('./data/customer.proto')
  .then(root => {
    Customer = root.lookupType('Customer')
    CustomerList = root.lookupType('CustomerList')
  })

protobuf.load('./data/repair.proto')
  .then(root => {
    Repair = root.lookupType('Repair')
    RepairList = root.lookupType('RepairList')
  })

app.get('/api/users', (req, res) => {
  res.json(users)
})

app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id)
  const user = users.find(usr => usr.id === userId)

  if (!user) {
    res.status(404).send({ errors: ['user not found'] })
  }

  res.json(user)
})

app.get('/api/customers', (req, res) => {
  res.json(customers)
})

app.get('/api/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id)
  const customer = customers.find(c => c.id === customerId)

  if (!customer) {
    res.status(404).json({ errors: ['customer not found'] })
  }

  res.json(customer)
})

app.get('/api/repairs', (req, res) => {
  const data = repairs.map(repair => ({
    ...repair,
    histories: histories.filter(h => h.repair_id === repair.id)
  }))

  res.json(data)
})

app.get('/api/repairs/:id', (req, res) => {
  const repairId = parseInt(req.params.id)
  const repair = repairs.filter(r => r.id === repairId)
    .map(r => ({
      ...r,
      histories: histories.filter(h => h.repair_id === r.id)
    }))[0]

  if (!repair) {
    res.status(404).json({ errors: ['repair not found'] })
  }

  res.json(repair)
})

app.get('/api/v2/users', (req, res) => {
  const data = UserList.encode({users}).finish()
  res.header('Content-Type', 'application/protobuf')
  res.send(data)
})

app.get('/api/v2/users/:id', (req, res) => {
  const userId = parseInt(req.params.id)
  const user = users.find(usr => usr.id === userId)

  if (!user) {
    res.status(404).send({ errors: ['user not found'] })
  }

  const data = User.encode(user).finish()
  res.header('Content-Type', 'application/protobuf')
  res.send(data)
})

app.get('/api/v2/customers', (req, res) => {
  const data = CustomerList.encode({customers}).finish()
  res.header('Content-Type', 'application/protobuf')
  res.send(data)
})

app.get('/api/v2/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id)
  const customer = customers.find(c => c.id === customerId)

  if (!customer) {
    res.status(404).json({ errors: ['customer not found'] })
  }

  const data = Customer.encode(customer).finish()
  res.header('Content-Type', 'application/protobuf')
  res.send(data)
})

app.get('/api/v2/repairs', (req, res) => {
  const repairsData = repairs.map(repair => ({
    ...repair,
    histories: histories.filter(h => h.repair_id === repair.id)
  }))

  const data = RepairList.encode({ repairs: repairsData }).finish()

  res.header('Content-Type', 'application/protobuf')
  res.send(data)
})

app.get('/api/v2/repairs/:id', (req, res) => {
  const repairId = parseInt(req.params.id)
  const repair = repairs.filter(r => r.id === repairId)
    .map(r => ({
      ...r,
      histories: histories.filter(h => h.repair_id === r.id)
    }))[0]

  if (!repair) {
    res.status(404).json({ errors: ['repair not found'] })
  }

  const data = Repair.encode(repair).finish()

  res.header('Content-Type', 'application/protobuf')
  res.send(data)
})

app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id
  const channel = req.body.channel_name
  const auth = pusher.authenticate(socketId, channel)
  res.send(auth)
})

app.get('/pusher/key', (req, res) => {
  const appKey = process.env.FIREBASE_KEY || ''

  return res.json({ appKey })
})

const port = process.env.PORT || 5000
app.listen(port)
