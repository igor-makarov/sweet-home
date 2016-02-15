'use strict'

import ipMon from 'ip-monitor';
import mqtt from 'mqtt'
import fs from 'fs'
import xkcd from 'xkcd-password'


var client  = mqtt.connect('mqtt://test.mosquitto.org');

var subject = undefined;

var watcher = ipMon.createWatcher({
    polling: 60000,
    externalIP: {
        timeout: 10000,
        getIP: 'parallel',
        services: ['http://ifconfig.co/', 'http://icanhazip.com/'],
        replace: true
    }
});

watcher.on('IP:change', function (prevIP, newIP) {
    console.log('Prev IP: %s, New IP: %s', prevIP, newIP);
    client.publish(subject, `${newIP}`, { retain:true });
});


watcher.on('error', function (error) {
    console.log('IP watcher error:' + error)
    //throw error;
});


watcher.on('IP:error', function (error) {
    console.log('Cant get external IP: ' + error);
});

watcher.on('IP:success', function (IP) {
    // console.log('Got IP: %s', IP);
    // client.publish('sweet-home', `${IP}`, { retain:true });

});

client.on('connect', () => {
    fs.readFile('./tmp/subject', 'utf-8',  (err, data) => {
        console.log(err);
        if (data != undefined) {
            subject = data;
            console.log(subject);

            watcher.start();
        } else {
            var pw = new xkcd();

            var options = {
                numWords: 4,
                minLength: 5,
                maxLength: 8
            };

            pw.generate(options, function(err, result) {
                subject = result.map(s=> s.charAt(0).toUpperCase() + s.slice(1)).join('');
                console.log(subject);
                fs.writeFile('./tmp/subject', subject, (err) => {
                    if (err) console.log(err);
                });
                watcher.start();
            });

        }



    });

});
