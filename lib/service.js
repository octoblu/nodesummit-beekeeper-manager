const bindAll = require("lodash/fp/bindAll")
const get = require("lodash/fp/get")
const request = require("request")
const debug = require("debug")("nodesummit-beekeeper-manager:service")

class Service {
  constructor({ beekeeperUri }) {
    bindAll(Object.getOwnPropertyNames(Service.prototype), this)
    if (!beekeeperUri) throw new Error("Service: requires beekeeperUri")
    this.request = request.defaults({
      baseUrl: beekeeperUri,
      json: true,
    })
    this.intents = {
      get_latest_version: "getLatest",
    }
  }

  handleRequest(request, callback) {
    const intentName = get("response.result.metadata.intentName", request)
    debug("intentName", intentName)
    if (!intentName) return callback(new Error("Missing intentName"))
    const method = this.intents[intentName]
    if (!method) return callback(new Error("Invalid intentName"))
    this[method](request, callback)
  }

  getLatest(request, callback) {
    debug("getLatest", request)
    const owner = get("response.result.parameters.owner", request)
    const repo = get("response.result.parameters.name", request)
    this.request.get(
      {
        uri: `/deployments/${owner}/${repo}/latest`,
      },
      (error, response, body) => {
        if (error) return callback(error)
        debug("got response from deployment", response.statusCode, body)
        if (response.statusCode > 399) {
          return callback(`Unexpected statusCode ${response.statusCode}`)
        }
        const { tag } = body
        callback(null, `The latest version is ${tag}`)
      }
    )
  }
}

module.exports = Service
