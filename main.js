let state = {
    score: 0,
    level: 1,
    consecutiveCorrect: 0,
    currentCity: null,
    timerId: null,
    timeLeft: 0
};

console.log("main.js загружен");

async function getRandomCountry() {
    const url = 'https://restcountries.com/v3.1/all';

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Полученные данные:', data);

        const validCountries = data.filter(
            country => country.translations?.rus?.common && country.latlng
        );

        if (!validCountries || validCountries.length === 0) throw new Error("Список стран пуст.");

        const randomIndex = Math.floor(Math.random() * validCountries.length);
        const selectedCountry = validCountries[randomIndex];

        return {
            name: selectedCountry.translations.rus.common,
            coords: selectedCountry.latlng
        };
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        infoEl.textContent = '⚠️ Ошибка загрузки данных о стране. Попробуйте снова.';
        return null;
    }
}

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const infoEl = document.getElementById("info");
const timeLeftEl = document.getElementById("timeLeft");
const targetCityNameEl = document.getElementById("targetCityName");
const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", nextRound);

async function nextRound() {
    stopTimer();
    generateBtn.disabled = true;

    const randomCountry = await getRandomCountry();
    if (!randomCountry) {
        generateBtn.disabled = false;
        return;
    }

    state.currentCity = randomCountry;
    targetCityNameEl.textContent = "Страна: " + randomCountry.name;

    state.timeLeft = 30;
    timeLeftEl.textContent = `Осталось времени: ${state.timeLeft} c.`;
    state.timerId = setInterval(tick, 1000);

    infoEl.textContent = "";
}

function tick() {
    state.timeLeft--;
    if (state.timeLeft < 0) state.timeLeft = 0;
    timeLeftEl.textContent = `Осталось времени: ${state.timeLeft} c.`;

    if (state.timeLeft <= 0) {
        stopTimer();
        handleGuessFail("⏰ Время вышло!");
    }
}

function stopTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

function checkUserGuess(userCoords) {
    if (!state.currentCity) {
        infoEl.textContent = "⚠️ Нажмите 'Сгенерировать страну' для начала.";
        return;
    }

    const distance = ymaps.coordSystem.geo.getDistance(
        [state.currentCity.coords[0], state.currentCity.coords[1]],
        [userCoords[0], userCoords[1]]
    );

    const threshold = 200000;
    if (distance <= threshold) {
        stopTimer();
        handleGuessSuccess(distance);
    } else {
        stopTimer();
        handleGuessFail(`❌ Промах! Расстояние: ${(distance / 1000).toFixed(1)} км.`);
    }
}

function handleGuessSuccess(distance) {
    infoEl.textContent = `🎯 Угадано! Расстояние: ${(distance / 1000).toFixed(1)} км.`;
    state.score++;
    scoreEl.textContent = `Счёт: ${state.score}`;
    state.consecutiveCorrect++;
    if (state.consecutiveCorrect >= 3) {
        state.level++;
        state.consecutiveCorrect = 0;
        levelEl.textContent = `Уровень: ${state.level}`;
        infoEl.textContent += ` 🚀 Новый уровень: ${state.level}!`;
    }
    generateBtn.disabled = false;
}

function handleGuessFail(msg) {
    infoEl.textContent = `😔 Не угадано! ${msg}`;
    state.consecutiveCorrect = 0;
    generateBtn.disabled = false;
}