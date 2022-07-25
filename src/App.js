import './styles/App.scss';
import { useState } from 'react'
import { useRef } from 'react';
import Weather from './components/Weather';
import News from './components/News';

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudSunRain, faCommentDots, faNewspaper } from '@fortawesome/free-solid-svg-icons'

library.add(faCloudSunRain, faNewspaper, faCommentDots)

function App() {
	// button variables
	const myRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

	// toggle variables
	const [sectionToggles, setSectionToggles] = useState([true, true, true, true, true, true])

	// button functions
	const handleButtonClick = (index) => (event) => {
		setSectionToggles((prev) => prev.map((toggle, toggleIndex) => ((toggleIndex === index) ? !toggle : toggle)))
	}
	const executeScroll = (index) => () => {
		return myRef[index].current.scrollIntoView()
	}

	return (
		<div className='App'>
			<nav>
				<ul>
					<li>
						<button onClick={executeScroll(0)} className='sectionButton'><FontAwesomeIcon icon="fa-solid fa-cloud-sun-rain" /><span> Weather</span></button>
						<button onClick={handleButtonClick(0)} className='minimizerButton'>{sectionToggles[0] ? `-` : `+`}</button>
					</li>
					{/* <li>
						<button onClick={executeScroll(1)} className='sectionButton'> Charts </button>
						<button onClick={handleButtonClick(1)} className='minimizerButton'>{sectionToggles[1] ? `-` : `+`}</button>
					</li> */}
					<li>
						<button onClick={executeScroll(2)} className='sectionButton'><FontAwesomeIcon icon="fa-solid fa-newspaper" /><span> News</span></button>
						<button onClick={handleButtonClick(2)} className='minimizerButton'>{sectionToggles[2] ? `-` : `+`}</button>
					</li>
					{/* <li>
						<button onClick={executeScroll(3)} className='sectionButton'> Saved </button>
						<button onClick={handleButtonClick(3)} className='minimizerButton'>{sectionToggles[3] ? `-` : `+`}</button>
					</li> */}
					<li>
						<button onClick={executeScroll(4)} className='sectionButton'><FontAwesomeIcon icon="fa-solid fa-comment-dots" /><span> Threads</span></button>
						<button onClick={handleButtonClick(4)} className='minimizerButton'>{sectionToggles[4] ? `-` : `+`}</button>
					</li>
				</ul>
			</nav>
			<header>
				<img src={require(`./images/sky.png`)} alt="Clouds" className='skyBanner' />
				<h1>Weatherenews</h1>
			</header>
			<div className="container">
				{/* weather display from api app */}
				<Weather handleButtonClick={handleButtonClick} sectionToggles={sectionToggles} myRef={myRef} />
				{/* news */}
				<News handleButtonClick={handleButtonClick} sectionToggles={sectionToggles} myRef={myRef} />
			</div>
			<footer>
				<img src={require(`./images/lowerSky.png`)} alt="Clouds" className='skyBanner' />
			</footer>
		</div>
	);
}

export default App;
