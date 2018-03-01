const jimp = require("jimp")

function render(text) {
  // read base image template
  return jimp.read("./assets/images/base.png")
  .then((image) => {
    // load souls font
    return jimp.loadFont("./assets/fonts/optimus-princeps-16.fnt")
    .then((font) => {
      // place font on template
      return image.print(font, 150, 40, text)
    }, (err) => console.error("Invalid font", err))
  }, (err) => console.log("Invalid image", err))
}

module.exports.render = render