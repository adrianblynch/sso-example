require("dotenv").config({ silent: true, path: "../.env" })

const Koa = require("koa")
const Router = require("koa-router")
const morgan = require("koa-morgan")
const convert = require("koa-convert")
const session = require("koa-session")
const fs = require("fs")
const cors = require("@koa/cors")
const passport = require("koa-passport")

const port = process.env.PORT || 3000

const app = new Koa()
const router = new Router()

router.get("/secure-data", async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.status = 200
    ctx.body = { shhhhh: "It's a secret!" }
  } else {
    ctx.status = 403
    ctx.body = { status: 403, message: "You're not allowed in!" }
  }
})

app.keys = [process.env.AUTH_COOKIE_KEY]

const sessionConfig = { key: process.env.AUTH_COOKIE_NAME }

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((obj, done) => done(null, obj))

app
  .use(morgan(":method :url :status :res[content-length] bytes - :response-time ms"))
  .use(cors({ credentials: true }))
  .use(passport.initialize())
  .use(session(sessionConfig, app))
  .use(passport.session())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(port, () => console.log(`Listening on port ${port}`))
