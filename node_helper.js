/* Magic Mirror
 * Module: KS-SH
 *
 * By Mark Pearce
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getDevices: function() {
        /* Call the external python module to get the list of device status values */
	console.log("KS-SH: Requsesting device update." );   
    },
	
    getUFO: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).sightings; // sightings is from JSON data
		//		console.log(response.statusCode + result); // uncomment to see in terminal
                    this.sendSocketNotification('UFO_RESULT', result);
		
            }
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_UFO') {
            this.getUFO(payload);
        }
	if (notification === 'GET_DEVICES') {
	    this.getDevices();
	}
    }
});
