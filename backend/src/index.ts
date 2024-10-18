import express from 'express'
import { PrismaClient } from '@prisma/client'
import init from './init'
import fs from 'fs'
import crypto from 'crypto'


if(!fs.existsSync('./assets')) fs.mkdirSync('./assets')

const port = process.env.PORT || 4274
const app = express()
const prisma = new PrismaClient()
init()

export { prisma, app, port }

app.use(express.static("www"))

app.use(express.json({
  limit: '20mb'
}))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/login', async (req, res) => {
  const { password } = req.body

  if (!password) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Password is required'
  })

  const config = await prisma.config.findUnique({ where: { key: 'password' } })
  if (!config) return res.status(500).json({ 
    error: true,  
    type: 'internal_server_error',
    message: 'Password not found'
  })

  if (config.value !== password) return res.status(401).json({ 
    error: true,  
    type: 'unauthorized',
    message: 'Invalid password'
  })

  const token = await prisma.config.findUnique({ where: { key: 'token' } })
  if (!token) return res.status(500).json({ 
    error: true,  
    type: 'internal_server_error',
    message: 'Token not found'
  })

  res.json({ 
    error: false,  
    token: token?.value
  })
})

app.get('/api/verifyToken', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  res.json({ 
    error: false,  
    authenticated
  })
})

app.patch('/api/password', async (req, res) => {
  const { password } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!password) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Password is required'
  })

  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })
  
  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })
  
  await prisma.config.update({ where: { key: 'password' }, data: { value: password } })

  res.json({ 
    error: false
  })
})

app.get('/api/general', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const title = await prisma.config.findUnique({ where: { key: 'title' } })
  const subtitle = await prisma.config.findUnique({ where: { key: 'subtitle' } })
  const banner = await prisma.config.findUnique({ where: { key: 'banner' } })
  const wallpaper = await prisma.config.findUnique({ where: { key: 'wallpaper' } })

  res.json({ 
    error: false,  
    title: title?.value,
    subtitle: subtitle?.value,
    banner: banner?.value,
    wallpaper: wallpaper?.value
  })
})

app.patch('/api/general', async (req, res) => {
  const { title, subtitle, banner, wallpaper } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!title) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Title is required'
  })

  if (!subtitle) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Subtitle is required'
  })

  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  await prisma.config.upsert({
    where: { key: 'title' },
    update: { value: title },
    create: { key: 'title', value: title }
  })

  await prisma.config.upsert({
    where: { key: 'subtitle' },
    update: { value: subtitle },
    create: { key: 'subtitle', value: subtitle }
  })

  await prisma.config.upsert({
    where: { key: 'banner' },
    update: { value: banner },
    create: { key: 'banner', value: banner }
  })

  await prisma.config.upsert({
    where: { key: 'wallpaper' },
    update: { value: wallpaper },
    create: { key: 'wallpaper', value: wallpaper }
  })

  res.json({ 
    error: false
  })
})

app.get('/api/servers', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const servers = await prisma.servers.findMany({
    select: {
      id: true,
      title: true,
      logo: true,
      logoPosition: true,
      banner: true,
      position: true,
      
      services: {
        select: {
          id: true,
          title: true,
          icon: true,
          subtitle: true,
          link: true,
          position: true
        },
        orderBy: {
          position: 'asc'
        }
      },
    },
    orderBy: {
      position: 'asc'
    }
  })

  res.json({ 
    error: false,  
    servers
  })
})

app.post('/api/servers', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const { title, logo, logoPosition, banner } = req.body

  if (!title) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Title is required'
  })

  if (!logo) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Logo is required'
  })

  if (!logoPosition || !['l', 'c', 'r'].includes(logoPosition)) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Logo position is required and must be [l, c, r]'
  })

  const server = await prisma.servers.create({
    data: {
      title,
      logo,
      logoPosition,
      banner
    }
  })

  res.json({ 
    error: false,  
    server
  })
})

app.get('/api/service/:service', async (req, res) => {
  const { service } = req.params
  const token = req.headers.authorization?.split(' ')[1]

  if (!service) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Service is required'
  })

  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })
  
  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })
  
  const serviceData = await prisma.services.findUnique({ where: { id: service } })
  if (!serviceData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Service not found'
  })

  res.json({ 
    error: false,  
    service: serviceData
  })
})

app.patch('/api/service/:service', async (req, res) => {
  const { service } = req.params
  const { title, icon, subtitle, link } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!service) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Service is required'
  })

  if (!title) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Title is required'
  })

  if (!icon) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Icon is required'
  })

  if (!link) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Link is required'
  })

  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })
  
  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })
  
  const serviceData = await prisma.services.findUnique({ where: { id: service } })
  if (!serviceData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Service not found'
  })

  await prisma.services.update({ where: { id: service }, data: { title, icon, subtitle, link } })

  res.json({ 
    error: false
  })
})

app.post('/api/service', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const { server, title, icon, subtitle, link } = req.body

  if (!server) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server is required'
  })

  if (!title) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Title is required'
  })

  if (!icon) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Icon is required'
  })

  if (!link) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Link is required'
  })

  const serverData = await prisma.servers.findUnique({ where: { id: server } })
  if (!serverData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server not found'
  })

  const services = await prisma.services.count({ where: { serverID: server } })

  const service = await prisma.services.create({
    data: {
      title,
      icon,
      subtitle,
      link,
      position: services,
      server: {
        connect: {
          id: server
        }
      }
    }
  })

  res.json({ 
    error: false,  
    service
  })

})

