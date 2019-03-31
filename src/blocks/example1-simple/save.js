/**
 * External dependencies
 */
import classNames from 'classnames';
import { Component } from '@wordpress/element';

class Save extends Component {
	render() {
		const { attributes, className } = this.props;
		const { align } = attributes;
		const classes = classNames( className, `align${ align }` );
		return (
			<div className={ classes }>
				<p>Newspack Example Block (Save)</p>
			</div>
		);
	}
}
export default Save;
