const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const colors = require('colors')
const fs = require('fs')

const image = require("./utils/image")
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

// static - static
templates.static.forEach((template1) => {
  conjunctions.forEach((conjunction) => {
    templates.static.forEach((template2) => {
      constructLongURL(template1, conjunction, template2)
    })
  })
})

// static - dynamic
templates.static.forEach((template1) => {
  conjunctions.forEach((conjunction) => {
    templates.dynamic.forEach((template2) => {
      constructLongURL(template1, conjunction, template2)
    })
  })
})

// static
templates.static.forEach((template) => {
  constructShortURL(template)
})

// dynamic - static
templates.dynamic.forEach((template1) => {
  conjunctions.forEach((conjunction) => {
    templates.static.forEach((template2) => {
      constructLongURL(template1, conjunction, template2)
    })
  })
})

// dynamic
// dynamic - dynamic
// different than above to prevent double phrase dynamics overriding conjunctions and second phrases
templates.dynamic.forEach((template1) => {
  constructShortURL(template1)
  conjunctions.forEach((conjunction) => {
    templates.dynamic.forEach((template2) => {
      constructLongURL(template1, conjunction, template2)
    })
  })
})

function constructLongURL(template1, conjunction, template2) {
  let url1 = template1.url
  let url2 = template2.url

  // give second url variable a different variable
  url2 = url2.replace("msg1", "msg6")
  url2 = url2.replace("msg2", "msg7")
  url2 = url2.replace("msg3", "msg8")
  url2 = url2.replace("msg4", "msg9")
  url2 = url2.replace("msg5", "msg10")

  app.get(`${url1}${conjunction.url}${url2}`, (req, res, next) => {
    // multiple word subjects
    let msg = req.params.msg1
    msg += req.params.msg2 ? ` ${req.params.msg2}` : ""
    msg += req.params.msg3 ? ` ${req.params.msg3}` : ""
    msg += req.params.msg4 ? ` ${req.params.msg4}` : ""
    msg += req.params.msg5 ? ` ${req.params.msg5}` : ""

    let msg2 = req.params.msg6
    msg2 += req.params.msg7 ? ` ${req.params.msg7}` : ""
    msg2 += req.params.msg8 ? ` ${req.params.msg8}` : ""
    msg2 += req.params.msg9 ? ` ${req.params.msg9}` : ""
    msg2 += req.params.msg10 ? ` ${req.params.msg10}` : ""

    const message = formatMessage(
      { pre: template1.pre, post: template1.post, message: msg },
      { text: conjunction.text },
      { pre: template2.pre, post: template2.post, message: msg2 }
    )

    renderMessage(req, res, next, true, {
      pre: message.msg1.pre,
      post: message.msg1.post,
      message: message.msg1.message,
      conjunction: message.conj.text,
      pre2: message.msg2.pre,
      post2: message.msg2.post,
      message2: message.msg2.message,
      string: message.string
    })
  })
}

function constructShortURL(template) {
  app.get(`${template.url}`, (req, res, next) => {
    // multiple word subjects
    let msg = req.params.msg1
    msg += req.params.msg2 ? ` ${req.params.msg2}` : ""
    msg += req.params.msg3 ? ` ${req.params.msg3}` : ""
    msg += req.params.msg4 ? ` ${req.params.msg4}` : ""
    msg += req.params.msg5 ? ` ${req.params.msg5}` : ""

    const message = formatMessage(
          { pre: template.pre, post: template.post, message: msg }
        )

    renderMessage(req, res, next, false, {
      pre: message.pre,
      post: message.post,
      message: message.message,
      string: message.string
    })
  })
}

// deal with messaging
function renderMessage(req, res, next, long, data) {
  let validEntry = false

  // check if subject is valid
  for(let prop in subjects) {
    if(subjects[prop].includes(data.message.toLowerCase())) {
      validEntry = true
    }
  }

  if(validEntry && data.message2) {
    validEntry = false

    for(let prop in subjects) {
      if(subjects[prop].includes(data.message2.toLowerCase())) {
        validEntry = true
      }
    }
  }

  // check message length (single/double)
  let messageType = long ? "messagelong" : "message"

  if(validEntry) {
    // render valid message
    // res.render(messageType, data) // TODO
    renderImage(req, res, next, data.string)
  } else {
    // render error because of invalid subject
    renderError(req, res, next)
  }
}

function renderImage(req, res, next, text) {
  // construct image
  let img = image.render(text)
  .then(img => {
    // get image buffer and send as binary PNG
    img.getBuffer("image/png", (err, img) => {
      res.setHeader('content-type', 'image/png');
      res.end(img, "binary")
    })
  }, (err) => console.error("Error with rendering image".red, err))
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

  renderError(req, res, next)
})

function renderError(req, res, next) {
  // error template, subject and conjunction selection and formatting
  const msg1 = { ...templates.static[1], message: "despair"}
  const conj = conjunctions[4]
  const msg2 = { ...templates.static[10], message: "backstepping" }
  const message = formatMessage(msg1, conj, msg2)

  // dark souls like error message
  renderMessage(req, res, next, true, {
    pre: message.msg1.pre,
    post: message.msg1.post,
    message: message.msg1.message,
    conjunction: message.conj.text,
    pre2: message.msg2.pre,
    post2: message.msg2.post,
    message2: message.msg2.message,
    string: message.string
  })
}

module.exports = app
