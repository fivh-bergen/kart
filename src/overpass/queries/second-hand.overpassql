
[out:xml][timeout:25];
// fetch area “bergen” to search in
area(id:3600404159)->.searchArea;

// find second hand shops
(
  node["shop"="second_hand"](area.searchArea);
  node["second_hand"="yes"](area.searchArea);
  node["second_hand"="only"](area.searchArea);
  node["amenity"="give_box"](area.searchArea);
)->.secondHand;

// send final output to default result set 
(
  node.secondHand;
);

out geom;