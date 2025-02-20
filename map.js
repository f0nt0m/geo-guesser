ymaps.ready(init);

let myMap;

function init() {
    try {
        console.log("Инициализация карты...");

        myMap = new ymaps.Map("map", {
            center: [30, 0],
            zoom: 3,
            type: 'yandex#map',
            controls: ['zoomControl', 'fullscreenControl']
        }, {
            minZoom: 2,
            maxZoom: 15,
            restrictMapArea: false
        });

        myMap.setType('yandex#satellite');

        myMap.behaviors.enable('scrollZoom');

        myMap.behaviors.enable('dblClickZoom');

        myMap.controls.remove('searchControl');
        myMap.controls.remove('trafficControl');
        myMap.controls.remove('typeSelector');
        myMap.controls.remove('geolocationControl');

        myMap.events.add('click', onMapClick);

        if (!myMap) {
            throw new Error("Карта не была инициализирована");
        }

        console.log("Карта успешно инициализирована");
    } catch (error) {
        console.error("Ошибка при инициализации карты:", error);
        document.getElementById('map').innerHTML =
            '<div style="padding: 20px; text-align: center;">' +
            'Ошибка загрузки карты. Пожалуйста, обновите страницу.' +
            '</div>';
    }
}

function onMapClick(e) {
    if (!myMap) return;
    const coords = e.get('coords');
    checkUserGuess(coords);
}

function checkMapState() {
    if (!myMap) {
        console.log("Карта не инициализирована, пробуем переинициализировать...");
        ymaps.ready(init);
    }
}

setInterval(checkMapState, 5000);