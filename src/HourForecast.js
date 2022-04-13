const HourForecast = ({element, index, elementDate}) => {
	return (
		<div className={`day${index}`} >
			<div className='dayName'>
				{
					(elementDate.getHours() > 12 ? (elementDate.getHours() + index) % 12 : elementDate.getHours()) + (elementDate.getHours() > 11 ? "pm" : "am")
				}
			</div>
			<div>
				<img src={require(`./icons/${element.weather[0].icon}@2x.png`)} alt="testing" />
			</div>
			<div className='temps'>
				<div className='tempMax'>{Math.round(element.temp)}{'\u00b0'}</div>
			</div>
			<div className='description'>{element.weather[0].main}</div>
			<div className='wind'>{Math.round(element.wind_speed)} m/s</div>
			<div className='dewPoint'>Dew Point: {Math.round(element.dew_point * 100) / 100}{'\u00b0'}</div>
			<div className='humid'>Humiditiy: {element.humidity}{'\u00b0'}</div>
		</div>
	)
}

export default HourForecast