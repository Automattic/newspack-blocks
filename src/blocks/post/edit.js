/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class Edit extends Component {
	render = () => {
		const { attributes } = this.props;
		const { post } = attributes;
		return (
			<Fragment>
				{ ! post && (
					<Placeholder>
						<Spinner />
					</Placeholder>
				) }
				{ !! post && (
					<h1>{ post.title.rendered }</h1>
				) }
			</Fragment>
		);
	};
}
export default Edit;
