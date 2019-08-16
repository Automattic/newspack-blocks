/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { Placeholder, Spinner } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class Edit extends Component {
	render = () => {
		const { attributes, setAttributes } = this.props;
		const {} = attributes;
		return (
			<Fragment>
				<InspectorControls>
					<p>{ __( 'Inspectors TK' ) }</p>
				</InspectorControls>
				<Placeholder>
					<Spinner />
				</Placeholder>
			</Fragment>
		);
	};
}
export default compose( [
	withSelect( ( select, props ) => {
		return {};
	} ),
	withDispatch( ( dispatch, props, registry ) => {
		return {};
	} ),
] )( Edit );
