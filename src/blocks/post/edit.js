/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow, Placeholder, ToggleControl, Spinner } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';

class Edit extends Component {
	render = () => {
		const { attributes, className, setAttributes } = this.props;
		const { post, showImage } = attributes;
		const classes = classNames( className ); // This unnecessary use of classNames is a placeholder for className manipulation to come.
		return (
			<Fragment>
				<div className={ classes }>
					{ ! post && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ !! post && (
						<article key={ post.id }>
							{ showImage && post.newspack_featured_image_src && (
								<div className="post-thumbnail" key="thumbnail">
									<img src={ post.newspack_featured_image_src.large } />
								</div>
							) }
							<div className="entry-wrapper">
								<h3 className="entry-title" key="title">
									<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
								</h3>
							</div>
						</article>
					) }
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Featured Image Settings' ) }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Featured Image' ) }
								checked={ showImage }
								onChange={ () => setAttributes( { showImage: ! showImage } ) }
							/>
						</PanelRow>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}
export default withDispatch( ( dispatch, props, registry ) => {
	const { attributes, clientId } = props;
	const { getBlockRootClientId } = registry.select( 'core/block-editor' );
	const { updateBlockAttributes } = dispatch( 'core/block-editor' );
	return {
		setAttributes: attributes => {
			const parentBlockClientId = getBlockRootClientId( clientId );
			return updateBlockAttributes( parentBlockClientId, { innerBlockAttributes: attributes } );
		},
	};
} )( Edit );
