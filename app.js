const FORECAST = 'http://api.openweathermap.org/data/2.5/forecast?';
const REVGEO = 'http://nominatim.openstreetmap.org/reverse?';

const appid = 'ec9c5934aaa63b5e078d3cac6320adb2';
const textbox = document.querySelector('.text');
const locationdiv = document.querySelector('.location');
let city = 'Mumbai';

document.addEventListener('DOMContentLoaded', () => onload_events());

const set_loc = (city) => locationdiv.innerHTML = city

function onload_events() {
    set_loc(city);
    get_weather();
}

function get_location() {
    if (!navigator.geolocation) {
        console.log('browser doesnt support geolocation')
        return;
    }
    set_loc('loading...');

    const success = async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const city_data = await get_city(lat, long)
        city = city_data.address.city;
        set_loc(city);
        get_weather();
    }
    const error = () => { console.log('error@geolocation'); }

    navigator.geolocation.getCurrentPosition(success, error);

}

async function get_weather() {
    const data = await call_api(city);
    const array = process_data(data);
    drawchart(array.days, array.rain)

    console.log(array);
}


async function call_api(city) {
    let url = FORECAST
        + 'q=' + city
        + '&id=524901'
        + '&appid=' + appid;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data;
        })
}

async function get_city(lat, long) {

    let url = REVGEO
        + 'format=json'
        + '&lat=' + lat
        + '&lon=' + long
        + '&zoom=15&addressdetails=1';

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data;
        })

}

function process_data(obj) {
    let days = [];
    let rain = [];
    let day = ''
    for (let i =0;i<15;i++) {
        let str = format(obj.list[i].dt_txt);

        if (day != str)
            days.push(str);
        else
            days.push('');
        day = str;

        if (obj.list[i].rain) {
            rain.push(obj.list[i].rain['3h'])
        } else
            rain.push(null)
    }
    return { days, rain }
}

const format = (str) => { return moment(str).format('ddd h:mm a'); }


function drawchart(labels, data_array) {
    document.getElementById('chart').remove();
    creat_canv();
    const data = {
        labels: labels,
        datasets: [{
            label: 'rain',
            data: data_array,
            fill: false,
            borderColor: 'gray',
            pointBorderColor: 'gray',
            pointBorderWidth: 0.5,
            borderWidth: 1,
            tension: 0.3
        }]
    };
    const config = {
        type: 'line',
        data: data,
        options: {
            // responsive: false,
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotation: 90,
                    }
                }
            }
        }
    };
    const chart = new Chart(
        document.getElementById('chart'),
        config
    );
}

const searchbtn = document.getElementById('searchbtn')
searchbtn.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        city = searchbtn.value;
        set_loc(city);
        get_weather();
    }
});

function creat_canv() {
    const canvascontainer = document.querySelector('.canvascontainer');
    let canvas = document.createElement('canvas');
    canvas.id = 'chart';
    canvas.setAttribute('height', '400px');
    canvas.setAttribute('width', '500px');
    canvascontainer.appendChild(canvas);
}

// function set_leafletview(lat, lon) {
//     var map = L.map('map').setView([lat, lon], 12);
//     var marker = L.marker([lat, lon]).addTo(map);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '© OpenStreetMap'
//     }).addTo(map);
// }