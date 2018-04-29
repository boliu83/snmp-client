const path = require('path');
const snmp = require('net-snmp');
const _ = require('underscore')
const async = require('async')


var poller = require(path.join(__dirname,"lib","snmppoll"))

var config = {
    host : "192.168.0.101",
    community : "public",
    version: snmp.Version2c
}

var hosts = [config, config, config]

// var target = poller.new(config)

// // target.on('ready', () => {
// //     target.getHrProcessorTable( (err, data) => {
// //         console.log(data)
// //     })

// //     target.close()
// // }).on('failed', err => {
// //     console.log(err)
// // })

var linux_poll = function(config) {
    var target = poller.new(config)

    return callback => {
        target.on('ready', () => {
            target.getHrStorageTable( (err, data) => {
                if (err) return callback(null, null)
                return callback(null, data)
            })
        })
    }

}

setTimeout( () => {}, 1000 )

let tasks = _.map(hosts, host => linux_poll(host) )
let limit = 1
async.parallelLimit( tasks , 1, (err, data) => {
    console.log(data.length)
})

// linux_poll(config)( (err, data) => {
//     if (err) console.log(err)

//     console.log(data)
// })