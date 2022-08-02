import axios from 'axios'
import { useEffect, useState } from 'react'
import DayForecast from './DayForecast';
import HourForecast from './HourForecast';
import Chart from 'chart.js/auto'; //needed for live site despite warning suggesting it isnt needed
import { Line } from 'react-chartjs-2';

const currentDate = new Date()

const Weather = ({ handleButtonClick, sectionToggles, myRef }) => {

	// weather state variables
	const [longitude, setLongitude] = useState(200) // 200 is outside possible value
	const [latitude, setLatitude] = useState(200)
	const [result, setResult] = useState('')
	const [chartData, setChartData] = useState([])
	const [feelsChartData, setFeelsChartData] = useState([])
	const [dewChartData, setDewChartData] = useState([])
	const [windChartData, setWindChartData] = useState([])
	const [labels, setLabels] = useState([])	// for weather api data

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
				setResult(res.data)
				console.log(res.data);
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

	return (
		<div className='weather' >
			<div ref={myRef[0]}></div>
			{result !== '' ?
				<div className="forecastsContainer">
					<button onClick={handleButtonClick(0)}>{sectionToggles[0] ? 'Hide ' : 'Show '} Forecasts </button>
					{sectionToggles[0] ?
						<div className='forecastsToggleContainer'>
							<h2>24 hour forecast</h2>
							<div className="weatherDisplay">
								{/* create forecast for first 5 hours */}
								{result.hourly.map((element, index) => {
									if (index < 24) {
										const elementDate = new Date()
										elementDate.setHours(currentDate.getHours() + index)
										return (
											<div className={`hourContainer${index} hourContainer  ${elementDate.getDate() > currentDate.getDate() ? 'hourContainerNewDay' : ''}`} key={index}>
												<HourForecast element={element} index={index} elementDate={elementDate} />
											</div>
										)
									} else {
										return null
									}
								})}
							</div>
							<h2>5 day forecast</h2>
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
			{/* Charts */}
			<div ref={myRef[1]}></div>
			{result !== '' ?
				<div className="chartsContainer">
					<button onClick={handleButtonClick(1)}>{sectionToggles[1] ? 'Hide ' : 'Show '} Charts </button>
					{sectionToggles[1] ?
						<div className='chartsToggleContainer'>
							<h2>Charts</h2>
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
												backgroundColor: 'rgb(255, 255, 128)',
												borderColor: 'rgba(0,0,0,1)',
												borderWidth: 2,
												data: feelsChartData
											},
											{
												label: 'Dew point',
												backgroundColor: 'rgb(132, 183, 237)',
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
										maintainAspectRatio: false,
									}}
								/>
							</div>
							<div className="chartContainer">
								<Line
									data={{
										labels: labels,
										datasets: [
											{
												label: 'Wind speed in m/s',
												backgroundColor: 'rgb(151, 172, 192)',
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
										maintainAspectRatio: false,
									}}
								/>
							</div>
						</div>
						:
						''
					}
				</div>
				:
				'Geolocation not supported'
			}


		</div>
	)
}

export default Weather
