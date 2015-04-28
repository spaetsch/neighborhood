// --------- MODEL ---------------

var markersModel = [
  {
    title: "5 Spot",
    category: "restaurant",
    address: "1502 Queen Anne Ave N., Seattle, WA", 
    phone:"(206) 285-7768",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png",
    }) 
  },
  {
    title: "Bustle on Queen Anne",
    category: "coffee",
    address: "535 W. McGraw St., Seattle, WA", 
    phone:"(206) 453-4285",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png",
    }) 
  },
   {
    title: "Cafe Ladro",
    category: "coffee",
    address: "2205 Queen Anne Ave N, Seattle, WA", 
    phone:"(206) 282-5313",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png",
    }) 
  },
  {
    title: "Homegrown",
    category: "restaurant",
    address: "2201 Queen Anne Ave N., Seattle, WA", 
    phone: "(206) 217-4745",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png",
    })
  },
  {
    title: "Hommage",
    category: "restaurant",
    address: "198 Nickerson St, Seattle, WA", 
    phone: "(206) 283-2665",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0), 
      icon: "img/pins/restaurant.png"
    })
  },
  {
    title: "Nickerson Street Saloon",
    category: "pub",
    address: "318 Nickerson St, Seattle, WA", 
    phone: "(206) 284-8819",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png",
    })
  },
  {
    title: "Paragon Seattle",
    category: "pub",
    address: "2125 Queen Anne Ave N, Seattle, WA", 
    phone: "(206) 283-4548",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png",
    })
  },
  {
    title: "Storyville Coffee Company",
    category: "coffee",
    address: "2128 Queen Anne Ave N, Seattle, WA", 
    phone:"(206) 780-5777",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png",
    }) 
  },
  {
    title: "Sully's Lounge",
    category: "pub",
    address: "1625 Queen Anne Ave N, Seattle, WA", 
    phone: "(206) 283-3900",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png",
    })
  },
  {
    title: "Tenth West",
    category: "restaurant",
    address: "1903 10th Ave W, Seattle, WA", 
    phone: "(206) 708-6742",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0), 
      icon: "img/pins/restaurant.png"
    })
  },
     {
    title: "Trader Joe's",
    category: "grocery",
    address: "1916 Queen Anne Ave., Seattle, WA", 
    phone: "(206) 284-2546",
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0), 
      icon: "img/pins/supermarket.png"
    })
  },
  {
    title: 'Whole Foods',
    category: "grocery",                        
    address: "2001 15th Ave. W., Seattle, WA",  // street address for use by Google Maps geocoder
    phone:"(206) 352-5440",                     // phone number for use by Yelp API
    marker : new google.maps.Marker({           // google maps marker object
      position: new google.maps.LatLng(0,0),      // set initial position to (0,0)
      icon: "img/pins/supermarket.png"            // map icon by category
    })
  },
]


// ---------------------------------- VIEWMODEL ------------------------------

var resultMarkers = function(members){
  var self = this;

  self.mapOptions = {
      center: new google.maps.LatLng(47.641437, -122.360834),//(47.635930, -122.364991), //set map center in Queen Anne
      zoom: 15
    };

  self.map = new google.maps.Map(document.getElementById('map-container'), self.mapOptions);

  self.markers = ko.observableArray(members); 
  self.searchReq = ko.observable("");

  self.filteredMarkers = ko.computed(function() {
    //remove all markers from map
    for (current in markersModel) {
        markersModel[current].marker.setMap(null);
      }
    //place only markers that match search request
    return $.grep(members, function( a ) {
    
      var titleSearch = a.title.toLowerCase().indexOf(self.searchReq().toLowerCase());
      var catSearch = a.category.toLowerCase().indexOf(self.searchReq().toLowerCase());   
    
      if( titleSearch > -1 || catSearch > -1){
          a.marker.setMap(self.map);
        } 
        return titleSearch > -1 || catSearch > -1;
        });
  });
  
  self.addAllMarkers = function(){  
    //iterate through all markers in the model
    for (current in markersModel){
        //add event listener to each map marker to trigger the corresponding infowindow on click
        google.maps.event.addListener(markersModel[current].marker, 'click', function(innerCurrent) {
          return function(){
            var infowindow = new google.maps.InfoWindow({
              content: "<div id='yelpWindow'></div>" ,
              maxWidth: 250
            });

            yelpRequest(markersModel[innerCurrent].phone, function(data){
              var contentString = "<div id='yelpWindow'>" +
                                  "<h5>" +  "<a href='" + data.mobile_url + "' target='_blank'>" +data.name + "</a>" + "</h5>" + 
                                  "<p>" + data.location.address + "</p>" +
                                  "<p>" + data.display_phone + "</p>" +
                                  "<img src='" + data.rating_img_url_large + "'>" +
                                  "<p>" + data.snippet_text + "</p>" +
                                  "</div>";
              infowindow.setContent(contentString);
            });
            infowindow.open(self.map, markersModel[innerCurrent].marker);
          }
        }(current));

        geocoder = new google.maps.Geocoder();
        //place marker on map using address to find LatLng with geocoder
        geocoder.geocode({ 'address': markersModel[current].address }, function(current){
          return function(results, status) {  
            markersModel[current].marker.position = results[0].geometry.location;
            markersModel[current].marker.setMap(self.map);
          }
        }(current));
    }//for loop
  }//addAllMarkers

  //toggle bounce animation on click (data-binding)
  self.toggleBounce = function(currentMarker) {
    if (currentMarker.marker.getAnimation() != null) {
      currentMarker.marker.setAnimation(null);
    } else {
      currentMarker.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function (){currentMarker.marker.setAnimation(null)}, 2800); //bounce for 2800 ms
    }
  }
}

//----

//----

var myMarkers = new resultMarkers(markersModel);
ko.applyBindings(myMarkers);
google.maps.event.addDomListener(window, 'load', myMarkers.addAllMarkers);
