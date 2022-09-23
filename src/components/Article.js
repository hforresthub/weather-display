import { SayButton } from 'react-say'
import { useCallback } from 'react'

//react device detect
import { isMobile } from 'react-device-detect'

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons'

library.add(faVolumeHigh)

const Article = ({ element, index }) => {
	const selector = useCallback(voices => { 
		// console.log(voices);
		return [...voices].find(v => (v.name === 'Microsoft Linda - English (Canada)'))
}, []);

	return (
		<div className={`article${index} article`} >
			<div className='title'>
				<h3 title={element.title}>
					{element.title ? element.title : 'No title available'}
				</h3>
				<img src={element.image_url} onError={(e) => {e.target.src=require(`../images/backupImage.png`)}} alt={`Image related to ${element.title}`} />
			</div>
			<div class="paragraphContainer">

			<p className='content'>{element.description ? element.description : 'No description available'}</p>
			</div>
			{ isMobile ? 
			''
			:
			<SayButton 
				className='playSound'
				voice={ selector }
				onClick= { event => {
							console.log(event)
						}
					} text={element.description ? element.description : 'No description available'} 
			>
			<FontAwesomeIcon icon="fa-solid fa-volume-high" />
			</SayButton>
			}
			<a href={element.url}>Read more</a>
		</div>
	)
}

export default Article