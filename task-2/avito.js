const puppeteer = require('puppeteer');
const iPhone = puppeteer.devices['iPhone X'];
const url = 'https://m.avito.ru/moskva/kommercheskaya_nedvizhimost?cd=1&searchForm=true';

stationSelectionTest();
resetSelectionTest();
closingSearchBarTest();
filterWordingTest();
saveSelectionTest ();


async function stationSelectionTest () {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.emulate(iPhone);
	await page.goto(url);

	const searchLocation = await page.$('div[data-marker="location-chooser"]');
	await searchLocation.click();

	await page.waitForSelector('div[data-marker="region(637640)/container"]');
	const moscow = await page.$('div[data-marker="region(637640)/container"]');
	await moscow.click();

	await page.waitForSelector('.css-146c59g');
	const searchMetro = await page.$('.css-146c59g');
	await searchMetro.click();

	await page.waitForSelector('label[data-marker="metro-select-dialog/stations/item"]');
	const metroStation = await page.$('label[data-marker="metro-select-dialog/stations/item"]');
	await metroStation.click();

	const selectStationButton = await page.$('button[data-marker="metro-select-dialog/apply"]');
	const selectStationButtonText = await page.$eval('button[data-marker="metro-select-dialog/apply"]', element => element.textContent);
	const buttonTextCheck = selectStationButtonText.startsWith('Выбрать') && selectStationButtonText.endsWith('станцию');

	if (selectStationButton && buttonTextCheck) {
		console.log('При выборе станции появляется кнопка "Выбрать N станций": PASSED');
	} else {
		console.log('При выборе станции появляется кнопка "Выбрать N станций": FAILED');
	}

	const buttonLines = await page.$('button[value="lines"]');
	await buttonLines.click();

	const selectedStations = await page.$('div[data-marker="metro-select-dialog/chips"]');

	if (selectedStations) {
		console.log('Переключение Алфавит/Линия не сбрасывает выбор станции: PASSED');
	} else {
		console.log('Переключение Алфавит/Линия не сбрасывает выбор станции: FAILED');
	}

	await browser.close();
};


async function saveSelectionTest () {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.emulate(iPhone);
	await page.goto(url);

	const searchLocation = await page.$('div[data-marker="location-chooser"]');
	await searchLocation.click();

	await page.waitForSelector('div[data-marker="region(637640)/container"]');
	const moscow = await page.$('div[data-marker="region(637640)/container"]');
	await moscow.click();

	await page.waitForSelector('.css-146c59g');
	const searchMetro = await page.$('.css-146c59g');
	await searchMetro.click();

	await page.waitForSelector('label[data-marker="metro-select-dialog/stations/item"]');
	await page.evaluate( () => {
		const stations = [...document.querySelectorAll('label[data-marker="metro-select-dialog/stations/item"]')];
		const targetStation = stations.find(e => e.innerText.includes('Автозаводская'));
		targetStation && targetStation.click();
	});

	const buttonLines = await page.$('button[value="lines"]');
	await buttonLines.click();

	const stationIsChecked =  await page.evaluate( () => {
		const stations = [...document.querySelectorAll('label[data-marker="metro-select-dialog/lines/station"]')];
		const targetStation = stations.find(e => e.innerText.includes('Автозаводская'));
		const checked = targetStation.getAttribute('aria-checked') === 'true';
		return checked;
	});

	const lineIsClosed =  await page.evaluate( () => {
		const lines = [...document.querySelectorAll('div[data-marker="metro-select-dialog/lines"]')];
		const targetLine = lines.find(e => e.innerText.includes('Замоскворецкая'));
		const closed = targetLine.getAttribute('data-marker') !== 'metro-select-dialog/lines/expanded';
		return closed;
	});

	if (stationIsChecked && lineIsClosed) {
		console.log('При выборе любой станции из алфавитного списка, выбор дублируется внутри линии, линия не разворачивается: PASSED');
	} else {
		console.log('При выборе любой станции из алфавитного списка, выбор дублируется внутри линии, линия не разворачивается: FAILED');
	};

	browser.close();
};


