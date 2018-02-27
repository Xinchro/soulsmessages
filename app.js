const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const categories = require("./data/categories")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")))
app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// routes
app.get("/", (req, res, next) => {
  res.render("message", { pre: "Please use ", post:" URL!", message: "a proper" })
})

app.get("/:message/ahead", (req, res, next) => {
  renderMessage(req, res, next, { post: " ahead", message: req.params.message })
})

app.get("/no/:message/ahead", (req, res, next) => {
  renderMessage(req, res, next, { pre: "No", post: " ahead", message: req.params.message })
})

app.get("/:message/required/ahead", (req, res, next) => {
  renderMessage(req, res, next, { post: " required ahead", message: req.params.message })
})

app.get("/be/wary/of/:message", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Be wary of ", message: req.params.message })
})

app.get("/try/:message", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Try ", message: req.params.message })
})

app.get("/could/this/be/a/:message/?", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Could this be a ", post: "?", message: req.params.message })
})

app.get("/if/only/i/had/a/:message/...", (req, res, next) => {
  renderMessage(req, res, next, { pre: "If only I had a ", post: "...", message: req.params.message })
})

app.get("/visions/of/:message/...", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Visions of", message: req.params.message })
})

app.get("/time/for/:message", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Time for ", message: req.params.message })
})

app.get("/:message", (req, res, next) => {
  renderMessage(req, res, next, { template: "", message: req.params.message })
})

app.get("/:message/!", (req, res, next) => {
  renderMessage(req, res, next, { post: "!", message: req.params.message })
})

app.get("/:message/?", (req, res, next) => {
  renderMessage(req, res, next, { post: "?", message: req.params.message })
})

app.get("/:message/...", (req, res, next) => {
  renderMessage(req, res, next, { post: "...", message: req.params.message })
})

app.get("/huh/its/a/:message/...", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Huh, it's a ", message: req.params.message })
})

app.get("/praise/the/:message/!", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Praise the ", post:"!", message: req.params.message })
})

app.get("/let/there/be/:message", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Let there be ", message: req.params.message })
})

app.get("/ahh/:message/...", (req, res, next) => {
  renderMessage(req, res, next, { pre: "Ahh,", post: "...", message: req.params.message })
})

// deal with messaging
function renderMessage(req, res, next, data) {
  let validEntry = false
  for(let prop in categories) {
    if(categories[prop].includes(data.message)) {
      validEntry = true
    }
  }
  if(validEntry) {
    res.render("message", data)
  } else {
    res.render("message", {pre: "Error: ", post: "!", message: "unsupported word"})
  }
}

// catch 404 and forward to error handler
app.use(fourohfour)

function fourohfour(req, res, next) {
  let err = new Error("Not Found")
  err.status = 404
  next(err)
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
