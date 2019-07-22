var map;
var service;
var initialLocation;
var hospitals = [];
var markers = []

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.7223, lng: -9.1393},
        zoom: 8
    });
    
    service = new google.maps.places.PlacesService(map);
    
    var input = document.getElementById("location-input");
    var searchBox = new google.maps.places.SearchBox(input);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById("sidebar"));
    
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        hospitals.forEach(function(hospital) {
            hospital.marker.setMap(null);
        });
        
        document.getElementById("sidebar").innerHTML = "<h1>Hospitals</h1>";

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            
            var request = {
                location: place.geometry.location,
                radius: '1000000',
                type: ['hospital'],
                fields: ['opening_hours']
            };
            
            service.search(request, callback);

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
        
    });
}

function callback(data) {
    var len = data.length;
    if(len > 9)
        len = 9;
    for(var i = 0; i < len; i++) {
        var currentHospital = data[i];
        service.getDetails({reference: currentHospital.reference}, function(details, status) {
            var marker = new google.maps.Marker({
                map: map,
                title: details.name,
                position: details.geometry.location
            });
            hospitals.push({name: details.name, address: details.formatted_address, phoneNumber: details.formatted_phone_number, marker: marker});
            document.getElementById("sidebar").innerHTML += "<h3>" + details.name + "</h3><p>Address: " + details.formatted_address + "</p><p>Phone Number: " + details.formatted_phone_number + "</p>";
        });
    }
}