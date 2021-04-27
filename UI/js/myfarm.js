
var raster = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmFsYWppMjI3IiwiYSI6ImNrbm10Z2h6NjB2eXQybnBlaTZ3cGgxMzMifQ.KSd7ydAqcZCAEzgoB6iLzA',
      tileSize: 512
    })
  });

var source = new ol.source.Vector({wrapX: false});

var vector = new ol.layer.Vector({
  source: source,
});

var view_var = new ol.View({
    zoom: 5,
    minZoom: 3,
    center: ol.proj.fromLonLat([80.9038, 22.4937]),
});
/*
var map = new ol.Map({
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});
*/
var map = new ol.Map({
    layers: [raster, vector],
    target: 'map',
    view: view_var
  });

var js = '{"coordinates":[[[77.47381782610317,18.823230684599565],[77.47386932373044,18.821898337682356],[77.47489929199216,18.821849593211198],[77.47483062717944,18.82230454209204],[77.47574043300118,18.822272045651417],[77.47584342956542,18.824303053677724],[77.47397232029469,18.824368045457433],[77.47381782610317,18.823230684599565]]]}';
//var coords = js.coordinates
//console.log(coords)

/*function dispMap() {
    //alert("IN");
    console.log(coords)
    var polygon = new ol.geom.Polygon(coords);
    console.log(polygon);
    polygon.transform('ESPG:4326', 'ESPG:3857');
    var feature = new ol.Feature(polygon);
    var vectorSource = new ol.source.Vector();
    vectorSource.addFeature(feature);
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayer);

}*/
function fetchfarms(key) {
  //console.log("func key: " + farm_name);
  //var key = getCookie('user_key');
  console.log(key);
  formoption = "<ul class='nav nav-treeview'>"


  console.log('http://127.0.0.1:5010/userfarms?key=' + key)
  //var jsonstr = JSON.stringify(js_ob)
  //console.log(typeof(jsonstr))
  //console.log(jsonstr);
  $.ajax({
      url : 'http://127.0.0.1:5010/userfarms?key=' + key,
      type : 'POST',
      cors : true,
      headers: {
      'Access-Control-Allow-Origin': '*',
      },
      contentType: 'application/json',
      success : function(data)
      {
          console.log(data);
          FarmArray = data["Active"]
          console.log(FarmArray[0]);
          for(let i = 0;i < FarmArray.length;i++){
            console.log(FarmArray[i]["farmname"],FarmArray[i]["farmid"]);
            formoption += "<li class='nav-item' ><a onclick='fetchcoords("+FarmArray[i]["farmid"]+"); return false;' class='nav-link'><i class='fas fa-leaf nav-icon'></i><p>"+FarmArray[i]["farmname"]+"</p></a></li>";
           
            console.log(i,formoption)
         }
         formoption += '</ul>';
         $('#user_farms').append(formoption);
         
      }
   });


}

//var js_str = '{"coordinates":[[[-89.42373275756836,39.889705702345424],[-89.42400741158052,39.88296169776643],[-89.41521834698503,39.88222403095028],[-89.41466903896068,39.8909701306041],[-89.42359543056226,39.89139160284719],[-89.42373275756836,39.889705702345424]]]}';
var js_obj;
var vectorLayer;
var content;

