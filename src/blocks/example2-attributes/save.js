/**
 * External dependencies
 */
import classNames from 'classnames';
import { Component } from '@wordpress/element';
import { RichText } from '@wordpress/editor';

class Save extends Component {
	render() {
		const { attributes, className } = this.props;
		const { align, backgroundColor, content } = attributes;
		const classes = classNames( className, `align${ align }` );
		const style = {
			backgroundColor: backgroundColor,
		};
		return <RichText.Content className={ classes } tagName="p" value={ content } style={ style } />;
	}
}
export default Save;
