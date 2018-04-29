const snmp = require('net-snmp');
const EventEmitter = require('events');
const mibs = require('./mibs')
const _ = require('underscore');

const HostResources = require('./host-resources')

var ping_oids = _.values(mibs["SNMPv2-MIB"]["system"]);
var ping_oids_inverted = _.invert(mibs["SNMPv2-MIB"]["system"])


let emitter = new EventEmitter()

class Poller extends EventEmitter {
    constructor (options) {
        super()
        this.options = options
        this.session = snmp.createSession(options.host, options.community, options);
        this.snmp = {}
    }

    ping() {
        let oids = _.values(mibs["SNMPv2-MIB"]["system"])

        return new Promise( (resolve, reject) => {
            this.session.get(oids, (err, varbinds) => {
                if (err) {
                    console.log(err)
                    return reject(err)
                } else {
                    _.each(varbinds, varbind => {
                        let property = ping_oids_inverted[varbind.oid]

                        if ( snmp.isVarbindError(varbind) ) {
                            this.snmp[property] = snmp.varbindError(varbind)
                        }else{
                            if ( varbind.type == snmp.ObjectType.OctetString ) {
                                this.snmp[property] = Buffer.from(varbind.value).toString('utf8')
                            } else {
                                this.snmp[property] = varbind.value
                            }
                        }
                    })
                    return resolve()
                }
            })
        })
    }

    getHrStorageTable(callback) {
        HostResources.getHrStorageTable(this.session, callback)
    }

    getHrProcessorTable(callback) {
        HostResources.getHrProcessorTable(this.session, callback)
    }

    close() {
        this.session.close();
    }
}

var poller = {}

poller.new = function(config) {
    let target = new Poller(config)

    target.ping()
        .then( () => {
            target.emit('ready')
        })
        .catch( err => {
            target.emit('failed', err)
        })

    return target
}


module.exports = poller