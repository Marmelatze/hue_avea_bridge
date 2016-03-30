"use strict";
const hue = require("node-hue-api");
const fs = require("fs");
const fetch = require("isomorphic-fetch");
const FormData = require("form-data");

let config;
if (fs.existsSync("config.json")) {
    const configContent = fs.readFileSync("config.json");
    config = JSON.parse(configContent);
}

if (undefined === config) {
    // search bridge
    hue.nupnpSearch().then((bridge) => {
        console.log("bridge found at " + bridge[0].ipaddress);
        console.log("press hue button");
        config = {
            "bridge": bridge[0].ipaddress,
        };
        const hueApi = new hue.HueApi();

        return hueApi.registerUser(bridge[0].ipaddress, "hue avea bridge");
    }).then((result) => {
        config.username = result;
        fs.writeFile("config.json", JSON.stringify(config));
    }).done();
    return;
}

const hueApi = new hue.HueApi(config.bridge, config.username);
hueApi.lightStatusWithRGB(config.referenceBulb).then(result => {
    console.log(result);
    console.log(result.state.rgb);
    const data = new FormData();
    data.append("color", "255," + result.state.rgb.join(","));
    console.log(data);
    fetch("http://localhost:3000/api/bulbs/" + config.aveaBulb, {
        method: "put",
        body: "color=255," + result.state.rgb.join(","),
    }).then(data => {
        return data.json();
    }).then(json => {
        console.log(json);
    }).catch(function(error) {
        console.log('request failed', error)
    });
}).done();



