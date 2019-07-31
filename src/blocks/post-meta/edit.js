/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';

class Edit extends Component {
	render() {
		const { className, author } = this.props; // variables getting pulled out of props
		return (
			<Fragment>
				<div className={ className }>
					<h2>{ __( 'This is the author.', 'newspack' ) }</h2>
				</div>
			</Fragment>
		);
	}
}

export default Edit;
