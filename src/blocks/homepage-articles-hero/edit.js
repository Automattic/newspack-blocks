/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { HomepageArticlesComponent } from '../../shared/homepage-articles';

const MAX_POSTS_COLUMNS = 6;

class Edit extends Component {
	render = () => (
		<HomepageArticlesComponent showImage showAuthor showExcerpt showAvatar { ...this.props } />
	);
}
export default Edit;
