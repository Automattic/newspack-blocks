/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment, RawHTML } from '@wordpress/element';

const { decodeEntities } = wp.htmlEntities;

class Edit extends Component {
	renderPost = post => {
		const { attributes } = this.props;
		return (
			<div className="entry-meta">
				<span className="author-avatar">
					<RawHTML>{ post.newspack_author_info.avatar }</RawHTML>
				</span>
				<span className="byline">
					<span>{ __( 'by' ) }</span>{' '}
					<span className="author vcard">
						<a className="url fn n" href="#">
							{ post.newspack_author_info.display_name }
						</a>
					</span>
				</span>
				<span className="posted-on">
					<time className="entry-date published">{ post.newspack_published_date }</time>
				</span>
			</div>
		);
	};
	render() {
		const { className } = this.props; // variables getting pulled out of props
		const post = wp.data.select( 'core/editor' ).getCurrentPost();
		return (
			<Fragment>
				<div className={ className }>
					<div>{ this.renderPost( post ) }</div>
				</div>
			</Fragment>
		);
	}
}

export default Edit;
