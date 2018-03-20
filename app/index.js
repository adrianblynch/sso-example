require("dotenv").config({ silent: true, path: "../.env" })

const Koa = require("koa")
const Router = require("koa-router")
const morgan = require("koa-morgan")
const convert = require("koa-convert")
const bodyParse = require("koa-body")
const session = require("koa-session")
const fs = require("fs")
const axios = require("axios")

const passport = require("./passport")

const port = process.env.PORT || 3000

const app = new Koa()
const router = new Router()

const cookieName = process.env.AUTH_COOKIE_NAME

router.get("/", async (ctx) => {
  if (ctx.isAuthenticated()) {

    const apiUrl = "http://departures:3000/api/secure-data"

    ctx.status = 200
    ctx.body = `
      <h1>Web App</h1>
      <p>We're in!</p>
      <p><a href='/auth/logout'>Logout</a></p>
      <script>
        const getData = async () => fetch("${apiUrl}", { credentials: "include" }).then(res => res.json())

        ;(async () => {
          try {
            const secureData = await getData()
            console.log(secureData)
          } catch (e) {
            console.error(e)
          }
        })()
      </script>
    `
    // TODO: Investigate { credentials: "include" }

  } else {
    ctx.redirect("/auth/saml")
  }
})

router.get("/api/secure-data", async (ctx) => {

  // Get the cookies - Use a lib if doing this for real
  const ssoCookies = {
    [cookieName]:     ctx.cookies.get(cookieName),
    [`${cookieName}.sig`]: ctx.cookies.get(`${cookieName}.sig`)
  }

  try {
    const response = await axios.get("http://localhost:3001/secure-data", {
      headers: {
        Cookie: `${cookieName}=${ctx.cookies.get(cookieName)}; ${cookieName}.sig=${ctx.cookies.get(`${cookieName}.sig`)};`
      }
    })
    ctx.status = response.status
    ctx.body = response.data
  } catch (err) {
    ctx.status = 500
    ctx.body = { message: "Something went wrong getting data" }
  }
})

router.post("/saml/callback",
  passport.authenticate("saml", { failureRedirect: "/", failureFlash: true }),
  ctx => ctx.redirect("/")
)

router.get("/auth/saml", passport.authenticate("saml"))

router.get("/auth/logout", (ctx) => {
  ctx.logout()
  ctx.redirect("/")
})

app.keys = [process.env.AUTH_COOKIE_KEY]

const sessionConfig = { key: cookieName }

app
  .use(morgan(":method :url :status :res[content-length] bytes - :response-time ms"))
  .use(bodyParse())
  .use(passport.initialize())
  .use(session(sessionConfig, app))
  .use(passport.session())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(port, () => console.log(`Listening on port ${port}`))
