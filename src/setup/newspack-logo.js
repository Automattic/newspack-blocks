/**
 * External dependencies
 */
import { Path, Polygon, SVG } from '@wordpress/components';
import classNames from 'classnames';

export default ( { size = 24, className } ) => (
	<SVG
		className={ classNames( 'newspack-logo', className ) }
		width={ size }
		height={ size }
		viewBox="0 0 32 32"
	>
		<Path
			className="newspack-logo__icon-circle"
			fill="#263c95"
			d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z"
		/>
	</SVG>
);