app.patch('/api/service/positions', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({
    error: true,
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const { server, service, position } = req.body

  if (!server) return res.status(400).json({
    error: true,
    type: 'invalid_request',
    message: 'Server is required'
  })
  if(!service) return res.status(400).json({
    error: true,
    type: 'invalid_request',
    message: 'Service is required'
  })
  if(typeof position !== 'number') return res.status(400).json({
    error: true,
    type: 'invalid_request',
    message: 'Position is required'
  })
  const serverData = await prisma.servers.findUnique({
    where: { id: server },
    include: { services: { orderBy: { position: 'asc' } } }
  })
  if (!serverData) return res.status(400).json({
    error: true,
    type: 'invalid_request',
    message: 'Server not found'
  })

  const serviceData = serverData.services.find(s => s.id === service)
  if (!serviceData) return res.status(400).json({
    error: true,
    type: 'invalid_request',
    message: 'Service not found'
  })

  const services = serverData.services.filter(s => s.id !== service)
  services.splice(position, 0, serviceData)

  const updatePromises = services.map((s, index) => {
    return prisma.services.update({
      where: { id: s.id },
      data: { position: index }
    })
  })

  await Promise.all(updatePromises)

  res.json({
    error: false
  })
})

app.delete('/api/service/:service', async (req, res) => {
  const { service } = req.params
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const serviceData = await prisma.services.findUnique({ where: { id: service } })
  if (!serviceData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Service not found'
  })

  await prisma.services.delete({ where: { id: service } })

  await prisma.services.updateMany({
    where: {
      serverID: serviceData.serverID,
      position: {
        gte: serviceData.position
      }
    },
    data: {
      position: {
        decrement: 1
      }
    }
  })

  res.json({ 
    error: false
  })
})

app.patch('/api/servers/positions', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const { serverA, serverB } = req.body

  if (!serverA) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server A is required'
  })

  if (!serverB) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server B is required'
  })

  const serverAData = await prisma.servers.findUnique({ where: { id: serverA } })
  const serverBData = await prisma.servers.findUnique({ where: { id: serverB } })

  if (!serverAData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server A not found'
  })

  if (!serverBData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server B not found'
  })

  const serverAposition = serverAData.position
  const serverBposition = serverBData.position

  await prisma.servers.update({ where: { id: serverA }, data: { position: serverBposition } })
  await prisma.servers.update({ where: { id: serverB }, data: { position: serverAposition } })

  res.json({ 
    error: false
  })
})

app.patch('/api/servers/:server', async (req, res) => {
  const { server } = req.params
  const { title, logo, logoPosition, banner } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!server) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server is required'
  })

  if (!title) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Title is required'
  })

  if (!logo) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Logo is required'
  })

  if (!logoPosition || !['l', 'c', 'r'].includes(logoPosition)) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Logo position is required and must be [l, c, r]'
  })

  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })
  
  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })
  
  const serverData = await prisma.servers.findUnique({ where: { id: server } })
  if (!serverData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server not found'
  })

  await prisma.servers.update({ where: { id: server }, data: { title, logo, logoPosition, banner } })

  res.json({ 
    error: false
  })
})

app.delete('/api/servers/:server', async (req, res) => {
  const { server } = req.params
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const serverData = await prisma.servers.findUnique({ where: { id: server } })
  if (!serverData) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Server not found'
  })

  await prisma.services.deleteMany({ where: { serverID: server } })
  await prisma.servers.delete({ where: { id: server } })
  
  res.json({ 
    error: false
  })
})

app.get("/api/assets", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const assets = fs.readdirSync('./assets')

  res.json({ 
    error: false,  
    assets
  })
});

app.post('/api/assets', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })

  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })

  const { name, data } = req.body

  if (!name) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Name is required'
  })

  if (!data) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Data is required'
  })

  // data is base64 encoded
  const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  fs.writeFileSync(`./assets/${name}`, Uint8Array.from(buffer))

  res.json({ 
    error: false
  })
})

app.delete('/api/assets/:asset', async (req, res) => {
  const { asset } = req.params
  const token = req.headers.authorization?.split(' ')[1]
  if (!asset) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'Asset is required'
  })
  if (!token) return res.status(400).json({ 
    error: true,  
    type: 'invalid_request',
    message: 'No token provided'
  })
  
  const authenticated = await authenticate(token)
  if(!authenticated) return res.status(401).json({
    error: true,
    type: 'unauthorized',
    message: 'Invalid token'
  })
  
  fs.unlinkSync(`./assets/${asset}`)

  res.json({ 
    error: false
  })
})


async function authenticate(token: string): Promise<boolean> {
  if (!token) return false

  const realToken = await prisma.config.findUnique({ where: { key: 'token' } })
  if (!realToken) return false

  return token === realToken.value
}

app.get('/assets/:file', (req, res) => {
  const { file } = req.params
  res.sendFile(file, { root: './assets' })
})

app.listen(port, () => {
  console.log('Server is running on port ' + port)
})
