import './styles/App.scss';
import { useState } from 'react'
import { useRef } from 'react';
import Weather from './components/Weather';
import News from './components/News';

function App() {
	// button variables
	const myRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

	// toggle variables
	const [sectionToggles, setSectionToggles] = useState([true, true, true, true, true])

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
				<button onClick={executeScroll(0)}> Weather </button>
				<button onClick={executeScroll(1)}> Charts </button>
				<button onClick={executeScroll(2)}> News </button>
				<button onClick={executeScroll(3)}> Saved </button>
				<button onClick={executeScroll(4)}> Comments </button>
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
