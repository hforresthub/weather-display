const DayForecast = ({element, index, elementDate}) => {
	return (
		<div className={`day${index} day`} >
			<div className='dayName'>
				{
					elementDate.toLocaleDateString("en-EN", { weekday: 'short' }) + ' ' + elementDate.toString().split(" ")[2]
				}
			</div>
			<div className='imgContainer'>
				<img className="weatherIcon" src={require(`../icons/${element.weather[0].icon}@2x.png`)} alt="testing" />
			</div>
			<div className='temps'>
				<div className='tempMax'>{Math.round(element.temp.max)}{'\u00b0'}</div>
				<div className='tempMin'>{Math.round(element.temp.min)}{'\u00b0'}</div>
			</div>
			<div className='description'>{element.weather[0].main}</div>
			<div className='wind'>{Math.round(element.wind_speed)} m/s</div>
			<div className='dewPoint'>Dew Point: {Math.round(element.dew_point * 100) / 100}{'\u00b0'}</div>
			<div className='humid'>Humiditiy: {element.humidity}%</div>
		</div>
	)
}

export default DayForecast