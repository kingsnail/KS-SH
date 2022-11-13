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

    notifyDevCmd: function(r){
	console.log("Responsing with " + r);
        self.sendSocketNotification('SET_DEVICE_RESPONSE', r);
    },
	
	
    getDevices: function(callback) {    
	var devstr = "Test";
        /* Call the external python module to get the list of device status values */
	// devstr ='{"devices":[{"bulbID":"65539","name":"Nazanins Light","brightness": "3","warmth":"NAN%","state":"on"},{"bulbID":"65538","name":"Bedside A","brightness":"3","warmth":"100.0%","state":"off"}],"groups":[{"groupID":"131077","name":"Guest Room","state":"off"},{"groupID":"131075","name":"Master Bedroom","state":"off"}]}';
	//console.log("Calling Python...");
        const pythonProcess = spawn('python',["/home/mark/MagicMirror/modules/KS-SH/python/tradfri-status.py"]);
	pythonProcess.stdout.on('data', function (data) { var result = JSON.parse(data.toString());
							  callback(result);							 
						        });
    },
 
    setDeviceOn: function(cb, d) {
	console.log("Turn " + d + " on.");
        const pythonProcess1 = spawn('python',["/home/mark/MagicMirror/modules/KS-SH/python/tradfri-lights.py", "-a power -l " + d + " -v on"]);
	pythonProcess1.stdout.on('data', function (data) { console.log("data=" + data.toString());
							  cb(data.toString());							 
						         });

    },

    setDeviceOff: function(cb, d) {
	console.log("Turn " + d + " off.");
        const pythonProcess2 = spawn('python',["/home/mark/MagicMirror/modules/KS-SH/python/tradfri-lights.py", "-a power -l " + d + " -v off"]);
	pythonProcess2.stdout.on('data', function (data) { console.log("data=" + data.toString());
			  				   cb(data.toString());
							 });
    }, 

    socketNotificationReceived: function(notification, payload) {
        console.log("socketNotificationReceived: " + notification);
	if (notification === 'GET_DEVICES') {
	    this.getDevices(this.updatedDevices);
	}
	if (notification === 'SET_DEVICE_ON') {
	        console.log("SET_DEVICE_ON " + payload);
		this.setDeviceOn(this.notifyDevCmd, payload);
	}
	if (notification === 'SET_DEVICE_OFF') {
	    console.log("SET_DEVICE_OFF " + payload);
	    this.setDeviceOff(this.notifyDevCmd, payload);
	}
    }
});
