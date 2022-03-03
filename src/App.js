import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react'
// import datetime from 'datetime'

const apiKey = process.env.REACT_APP_API_KEY

const currentDate = new Date()

function App() {

	const [longitude, setLongitude] = useState(0)
	const [latitude, setLatitude] = useState(0)
	const [result, setResult] = useState('')

	useEffect(() => {

		const geolocationCoordinatesInstance = navigator.geolocation.getCurrentPosition((position) => {
			setLatitude(position.coords.latitude)
			setLongitude(position.coords.longitude)
		})
		// only do an api call if we received geolocation
		if (latitude != 0 && longitude != 0) {
			axios({
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
		<div className='App'>
			{/* weather display from api app */}
			{result !== '' ?
				<div className="weatherDisplay">
					{/* <p>
						lat: {latitude}
					</p>
					<p>

						lon: {longitude}
					</p> */}
					{result.daily.map((element, index) => {
						if (index < 5) {
							const elementDate = new Date()
							elementDate.setDate(currentDate.getDate() + index)
							return (
								<div className={`dayContainer${index} dayContainer`} key={index}>
									<div className={`day${index}`} >
										<div className='dayName'>
											{
												elementDate.toLocaleDateString("en-EN", { weekday: 'short' })
											}
										</div>
										<div>
											<img src={require(`./icons/${element.weather[0].icon}@2x.png`)} alt="testing" />
										</div>
										<div className='temps'>
											{/* round to nearest degree */}
											<div className='tempMax'>{Math.round(element.temp.max)}{'\u00b0'}</div>
											<div className='tempMin'>{Math.round(element.temp.min)}{'\u00b0'}</div>
										</div>
									</div>
								</div>
							)
						} else {
							return null
						}
					})}
					{/* <div>
						result: {JSON.stringify(result)}
					</div> */}
				</div>
				:
				null
			}
		</div>
	);
}

export default App;
