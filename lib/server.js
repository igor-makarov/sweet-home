'use strict'

import mqtt from 'mqtt'
import {argv} from 'optimist'
import express from 'express'
import http from 'http'
import request from 'request'

var port = argv.p;

var client  = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', function () {


    var app = express();

    app.use('/:subject/:port', (req, res) => {
        console.log(req.params);
        console.log(req.url);

        let subject = req.params.subject;

        client.subscribe(subject);

        client.on('message', (topic, message) => {
            if (topic !== subject) return;
            console.log('home IP: ' + message);
            let homeIp = message;

            client.unsubscribe(topic);

            let url = `http://${homeIp}:${req.params.port}`;
            console.log(url);

            res.redirect(307, url);

        });

    });

    app.listen(port, () => {
        console.log('Example app listening on port ' + port);
    });

});
