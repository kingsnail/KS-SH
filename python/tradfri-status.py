#!/usr/bin/env python

# file        : tradfri-status.py
# purpose     : getting status from the Ikea tradfri smart lights
#
# author      : harald van der laan
# date        : 2017/11/01
# version     : v1.2.0
#
# changelog   :
# - v1.2.0      update for gateway 1.1.15 issues                        (harald)
# - v1.1.0      refactor for cleaner code                               (harald)
# - v1.0.0      initial concept                                         (harald)

"""
    tradfri-status.py - getting status of the Ikea Tradfri smart lights

    This module requires libcoap with dTLS compiled, at this moment there is no python coap module
    that supports coap with dTLS. see ../bin/README how to compile libcoap with dTLS support
"""

# pylint convention disablement:
# C0103 -> invalid-name
# C0200 -> consider-using-enumerate
# pylint: disable=C0200, C0103

from __future__ import print_function
from __future__ import unicode_literals

import os
import sys
import time
import configparser

from tradfri import tradfriStatus
from tqdm import tqdm

def main():
    """ main function """
    conf = configparser.ConfigParser()
    script_dir = os.path.dirname(os.path.realpath(__file__))
    conf.read(script_dir + '/tradfri.cfg')

    hubip = conf.get('tradfri', 'hubip')
    apiuser = conf.get('tradfri', 'apiuser')
    apikey = conf.get('tradfri', 'apikey')

    lightbulb = []
    lightgroup = []
    scenegroup = []

    #print('[ ] Tradfri: acquiring all Tradfri devices, please wait ...')
    devices = tradfriStatus.tradfri_get_devices(hubip, apiuser, apikey)
    groups = tradfriStatus.tradfri_get_groups(hubip, apiuser, apikey)
    scenes = tradfriStatus.tradfri_get_scenes(hubip, apiuser, apikey)
    for deviceid in tqdm(range(len(devices)), desc='Tradfri devices', unit=' devices'):
        lightbulb.append(tradfriStatus.tradfri_get_lightbulb(hubip, apiuser, apikey,
                                                             str(devices[deviceid])))

    # sometimes the request are to fast, the will decline the request (flood security)
    # in this case you could increse the sleep timer
    time.sleep(.5)

    for groupid in tqdm(range(len(groups)), desc='Tradfri groups', unit=' group'):
        lightgroup.append(tradfriStatus.tradfri_get_group(hubip, apiuser, apikey,
                                                          str(groups[groupid])))

    time.sleep(.5)
    for sceneid in tqdm(range(len(scenes)), desc='Tradfri scenes', unit=' scene'):
        sc = tradfriStatus.tradfri_get_scene(hubip, apiuser, apikey, str(scenes[sceneid]))
        print('sc = ' + str(sc))
        scenegroup.append(sc)
        
    print('[+] Tradfri: device information gathered')
    print('===========================================================\n')
    print('{ "devices": [')
    firstitem = True
    for _ in range(len(lightbulb)):
        try:
            brightness = lightbulb[_]["3311"][0]["5851"]
            try:
                warmth     = float(lightbulb[_]["3311"][0]["5711"])
                warmth     = round((warmth-250)/(454-250)*100,1)# reported as a percentage (100% maximum warmth)
            except KeyError:
                warmth = "NAN"
            if (firstitem == True):
                print('{')
                firstitem = False
            else: 
                print(',{')
            if lightbulb[_]["3311"][0]["5850"] == 0:
                print('\t"bulbID" : "' + str(lightbulb[_]["9003"]) + '",\n\t' + '"name" : "' + lightbulb[_]["9001"] + '",\n\t"brightness": "' + str(brightness) + '",\n\t"warmth" : "' + str(warmth) + '",\n\t"state": "off"')
            else:
                print('\t"bulbID" : "' + str(lightbulb[_]["9003"]) + '",\n\t' + '"name" : "' + lightbulb[_]["9001"] + '",\n\t"brightness" : "' + str(brightness) + '",\n\t"warmth" : "' + str(warmth) + '",\n\t"state" : "on"')
            print('}')
        except KeyError:
            # device is not a lightbulb but a remote control, dimmer or sensor
            pass
        
    print('],')
    print('"groups" : [')
    firstitem = True
    for _ in range(len(lightgroup)):
        if firstitem:
            print('{')
            firstitem = False
        else: 
            print(',{')
        if lightgroup[_]["5850"] == 0:
            print('\t"groupID" : "' + str(lightgroup[_]["9003"]) + '",\n\t"name" : "' + lightgroup[_]["9001"] + '",\n\t"state" : "off"')
        else:
            print('\t"groupID" : "' + str(lightgroup[_]["9003"]) + '",\n\t"name" : "' + lightgroup[_]["9001"] + '",\n\t"state" : "on"')
        print('}')
    print('],')
    
    print('"scenes": [')
    firstitem = True
    print(scenegroup)
    for _ in range(len(scenegroup)):
        if firstitem:
            print('{')
            firstitem = False
        else: 
            print(',{')
        if scenegroup[_]["5850"] == 0:
            print('\t"sceneID" : "' + str(scenegroup[_]["9003"]) + '",\n\t"name" : "' + scenegroup[_]["9001"] + '",\n\t"state" : "off"')
        else:
            print('\t"sceneID" : "' + str(scenegroup[_]["9003"]) + '",\n\t"name" : "' + scenegroup[_]["9001"] + '",\n\t"state" : "on"')
        print('}')
    
    print(']')
    
    print('}')

if __name__ == "__main__":
    main()
    sys.exit(0)
