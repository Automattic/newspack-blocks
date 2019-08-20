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
		return (
			<div className={ className }>
				<amp-lightbox id="my-lightbox" layout="nodisplay">
					<div class="lightbox" on="tap:my-lightbox.close" role="button" tabindex="0">
						<div class="wp-block-newspack-blocks-popup">
							<InnerBlocks.Content />
						</div>
					</div>
				</amp-lightbox>
				<button on="tap:my-lightbox">Open lightbox</button>
			</div>
		);
	}
}

export default Save;
