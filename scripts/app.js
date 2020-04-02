// //foursquare clientid
// let clientId = "IRDBUTDRK0IU2A1O2LWFJPFUTNUSTQFZEOPP5QWVXOQ0LMDM"
// let clientSecret = "XX32BTHUQ3MU5QXPATTSHF4Z3ASR3VPE2W5F2FGZ21Z1B5ZW"

// //foursquare api base URL
// let foursquareURL = "https://api.foursquare.com/v2/venues/search"

// let natureCat = "4d4b7105d754a06377d81259"
// let foursquareParam = {
//         client_id: clientId, 
//         client_secret: clientSecret, 
//         near: "Singapore",
//         categoryId: natureCat,
//         v:"20200328"
// }

// let foursquareData = null

//Parks and NParks data from Data.gov.sg
let parksAPI = "/data/parks-geojson.geojson"
let nParksAPI = "/data/nparks-parks-geojson.geojson"
let cyclingAPI = "/data/cycling-path-network-geojson.geojson"
let treesAPI = "/data/heritage-trees-geojson.geojson"
let pcnAPI = "/data/park-connector-loop-geojson.geojson"
let nParksTracksAPI = "/data/nparks-tracks-geojson.geojson"
let parkDataAPI = "/data/park-data.csv"

// https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=2020-04-01T23%3A50%3A00&date=2020-04-01
let weather2hrAPI = "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast"
let weather24hrAPI = "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast"



// declare variables for creating markers
let parks
let nParks
let cyclingPath
let trees
let pcn
let nParksTracks
let parkData
let parksLayer
let nParksLayer
let treesLayer
let pcnLayer
let cyclingPathLayer
let nParksTracksLayer
let marker

let promises = [
    axios.get(parksAPI),
    axios.get(nParksAPI),
    axios.get(cyclingAPI),
    axios.get(treesAPI),
    axios.get(pcnAPI),
    axios.get(nParksTracksAPI),
    axios.get(parkDataAPI)
];



