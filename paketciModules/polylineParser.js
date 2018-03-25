var polyline = require('polyline');

var decoder = (polyfilString)=>{
    return polyline.decode(polyfilString);
}

module.exports.decode = decoder;

