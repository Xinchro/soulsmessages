const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

const templates = require("./data/templates")
const conjunctions = require("./data/conjunctions")
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

templates.forEach((template) => {
  app.get(`${template.url}`, (req, res, next) => {
    res.render("message", { pre: template.pre, post: template.post, message: req.params.message })
  })
})

templates.forEach((template1) => {
  conjunctions.forEach((conjunction) => {
    templates.forEach((template2) => {
      let url1 = template1.url
      let url2 = template2.url

      url2 = url2.replace("message", "message2")
      app.get(`${url1}${conjunction.url}${url2}`, (req, res, next) => {
        let message1 = req.params.message
        let template1Pre = template1.pre

        if(template1Pre.length > 0) {
          template1Pre = `${template1Pre[0].toUpperCase()}${template1Pre.slice(1)}`
        } else {
          message1 = `${message1[0].toUpperCase()}${message1.slice(1)}`
        }

        res.render("messagelong", {
          pre: template1Pre,
          post: template1.post,
          message: message1,
          conjunction: conjunction.text,
          pre2: template2.pre,
          post2: template2.post,
          message2: req.params.message2
        })
      })
    })
  })
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
    res.render("message", { pre: "Error: ", post: "!", message: "unsupported word" })
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
