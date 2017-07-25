const bindAll = require("lodash/fp/bindAll")
const get = require("lodash/fp/get")
const MeshbluHttp = require("meshblu-http")
const Service = require("./service")
const debug = require("debug")("nodesummit-beekeeper-manager:controller")

class Controller {
  constructor({ beekeeperUri, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(Controller.prototype), this)
    if (!meshbluConfig) throw new Error("Controller: requires meshbluConfig")
    if (!beekeeperUri) throw new Error("Controller: requires beekeeperUri")
    this.service = new Service({ beekeeperUri })
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  handleRequest(req, res) {
    const request = req.body
    const { respondUuid, sessionId } = request
    debug("handle request", { respondUuid, sessionId })
    this.service.handleRequest(request, (error, messageText) => {
      if (error) return res.sendError(error)
      const message = {
        devices: [respondUuid],
        topic: "response",
        sessionId: get("response.sessionId", sessionId, request),
        message: messageText,
      }
      debug("messaging", message)
      this.meshbluHttp.message(message, error => {
        if (error) return res.sendError(error)
        res.sendStatus(204)
      })
    })
  }
}

module.exports = Controller
