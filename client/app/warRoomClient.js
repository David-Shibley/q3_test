var axios = require("axios");

module.exports = function (callback) {
  setInterval(function () {
    axios.get("http://galvanize-warroom-status.herokuapp.com/")
    .then(function (data) {
      callback(null, data);
    })
    .catch(function (reason) {
      callback(reason);
    });
  }, 500);
}
