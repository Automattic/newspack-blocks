/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classNames from 'classnames';
import { RichText } from '@wordpress/editor';

class Save extends Component {
	render() {
		const { attributes, className, setAttributes } = this.props;
		const { align, toggleTest, content, currentSelectedAuthor } = attributes;
		const classes = classNames( className, `align${ align }` );

		return <RichText.Content tagName="p" value={ content } />;
	}
}
export default Save;
