/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks } from '@wordpress/block-editor';

class Save extends Component {
	render() {
		const { className } = this.props;
		return <InnerBlocks.Content />;
	}
}

export default Save;
