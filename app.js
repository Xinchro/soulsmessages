const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const colors = require('colors');

const templates = require("./data/templates")
const conjunctions = require("./data/conjunctions")
const subjects = require("./data/subjects")

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

// single template route generation
templates.forEach((template) => {
  app.get(`${template.url}`, (req, res, next) => {
    const message = formatMessage(
          { pre: template.pre, post: template.post, message: req.params.message }
        )

    renderMessage(req, res, next, false, { 
      pre: message.pre,
      post: message.post,
      message: message.message,
      description: message.string
    })
  })
})

// double template route generation
templates.forEach((template1) => {
  conjunctions.forEach((conjunction) => {
    templates.forEach((template2) => {
      let url1 = template1.url
      let url2 = template2.url

      // give second url variable a different variable
      url2 = url2.replace("message", "message2")

      app.get(`${url1}${conjunction.url}${url2}`, (req, res, next) => {
        const message = formatMessage(
          { pre: template1.pre, post: template1.post, message: req.params.message },
          { text: conjunction.text },
          { pre: template2.pre, post: template2.post, message: req.params.message2 }
        )

        renderMessage(req, res, next, true, {
          pre: message.msg1.pre,
          post: message.msg1.post,
          message: message.msg1.message,
          conjunction: message.conj.text,
          pre2: message.msg2.pre,
          post2: message.msg2.post,
          message2: message.msg2.message,
          description: message.string
        })
      })
    })
  })
})

// deal with messaging
function renderMessage(req, res, next, long, data) {
  let validEntry = false

  // check if subject is valid
  for(let prop in subjects) {
    if(subjects[prop].includes(data.message.toLowerCase())) {
      validEntry = true
    }
  }

  // check message length (single/double)
  let messageType = long ? "messagelong" : "message"

  if(validEntry) {
    // render valid message
    res.render(messageType, data)
  } else {
    // render error because of invalid subject
    res.render(messageType, {
      pre: "Error ",
      post: " phrase!",
      message: "with",
      description: "Error with phrase!"
    })
  }
}

// catch 404 and forward to error handler
app.use(fourohfour)

function fourohfour(req, res, next) {
  let err = new Error("Not Found")
  err.status = 404
  next(err)
}

// format message with capital first letter
function formatMessage(msg1, conj, msg2) {
  // capitalize first letter
  // check if we have a pre phrase or not
  if(msg1.pre.length > 0) {
    msg1.pre = `${msg1.pre[0].toUpperCase()}${msg1.pre.slice(1)}`
  } else {
    msg1.message = `${msg1.message[0].toUpperCase()}${msg1.message.slice(1)}`
  }

  // check if there's a second template (single/double message)
  // return object with all changes, as well as a string of the whole message
  if(msg2) {
    return {
      msg1: {
        pre: msg1.pre,
        post: msg1.post,
        message: msg1.message
      },
      conj: {
        text: conj.text
      },
      msg2: {
        pre: msg2.pre,
        post: msg2.post,
        message: msg2.message
      },
      string: `${msg1.pre}${msg1.message}${msg1.post}${conj.text}${msg2.pre}${msg2.message}${msg2.post}`
    }
  } else {
    return {
      pre: msg1.pre,
      post: msg1.post,
      message: msg1.message,
      string: `${msg1.pre}${msg1.message}${msg1.post}`
    }
  }
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  console.error(`${err.status}`.red)
  console.error(`${err.message}`.red)

  // error template, subject and conjunction selection and formatting
  const msg1 = { ...templates[7], message: "despair"}
  const conj = conjunctions[3]
  const msg2 = { ...templates[4], message: "something" }
  const message = formatMessage(msg1, conj, msg2)

  // dark souls like error message
  renderMessage(req, res, next, true, {
    pre: message.msg1.pre,
    post: message.msg1.post,
    message: "despair",
    conjunction: message.conj.text,
    pre2: message.msg2.pre,
    post2: message.msg2.post,
    message2: "something",
    description: message.string
  })
})

module.exports = app
