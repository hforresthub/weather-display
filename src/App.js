import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react'
import DayForecast from './DayForecast';
import HourForecast from './HourForecast';
import Article from './Article';
import Chart from 'chart.js/auto'
import { Bar, Line } from 'react-chartjs-2';

import backupNewsData from './backupNewsData.json'


const currentDate = new Date()

function App() {

	// weather state variables
	const [longitude, setLongitude] = useState(200) // 200 is outside possible value
	const [latitude, setLatitude] = useState(200)
	const [result, setResult] = useState('')
	const [chartData, setChartData] = useState([])
	const [feelsChartData, setFeelsChartData] = useState([])
	const [dewChartData, setDewChartData] = useState([])
	const [windChartData, setWindChartData] = useState([])
	const [labels, setLabels] = useState([])
	// toggle variables
	const [sectionToggles, setSectionToggles] = useState([true, true, true])
	// news state variables
	const [newsArticles, setNewsArticles] = useState(backupNewsData)
	// const [searchTopic, setSearchTopic] = useState('')

	// const handleTopicChange = (event) => {
	// 	setSearchTopic(event.target.value)
	// }
	const handleButtonClick = (index) => (event) => {
		setSectionToggles((prev) => prev.map((toggle, toggleIndex) => ((toggleIndex === index) ? !toggle : toggle)))
	}

	useEffect(() => {

		//weather api
		// request geolocation permission from user
		navigator.geolocation.getCurrentPosition((position) => {
			setLatitude(position.coords.latitude)
			setLongitude(position.coords.longitude)
		})
		// only do an api call if we received geolocation
		if (latitude !== 200 && longitude !== 200) {
			axios({
				url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${process.env.REACT_APP_API_KEY}&units=metric`,
				method: 'GET',
				dataResponse: 'json'
			}).then((res) => {
				console.log(res.data)
				setResult(res.data)
				const tempData = res.data.hourly.map(element => {
					return element.temp
				})
				setChartData(tempData)
				const feelsData = res.data.hourly.map(element => {
					return element.feels_like
				})
				setFeelsChartData(feelsData)
				const dewData = res.data.hourly.map(element => {
					return element.dew_point
				})
				setDewChartData(dewData)
				const windData = res.data.hourly.map(element => {
					return element.wind_speed
				})
				setWindChartData(windData)
				const labelData = res.data.hourly.map((element, index) => {
					return ((currentDate.getHours() + index - 1) % 12 + 1)
						// am or pm
						+ (((currentDate.getHours() + index) % 24) > 11 ? "pm" : "am")
				})
				setLabels(labelData)
			})
		}
	}, [longitude, latitude])

	useEffect(() => {
		// news api
		axios({
			url: `https://newsapi.org/v2/everything?q=news&from=2022-04-19&sortBy=popularity&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`,
			method: 'GET',
			dataResponse: 'json'
		}).then((res) => {
			// console.log(res.data.articles)
			// console.log(JSON.stringify(res.data.articles))
			setNewsArticles(res.data.articles)
		})
	}, [])

	return (
		<div className='App'>
			<div className="container">
				{/* weather display from api app */}
				{result !== '' ?
					<div className="weatherContainer">
						<button onClick={handleButtonClick(0)}>{sectionToggles[0] ? 'Hide ' : 'Show '} Charts </button>
						{sectionToggles[0] ?
							<div className="chartContainer">
								<Line
									data={{
										labels: labels,
										datasets: [
											{
												label: 'Temperature',
												backgroundColor: 'rgba(192,111,111,1)',
												borderColor: 'rgba(0,0,0,1)',
												borderWidth: 2,
												data: chartData
											},
											{
												label: 'Feels like',
												backgroundColor: 'rgba(75,192,111,1)',
												borderColor: 'rgba(0,0,0,1)',
												borderWidth: 2,
												data: feelsChartData
											},
											{
												label: 'Dew point',
												backgroundColor: 'rgba(75,192,192,1)',
												borderColor: 'rgba(0,0,0,1)',
												borderWidth: 2,
												data: dewChartData
											},
										]
									}}
									options={{
										plugins: {
											title: {
												display: true,
												text: 'Temperature over 48 hours (in C\u00b0)',
												fontSize: 20
											},
										},
										legend: {
											display: true,
											position: 'right'
										},
									}}
								/>
								<Line
									data={{
										labels: labels,
										datasets: [
											{
												label: 'Wind speed in m/s',
												backgroundColor: 'rgba(192,75,192,1)',
												borderColor: 'rgba(0,0,0,1)',
												borderWidth: 2,
												data: windChartData
											},
										]
									}}
									options={{
										plugins: {
											title: {
												display: true,
												text: 'Wind speed over 48 hours',
												fontSize: 20
											},
										},
										legend: {
											display: true,
											position: 'right'
										},
									}}
								/>
							</div>
							:
							''
						}
						<button onClick={handleButtonClick(1)}>{sectionToggles[1] ? 'Hide ' : 'Show '} Forecasts </button>
						{sectionToggles[1] ?
							<div>
									<p>24 hour forecast</p>
								<div className="weatherDisplay">
									{/* create forecast for first 5 hours */}
									{result.hourly.map((element, index) => {
										if (index < 24) {
											const elementDate = new Date()
											elementDate.setDate(currentDate.getDate() + index)
											return (
												<div className={`hourContainer${index} hourContainer`} key={index}>
													<HourForecast element={element} index={index} elementDate={elementDate} />
												</div>
											)
										} else {
											return null
										}
									})}
								</div>
									<p>5 day forecast</p>
								<div className="weatherDisplay">
									{/* create forecast for first 5 days */}
									{result.daily.map((element, index) => {
										if (index < 5) {
											const elementDate = new Date()
											elementDate.setDate(currentDate.getDate() + index)
											return (
												<div className={`dayContainer${index} dayContainer`} key={index}>
													<DayForecast element={element} index={index} elementDate={elementDate} />
												</div>
											)
										} else {
											return null
										}
									})}
								</div>
							</div>
							:
							''
						}

					</div>
					:
					'Geolocation not supported'
				}
				{/* news */}
				{newsArticles.length !== 0 ?
					<div className='articlesContainer'>
						<button onClick={handleButtonClick(2)}>{sectionToggles[2] ? 'Hide ' : 'Show '} News </button>
						{sectionToggles[2] ?
							<div className='newsArticles'>
								<p>News Articles: </p>
								{/* <input type='text' value={searchTopic} onChange={handleTopicChange} className='searchField' placeholder='Search by topic' /> */}
								{newsArticles.map((element, index) => {
									return (
										<div className={`articleContainer${index} articleContainer`} key={index}>
											<Article element={element} />
										</div>
									)
								})}
							</div>

							:
							''
						}
					</div>
					:
					'No news available atm'
				}
			</div>
		</div>
	);
}

export default App;
