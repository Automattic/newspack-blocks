/**
 * WordPress dependencies
 */
import {
	PanelBody,
	PanelRow,
	TextControl,
	SelectControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';

const SectionHeader = ({ attributes, setAttributes }) => {
	const {
		heading,
		linkType = 'category',
		selectedTaxonomy,
		link,
	} = attributes;
	const categories = useSelect(select => {
		return (
			select('core').getEntityRecords('taxonomy', 'category', {
				per_page: -1,
			}) || []
		);
	}, []).map(cat => ({
		label: cat.name,
		value: JSON.stringify({
			id: cat.id,
			name: cat.name,
			slug: cat.slug,
			link: cat.link,
		}),
	}));
	const pages = useSelect(select => {
		const records = select('core').getEntityRecords('postType', 'page', {
			per_page: -1,
		});
		return records || [];
	}, []);
	const tags = useSelect(select => {
		return (
			select('core').getEntityRecords('taxonomy', 'tag', {
				per_page: -1,
			}) || []
		);
	}, []).map(cat => ({
		label: cat.name,
		value: JSON.stringify({ id: cat.id, name: cat.name, link: cat.link, slug: cat.slug }),
	}));

	const handleHeadingChange = value => {
		setAttributes({ heading: value });
	};
	const handleLinkTypeChange = value => {
		if (linkType !== value) {
			setAttributes({ linkType: value });
			setAttributes({
				selectedTaxonomy: null,
				link: '',
			});
		}
	};
	const handleTaxonomyChange = value => {
		const taxonomy = JSON.parse(value);
		setAttributes({ selectedTaxonomy: taxonomy });
		if (
			(linkType === 'category' || linkType === 'tag') &&
			pages.find(page => page.slug === taxonomy.slug)
		) {
			setLink(`${taxonomy.link}/news/`);
			return;
		}
		setLink(taxonomy.link);
	};

	const setLink = newLink => {
		setAttributes({ link: newLink });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title="Header Settings">
					<PanelRow>
						<TextControl
							label="Heading"
							value={heading}
							onChange={handleHeadingChange}
						/>
					</PanelRow>
					<PanelRow>
						<SelectControl
							label="Link Type"
							value={linkType}
							options={[
								{ label: 'Category', value: 'category' },
								{ label: 'Tag', value: 'tag' },
								{ label: 'Custom Link', value: 'custom' },
							]}
							onChange={handleLinkTypeChange}
						/>
					</PanelRow>
					{linkType === 'category' && (
						<PanelRow>
							<SelectControl
								label="Select Category"
								value={
									selectedTaxonomy
										? JSON.stringify({
												id: selectedTaxonomy.id,
												name: selectedTaxonomy.name,
												slug: selectedTaxonomy.slug,
												link: selectedTaxonomy.link,
											})
										: ''
								}
								options={[
									{
										label: 'Select Category',
										value: '',
										disabled: true,
									},
									...categories,
								]}
								onChange={handleTaxonomyChange}
							/>
						</PanelRow>
					)}
					{linkType === 'tag' && (
						<PanelRow>
							<SelectControl
								label="Select Tag"
								value={
									selectedTaxonomy
										? JSON.stringify({
												id: selectedTaxonomy.id,
												name: selectedTaxonomy.name,
												link: selectedTaxonomy.link,
											})
										: ''
								}
								options={[
									{ label: 'Select Tag', value: '' },
									...tags,
								]}
								onChange={handleTaxonomyChange}
							/>
						</PanelRow>
					)}
					<PanelRow>
						<TextControl
							label="Read More Link"
							value={link}
							onChange={setLink}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<header className="page-header">
				<h1 className="page-title">
					{heading ? heading : 'Enter Heading'}
				</h1>
				{link && (
					<a href={link}>
						और पढ़ें <i className="read_more_arrow" />
					</a>
				)}
			</header>
		</Fragment>
	);
};

export default SectionHeader;
