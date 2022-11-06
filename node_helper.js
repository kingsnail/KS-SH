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
	var devstr ='{"devices":[{"bulbID":"65539","name":"Nazanins Light","brightness": "3","warmth":"NAN%","state":"on"},{"bulbID":"65538","name":"Bedside A","brightness":"3","warmth":"100.0%","state":"off"}],"groups":[{"groupID":"131077","name":"Guest Room","state":"off"},{"groupID":"131075","name":"Master Bedroom","state":"off"}]}';
	var devstr = "";
	console.log("Calling Python...");
	const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',["/home/mark/MagicMirror/modules/KS-SH/get_status.py"]);
	pythonProcess.stdout.on('data', function (data) { devstr = data;
						          console.log("devstr=");
						          console.log(data);});
	console.log("KS-SH: Requsesting device update." );
	console.log(devstr );
	var result = JSON.parse(devstr);
	console.log(result);
	this.sendSocketNotification('DEVICES_RESULT', result);
    },
	
    getUFO: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).sightings; // sightings is from JSON data
   		    console.log(response.statusCode + result); // uncomment to see in terminal
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
