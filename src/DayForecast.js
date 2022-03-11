const DayForecast = ({element, index, elementDate}) => {
	return (
		<div className={`day${index}`} >
			<div className='dayName'>
				{
					elementDate.toLocaleDateString("en-EN", { weekday: 'short' }) + ' ' + elementDate.toString().split(" ")[2]
				}
			</div>
			<div>
				<img src={require(`./icons/${element.weather[0].icon}@2x.png`)} alt="testing" />
			</div>
			<div className='temps'>
				<div className='tempMax'>{Math.round(element.temp.max)}{'\u00b0'}</div>
				<div className='tempMin'>{Math.round(element.temp.min)}{'\u00b0'}</div>
			</div>
			<div className='description'>{element.weather[0].main}</div>
			<div className='wind'>{element.wind_speed} km/h</div>
		</div>
	)
}

export default DayForecast