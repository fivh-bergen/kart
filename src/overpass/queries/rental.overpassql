
[out:xml][timeout:25];
// fetch area “bergen” to search in
area(id:3600404159)->.searchArea;

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
  node.rental;
);

out geom;