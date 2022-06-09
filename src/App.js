import './styles/App.scss';
import axios from 'axios'
import { useEffect, useState } from 'react'
import DayForecast from './DayForecast';
import HourForecast from './HourForecast';
import Article from './Article';
import Chart from 'chart.js/auto'
import { Bar, Line } from 'react-chartjs-2';

import backupNewsData from './backupNewsData.json'
import backupNewsData2 from './backupNewsData2.json'

//login import
import jwt_decode from "jwt-decode" //install jwt-decode

//firebase
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";

const currentDate = new Date()

function App() {

	// user state variable
	const [user, setUser] = useState({})

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
	const [sectionToggles, setSectionToggles] = useState([true, true, true, true])
	// news state variables
	const [newsArticles, setNewsArticles] = useState(backupNewsData2.data)
	// const [searchTopic, setSearchTopic] = useState('')

	//firebase state variables
	const [users, setUsers] = useState([{}])
	const [comments, setComments] = useState([])
	const [savedArticles, setSavedArticles] = useState([])

	// const handleTopicChange = (event) => {
	// 	setSearchTopic(event.target.value)
	// }

	// google login setup
	function handleCallbackResponse(response) {
		// console.log(("Encoded JWT ID token: " + response.credential))
		const userObject = jwt_decode(response.credential)
		// console.log(userObject)
		setUser(userObject)
		document.getElementById("signInDiv").hidden = true
	}
	function handleSignout(event) {
		setUser({})
		document.getElementById("signInDiv").hidden = false
	}
	useEffect(() => {
		/* global google */
		google.accounts.id.initialize({
			client_id: process.env.REACT_APP_GOOGLE_KEY,
			callback: handleCallbackResponse
		})

		google.accounts.id.renderButton(
			document.getElementById("signInDiv"),
			{
				theme: "outline", size: "large"
			}
		)

		google.accounts.id.prompt()
	}, [])

	//firebase
	// watch comment data
	useEffect(() => {
		const commentsDb = ref(realtime, 'comments/')
		onValue(commentsDb, (snapshot) => {
			const myData = snapshot.val()
			// console.log(myData);
			const commentArray = []
			for (let propertyName in myData) {
				// create a new local object for each loop iteration:
				const userComment = {
					key: propertyName,
					newComment: myData[propertyName]
				}
				// console.log(myData[propertyName]);
				// console.log(userComment);
				if (myData[propertyName]) {
					commentArray.push(userComment)
				}
			}
			setComments(commentArray)
		})
	}, [])
	// watch user data
	useEffect(() => {
		const userDb = ref(realtime, 'users/')
		onValue(userDb, (snapshot) => {
			const myData = snapshot.val()
			const userArray = []
			for (let propertyName in myData) {
				// create a new local object for each loop iteration:
				const tempUser = {
					key: propertyName,
					userData: myData[propertyName]
				}
				if (myData[propertyName]) {
					userArray.push(tempUser)
				}
			}
			// console.log(userArray);
			setUsers(userArray)
		})
	}, [])
	// watch saved article data
	useEffect(() => {
		const savedDb = ref(realtime, 'saved/')
		onValue(savedDb, (snapshot) => {
			const myData = snapshot.val()
			const savedArray = []
			for (let propertyName in myData) {
				// create a new local object for each loop iteration:
				const tempArticle = {
					key: propertyName,
					userData: myData[propertyName]
				}
				if (myData[propertyName]) {
					savedArray.push(tempArticle)
				}
			}
			// console.log(savedArray);
			setSavedArticles(savedArray)
		})
	}, [])

	const handleSaveButtonClick = (element) => (event) => {
		// console.log('testing save: ', element)

		//update user
		const savedDb = ref(realtime, `saved/${element.uuid}`)
		const tempSavedArticle = {
			article: element,
		}
		update(savedDb, tempSavedArticle)
	}

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
				// console.log(res.data)
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
		// axios({
		// 	url: `https://newsapi.org/v2/everything?q=news&sortBy=popularity&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`,
		// 	method: 'GET',
		// 	dataResponse: 'json'
		// }).then((res) => {
		// 	// console.log(res.data.articles)
		// 	// console.log(JSON.stringify(res.data.articles))
		// 	setNewsArticles(res.data.articles)
		// })
		// NewsAPI
		// axios({
		// 	url: `https://api.thenewsapi.com/v1/news/all?locale=us,ca&language=en&api_token=${process.env.REACT_APP_NEWS_API_KEY_2}`,
		// 	method: 'GET',
		// 	dataResponse: 'json'
		// }).then((res) => {
		// 	// console.log(JSON.stringify(res.data))
		// 	// console.log(res.data.data)
		// 	// console.log(JSON.stringify(res.data.articles))
		// 	setNewsArticles(res.data.data)
		// })
		// console.log(JSON.stringify(newsArticles))
	}, [])

	return (
		<div className='App'>
			<header>
				<img src={require(`./images/sky.png`)} alt="Picture of clouds" className='skyBanner' />
				<h1>Weatherenews</h1>
			</header>
			<div className="container">
				{/* google login button */}
				<div className='googleLoginContainer'>
					<p id="signInDiv"></p>
					{Object.keys(user).length != 0 &&
						<button onClick={(e) => handleSignout(e)}>Sign out with Google</button>
					}
					{user &&
						<div>
							<img src={user.picture} alt=""></img>
							<h3>{user.name}</h3>
						</div>
					}
				</div>
				{/* <div className='commentContainer'>
					{
						comments.map((element, index) => {
							return (
								<div key={index}>
									<p>{element.key}</p>
								</div>
							)
						})
					}
				</div> */}
				{/* weather display from api app */}
				{result !== '' ?
					<div className="forecastsContainer">
						<button onClick={handleButtonClick(1)}>{sectionToggles[1] ? 'Hide ' : 'Show '} Forecasts </button>
						{sectionToggles[1] ?
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

				{result !== '' ?
					<div className="chartsContainer">
						<button onClick={handleButtonClick(0)}>{sectionToggles[0] ? 'Hide ' : 'Show '} Charts </button>
						{sectionToggles[0] ?
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

				{/* news */}
				{newsArticles.length !== 0 ?
					<div className='newsContainer'>
						<button onClick={handleButtonClick(2)}>{sectionToggles[2] ? 'Hide ' : 'Show '} News </button>
						{sectionToggles[2] ?
							<div className='newsToggleContainer'>
								<h2>News Feed: </h2>
								{/* <input type='text' value={searchTopic} onChange={handleTopicChange} className='searchField' placeholder='Search by topic' /> */}
								<div className='newsArticles'>
									{newsArticles.map((element, index) => {
										// console.log(element)
										return (
											<div className={`articleContainer${index} articleContainer`} key={index}>
												<Article element={element} />
												{
													savedArticles.filter(savedElement => {
														return (savedElement.userData.article.uuid == element.uuid)
													}).length > 0
														?
														'saved'
														:
														<button onClick={handleSaveButtonClick(element)}>Save</button>
												}
											</div>
										)
									})}
								</div>
							</div>

							:
							''
						}
					</div>
					:
					'No news available atm'
				}
				{/* saved news */}
				{savedArticles.length !== 0 ?
					<div className='newsContainer'>
						<button onClick={handleButtonClick(3)}>{sectionToggles[3] ? 'Hide ' : 'Show '} Saved News </button>
						{sectionToggles[3] ?
							<div className='newsToggleContainer'>
								<h2>Saved News Articles: </h2>
								{/* <input type='text' value={searchTopic} onChange={handleTopicChange} className='searchField' placeholder='Search by topic' /> */}
								<div className='newsArticles'>
									{savedArticles.map((element, index) => {
										// console.log('test: ', element)
										return (
											<div className={`articleContainer${index} articleContainer`} key={index}>
												<Article element={element.userData.article} />
											</div>
										)
									})}
								</div>
							</div>

							:
							''
						}
					</div>
					:
					'No saved news available atm'
				}
			</div>
			<footer>
				<img src={require(`./images/lowerSky.png`)} alt="Picture of clouds" className='skyBanner' />
			</footer>
		</div>
	);
}

export default App;
