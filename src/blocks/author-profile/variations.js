/**
 * Newspack dependencies
 */
import colors from 'newspack-colors';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { SVG, Circle, Rect } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import { DEFAULT_TEMPLATE, AVATAR_RIGHT_TEMPLATE, CENTERED_TEMPLATE, COMPACT_TEMPLATE } from './templates';

const ICON_COLOR = colors[ 'primary-400' ];

// Variation icons: abstract layout representations.
// Circle represents the avatar, rectangles represent text lines.

const iconDefault = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
		<Circle cx="12" cy="24" r="8" />
		<Rect x="26" y="14" width="16" height="3" rx="1.5" />
		<Rect x="26" y="20" width="12" height="2" rx="1" />
		<Rect x="26" y="26" width="16" height="2" rx="1" />
		<Rect x="26" y="32" width="10" height="2" rx="1" />
	</SVG>
);

const iconAvatarRight = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
		<Rect x="6" y="14" width="16" height="3" rx="1.5" />
		<Rect x="6" y="20" width="12" height="2" rx="1" />
		<Rect x="6" y="26" width="16" height="2" rx="1" />
		<Rect x="6" y="32" width="10" height="2" rx="1" />
		<Circle cx="36" cy="24" r="8" />
	</SVG>
);

const iconCentered = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
		<Circle cx="24" cy="14" r="8" />
		<Rect x="14" y="26" width="20" height="3" rx="1.5" />
		<Rect x="16" y="32" width="16" height="2" rx="1" />
		<Rect x="12" y="38" width="24" height="2" rx="1" />
	</SVG>
);

const iconCompact = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
		<Rect x="6" y="16" width="20" height="3" rx="1.5" />
		<Rect x="6" y="23" width="36" height="2" rx="1" />
		<Rect x="6" y="29" width="30" height="2" rx="1" />
		<Rect x="6" y="35" width="12" height="2" rx="1" />
	</SVG>
);

// `label` is a custom property (not part of the WordPress variation API).
// It provides a short title for picker UIs, while `title` includes the block
// name for contexts like the list view and sidebar where extra context helps.
const variations = [
	{
		name: 'default',
		title: __( 'Author Profile', 'newspack-blocks' ),
		label: __( 'Default', 'newspack-blocks' ),
		description: __( 'Avatar on the left, content on the right.', 'newspack-blocks' ),
		icon: { src: iconDefault, foreground: ICON_COLOR },
		attributes: { variation: 'default' },
		innerBlocks: DEFAULT_TEMPLATE,
		isActive: [ 'variation' ],
		scope: [ 'block' ],
		isDefault: true,
	},
	{
		name: 'avatar-right',
		title: __( 'Author Profile (Avatar right)', 'newspack-blocks' ),
		label: __( 'Avatar right', 'newspack-blocks' ),
		description: __( 'Content on the left, avatar on the right.', 'newspack-blocks' ),
		icon: { src: iconAvatarRight, foreground: ICON_COLOR },
		attributes: { variation: 'avatar-right' },
		innerBlocks: AVATAR_RIGHT_TEMPLATE,
		isActive: [ 'variation' ],
		scope: [ 'block' ],
	},
	{
		name: 'centered',
		title: __( 'Author Profile (Centered)', 'newspack-blocks' ),
		label: __( 'Centered', 'newspack-blocks' ),
		description: __( 'Large centered avatar with center-aligned text.', 'newspack-blocks' ),
		icon: { src: iconCentered, foreground: ICON_COLOR },
		attributes: { variation: 'centered' },
		innerBlocks: CENTERED_TEMPLATE,
		isActive: [ 'variation' ],
		scope: [ 'block' ],
	},
	{
		name: 'compact',
		title: __( 'Author Profile (Compact)', 'newspack-blocks' ),
		label: __( 'Compact', 'newspack-blocks' ),
		description: __( 'No avatar, vertical stack.', 'newspack-blocks' ),
		icon: { src: iconCompact, foreground: ICON_COLOR },
		attributes: { variation: 'compact' },
		innerBlocks: COMPACT_TEMPLATE,
		isActive: [ 'variation' ],
		scope: [ 'block' ],
	},
];

export default variations;
