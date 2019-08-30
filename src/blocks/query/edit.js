/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { serialize } from '@wordpress/blocks';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

const lipsumPost = {
	link: '#',
	title: {
		raw: 'Title'
	},
	excerpt: {
		rendered: '<p>Lorem ipsum dolor sit amet, nostrud volutpat ex mei, sea ad saepe veniam ullamcorper. Quo elit aperiam ne.</p>'
	}
}

class Edit extends Component {
	componentDidUpdate = prevProps => {
		const { updateInnerBlockAttributes } = this.props;
		const { innerBlockAttributes } = this.props.attributes;
		const { innerBlockAttributes: prevInnerBlockAttributes } = prevProps.attributes;
		if ( prevInnerBlockAttributes !== innerBlockAttributes ) {
			updateInnerBlockAttributes( innerBlockAttributes );
		}
	};
	render = () => {
		const { attributes, query, setAttributes, getBlock, updateBlockAttributes } = this.props;
		const { criteria, innerBlockAttributes } = attributes;

		const block = getBlock( this.props.clientId ); // this may be slow?
		// default post for the inner blocks editor
		const output =
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Query Settings' ) } initialOpen={ true }>
						<QueryPanel
							criteria={ criteria }
							onChange={ criteria => setAttributes( { criteria } ) }
						/>
					</PanelBody>
				</InspectorControls>
				{ ! query && (
					<Placeholder>
						<Spinner />
					</Placeholder>
				) }
				<div style={ { background: 'lightgray' } }>
					<InnerBlocks
						allowedBlocks={ [ 'newspack-blocks/title', 'newspack-blocks/excerpt' ] }
					/>
				</div>
				{ query && ! query.length && <Placeholder>{ __( 'No posts found' ) }</Placeholder> }
				<section>
				{ query && query.length > 0 && (
					query.map( post => {
						// SUPER SLOW?
						block.innerBlocks.forEach( b => updateBlockAttributes( b.clientId, { post } ) );
						console.log( post ); // Why are these all the same in the output???
						// REACT!!!!!! dispatch is async....
						console.log( block.innerBlocks );
						return <RawHTML>{ serialize( block.innerBlocks ) }</RawHTML>
					} )
				) }
				</section>
			</Fragment>;
		// block.innerBlocks.forEach( b => updateBlockAttributes( b.clientId, { post: lipsumPost } ) )
		return output;
	};
}
export default compose( [
	withSelect( ( select, props ) => {
		const { attributes } = props;
		const { criteria } = attributes;
		const { getEntityRecords } = select( 'core' );
		const { getBlock } = select( 'core/block-editor' );
		return {
			query: getEntityRecords( 'postType', 'post', criteria ),
			getBlock,
		};
	} ),
	withDispatch( ( dispatch, props, registry ) => {
		const { clientId } = props;
		const { updateBlockAttributes } = dispatch( 'core/block-editor' );
		const { getBlock } = registry.select( 'core/block-editor' );
		return {
			updateInnerBlockAttributes: attributes => {
				const { innerBlocks } = getBlock( clientId );
				innerBlocks.forEach( innerBlock =>
					updateBlockAttributes( innerBlock.clientId, attributes )
				);
			},
			updateBlockAttributes
		};
	} ),
] )( Edit );
