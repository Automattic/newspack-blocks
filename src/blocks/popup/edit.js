/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, ExternalLink, Placeholder, Spinner } from '@wordpress/components';

class Edit extends Component {
	render() {
		const { className } = this.props;
		return (
			<div className={ className }>
				<InnerBlocks templateLock={ false } />
			</div>
		);
	}
}

export default Edit;
