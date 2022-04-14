import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react'
import DayForecast from './DayForecast';
import HourForecast from './HourForecast';
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';

const currentDate = new Date()

function App() {

	const [longitude, setLongitude] = useState(200) // 200 is outside possible value
	const [latitude, setLatitude] = useState(200)
	const [result, setResult] = useState('')
	const [chartData, setChartData] = useState([])
	const [labels, setLabels] = useState([])

	useEffect(() => {
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
				const labelData = res.data.hourly.map((element, index) => {
					return (currentDate.getHours() % 24 > 12 ? (currentDate.getHours() + index) % 12 : currentDate.getHours()) 
					+ (((currentDate.getHours() + index) % 24) > 11 ? "pm" : "am")
				})
				setLabels(labelData)
			})
		}
	}, [longitude, latitude])

	return (
		<div className='App'>
			{/* weather display from api app */}
			{result !== '' ?
				<div className="container">
					<Bar
						data={{
							labels: labels,
							datasets: [
								{
									label: 'Temperature',
									backgroundColor: 'rgba(75,192,192,1)',
									borderColor: 'rgba(0,0,0,1)',
									borderWidth: 2,
									data: chartData
								}
							]
						}}
						options={{
							title: {
								display: true,
								text: 'temperature over the course of the 2 days',
								fontSize: 20
							},
							legend: {
								display: true,
								position: 'right'
							}
						}}
					/>
					<div className="weatherDisplay">
						{/* create forecast for first 5 days */}
						{result.hourly.map((element, index) => {
							if (index < 5) {
								const elementDate = new Date()
								elementDate.setDate(currentDate.getDate() + index)
								return (
									<div className={`dayContainer${index} dayContainer`} key={index}>
										<HourForecast element={element} index={index} elementDate={elementDate} />
									</div>
								)
							} else {
								return null
							}
						})}
					</div>
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
				'Geolocation not supported'
			}
		</div>
	);
}

export default App;
