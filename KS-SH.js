/* Magic Mirror
 * Module: KS-SH
 *
 * By Mark Pearce
 *
 */
Module.register("KS-SH", {

    // Module config defaults.
    defaults: {
        useHeader: true, // false if you don't want a header
        header: "Loading Data", // Any text you want
        maxWidth: "250px",
        rotateInterval: 30 * 1000,
        animationSpeed: 1000, // fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 10 * 1 * 1000
    },

    getStyles: function() {
        return ["KS-SH.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
	this.Devices = [];
        this.activeItem = 0;         // <-- starts rotation at item 0 (see Rotation below)
        this.rotateInterval = null;  // <-- sets rotation time (see below)
        this.scheduleUpdate();       // <-- When the module updates (see below)
    },

    compareDevs: function( a, b ) {
        if ( a.name < b.name ){
             return -1;
        }
        if ( a.name > b.name ){
             return 1;
        }
        return 0;
    },
	
    getDom: function() {
		
		// creating the wrapper
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

		// The loading sequence
        if (!this.loaded) {
            wrapper.innerHTML = "Loading Devices . . !";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

		// creating the header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

		// Rotating the data
        // Display the lights
	var Devs = this.Devices.devices.sort(this.compareDevs);
	var Groups = this.Devices.groups.sort(this.compareDevs);

	// Creating the div's for your data items
        var top = document.createElement("div");
        top.classList.add("list-row");
	    
	for(var dev = 0; dev < Devs.length; dev++){	
		var devrow = document.createElement("div");
		var statespan = document.createElement("span");
		var textspan  = document.createElement("span");
		if (Devs[dev].state === "on"){
            	    statespan.classList.add("small", "bright", "state_on");
		} else {
		    statespan.classList.add("small", "bright", "state_off");
		}
		textspan.classList.add("small", "bright", "state");
		devrow.classList.add("small", "bright", "staterow");
		
		statespan.innerHTML = Devs[dev].state.toUpperCase();
		textspan.innerHTML  = " " + Devs[dev].name + " B(" + Devs[dev].brightness + "), W(" + Devs[dev].warmth + ")";
            	
		devrow.appendChild(statespan);
		devrow.appendChild(textspan);
            	wrapper.appendChild(devrow);
	}
	
	for(var grp = 0; grp < Groups.length; grp++){
	        var grprow = document.createElement("div");
                var gstate = document.createElement("span");
		var gtext  = document.createElement("span");
		
		if (Groups[grp].state === "on"){
   		    gstate.classList.add("small", "bright", "state_on");
		} else {
		    gstate.classList.add("small", "bright", "state_off");
		}
		gtext.classList.add("small", "bright", "state");
		grprow.classList.add("small", "bright", "staterow");
		
		gstate.innerHTML = Groups[grp].state.toUpperCase();
		gtext.innerHTML  = " Group: " + Groups[grp].groupID + "(" + Groups[grp].name + ")";
		grprow.appendChild(gstate);
		grprow.appendChild(gtext);
		wrapper.appendChild(grprow);
	}
	 	
        return wrapper;
		
    }, // <-- closes the getDom function from above

	// this processes your data
    processUFO: function(data) { 
        this.UFO = data; 
        this.loaded = true;
    },
    
    processDevices: function(data) {
        this.Devices = data;
        //console.log("KS-SH: Devices Updated");
	//console.log(this.Devices);
	this.loaded  = true;
    },
	
	// this rotates your data
    scheduleCarousel: function() { 
    //    console.log("Carousel of UFO fucktion!"); // uncomment to see if data is rotating (in dev console)
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },
	
	
// this tells module when to update
    scheduleUpdate: function() { 
	//console.log("KS-SH scheduleUpdate called.");
        setInterval(() => {
            this.getDevices();
        }, this.config.updateInterval);
        this.getDevices(this.config.initialLoadDelay);
        var self = this;
    },
	
    getDevices: function(){
        console.log("KS-SH: getDevices called...");
        this.sendSocketNotification('GET_DEVICES', this.url);
    },
	    
	// this gets data from node_helper
    socketNotificationReceived: function(notification, payload) { 
        if (notification === "DEVICES_RESULT") {
            //console.log("KS-SH: socketNotificationReceived...");
            this.processDevices(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
