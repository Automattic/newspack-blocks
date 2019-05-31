/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { SelectControl, PanelBody } from '@wordpress/components';

class Edit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			menus: [],
		};
	}

	componentDidMount = () => {
		apiFetch( { path: '/newspack-blocks/v1/menus' } ).then( menus => {
			this.setState( {
				menus,
			} );
		} );
	};

	render() {
		/**
		 * Constants
		 */
		const { attributes, setAttributes } = this.props;
		const { menu_slug } = attributes;
		const { menus } = this.state;
		const menuSelect = Object.keys( menus ).map( slug => {
			return { label: menus[ slug ].name, value: slug };
		} );
		const menu = menu_slug && menus && menus[ menu_slug ];
		return (
			<Fragment>
				{ ! menu_slug &&  <p>No menu selected</p> }
				{ menu_slug && menu && <RawHTML>{ menu.markup }</RawHTML> }
				<InspectorControls>
					<PanelBody title={ __( 'Navigation Options' ) }>
						<SelectControl
							label={ __( 'Menu' ) }
							value={ menu_slug }
							onChange={ value => setAttributes( { menu_slug: value } ) }
							options={ [ { label: 'Select A Menu', value: null }, ...menuSelect ] }
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}
export default Edit;
