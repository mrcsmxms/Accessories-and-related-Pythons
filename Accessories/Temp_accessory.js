var http = require("http");
var fs =  require("fs"); 
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a temperature sensor device that we'll expose to HomeKit
var TEMP_SENSOR = {
  currentTemperature: 50,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    return TEMP_SENSOR.currentTemperature;
  },
  getNewTemperature: function() {

    var temp = fs.readFileSync("/home/pi/HAP-NodeJS/temp");
    var raspiTemp = temp/1;
    TEMP_SENSOR.currentTemperature = raspiTemp;
 }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sens');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature Sens', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "F1:5D:3A:AE:5E:FC";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, TEMP_SENSOR.getTemperature());
  });

// refresh our temperature reading every 3 seconds
setInterval(function() {
  
  TEMP_SENSOR.getNewTemperature();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, TEMP_SENSOR.currentTemperature);
  
}, 3000);
