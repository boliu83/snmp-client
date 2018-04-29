
// http://www.oidview.com/mibs/0/HOST-RESOURCES-TYPES.html
// http://www.oidview.com/mibs/0/HOST-RESOURCES-MIB.html

const _ = require('underscore')

const HOST_RESOURCES_TYPES = {
    'hrStorageOther'            : '1.3.6.1.2.1.25.2.1.1',
    'hrStorageRam'              : '1.3.6.1.2.1.25.2.1.2',
    'hrStorageVirtualMemory'    : '1.3.6.1.2.1.25.2.1.3',
    'hrStorageFixedDisk'        : '1.3.6.1.2.1.25.2.1.4',
    'hrStorageRemovableDisk'    : '1.3.6.1.2.1.25.2.1.5',
    'hrStorageFloppyDisk'       : '1.3.6.1.2.1.25.2.1.6',
    'hrStorageCompactDisc'      : '1.3.6.1.2.1.25.2.1.7',
    'hrStorageRamDisk'          : '1.3.6.1.2.1.25.2.1.8',
    'hrStorageFlashMemory'      : '1.3.6.1.2.1.25.2.1.9'
}

const HOST_RESOURCES_TYPES_INVERTED = _.invert(HOST_RESOURCES_TYPES)

var handler = {

    // hrStorageTable 	                    1.3.6.1.2.1.25.2.3
    //   hrStorageEntry 	                1.3.6.1.2.1.25.2.3.1
    //      hrStorageIndex 	                1.3.6.1.2.1.25.2.3.1.1
    //      hrStorageType  	                1.3.6.1.2.1.25.2.3.1.2
    //      hrStorageDescr 	                1.3.6.1.2.1.25.2.3.1.3
    //      hrStorageAllocationUnits (byte) 1.3.6.1.2.1.25.2.3.1.4
    //      hrStorageSize                   1.3.6.1.2.1.25.2.3.1.5
    //      hrStorageUsed  	                1.3.6.1.2.1.25.2.3.1.6
    //      hrStorageAllocationFailures 	1.3.6.1.2.1.25.2.3.1.7
    getHrStorageTable : function (session, callback) {
        let oid = "1.3.6.1.2.1.25.2.3"

        session.table(oid, (err, varbinds) => {
            if (err) return callback(err)

            let result = []

            _.each( _.values(varbinds), item => {
                result.push({
                    hrStorageIndex : item[1],
                    hrStorageType  : HOST_RESOURCES_TYPES_INVERTED[item[2]],
                    hrStorageDescr : Buffer.from(item[3]).toString('utf-8'),
                    hrStorageAllocationUnits : item[4],
                    hrStorageSize : item[5],
                    hrStorageUsed : item[6],
                    hrStorageAllocationFailures : item[7]
                })
            })
            callback(null, result)
        })
    },

    // hrProcessorTable  	    1.3.6.1.2.1.25.3.3
    //   hrProcessorEntry  	    1.3.6.1.2.1.25.3.3.1
    //     hrProcessorFrwID  	1.3.6.1.2.1.25.3.3.1.1
    //     hrProcessorLoad  	1.3.6.1.2.1.25.3.3.1.2
    // ****************************************************** 
    //     hrProcessorFrwID OBJECT-TYPE
    //     SYNTAX     ProductID
    //     MAX-ACCESS read-only
    //     STATUS     current
    //     DESCRIPTION
    //         "The product ID of the firmware associated with the
    //         processor."
    //     hrProcessorLoad OBJECT-TYPE
    //     SYNTAX     Integer32 (0..100)
    //     MAX-ACCESS read-only
    //     STATUS     current
    //     DESCRIPTION
    //         "The average, over the last minute, of the percentage
    //         of time that this processor was not idle.
    //         Implementations may approximate this one minute
    //         smoothing period if necessary."

    getHrProcessorTable : function (session, callback) {
        let oid = "1.3.6.1.2.1.25.3.3"

        session.table(oid, (err, varbinds) => {
            if (err) return callback(err)

            let result = []

            _.each( _.values(varbinds), item => {
                result.push({
                    hrProcessorFrwID : item[1],

                    // 
                    hrProcessorLoad : item[2]
                })
            })
            callback(null, result)
        })
    }
}

module.exports = handler