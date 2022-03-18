/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');
const fetchMyIP = function(callback) {
  request(`https://api.ipify.org?format=json`,(error, response, body)=> {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const ip = JSON.parse(body).ip;
    callback(null,ip);
  });
};

const fetchCoordsByIP = function(ip,callback) {
  console.log(ip);
  request(`http://ip-api.com/json/${ip}`,(error,response,body)=> {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
  
    const datas = JSON.parse(body);
    const lat = JSON.stringify(datas.lat);
    const lon = JSON.stringify(datas.lon);
    const obj = {latitude: lat , longitude: lon};
    callback(null ,obj);
    //callback(null,data);
  });
};
const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, data) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(data, (error, obj) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(obj, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }
        
        callback(null, nextPasses);
      });
    });
  });
};



module.exports = { nextISSTimesForMyLocation, };