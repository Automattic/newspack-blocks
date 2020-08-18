const BASE = 'newspack-audio-player';

export const AUDIO_PLAYER_CLASSNAMES = {
	BASE,

	// States
	IS_LOADING: `${ BASE }--is-loading`,

	// Elements
	PLAY_BUTTON: `${ BASE }__play`,
	PLAY_ICON: `${ BASE }__play__icon`,
	PAUSE_ICON: `${ BASE }__pause__icon`,

	IMAGE: `${ BASE }__image`,

	TEXT: `${ BASE }__text`,
	TITLE: `${ BASE }__title`,
	DESCRIPTION: `${ BASE }__description`,

	OPTIONS_BUTTON: `${ BASE }__options`,

	SLIDER: `${ BASE }__progress`,
	SLIDER_BAR_WRAPPER: `${ BASE }__progress__bar-wrapper`,
	SLIDER_BAR: `${ BASE }__progress__bar`,
	SLIDER_INDICATOR: `${ BASE }__progress__indicator`,
	SLIDER_CURRENT: `${ BASE }__progress__current`,
	SLIDER_DURATION: `${ BASE }__progress__duration`,

	TIME_SLIDER: `${ BASE }__progress__bar--time`,
	VOLUME_SLIDER: `${ BASE }__progress__bar--volume`,

	VOLUME_BUTTON: `${ BASE }__volume_button`,

	CLOSE: `${ BASE }__close`,
	IS_CLOSED: `${ BASE }--is-closed`,

	MODAL: `${ BASE }__modal`,
	MODAL_TRIGGER: `${ BASE }__modal__trigger`,
	MODAL_TRIGGER_VISIBLE: `${ BASE }__modal__trigger--is-visible`,
	MODAL_IS_OPEN: `${ BASE }__modal--is-open`,
	MODAL_LINK: `${ BASE }__modal__link`,

	// utility classes
	RELATIVE: `${ BASE }__relative`,
};