function gen_overlay(farmid){

  var fname, cname;

  $.ajax({
    url : 'http://127.0.0.1:5010/name_crop?farmid=' + farmid,
    type : 'POST',
    cors : true,
    headers: {
    'Access-Control-Allow-Origin': '*',
    },
    contentType: 'application/json',
    success : function(data)
    {
        console.log(data.farmname);
        fname = data.farmname;
        cname = data.crop;

    }
 });

  map.on('singleclick', function (evt) {
    console.log("single click");
    flag_var = 0;
    chk_arr = [];
    setCookie('farm_id', farmid, 1);
    console.log(getCookie('farm_id'));
    var coordinate = evt.coordinate;
    //console.log(vectorLayer);
    var chk_arr = vectorLayer.getSource().getFeaturesAtCoordinate(coordinate)
    console.log(chk_arr.length);
    if(chk_arr.length > 0){
      flag_var = 1;
      console.log("In if condn "+flag_var);
      console.log("In gen_overlay",farmid)
    }
    console.log(flag_var);
    var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
    content.innerHTML = '<p>You clicked Here:</p><p>Farm name: ' + fname + '</p><p>Crop Type: '+ cname + '</p>' + '<a href="addtask.html"> Click Here to Add Task </a> <br><a href="farm_entry.html"> Click Here to Create Log </a>';
    
    overlay.setPosition(coordinate);
    if(flag_var > 0){
      console.log("in if");
      map.addOverlay(overlay);
    }
    else{
      map.removeOverlay(overlay);
    }
    
  });
}
function fetch_weather(farmid){
  var weather_nav;

  $.ajax({
    url : 'http://127.0.0.1:5010/weather?farmid=' + farmid,
    type : 'POST',
    cors : true,
    headers: {
    'Access-Control-Allow-Origin': '*',
    },
    contentType: 'application/json',
    success : function(data)
    {
        console.log(data.result_weather);
        weather_nav = '<div class="dropdown-menu dropdown-menu-lg dropdown-menu-right"><span class="dropdown-item dropdown-header">7 Days Weather Forecast</span><div class="dropdown-divider"/><span class="dropdown-item dropdown-header"><strong>'+ data.result_weather[0].date +'</strong></span><div class="dropdown-divider"/><a href="#" class="dropdown-item"><i class="fas fa-thermometer-half mr-2"/> Average Temperature <span class="float-right text-muted text-sm">'+  data.result_weather[0].day+'°C</span> </a><div class="dropdown-divider"/><a href="#" class="dropdown-item"><i class="fas fa-cloud-rain mr-2"/> Overall Weather <span class="float-right text-muted text-sm"> '+ data.result_weather[0].desc +'</span> </a><div class="dropdown-divider"/><a href="#" class="dropdown-item"><i class="fas fa-wind mr-2"/> Wind Speed <span class="float-right text-muted text-sm">10 knots</span> </a><div class="dropdown-divider"/><a href="#" class="dropdown-item dropdown-footer">See All</a></div> '
        console.log(weather_nav)
        $('#weather_disp').append(weather_nav);
        //console.log(document.getElementById("#weather_disp").innerHTML);
    }
 });


}

function fetchcoords(fid) {

  map.removeLayer(vectorLayer);
  fetch_weather(fid);
    var farmid = fid;
    console.log('http://127.0.0.1:5010/showfarm?farmid=' + farmid)
    //var jsonstr = JSON.stringify(js_ob)
    //console.log(typeof(jsonstr))
    //console.log(jsonstr);
    $.ajax({
        url : 'http://127.0.0.1:5010/showfarm?farmid=' + farmid,
        type : 'POST',  
        cors : true,
        headers: {
        'Access-Control-Allow-Origin': '*',
        },
        contentType: 'application/json',
        success : function(data)
        {
            console.log(data);
            crd = data;
            //console.log(typeof(crd))
            console.log("HELLO" + crd.coordinates[0]);
            var polygon = new ol.geom.Polygon([crd.coordinates[0]]);
            polygon.applyTransform(ol.proj.getTransform('EPSG:4326', 'EPSG:3857'))
                // Create feature with polygon.
            var feature = new ol.Feature(polygon);
        
            // Create vector source and the feature to it.
            var vectorSource = new ol.source.Vector();
            vectorSource.addFeature(feature);
        
            // Create vector layer attached to the vector source.
             vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });
            view_var.fit(polygon, { padding: [170, 50, 30, 150] });
            // Add the vector layer to the map.
            map.addLayer(vectorLayer);
            gen_overlay(farmid);        }
     });

}

//fetchcoords()
//dispFarm()

window.onload = function pop_up(){

  fetchfarms(getCookie('user_key'));
  var user_name = getCookie('username');
  console.log(user_name);
  var tag = "<a href='#' class='d-block'>"+user_name+"</a>"
  $("#username").html(tag);

  var flag_var = 0;
  console.log("in pop up")
  var container = document.getElementById('popup');
  content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');

  overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
  
  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

    /*map.on('singleclick', function (evt) {
      console.log("single click");
      flag_var = 0;
      chk_arr = [];
      var coordinate = evt.coordinate;
      //console.log(vectorLayer);
      var chk_arr = vectorLayer.getSource().getFeaturesAtCoordinate(coordinate)
      console.log(chk_arr.length);
      if(chk_arr.length > 0){
        flag_var = 1;
        console.log("In if condn "+flag_var);
      }
      console.log(flag_var);
      var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
      content.innerHTML = '<p>You clicked Here:</p><code>' + hdms + '</code>';
      overlay.setPosition(coordinate);
      if(flag_var > 0){
        console.log("in if");
        map.addOverlay(overlay);
      }
      else{
        map.removeOverlay(overlay);
      }
      
    });
    console.log(flag_var);*/
    
  
}
