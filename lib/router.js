const bindAll = require("lodash/fp/bindAll")
const Controller = require("./controller")

class Router {
  constructor({ beekeeperUri, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(Router.prototype), this)
    if (!beekeeperUri) throw new Error("Router: requires beekeeperUri")
    if (!meshbluConfig) throw new Error("Router: requires meshbluConfig")
    this.controller = new Controller({ beekeeperUri, meshbluConfig })
  }

  route(app) {
    app.post("/requests", this.controller.handleRequest)
  }
}

module.exports = Router
