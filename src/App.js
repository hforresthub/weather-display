// api key for openweather 6a229679b9f32bbf8e2efa2697417d08

// import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react';

const apiKey = '6a229679b9f32bbf8e2efa2697417d08'



function App() {

	const [longitude, setLongitude] = useState(0)
	const [latitude, setLatitude] = useState(0)
	const [result, setResult] = useState('')

	useEffect(() => {

		const geolocationCoordinatesInstance = navigator.geolocation.getCurrentPosition((position) => {
			setLatitude(position.coords.latitude)
			setLongitude(position.coords.longitude)
		})
		if (latitude != 0 && longitude != 0) {
			axios({
				// url: `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=${apiKey}`,
				url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
				method: 'GET',
				dataResponse: 'json'
			}).then((res) => {
				setResult(res.data)
				console.log(res.data)
			})
		}
	}, [longitude, latitude])

	return (
		<div className="App">
			{/* weather display from api app */}
			{result !== '' ?
				<div className="weatherDisplay">
					<p>
						lat: {latitude}
					</p>
					<p>

						lon: {longitude}
					</p>
					<div className="currentWeather">

						<p>max: {result.daily[0].temp.max}</p>
						<p>min: {result.daily[0].temp.min}</p>
					</div>
					<div>
						result: {JSON.stringify(result)}
					</div>
				</div>
				:
				null
			}
		</div>
	);
}

export default App;
