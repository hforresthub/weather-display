import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react'
import DayForecast from './DayForecast';

const currentDate = new Date()

function App() {

	const [longitude, setLongitude] = useState(200) // 200 is outside possible value
	const [latitude, setLatitude] = useState(200)
	const [result, setResult] = useState('')

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
				// console.log(res.data)
				setResult(res.data)
			})
		}
	}, [longitude, latitude])

	return (
		<div className='App'>
			{/* weather display from api app */}
			{result !== '' ?
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
				:
				'Geolocation not supported'
			}
		</div>
	);
}

export default App;
