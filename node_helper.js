/* Magic Mirror
 * Module: KS-SH
 *
 * By Mark Pearce
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');
const spawn = require("child_process").spawn;
var self;

module.exports = NodeHelper.create({
	

    start: function() {
        console.log("Starting node_helper for: " + this.name);
	self = this;
    },

    updatedDevices: function(devs){
	//console.log("Callback triggered");
	//console.log(devs);
        self.sendSocketNotification('DEVICES_RESULT', devs);
    },
	
    getDevices: function(callback) {    
	var devstr = "Test";
        /* Call the external python module to get the list of device status values */
	// devstr ='{"devices":[{"bulbID":"65539","name":"Nazanins Light","brightness": "3","warmth":"NAN%","state":"on"},{"bulbID":"65538","name":"Bedside A","brightness":"3","warmth":"100.0%","state":"off"}],"groups":[{"groupID":"131077","name":"Guest Room","state":"off"},{"groupID":"131075","name":"Master Bedroom","state":"off"}]}';
	//console.log("Calling Python...");
        const pythonProcess = spawn('python',["/home/mark/MagicMirror/modules/KS-SH/python/get_status.py"]);
	pythonProcess.stdout.on('data', function (data) { var result = JSON.parse(data.toString());
							 callback(result);
							 //console.log("devstr=" + data.toString());
						        });
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
	    this.getDevices(this.updatedDevices);
	}
    }
});