async function resetSelectionTest () {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.emulate(iPhone);
	await page.goto(url);

	const searchLocation = await page.$('div[data-marker="location-chooser"]');
	await searchLocation.click();

	await page.waitForSelector('div[data-marker="region(637640)/container"]');
	const moscow = await page.$('div[data-marker="region(637640)/container"]');
	await moscow.click();

	await page.waitForSelector('.css-146c59g');
	const searchMetro = await page.$('.css-146c59g');
	await searchMetro.click();

	const isDisabled = await page.$('button.css-yz1jyo[disabled]') !== null;

	await page.waitForSelector('label[data-marker="metro-select-dialog/stations/item"]');
	const metroStation = await page.$('label[data-marker="metro-select-dialog/stations/item"]');
	await metroStation.click();

	const isNotDisabled = await page.$('button.css-yz1jyo[disabled]') == null;

	if (isDisabled && isNotDisabled) {
		console.log('Кнопка “Сбросить” появляется только при выбранных станциях: PASSED');
	} else {
		console.log('Кнопка “Сбросить” появляется только при выбранных станциях: FAILED');
	};

	await browser.close();
};


async function closingSearchBarTest () {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.emulate(iPhone);
	await page.goto(url);

	const searchLocation = await page.$('div[data-marker="location-chooser"]');
	await searchLocation.click();

	await page.waitForSelector('div[data-marker="region(637640)/container"]');
	const moscow = await page.$('div[data-marker="region(637640)/container"]');
	await moscow.click();
	
	await page.waitForSelector('div.css-146c59g');
	const searchMetro = await page.$('div.css-146c59g');
	await searchMetro.click();

	await page.waitForSelector('input[data-marker="metro-select-dialog/search"]');
	const searchBar = await page.$('input[data-marker="metro-select-dialog/search"]');
	await searchBar.click();
	await searchBar.type('Автозаводская');
	
	const metroStation = await page.$('label[data-marker="metro-select-dialog/stations/item"]');
	await metroStation.click();

	const searchBarIsEmpty = searchBar.value == null;
	const sortIsDisplayed = await page.$('div.css-1bgls3i');
	const selectionIsDisplayed = await page.$('div[data-marker="metro-select-dialog/chips"]');

	if (searchBarIsEmpty && sortIsDisplayed && selectionIsDisplayed) {
		console.log('При выборе станции метро через поисковую строку, поиск закрывается: PASSED');
	} else {
		console.log('При выборе станции метро через поисковую строку, поиск закрывается: FAILED');
	};

	browser.close();
};


async function filterWordingTest () {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.emulate(iPhone);
	await page.goto(url);

	const searchLocation = await page.$('div[data-marker="location-chooser"]');
	await searchLocation.click();

	await page.waitForSelector('div[data-marker="region(637640)/container"]');
	const moscow = await page.$('div[data-marker="region(637640)/container"]');
	await moscow.click();

	await page.waitForSelector('.css-146c59g');
	const searchMetro = await page.$('.css-146c59g');
	await searchMetro.click();

	await page.waitForSelector('label[data-marker="metro-select-dialog/stations/item"]');
	await page.evaluate( () => {
		const station = [...document.querySelectorAll('label[data-marker="metro-select-dialog/stations/item"]')];
		const targetStation = station.find(e => e.innerText.includes('Автозаводская'));
		targetStation && targetStation.click();
	});
	await page.evaluate( () => {
		const station = [...document.querySelectorAll('label[data-marker="metro-select-dialog/stations/item"]')];
		const targetStation = station.find(e => e.innerText.includes('Авиамоторная'));
		targetStation && targetStation.click();
	});

	const selectStationButton = await page.$('button[data-marker="metro-select-dialog/apply"]');
	await selectStationButton.click();

	const metroSelectValue = await page.$eval('span[data-marker="metro-select/value"]', element => element.textContent);

	if (metroSelectValue.startsWith('Выбрано') && metroSelectValue.endsWith('станции')) {
		console.log('На экране “Уточнить” примененный фильтр по метро отображается с формулировкой "Выбрано n станций": PASSED');
	} else {
		console.log('На экране “Уточнить” примененный фильтр по метро отображается с формулировкой "Выбрано n станций": FAILED');
	};

	browser.close();
};


