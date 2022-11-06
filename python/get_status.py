import sys

op = ""
op += '{ "devices": [\n'
op += '		{ "bulbID": 	"65539", \n'
op += '		  "name":    	"Nazanins Light",\n'
op += '		  "brightness": "3", \n'
op += '		  "warmth":		"NAN%", \n'
op += '		  "state":		"on"\n'
op += '		},\n'
op += '		{\n'
op += '		  "bulbID": 	"65538",\n'
op += '		  "name": 		"Bedside A", \n'
op += '		  "brightness": "3",\n'
op += '		  "warmth": 	"100.0%", \n'
op += '		  "state": 		"off"\n'
op += '		}\n'
op += '	],\n'
op += '  "groups": [\n'
op += '		{\n'
op += '		"groupID":		"131077", \n'
op += '		"name": 		"Guest Room", \n'
op += '		"state": 		"off"\n'
op += '		},\n'
op += '		{\n'
op += '		"groupID": 		"131075",\n'
op += '		"name": 		"Master Bedroom", \n'
op += '		"state": 		"off"\n'
op += '		}\n'
op += '	]\n'
op += '}\n'


print(op)
sys.stdout.flush()
