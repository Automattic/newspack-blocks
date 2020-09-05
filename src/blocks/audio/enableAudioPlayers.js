import RSSParser from 'rss-parser/dist/rss-parser.min.js';

import { AUDIO_PLAYER_CLASSNAMES as CLASSNAMES } from './consts';

const padTime = time => time.toString().padStart( 2, '0' );
const displayTime = inSeconds => {
	const minutes = parseInt( ( inSeconds / 60 ) % 60 );
	const hours = parseInt( inSeconds / 3600 );
	return `${ hours ? `${ hours }:` : '' }${ padTime( minutes ) }:${ padTime(
		parseInt( inSeconds % 60 )
	) }`;
};

const enableModal = modalTrigger => {
	const modalContent = modalTrigger.querySelector( `.${ CLASSNAMES.MODAL }` );
	const isOpen = () => modalContent.classList.contains( CLASSNAMES.MODAL_IS_OPEN );
	// TODO: check if el exists
	const toggle = () => {
		if ( isOpen() ) {
			modalContent.classList.remove( CLASSNAMES.MODAL_IS_OPEN );
		} else {
			// close all modals first
			[ ...document.getElementsByClassName( CLASSNAMES.MODAL ) ].forEach( el => {
				el.classList.remove( CLASSNAMES.MODAL_IS_OPEN );
			} );
			modalContent.classList.add( CLASSNAMES.MODAL_IS_OPEN );
		}
	};

	modalTrigger.onclick = ( { target } ) => {
		if ( target === modalTrigger ) {
			toggle();
		}
	};

	document.addEventListener( 'mousedown', ( { target } ) => {
		const isChildOfModal = target.closest( `.${ CLASSNAMES.MODAL_TRIGGER }` );
		if ( ! isChildOfModal && isOpen() ) {
			toggle();
		}
	} );
};

const enableSingleAudioPlayer = playerEl => {
	let interval = null;

	// DOM elements
	const audioEl = playerEl.querySelector( 'audio' );
	const playBtn = playerEl.querySelector( `.${ CLASSNAMES.PLAY_BUTTON }` );
	const playIcon = playBtn.querySelector( `.${ CLASSNAMES.PLAY_ICON }` );
	const pauseIcon = playBtn.querySelector( `.${ CLASSNAMES.PAUSE_ICON }` );
	const progressBar = playerEl.querySelector( `.${ CLASSNAMES.TIME_SLIDER }` );
	const progressBarIndicator = progressBar.parentElement.querySelector(
		`.${ CLASSNAMES.SLIDER_INDICATOR }`
	);
	const progressCurrent = playerEl.querySelector( `.${ CLASSNAMES.SLIDER_CURRENT }` );
	const progressDuration = playerEl.querySelector( `.${ CLASSNAMES.SLIDER_DURATION }` );
	const closeBtn = playerEl.querySelector( `.${ CLASSNAMES.CLOSE }` );
	const volumeSlider = playerEl.querySelector( `.${ CLASSNAMES.VOLUME_SLIDER }` );
	const volumeIndicator = volumeSlider.parentElement.querySelector(
		`.${ CLASSNAMES.SLIDER_INDICATOR }`
	);
	const modalTriggers = playerEl.querySelectorAll( `.${ CLASSNAMES.MODAL_TRIGGER }` );
	// Info UI
	const imageEl = playerEl.querySelector( `.${ CLASSNAMES.IMAGE }` );
	const titleEl = playerEl.querySelector( `.${ CLASSNAMES.TITLE }` );
	const descriptionEl = playerEl.querySelector( `.${ CLASSNAMES.DESCRIPTION }` );

	// RSS Feed handling
	const rssFeedUrl = playerEl.getAttribute( 'data-rss-feed-url' );
	if ( rssFeedUrl ) {
		const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

		const parser = new RSSParser();
		parser.parseURL( CORS_PROXY + rssFeedUrl + '/?format=xml', ( err, feed ) => {
			if ( err ) {
				throw err;
			}
			if ( feed.items.length > 0 ) {
				const podcastImage = feed.itunes.image;
				const {
					title,
					// link,
					contentSnippet: description,
					enclosure: { url },
					itunes: { image: imageUrl = podcastImage },
				} = feed.items[ 0 ];
				audioEl.setAttribute( 'src', url );
				audioEl.load();

				if ( imageUrl ) {
					imageEl.style.backgroundImage = `url('${ imageUrl }')`;
				} else {
					imageEl.style.display = `none`;
				}
				titleEl.innerText = title;
				descriptionEl.innerText = description.replace( /\n/g, ' ' );
				waitForAudioLoad();
			}
		} );
	}

	// methods
	const handlePlay = () => {
		playIcon.style.display = 'none';
		pauseIcon.style.display = 'block';
		interval = setInterval( updateProgressUI, 200 );
	};

	const handlePause = () => {
		playIcon.style.display = 'block';
		pauseIcon.style.display = 'none';
		if ( interval ) {
			clearInterval( interval );
		}
	};

	const updateProgressUI = value => {
		if ( value !== undefined ) {
			progressBar.value = value;
			audioEl.currentTime = value;
		} else {
			progressBar.value = audioEl.currentTime;
		}

		progressBarIndicator.style.width = `${ ( audioEl.currentTime * 100 ) / audioEl.duration }%`;
		progressCurrent.innerHTML = displayTime( audioEl.currentTime || 0 );
		progressDuration.innerHTML = displayTime( audioEl.duration || 0 );
		progressBar.setAttribute( 'max', parseInt( audioEl.duration ) );
	};

	const updateVolumeUI = value => {
		audioEl.volume = value / 100;
		volumeSlider.value = value;
		volumeIndicator.style.width = `${ value }%`;
	};
	updateVolumeUI( 100 );

	// initial update, so that the duration is displayed before playing
	const waitForAudioLoad = () => {
		const updateProgressUIInterval = setInterval( () => {
			if ( audioEl.readyState > 0 ) {
				updateProgressUI();
				playerEl.classList.remove( CLASSNAMES.IS_LOADING );
				clearInterval( updateProgressUIInterval );
			}
		}, 100 );
	};
	if ( audioEl.getAttribute( 'src' ) ) {
		waitForAudioLoad();
	}

	// event handlers
	audioEl.onplay = handlePlay;
	audioEl.onpause = handlePause;
	playBtn.onclick = () => ( audioEl.paused ? audioEl.play() : audioEl.pause() );
	progressBar.onchange = ( { target } ) => updateProgressUI( target.value );
	volumeSlider.onchange = ( { target } ) => updateVolumeUI( target.value );
	closeBtn.onclick = () => {
		audioEl.pause();
		playerEl.classList.add( CLASSNAMES.IS_CLOSED );
	};

	// modals
	[ ...modalTriggers ].forEach( enableModal );
};

export default () => {
	const players = document.getElementsByClassName( CLASSNAMES.BASE );
	[ ...players ].forEach( enableSingleAudioPlayer );
};
