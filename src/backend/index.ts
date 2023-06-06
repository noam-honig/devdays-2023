import express from 'express'
import { remultExpress } from 'remult/remult-express'
import { Task } from '../shared/Task'
import { TasksController } from '../shared/TasksController'

import { createPostgresDataProvider } from 'remult/postgres'
export const app = express()
app.get('/api/hi', (req, res) => res.send('Hello dev days 2023!!!'))

//#region auth
import session from 'cookie-session'
import type { UserInfo } from 'remult'
import { Employee, Person } from '../shared/test'

app.use(
  '/api',
  session({ secret: process.env['SESSION_SECRET'] || 'my secret' })
)

export const validUsers: UserInfo[] = [
  { id: '1', name: 'Jane', roles: ['admin'] },
  { id: '2', name: 'Steve' },
]
app.post('/api/signIn', express.json({ type: 'text' }), (req, res) => {
  const user = validUsers.find((user) => user.name === req.body.username)
  if (user) {
    req.session!['user'] = user
    res.json(user)
  } else {
    res.status(404).json("Invalid user, try 'Steve' or 'Jane'")
  }
})

app.post('/api/signOut', (req, res) => {
  req.session!['user'] = null
  res.json('signed out')
})

app.get('/api/currentUser', (req, res) => {
  res.json(req.session!['user'])
})
//#endregion

const api = remultExpress({
  entities: [Task, Employee, Person],
  controllers: [TasksController],
  dataProvider: createPostgresDataProvider({
    connectionString:
      process.env['DATABASE_URL'] ||
      'postgres://postgres:MASTERKEY@localhost/postgres',
  }),
  getUser: (req) => req.session!['user'],
})

app.use(api)

if (!process.env['VITE']) {
  const frontendFiles = process.cwd() + '/dist'
  app.use(express.static(frontendFiles))
  app.get('/*', (_, res) => {
    res.sendFile(frontendFiles + '/index.html')
  })
  app.listen(process.env['PORT'] || 3002, () => console.log('Server started'))
}
