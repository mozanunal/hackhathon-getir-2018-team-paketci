var finder = require("./wayFinder");

finder.FindWay("40.7143528, -74.0059731","40.5143528, -74.2059731","akey",(points) => {
    console.log(points);
});
