## Paketçi Backend

Getir Hackhathon 2018

Takımdakiler: 
Sertan Sezgin Kutlu 
Ertuğrul Çınar
Mehmet Ozan Ünal

# Paketci App

Its a work on pack collection and delivery for courier and observer.

### Features:
By Backend:
1.Assign routes for couries by relate most efficent path.
2.Update states of packets.
3.Update states of couriers.

By Frontend
1.Courier see waypoints and pack to collect.
2.Observers see all couriers and pack states.
3.Adding new packs

### Used Libraries and API in frontend
1.Android Libraries
2.Java
3.Volley
4.Google Maps Directions API
5.Google Maps Javascript API
6.AngularJS

### Compleated Part of Frontend
Application is designed for used by cariers. It gave users to see which way courier should go and where to take packs.

In order to make it more stable, decions of disturbution made at backend in order to keep system stable for all users, this app communacte with backend by using asyncrounous http requests.

For async HTTPS requess, it been used Volley library in JSON Object and String responsed GET and POST requests.

App takes missions from backend and by communicating with Google Direcitons API, get caluclations of every shorth path waypoints which collect and carry pointed packs in missions and drawing them on a Map View.

In angular web app we see all packs and couriers with their missions and routes. Its allows users to add new packs to environment.
