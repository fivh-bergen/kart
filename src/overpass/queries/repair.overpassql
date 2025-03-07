
[out:json];
// fetch area “bergen” to search in
area(id:3600404159)->.searchArea;

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
)->.repair;

// find car related nodes
(
  node["shop"="car_repair"](area.searchArea);
  node["shop"="tyres"](area.searchArea);
)->.car;

// subtract car related nodes from repair set
(node.repair; - node.car;)->.repair;

// send final output to default result set 
(
  node.repair;
);

out geom;