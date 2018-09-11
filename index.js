"use strict";

let Service, Characteristic, api;

const configParser = require("homebridge-http-base").configParser;
const http = require("homebridge-http-base").http;
const notifications = require("homebridge-http-base").notifications;
const PullTimer = require("homebridge-http-base").PullTimer;

const packageJSON = require("./package.json");


module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    api = homebridge;

    homebridge.registerAccessory("homebridge-http-humidity-sensor", "HTTP-HUMIDITY", HTTP_HUMIDITY);
};

function HTTP_HUMIDITY(log, config) {
    this.log = log;
    this.name = config.name;

    if (config.getUrl) {
        try {
            this.getUrl = configParser.parseUrlProperty(config.getUrl);
        } catch (error) {
            this.log.warn("Error occurred while parsing 'getUrl': " + error.message);
            this.log.warn("Aborting...");
            return;
        }
    }
    else {
        this.log.warn("Property 'getUrl' is required!");
        this.log.warn("Aborting...");
        return;
    }

    this.homebridgeService = new Service.HumiditySensor(this.name);
    this.homebridgeService.getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on("get", this.getHumidity.bind(this));

    /** @namespace config.pullInterval */
    if (config.pullInterval) {
        this.pullTimer = new PullTimer(this.log, config.pullInterval, this.getHumidity.bind(this), value => {
           this.homebridgeService.setCharacteristic(Characteristic.CurrentRelativeHumidity, value);
        });
        this.pullTimer.start();
    }

    /** @namespace config.notificationPassword */
    /** @namespace config.notificationID */
    notifications.enqueueNotificationRegistrationIfDefined(api, log, config.notificationID, config.notificationPassword, this.handleNotification.bind(this));
}

HTTP_HUMIDITY.prototype = {

    identify: function (callback) {
        this.log("Identify requested!");
        callback();
    },

    getServices: function () {
        const informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Andreas Bauer")
            .setCharacteristic(Characteristic.Model, "HTTP Humidity Sensor")
            .setCharacteristic(Characteristic.SerialNumber, "HS01")
            .setCharacteristic(Characteristic.FirmwareRevision, packageJSON.version);

        return [informationService, this.homebridgeService];
    },

    handleNotification: function(body) {
        const value = body.value;

        /** @namespace body.characteristic */
        let characteristic;
        switch (body.characteristic) {
            case "CurrentRelativeHumidity":
                characteristic = Characteristic.CurrentRelativeHumidity;
                break;
            default:
                this.log("Encountered unknown characteristic handling notification: " + body.characteristic);
                return;
        }

        this.log("Updating '" + body.characteristic + "' to new value: " + body.value);
        this.homebridgeService.setCharacteristic(characteristic, value);
    },

    getHumidity: function (callback) {
        http.httpRequest(this.getUrl, (error, response, body) => {
            if (error) {
                this.log("getHumidity() failed: %s", error.message);
                callback(error);
            }
            else if (response.statusCode !== 200) {
                this.log("getHumidity() returned http error: %s", response.statusCode);
                callback(new Error("Got http error code " + response.statusCode));
            }
            else {
                const humidity = parseFloat(body);
                this.log("Humidity is currently at %s", humidity);

                callback(null, humidity);
            }
        });
    },

};