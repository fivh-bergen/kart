
[out:json];
// fetch area “bergen” to search in
area(id:3600404159)->.searchArea;

// find second hand shops
(
  node["shop"="second_hand"](area.searchArea);
  node["shop"="charity"](area.searchArea);
  node["second_hand"="only"](area.searchArea);
  node["amenity"="give_box"](area.searchArea);
)->.secondHand;

// find repair places
(
  node["repair"="yes"](area.searchArea);
  node["repair"="only"](area.searchArea);
  node["service:bicycle:repair"="yes"](area.searchArea);
  node["repair"="assisted_self_service"](area.searchArea);
  node["computer:repair"="yes"](area.searchArea);
  node["mobile_phone:repair"="yes"](area.searchArea);
  node["camera:repair"="yes"](area.searchArea);
  node["bicycle:repair"="yes"](area.searchArea);
  node["brand"="Repair Café"](area.searchArea);
  node["craft"="shoemaker"](area.searchArea);
  node["craft"="goldsmith"](area.searchArea);
  node["craft"="jeweller"](area.searchArea);
  node["craft"="luthier"](area.searchArea);
  node["shop"="repair"](area.searchArea);
)->.repair;

// find car related nodes
(
  node["shop"="car_repair"](area.searchArea);
  node["shop"="tyres"](area.searchArea);
)->.car;

// subtract car related nodes from repair set
(node.repair; - node.car;)->.repair;

// find rental/borrowing nodes
(
  node["amenity"="bicycle_rental"](area.searchArea);
  node["amenity"="boat_rental"](area.searchArea);
  node["amenity"="boat_sharing"](area.searchArea);
  node["amenity"="motorcycle_rental"](area.searchArea);
  node["amenity"="scooter_rental"](area.searchArea);
  node["amenity"="kick-scooter_rental"](area.searchArea);
  node["service:bicycle:rental"="yes"](area.searchArea);
  node["amenity"="ski_rental"](area.searchArea);
  node["shop"="rental"](area.searchArea);
  node["shop"="tool_hire"](area.searchArea);
  node["amenity"="tool_library"](area.searchArea);
  node["amenity"="toy_library"](area.searchArea);
  node["amenity"="public_bookcase"](area.searchArea);
)->.rental;

// find city bike docking stations
( 
  node["network"="Bergen Bysykkel"](area.searchArea);
  node["operator"="Bergen Bysykkel"](area.searchArea);
  node["bicycle_rental" = "docking_station"](area.searchArea);
  node["brand"="Obos"](area.searchArea);
)->.cityBike;

// subtract city bike docking stations from rental set
(node.rental; - node.cityBike;)->.rental;
  

// send final output to default result set 
(
  node.secondHand;
  node.repair;
  node.rental;
);

out geom;