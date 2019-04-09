/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { Component } from '@wordpress/element';

import { icon, title } from './';

class Edit extends Component {
	render() {
		const { attributes, className } = this.props;
		const { align } = attributes;
		const classes = classNames( className, `align${ align }` );
		return (
			<div className={ classes }>
				<p>Newspack SSR Example. In View, today's date will be displayed.</p>
			</div>
		);
	}
}
export default Edit;
