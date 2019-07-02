/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Path, SVG } from '@wordpress/components';

export const DEFAULT_FORMAT = 'mrec';
export const AD_FORMATS = [
	{
		height: 90,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Large Leaderboard 970x90' ),
		tag: 'large_leaderboard',
		width: 970,
		editorPadding: 30,
	},
	{
		height: 90,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Leaderboard 728x90' ),
		tag: 'leaderboard',
		width: 728,
		editorPadding: 30,
	},
	{
		height: 60,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Full Banner 468x60' ),
		tag: 'full_banner',
		width: 468,
		editorPadding: 30,
	},
	{
		height: 280,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4h-4v-2h2c1.1 0 2-.89 2-2V9c0-1.11-.9-2-2-2H9v2h4v2h-2c-1.1 0-2 .89-2 2v4h6v-2z" />
			</SVG>
		),
		name: __( 'Large Rectangle 336x280' ),
		tag: 'large_rectangle',
		width: 336,
		editorPadding: 60,
	},
	{
		height: 50,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V9c0-1.11-.9-2-2-2H9v2h4v2h-2v2h2v2H9v2h4c1.1 0 2-.89 2-2z" />
			</SVG>
		),
		name: __( 'Mobile Leaderboard 320x50' ),
		tag: 'mobile_leaderboard',
		width: 320,
		editorPadding: 100,
	},
	{
		height: 600,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V9c0-1.11-.9-2-2-2H9v2h4v2h-2v2h2v2H9v2h4c1.1 0 2-.89 2-2z" />
			</SVG>
		),
		name: __( 'Half-Page Ad 300x600' ),
		tag: 'half_page_ad',
		width: 300,
		editorPadding: 100,
	},
	{
		height: 250,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Medium Rectangle 300x250' ),
		tag: DEFAULT_FORMAT,
		width: 300,
		editorPadding: 30,
	},
	{
		height: 100,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( '3:1 Rectangle 300x100' ),
		tag: '3_1_rectangle',
		width: 300,
		editorPadding: 30,
	},
	{
		height: 250,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Square 250x250' ),
		tag: 'square',
		width: 250,
		editorPadding: 30,
	},
	{
		height: 400,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Vertical Rectangle 240x400' ),
		tag: 'vertical_rectangle',
		width: 240,
		editorPadding: 30,
	},
	{
		height: 60,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Half Banner 234x60' ),
		tag: 'half_banner',
		width: 234,
		editorPadding: 30,
	},
	{
		height: 200,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Small Square 200x200' ),
		tag: 'small_square',
		width: 200,
		editorPadding: 30,
	},
	{
		height: 150,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Rectangle' ),
		tag: 'rectangle',
		width: 180,
		editorPadding: 30,
	},
	{
		height: 600,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Wide Skyscraper 160x600' ),
		tag: 'wideskyscraper',
		width: 160,
		editorPadding: 30,
	},
	{
		height: 125,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Button 125x125' ),
		tag: 'button',
		width: 125,
		editorPadding: 30,
	},
	{
		height: 120,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Skyscraper 120x600' ),
		tag: 'skyscraper',
		width: 600,
		editorPadding: 30,
	},
	{
		height: 240,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Vertical Banner 120x240' ),
		tag: 'vertical_banner',
		width: 120,
		editorPadding: 30,
	},
	{
		height: 90,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Button 1 120x90' ),
		tag: 'button_1',
		width: 120,
		editorPadding: 30,
	},
	{
		height: 60,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Button 2 120x60' ),
		tag: 'button_2',
		width: 120,
		editorPadding: 30,
	},
	{
		height: 31,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Microbar 88x31' ),
		tag: 'microbar',
		width: 88,
		editorPadding: 30,
	},
];
