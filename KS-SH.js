/* Magic Mirror
 * Module: KS-SH
 *
 * By Mark Pearce
 *
 */
Module.register("KS-SH", {

    // Module config defaults.
    defaults: {
		city: "New York",
		state: "NY",
        useHeader: true, // false if you don't want a header
        header: "Loading Data", // Any text you want
        maxWidth: "250px",
        rotateInterval: 30 * 1000,
        animationSpeed: 3000, // fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 30 * 1 * 1000,

    },

    getStyles: function() {
        return ["KS-SH.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = "https://ufo-api.herokuapp.com/api/sightings/search?city=" + this.config.city + "&state=" + this.config.state + "&limit=50&skip=0";
        this.UFO = [];
	this.Devices = [];
        this.activeItem = 0;         // <-- starts rotation at item 0 (see Rotation below)
        this.rotateInterval = null;  // <-- sets rotation time (see below)
        this.scheduleUpdate();       // <-- When the module updates (see below)
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
        var Keys = Object.keys(this.Devices.devices);
        if (Keys.length > 0) {
            if (this.activeItem >= Keys.length) {
                this.activeItem = 0;
            }
	    console.log("Devices...");
	    console.log(Devices);
            var Dev = this.Devices[Keys[this.activeItem]];

			
			// Creating the div's for your data items
            var top = document.createElement("div");
            top.classList.add("list-row");
			
			
			// shape element from data
			var bulb = document.createElement("div");
            bulb.classList.add("xsmall", "bright", "shape");
            bulb.innerHTML = "Bulb: " + Dev.bulbID;
            wrapper.appendChild(bulb);
			
			
			// name element from data
			var name = document.createElement("div");
            name.classList.add("xsmall", "bright", "date");
            name.innerHTML = "Name: " + Dev.name;
            wrapper.appendChild(name);
			
			
			// state element from data
			var state = document.createElement("div");
            state.classList.add("xsmall", "bright", "duration");
            state.innerHTML = "State: " + Dev.state;
            wrapper.appendChild(state);
		
			
        } // <-- closes the rotation of the data
		
        return wrapper;
		
    }, // <-- closes the getDom function from above

	// this processes your data
    processUFO: function(data) { 
        this.UFO = data; 
    //    console.log(this.UFO); // uncomment to see if you're getting data (in dev console)
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
	console.log("KS-SH scheduleUpdate called.");
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
	    
	// this asks node_helper for data
    getUFO: function() { 
        console.log("KS-SH: getUFO called...");
        this.sendSocketNotification('GET_UFO', this.url);
    },
	
	
	// this gets data from node_helper
    socketNotificationReceived: function(notification, payload) { 
        if (notification === "DEVICES_RESULT") {
            console.log("KS-SH: socketNotificationReceived...");
            this.processDevices(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
