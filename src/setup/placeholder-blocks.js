/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';
import { getBlockType, registerBlockType } from '@wordpress/blocks';
import { ButtonGroup, Button } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';

const placeholderBlocks = {
	'newspack-ads/ad-unit': {
		title: __( 'Newspack Ad Unit', 'newspack-blocks' ),
		message: __( 'Place ad units inside your page by installing Newspack Ads.', 'newspack-blocks' ),
		url: 'https://github.com/Automattic/newspack-ads',
	},
};

function registerPlaceholderBlock( blockName, { title, message, url } ) {
	if ( getBlockType( blockName ) ) {
		return;
	}
	title = title || blockName.split( '/' ).pop();
	const edit = ( { clientId, removeBlocks } ) => {
		return (
			<div className="newspack-blocks-placeholder-block wp-block">
				<h4>
					{ sprintf(
						// translators: %s is the block name.
						__( 'The "%s" block is currently not available.', 'newspack-blocks' ),
						title
					) }
				</h4>
				{ message && <p>{ message }</p> }
				<ButtonGroup>
					<Button onClick={ () => removeBlocks( clientId ) }>
						{ __( 'Remove block', 'newspack-blocks' ) }
					</Button>
					{ url && (
						<Button isPrimary target="_blank" rel="external" href={ url }>
							{ __( 'Visit the plugin page', 'newspack-blocks' ) }
						</Button>
					) }
				</ButtonGroup>
			</div>
		);
	};
	registerBlockType( blockName, {
		title,
		edit: withDispatch( dispatch => ( {
			removeBlocks: dispatch( 'core/block-editor' ).removeBlocks,
		} ) )( edit ),
		supports: {
			html: false,
			lock: false,
			reusable: false,
			inserter: false,
			defaultStylePicker: false,
			customClassName: false,
			className: false,
			alignWide: false,
			align: false,
			anchor: false,
		},
	} );
}

for ( const blockName in placeholderBlocks ) {
	registerPlaceholderBlock( blockName, placeholderBlocks[ blockName ] );
}