$(function () {

    function clearMarkers() {
        if (parksLayer) {
            parksLayer.clearLayers()
        }

        if (nParksLayer) {
            nParksLayer.clearLayers()
        }

        if (treesLayer) {
            treesLayer.clearLayers()
        }

        if (pcnLayer) {
            pcnLayer.clearLayers()
        }

        if (cyclingPathLayer) {
            cyclingPathLayer.clearLayers()
        }

        if (nParksTracks) {
            nParksTracks.clearLayers()
        }
    }

    function getWeather() {

        let date_time = moment().format()
        let date = moment().format('YYYY-MM-DD')
        console.log(date_time)
        console.log(date)

        params = {
            date_time, date
        }

        axios.get(weather2hrAPI, { params }).then(function (response) {
            weather2hr = response.data
        })

        axios.get(weather24hrAPI, { params }).then(function (response) {
            weather24hr = response.data

            let forecast = weather24hr.items[0].general.forecast
            let lowTemp = weather24hr.items[0].general.temperature.low
            let highTemp = weather24hr.items[0].general.temperature.high

            let aveTemp = Math.floor((lowTemp + highTemp) / 2)

            let weatherText = `
                <div class="p-5">
                    <h3 class="bluetext">24-hour Weather Forecast</h3>
                    <span class="weatherText">${forecast} </span>
                    <p>Temperature in Average</br>
                    <span class="tempNumber pt-0">
                    ${aveTemp}<span class="tempDegree"><sup>°C</sup></span>
                    </span><br/>
                    <span class="highlow">
                        <small><sup>Lo</sup> </small>${lowTemp}<sup>°</sup> / <small><sup>Hi</sup></small> ${highTemp}<sup>°</sup>
                    </span>
                </div>
            `

            $('#weather').empty()
            $('#weather').append(weatherText)
        })

    }

    function getData() {

        axios.all(promises).then(axios.spread(function (parks, nparks, cyclingPath, trees, pcn, nParksTracks, parkData) {
            csv().fromString(parkData.data).then(function (pData) {
                //console.log(pData)
                displayResult(parks, nparks, cyclingPath, trees, pcn, nParksTracks, pData)

            })
        }))

        // axios.all(promises).then(axios.spread(function (parks, nparks, cyclingPath, trees, pcn, nParksTracks){
        //     return displayResult
        // }))

    }

    function displayResult(parks, nparks, cyclingPath, trees, pcn, nParksTracks, parkData) {

        clearMarkers()
        // getData()
        $('#details').empty()
        $('#search-result-header').empty()

        let query = $('#query').val()

        if ($('input[name="show-park"]:checked')) {
            let showMode = $('input[name="show-park"]:checked').val()
            if (showMode == 'area') {

                viewParksArea(nparks, query)
            } else {

                viewParks(parks, query, parkData)
            }
        }

        if ($('input[name="show-layers"]:checked')) {

            let checkboxes = $('input[name="show-layers"]:checked')

            checkboxes.each(function () {
                let option = $(this).val()

                if (option == 'cycling') {
                    viewCyclingPath(cyclingPath, query)
                } else if (option == 'trees') {
                    viewTrees(trees, query)
                } else if (option == 'pcn') {
                    viewPCN(pcn, query)
                } else if (option == 'tracks')
                    viewNParksTracks(nParksTracks, query)
            })

        }
    }

    function viewParks(parks, query, parkData) {

        parksLayer = L.markerClusterGroup();

        let noOfResults = 0
        //console.log(parks.data)
        for (let n of parks.data.features) {
            let desc = n.properties.Description
            let parkDetails
            pName = $(desc).children().children().children().children().eq(14).text()
            // only show results with Park in the decription
            if (desc.indexOf(query) >= 0 || desc.indexOf(query) >= 0) {
                let marker = L.marker([n.geometry.coordinates[1], n.geometry.coordinates[0]], { icon: treeIcon }).bindPopup(pName)

                parksLayer.addLayer(marker);
                noOfResults = noOfResults + 1;

                let location = ""
                for (let p of parkData) {
                    if (p["Park Name"] == pName) {

                        location = p.Location

                        parkDetails = `
                        <div class="card border-0">
                            <img src="/images/park_images/${p["Park ID"]}.jpg" class="card-img-top" alt="${pName}" width="390" height="225">
                            <h6>Location:</h6>
                            <p>${location}</p>

                            <h6>Accessibility:</h6>
                            <p>${p.Accessibility}</p>
                        </div>
                        `
                    }
                }

                if (location == "") {
                    parkDetails = ""
                }

                let searchResult = `
                        <a href="#${noOfResults}"></a>
                        <h6>${pName}</h6>
                        ${parkDetails}
                        <hr />
                    `
                $('#details').append(searchResult)
            }
        }

        parksLayer.addTo(map)

        //map.flyToBounds(marker.latLngBounds())

        let searchResultStr = `
                <p class="p-3"> ${noOfResults} Search Results for <strong>${query}</strong></p>
            `
        $('#search-result-header').append(searchResultStr)

    }

    function viewParksArea(nparks, query) {

        nParksLayer = new L.geoJson(nparks.data, {
            filter: (feature, layer) => {
                desc = feature.properties.Description.toLowerCase()
                return desc.indexOf(query) >= 0
            }, onEachFeature: (feature, layer) => {
                desc = feature.properties.Description
                pName = $(desc).children().children().children().children().eq(4).text()
                layer.bindPopup(pName);
            }

        }).addTo(map);

        nParksLayer.setStyle({
            color: '#99A139',
            fillColor: '#476220',
            weight: 1,
            fillOpacity: 0.6
        })
    }

    function viewCyclingPath(cyclingPath, query) {
        //marking cycling path
        cyclingPathLayer = new L.geoJson(cyclingPath.data, {
            filter: (feature, layer) => {
                desc = feature.properties.Description.toLowerCase()
                return desc.indexOf(query) >= 0
            },
            onEachFeature: (feature, layer) => {
                desc = feature.properties.Description
                pName = $(desc).children().children().children().children().eq(2).text()
                layer.bindPopup(pName);
            }
        }).addTo(map)

        cyclingPathLayer.setStyle({
            color: '#563B28',
            // fillColor: 'red',
            weight: 2,
            Opacity: 0.3
        })
    }

    function viewNParksTracks(nParksTracks, query) {
        //mark nParksTracks
        nParksTracksLayer = new L.geoJson(nParksTracks.data, {
            filter: (feature, layer) => {
                desc = feature.properties.Description.toLowerCase()
                return desc.indexOf(query) >= 0
            },
            onEachFeature: (feature, layer) => {
                desc = feature.properties.Description
                //console.log($(desc).children().children().children().children())
                pName = $(desc).children().children().children().children().eq(2).text()
                layer.bindPopup(pName);
            }
        }).addTo(map)

        nParksTracksLayer.setStyle({
            color: '#196C00',
            // fillColor: 'red',
            weight: 2,
            Opacity: 0.5
        })

    }

    function viewTrees(trees, query) {

        // marking trees
        treesLayer = L.markerClusterGroup();

        for (let t of trees.data.features) {
            let desc = t.properties.Description

            pName = $(desc).children().children().children().children().eq(10).text()

            if (desc.indexOf(query) >= 0 || desc.indexOf(query) >= 0) {
                let marker = L.marker([t.geometry.coordinates[1], t.geometry.coordinates[0]], { icon: tree2Icon }).bindPopup(pName)
                treesLayer.addLayer(marker);
            }

        }

        treesLayer.addTo(map)
    }

    function viewPCN(pcn, query) {

        //mark park connector
        pcnLayer = new L.geoJson(pcn.data, {
            onEachFeature: (feature, layer) => {
                desc = feature.properties.Description
                pName = 'Point A: ' + $(desc).children().children().children().children().eq(2).text()
                pName = pName + '<br/>Point B: ' + $(desc).children().children().children().children().eq(4).text()
                layer.bindPopup(pName);
            }
        }).addTo(map)

        pcnLayer.setStyle({
            color: '#D49683',
            // fillColor: 'red',
            weight: 2,
            Opacity: 0.5
        })

    }

    $('#btn-search-home').click(function () {

        axios.get('/results.html').then(function (response) {
            window.location = '/results.html'
            displayResult()
        })

    })
    $('#btn-search').click(getData)
    $('#btn-change').click(getData)
    $('#btn-refresh').click(getData)

    getWeather()


    //getData(promises, displayResult)


})