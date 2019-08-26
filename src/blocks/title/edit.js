/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { RichText } from '@wordpress/block-editor';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class Edit extends Component {
	setTitle = value => {};
	titleForPost = () => {
		const { attributes, currentPost } = this.props;
		const { post } = attributes;
		return post && post.id ? post.title.rendered : currentPost.title;
	};
	render() {
		const { attributes, className, setTitle } = this.props;
		return <RichText value={ this.titleForPost() } onChange={ setTitle } tagName="h2" />;
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { getCurrentPost } = select( 'core/editor' );
		return { currentPost: getCurrentPost() };
	} ),
	withDispatch( ( dispatch, props, registry ) => {
		return {
			setTitle: value => {
				dispatch( 'core/editor' ).editPost( { title: value } );
			},
		};
	} ),
] )( Edit );
