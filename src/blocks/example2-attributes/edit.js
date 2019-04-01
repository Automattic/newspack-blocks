/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { Component, Fragment } from '@wordpress/element';
import {
	InspectorControls,
	PanelColorSettings,
	RichText,
} from '@wordpress/editor';

import { icon, title } from './';
import './editor.scss';

class Edit extends Component {
	render() {
		const { attributes, className, setAttributes } = this.props;
		const { align, backgroundColor, content } = attributes;
		const classes = classNames( className, `align${ align }` );
		const style = {
			backgroundColor: backgroundColor,
		};
		return (
			<Fragment>
				<InspectorControls>
					<PanelColorSettings
						title={ __( 'Color' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: backgroundColor,
								onChange: value => setAttributes( { backgroundColor: value } ),
								label: 'Background Color',
							},
						] }
					/>
				</InspectorControls>
				<RichText
					className={ classes }
					identifier="content"
					inlineToolbar
					onChange={ value => setAttributes( { content: value } ) }
					placeholder={ __( 'Write something…' ) }
					style={ style }
					tagName="p"
					value={ content }
				/>
			</Fragment>
		);
	}
}
export default Edit;
