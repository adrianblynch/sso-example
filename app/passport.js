const passport = require("koa-passport")
const SamlStrategy = require("passport-saml").Strategy

const OKTA_ENTRYPOINT = process.env.OKTA_ENTRYPOINT
const OKTA_ISSUER = process.env.OKTA_ISSUER
const CREDS_CERTIFICATE = process.env.CREDS_CERTIFICATE

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

const getSamlStrategyConfig = () => {
  return config = {
    entryPoint: OKTA_ENTRYPOINT,
    issuer: OKTA_ISSUER,
    cert: CREDS_CERTIFICATE,
    forceAuthn: true,
    passReqToCallback: false
  }
}

const onProfile = (profile, callback) => {
  return callback(null, { email: profile.nameID })
}

passport.use(
  new SamlStrategy(
    getSamlStrategyConfig(),
    onProfile
  )
)

module.exports = passport
