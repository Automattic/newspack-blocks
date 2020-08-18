/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AUDIO_PLAYER_CLASSNAMES } from './consts';
import * as Icons from '../../components/icons';

const Slider = ( { className } ) => (
	<div
		className={ classnames(
			AUDIO_PLAYER_CLASSNAMES.SLIDER_BAR_WRAPPER,
			AUDIO_PLAYER_CLASSNAMES.RELATIVE
		) }
	>
		<input type="range" className={ classnames( AUDIO_PLAYER_CLASSNAMES.SLIDER_BAR, className ) } />
		<div className={ AUDIO_PLAYER_CLASSNAMES.SLIDER_INDICATOR } />
	</div>
);

const Modal = ( { children, className, renderTrigger, isVisible } ) => (
	<button
		className={ classnames(
			className,
			AUDIO_PLAYER_CLASSNAMES.RELATIVE,
			AUDIO_PLAYER_CLASSNAMES.MODAL_TRIGGER,
			{ [ AUDIO_PLAYER_CLASSNAMES.MODAL_TRIGGER_VISIBLE ]: isVisible }
		) }
	>
		<span>{ renderTrigger() }</span>
		<div className={ AUDIO_PLAYER_CLASSNAMES.MODAL }>{ children }</div>
	</button>
);

const Icon = ( { name, className, style } ) => {
	// eslint-disable-next-line import/namespace
	const SVGIcon = Icons[ name ];
	SVGIcon.props.className = className;
	SVGIcon.props.style = style;
	return SVGIcon;
};

const ModalLink = ( { icon, children, href = '#' } ) => (
	<a
		href={ href }
		target="_blank"
		rel="noreferrer noopener"
		className={ AUDIO_PLAYER_CLASSNAMES.MODAL_LINK }
	>
		<Icon name={ icon }></Icon>
		<span>{ children }</span>
	</a>
);

const AudioPlayer = ( {
	attributes: { source, rssFeedUrl, imageUrl, title, description, subscribeLink },
} ) => {
	if ( ! source && ! rssFeedUrl ) {
		return __( 'Please add an audio source or an RSS Feed URL', 'newspack' );
	}

	const copyLink = null;

	return (
		<div
			className={ classnames( AUDIO_PLAYER_CLASSNAMES.BASE, AUDIO_PLAYER_CLASSNAMES.IS_LOADING ) }
			data-rss-feed-url={ rssFeedUrl }
		>
			<button className={ AUDIO_PLAYER_CLASSNAMES.PLAY_BUTTON }>
				<Icon name="PlayArrow" className={ AUDIO_PLAYER_CLASSNAMES.PLAY_ICON } />
				<Icon
					name="Pause"
					className={ AUDIO_PLAYER_CLASSNAMES.PAUSE_ICON }
					style={ { display: 'none' } }
				/>
			</button>

			<div
				className={ AUDIO_PLAYER_CLASSNAMES.IMAGE }
				style={ {
					backgroundImage: `url('${ imageUrl }')`,
				} }
			/>

			<div className={ AUDIO_PLAYER_CLASSNAMES.TEXT }>
				<div className={ AUDIO_PLAYER_CLASSNAMES.TITLE }>{ title || '' }</div>
				<div className={ AUDIO_PLAYER_CLASSNAMES.DESCRIPTION }>{ description || '' }</div>
			</div>

			<Modal
				className={ AUDIO_PLAYER_CLASSNAMES.OPTIONS_BUTTON }
				isVisible={ copyLink || subscribeLink }
				renderTrigger={ () => <Icon name="MoreVert" /> }
			>
				{ copyLink && (
					<ModalLink icon="Link" href={ copyLink }>
						{ __( 'Copy Link', 'newspack' ) }
					</ModalLink>
				) }
				{ subscribeLink && (
					<ModalLink href={ subscribeLink } icon="LibraryMusic">
						{ __( 'Subscribe', 'newspack' ) }
					</ModalLink>
				) }
			</Modal>

			<div className={ AUDIO_PLAYER_CLASSNAMES.SLIDER }>
				<div className={ AUDIO_PLAYER_CLASSNAMES.SLIDER_CURRENT }>0:00</div>
				<Slider className={ AUDIO_PLAYER_CLASSNAMES.TIME_SLIDER } />
				<div className={ AUDIO_PLAYER_CLASSNAMES.SLIDER_DURATION }>-</div>
			</div>

			<Modal
				className={ AUDIO_PLAYER_CLASSNAMES.VOLUME_BUTTON }
				renderTrigger={ () => <Icon name="VolumeUp" /> }
			>
				<Slider className={ AUDIO_PLAYER_CLASSNAMES.VOLUME_SLIDER } />
			</Modal>

			<button className={ AUDIO_PLAYER_CLASSNAMES.CLOSE }>
				<Icon name="Close" />
			</button>
			<audio src={ source || 'https://example.com' } />
		</div>
	);
};

export default AudioPlayer;
