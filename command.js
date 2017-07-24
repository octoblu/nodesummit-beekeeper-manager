const bindAll = require("lodash/fp/bindAll")
const OctoDash = require("octodash")
const MeshbluConfig = require("meshblu-config")
const Server = require("./lib/server")
const packageJSON = require("./package.json")

const CLI_OPTIONS = [
  {
    names: ["beekeeper-uri"],
    type: "string",
    required: true,
    env: "BEEKEEPER_URI",
    help: "URI for beekeeper, should contain auth",
    helpArg: "URI",
  },
  {
    names: ["port", "p"],
    type: "number",
    env: "PORT",
    default: 80,
    required: true,
    help: "Port to run server as",
    helpArg: "NUMBER",
  },
]

class Command {
  constructor() {
    bindAll(Object.getOwnPropertyNames(Command.prototype), this)
    this.octoDash = new OctoDash({
      argv: process.argv,
      cliOptions: CLI_OPTIONS,
      name: packageJSON.name,
      version: packageJSON.version,
    })
  }

  run() {
    const { beekeeperUri, port } = this.octoDash.parseOptions()
    const meshbluConfig = new MeshbluConfig().toJSON()
    if (!meshbluConfig.uuid) {
      return this.octoDash.die(new Error("MeshbluConfig must have a uuid"))
    }
    new Server({ beekeeperUri, port, meshbluConfig }).run(error => {
      if (error) {
        this.octoDash.die(error)
        return
      }
      console.log(`Running ${packageJSON.name} on port ${port}`)
    })
  }
}
new Command().run()
