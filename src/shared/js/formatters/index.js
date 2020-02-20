/**
 * Wordpress dependencies
 */
import { _x } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';

/**
 * Format avatars for editor display.
 *
 * @return {string} avatar markup.
 */
export const formatAvatars = authorInfo =>
	authorInfo.map( author => (
		<span className="avatar author-avatar" key={ author.id }>
			<a className="url fn n" href="#">
				<RawHTML>{ author.avatar }</RawHTML>
			</a>
		</span>
	) );

/**
 * Format bylines for editor display.
 *
 * @return {string} byline markup.
 */
export const formatByline = authorInfo => (
	<span className="byline">
		{ _x( 'by', 'post author', 'newspack-blocks' ) }{' '}
		{ authorInfo.reduce( ( accumulator, author, index ) => {
			return [
				...accumulator,
				<span className="author vcard" key={ author.id }>
					<a className="url fn n" href="#">
						{ author.display_name }
					</a>
				</span>,
				index < authorInfo.length - 2 && ', ',
				authorInfo.length > 1 &&
					index === authorInfo.length - 2 &&
					_x( ' and ', 'post author', 'newspack-blocks' ),
			];
		}, [] ) }
	</span>
);
