// /**
//  * VIEW
//  * JavaScript used on front of site.
//  */

// /**
//  * Style dependencies
//  */
// import './view.scss';

// const fetchRetryCount = 3;

// /**
//  * Load More Button Handling
//  *
//  * Calls Array.prototype.forEach for IE11 compatibility.
//  *
//  * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
//  */
// Array.prototype.forEach.call(
// 	document.querySelectorAll(
// 		'.wp-block-newspack-blocks-ie-stories.has-more-button'
// 	),
// 	buildLoadMoreHandler
// );

// /**
//  * Builds a function to handle clicks on the load more button.
//  * Creates internal state via closure to ensure all state is
//  * isolated to a single Block + button instance.
//  *
//  * @param {HTMLElement} blockWrapperEl the button that was clicked
//  */
// function buildLoadMoreHandler(blockWrapperEl) {
// 	const btnEl = blockWrapperEl.querySelector('[data-next]');
// 	if (!btnEl) {
// 		return;
// 	}
// 	const postsContainerEl = blockWrapperEl.querySelector('[data-posts]');

// 	// Set initial state flags.
// 	let isFetching = false;
// 	let isEndOfData = false;
// 	if (
// 		window.addEventListener &&
// 		'1' === ieNetworkThemeExportsUtils.is_auto_loadmore_enabled
// 	) {
// 		if ('1' === ieNetworkThemeExportsUtils.is_auto_click_loadmore_enabled) {
// 			btnEl.addEventListener(
// 				'click',
// 				onVisibilityChange(btnEl, data_load, 'clickevent'),
// 				false
// 			);
// 		} else {
// 			addEventListener(
// 				'scroll',
// 				onVisibilityChange(btnEl, data_load, 'scrollevent'),
// 				false
// 			);
// 		}
// 	}
// 	btnEl.addEventListener('click', data_load, false);
// 	let isIoLazyLoadEnabled = 'no';
// 	function data_load() {
// 		// Early return if still fetching or no more posts to render.
// 		if (isFetching || isEndOfData) {
// 			return false;
// 		}
// 		isFetching = true;

// 		blockWrapperEl.classList.remove('is-error');
// 		blockWrapperEl.classList.add('is-loading');

// 		// Set currently rendered posts' IDs as a query param (e.g. exclude_ids=1,2,3).
// 		const requestURL =
// 			btnEl.getAttribute('data-next') +
// 			'&exclude_ids=' +
// 			getRenderedPostsIds().join(',');

// 		if ('yes' === btnEl.getAttribute('data-io-lazy-loading')) {
// 			isIoLazyLoadEnabled = 'yes';
// 		}

// 		fetchWithRetry(
// 			{ url: requestURL, onSuccess, onError },
// 			fetchRetryCount
// 		);

// 		/**
// 		 * @param {Object} data Post data
// 		 */
// 		function onSuccess(data) {
// 			// Validate received data.
// 			if (!isPostsDataValid(data)) {
// 				return onError();
// 			}

// 			if (data.items.length) {
// 				var ad_code_attr = '';
// 				if ('undefined' !== typeof data.ads && 0 < data.ads.length) {
// 					var lm_ad_code = data.ads;
// 					var lm_ad_code_len = lm_ad_code.length;
// 					for (var i = 0; i < lm_ad_code_len; i++) {
// 						if ('' !== lm_ad_code[i]) {
// 							ad_code_attr = lm_ad_code[i].split('~||~');
// 							if (
// 								'' !== ad_code_attr[0] &&
// 								'' !== ad_code_attr[1] &&
// 								'' !== ad_code_attr[2]
// 							) {
// 								refreshads(
// 									ad_code_attr[0],
// 									ad_code_attr[1],
// 									ad_code_attr[2]
// 								);
// 							}
// 						}
// 					}
// 				}

// 				// Render posts' HTML from string.
// 				const postsHTML = data.items.map(item => item.html).join('');
// 				postsContainerEl.insertAdjacentHTML('beforeend', postsHTML);
// 			}
// 			if (!data.items.length || !data.next) {
// 				isEndOfData = true;
// 				blockWrapperEl.classList.remove('has-more-button');
// 				document.querySelector('.loadmore-button').style.display =
// 					'none';
// 			}
// 			var taboola_container_id = '';
// 			if (
// 				data.page_number &&
// 				'1' === ieNetworkThemeExportsUtils.is_auto_loadmore_enabled
// 			) {
// 				// Save next URL as button's attribute.
// 				btnEl.setAttribute('data-page_number', data.page_number);
// 				if (document.getElementsByClassName('has-more-button')[0]) {
// 					var newDiv = document.createElement('div');
// 					newDiv.setAttribute('class', 'page_number_count');
// 					newDiv.setAttribute('data-page_number', data.page_number);
// 					postsContainerEl.appendChild(newDiv);
// 					taboola_container_id =
// 						'taboola-mid-section-' + data.page_number;
// 					var taboolaDiv = document.createElement('div');
// 					taboolaDiv.setAttribute('id', taboola_container_id);
// 					postsContainerEl.appendChild(taboolaDiv);
// 					window._taboola = window._taboola || [];
// 					_taboola.push({
// 						mode: 'thumbs-feed-section',
// 						container: taboola_container_id,
// 						placement: 'Mid Section Thumbnails' + data.page_number,
// 						target_type: 'mix',
// 					});
// 					if (
// 						'undefined' !== typeof ieNetworkThemeExportsUtils &&
// 						'undefined' !==
// 							typeof ieNetworkThemeExportsUtils.siteName &&
// 						null !== typeof ieNetworkThemeExportsUtils.siteName &&
// 						'The Financial Express' !==
// 							ieNetworkThemeExportsUtils.siteName
// 					) {
// 						_taboola.push({ category: 'auto' });
// 						_taboola.push({ flush: true });
// 					}
// 				}
// 			}
// 			if (data.next) {
// 				// Save next URL as button's attribute.
// 				btnEl.setAttribute('data-next', data.next);
// 			}

// 			isFetching = false;

// 			blockWrapperEl.classList.remove('is-loading');
// 			if ('yes' === isIoLazyLoadEnabled) {
// 				loadMoreStoriesLazyLoading();
// 			}
// 		}

// 		/**
// 		 * Handle fetching error
// 		 */
// 		function onError() {
// 			isFetching = false;

// 			blockWrapperEl.classList.remove('is-loading');
// 			blockWrapperEl.classList.add('is-error');
// 		}
// 	}
// }

// function loadMoreStoriesLazyLoading() {
// 	const target = document.querySelectorAll('.lazyloading');

// 	const observerCallback = (entries, observer) => {
// 		entries.forEach(entry => {
// 			if (entry.isIntersecting && entry.target.getAttribute('data-src')) {
// 				entry.target.src = entry.target.getAttribute('data-src');
// 				entry.target.removeAttribute('data-src');
// 				entry.target.classList.remove('lazyloading');

// 				// Unobserve the image.
// 				observer.unobserve(entry.target);
// 			} else if (
// 				entry.isIntersecting &&
// 				!entry.target.getAttribute('data-src') &&
// 				entry.target.getAttribute('src')
// 			) {
// 				entry.target.classList.remove('lazyloading');
// 				observer.unobserve(entry.target);
// 			}
// 		});
// 	};

// 	const observerOptions = {
// 		threshold: 0.2, // Adjust as needed.
// 	};

// 	const observer = new IntersectionObserver(
// 		observerCallback,
// 		observerOptions
// 	);

// 	if (target) {
// 		target.forEach(img => {
// 			observer.observe(img);
// 		});
// 	}
// }

// /**
//  * Returns unique IDs for posts that are currently in the DOM.
//  */
// function getRenderedPostsIds() {
// 	const postEls = document.querySelectorAll(
// 		'.wp-block-newspack-blocks-ie-stories [data-post-id]'
// 	);
// 	const postIds = Array.from(postEls).map(el =>
// 		el.getAttribute('data-post-id')
// 	);

// 	postIds.push(
// 		document
// 			.querySelector(
// 				'.wp-block-newspack-blocks-ie-stories > div[data-current-post-id]'
// 			)
// 			.getAttribute('data-current-post-id')
// 	);

// 	return [...new Set(postIds)]; // Make values unique with Set.
// }

// /**
//  * Wrapper for XMLHttpRequest that performs given number of retries when error
//  * occurs.
//  *
//  * @param {Object} options XMLHttpRequest options
//  * @param {number} n retry count before throwing
//  */
// function fetchWithRetry(options, n) {
// 	const xhr = new XMLHttpRequest();

// 	xhr.onreadystatechange = () => {
// 		// Return if the request is completed.
// 		if (xhr.readyState !== 4) {
// 			return;
// 		}

// 		// Call onSuccess with parsed JSON if the request is successful.
// 		if (xhr.status >= 200 && xhr.status < 300) {
// 			const data = JSON.parse(xhr.responseText);

// 			return options.onSuccess(data);
// 		}

// 		// Call onError if the request has failed n + 1 times (or if n is undefined).
// 		if (!n) {
// 			return options.onError();
// 		}

// 		// Retry fetching if request has failed and n > 0.
// 		return fetchWithRetry(options, n - 1);
// 	};

// 	xhr.open('GET', options.url);
// 	xhr.send();
// }

// /**
//  * Validates the "Load more" posts endpoint schema:
//  * {
//  * 	"type": "object",
//  * 	"properties": {
//  * 		"items": {
//  * 			"type": "array",
//  * 			"items": {
//  * 				"type": "object",
//  * 				"properties": {
//  * 					"html": {
//  * 						"type": "string"
//  * 					}
//  * 				},
//  * 				"required": ["html"]
//  * 			},
//  * 			"required": ["items"]
//  * 		},
//  * 		"next": {
//  * 			"type": ["string", "null"]
//  * 		}
//  * 	},
//  * 	"required": ["items", "next"]
//  * }
//  *
//  * @param {Object} data posts endpoint payload
//  */
// function isPostsDataValid(data) {
// 	let isValid = false;

// 	if (
// 		data &&
// 		hasOwnProp(data, 'items') &&
// 		Array.isArray(data.items) &&
// 		hasOwnProp(data, 'next') &&
// 		typeof data.next === 'string'
// 	) {
// 		isValid = true;

// 		if (
// 			data.items.length &&
// 			!(
// 				hasOwnProp(data.items[0], 'html') &&
// 				typeof data.items[0].html === 'string'
// 			)
// 		) {
// 			isValid = false;
// 		}
// 	}

// 	return isValid;
// }

// /**
//  * Checks if object has own property.
//  *
//  * @param {Object} obj Object
//  * @param {string} prop Property to check
//  */
// function hasOwnProp(obj, prop) {
// 	return Object.prototype.hasOwnProperty.call(obj, prop);
// }

// /**
//  * Checks if object has own property.
//  *
//  * @param {string} networkid Object
//  * @param {string} ad_code Property to check
//  * @param {string} ad_div Property to check
//  */
// function refreshads(networkid, ad_code, ad_div) {
// 	if (
// 		'undefined' !== networkid &&
// 		'undefined' !== ad_code &&
// 		'undefined' !== ad_div
// 	) {
// 		var slot1 = {};
// 		googletag.cmd.push(function () {
// 			slot1[ad_div] = googletag
// 				.defineSlot('/' + networkid + '/' + ad_code, [300, 250], ad_div)
// 				.addService(googletag.pubads());
// 			googletag.display(ad_div);
// 			googletag.pubads().refresh([slot1[ad_div]]);
// 		});
// 	}
// }

// function isElementInViewport(el) {
// 	// Special bonus for those using jQuery.
// 	if (typeof jQuery === 'function' && el instanceof jQuery) {
// 		el = el[0];
// 	}

// 	var rect = el.getBoundingClientRect();

// 	return (
// 		rect.top >= 0 &&
// 		rect.left >= 0 &&
// 		rect.bottom <=
// 			(window.innerHeight ||
// 				document.documentElement
// 					.clientHeight) /* or $(window).height() */ &&
// 		rect.right <=
// 			(window.innerWidth ||
// 				document.documentElement.clientWidth) /* or $(window).width() */
// 	);
// }
// function onVisibilityChange(el, callback, eventtype) {
// 	var old_visible = false;
// 	var lastScrollTop = 0;
// 	var latestPageUp = 0;
// 	var latestPageDown = 0;
// 	return function () {
// 		var st = window.pageYOffset || document.documentElement.scrollTop;
// 		var page_url = ieNetworkThemeExportsUtils.pageUrl.split('?')[0];
// 		var pageTitle = ieNetworkThemeExportsUtils.seo_title;
// 		var pageSeoLang = ieNetworkThemeExportsUtils.site_seo_language_name;
// 		var listSectionName = ieNetworkThemeExportsUtils.seo_page_title;
// 		if (st > lastScrollTop) {
// 			var visible = isElementInViewport(el);
// 			// downscroll code.
// 			if (visible != old_visible) {
// 				if (typeof callback == 'function') {
// 					callback();
// 				}
// 			}
// 			var pageElement = document.querySelectorAll('.page_number_count');
// 			pageElement.forEach(function (userItem) {
// 				var visibleOnUp = isElementInViewport(userItem);
// 				if ('clickevent' === eventtype) {
// 					visibleOnUp = true;
// 				}
// 				if (visibleOnUp != old_visible) {
// 					var new_page_url = '';
// 					var previousBtnUrl = '';
// 					var nextBtnUrl = '';
// 					var pageNumber = userItem.getAttribute('data-page_number');
// 					if (pageNumber !== latestPageUp) {
// 						var newPageTitle = pageTitle.replace(
// 							'/Page [0-9]/i',
// 							''
// 						);
// 						var pageTitleArray = newPageTitle.split('|');
// 						pageTitleArray.splice(
// 							1,
// 							0,
// 							'Page ' + (parseInt(pageNumber) + 1)
// 						);
// 						var pageTitleString = pageTitleArray.join(' | ');
// 						document.title = pageTitleString;

// 						if (
// 							null !==
// 							document.querySelector('meta[property="og:title"]')
// 						) {
// 							document
// 								.querySelector('meta[property="og:title"]')
// 								.setAttribute('content', pageTitleString);
// 						}

// 						var pageDescription =
// 							listSectionName +
// 							' News, Page ' +
// 							(parseInt(pageNumber) + 1) +
// 							' - Find the detailed coverage on' +
// 							listSectionName +
// 							'  in ' +
// 							pageSeoLang +
// 							' at ' +
// 							ieNetworkThemeExportsUtils.siteUrl.replace(
// 								/^https?:\/\//,
// 								''
// 							) +
// 							'.';

// 						if (
// 							null !==
// 							document.querySelector('meta[name="description"]')
// 						) {
// 							document
// 								.querySelector('meta[name="description"]')
// 								.setAttribute('content', pageDescription);
// 						}

// 						if (
// 							null !==
// 							document.querySelector(
// 								'meta[property="og:description"]'
// 							)
// 						) {
// 							document
// 								.querySelector(
// 									'meta[property="og:description"]'
// 								)
// 								.setAttribute('content', pageDescription);
// 						}
// 						new_page_url = page_url.replace(/\/page\/[0-9]+/, '');
// 						previousBtnUrl = new_page_url;
// 						if ('1' === pageNumber) {
// 							var headID =
// 								document.getElementsByTagName('head')[0];
// 							var link = document.createElement('link');
// 							link.rel = 'prev';
// 							headID.appendChild(link);
// 							link.href = previousBtnUrl;
// 						} else {
// 							previousBtnUrl =
// 								new_page_url +
// 								'page/' +
// 								parseInt(pageNumber) +
// 								'/';
// 							if (
// 								null !==
// 								document.querySelector('link[rel="prev"]')
// 							) {
// 								document
// 									.querySelector('link[rel="prev"]')
// 									.setAttribute('href', previousBtnUrl);
// 							}
// 						}
// 						nextBtnUrl =
// 							new_page_url +
// 							'page/' +
// 							(parseInt(pageNumber) + 2) +
// 							'/';
// 						new_page_url =
// 							new_page_url +
// 							'page/' +
// 							(parseInt(pageNumber) + 1) +
// 							'/';

// 						if (
// 							null !== document.querySelector('.new-preview-btn')
// 						) {
// 							document
// 								.querySelector('.new-preview-btn')
// 								.setAttribute('href', previousBtnUrl);
// 						}
// 						if (null !== document.querySelector('.new-next-btn')) {
// 							document
// 								.querySelector('.new-next-btn')
// 								.setAttribute('href', nextBtnUrl);
// 						}
// 						if (
// 							null !== document.querySelector('link[rel="next"]')
// 						) {
// 							document
// 								.querySelector('link[rel="next"]')
// 								.setAttribute('href', nextBtnUrl);
// 						}

// 						window.history.pushState(null, null, new_page_url);
// 						ga(
// 							'create',
// 							ieNetworkThemeExportsUtils.ga_tracking_id,
// 							'auto'
// 						);
// 						ga('send', { hitType: 'pageview', page: new_page_url });
// 						const canonical = document.querySelector(
// 							'link[rel="canonical"]'
// 						);
// 						if (canonical !== null) {
// 							canonical.href = new_page_url;
// 						}
// 						latestPageUp = pageNumber;
// 					}
// 				}
// 			});
// 		} else {
// 			// upscroll code.
// 			var pageElement = document.querySelectorAll('.page_number_count');
// 			pageElement.forEach(function (userItem) {
// 				var visibleOnUp = isElementInViewport(userItem);
// 				if (visibleOnUp != old_visible) {
// 					var new_page_url = '';
// 					var previousBtnUrl = '';
// 					var nextBtnUrl = '';
// 					var pageNumber = userItem.getAttribute('data-page_number');
// 					if (pageNumber !== latestPageDown) {
// 						var newPageTitle = pageTitle.replace(
// 							'/Page [0-9]/i',
// 							''
// 						);
// 						var pageTitleArray = newPageTitle.split('|');
// 						var pageDescription =
// 							ieNetworkThemeExportsUtils.seo_description;
// 						if ('1' !== pageNumber) {
// 							pageTitleArray.splice(
// 								1,
// 								0,
// 								'Page ' + parseInt(pageNumber)
// 							);
// 							pageDescription =
// 								listSectionName +
// 								' News, Page ' +
// 								parseInt(pageNumber) +
// 								' - Find the detailed coverage on' +
// 								listSectionName +
// 								'  in ' +
// 								pageSeoLang +
// 								' at ' +
// 								ieNetworkThemeExportsUtils.siteUrl.replace(
// 									/^https?:\/\//,
// 									''
// 								) +
// 								'.';
// 						}
// 						var pageTitleString = pageTitleArray.join(' | ');
// 						document.title = pageTitleString;

// 						if (
// 							null !==
// 							document.querySelector('meta[property="og:title"]')
// 						) {
// 							document
// 								.querySelector('meta[property="og:title"]')
// 								.setAttribute('content', pageTitleString);
// 						}
// 						if (
// 							null !==
// 							document.querySelector('meta[name="description"]')
// 						) {
// 							document
// 								.querySelector('meta[name="description"]')
// 								.setAttribute('content', pageDescription);
// 						}

// 						if (
// 							null !==
// 							document.querySelector(
// 								'meta[property="og:description"]'
// 							)
// 						) {
// 							document
// 								.querySelector(
// 									'meta[property="og:description"]'
// 								)
// 								.setAttribute('content', pageDescription);
// 						}
// 						// Save next URL as button's attribute.
// 						new_page_url = page_url.replace(/\/page\/[0-9]+/, '');
// 						previousBtnUrl = new_page_url;
// 						nextBtnUrl =
// 							new_page_url +
// 							'page/' +
// 							(parseInt(pageNumber) + 1) +
// 							'/';
// 						if ('1' !== pageNumber) {
// 							if ('2' === pageNumber) {
// 								previousBtnUrl = new_page_url;
// 							} else {
// 								previousBtnUrl =
// 									new_page_url +
// 									'page/' +
// 									(parseInt(pageNumber) - 1) +
// 									'/';
// 							}
// 							new_page_url =
// 								new_page_url + 'page/' + pageNumber + '/';
// 							if (
// 								null !==
// 								document.querySelector('link[rel="prev"]')
// 							) {
// 								document
// 									.querySelector('link[rel="prev"]')
// 									.setAttribute('href', previousBtnUrl);
// 							}
// 						}
// 						if ('1' === pageNumber) {
// 							var perviousObj =
// 								document.querySelector('link[rel="prev"]');
// 							perviousObj.remove();
// 						}
// 						if (
// 							null !== document.querySelector('.new-preview-btn')
// 						) {
// 							document
// 								.querySelector('.new-preview-btn')
// 								.setAttribute('href', previousBtnUrl);
// 						}
// 						if (null !== document.querySelector('.new-next-btn')) {
// 							document
// 								.querySelector('.new-next-btn')
// 								.setAttribute('href', nextBtnUrl);
// 						}
// 						if (
// 							null !== document.querySelector('link[rel="next"]')
// 						) {
// 							document
// 								.querySelector('link[rel="next"]')
// 								.setAttribute('href', nextBtnUrl);
// 						}

// 						window.history.pushState(null, null, new_page_url);
// 						ga(
// 							'create',
// 							ieNetworkThemeExportsUtils.ga_tracking_id,
// 							'auto'
// 						);
// 						ga('send', { hitType: 'pageview', page: new_page_url });
// 						const canonical = document.querySelector(
// 							'link[rel="canonical"]'
// 						);
// 						if (null !== canonical) {
// 							canonical.href = new_page_url;
// 						}
// 					}
// 					latestPageDown = pageNumber;
// 				}
// 			});
// 		}
// 		lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling.
// 	};
// }
// function load_tabolla() {
// 	window._taboola = window._taboola || [];
// 	_taboola.push({
// 		mode: 'thumbs-feed-section',
// 		container: 'taboola-mid-section-1',
// 		placement: 'Mid Section' + ' Thumbnails' + 1,
// 		target_type: 'mix',
// 	});
// 	if (
// 		'undefined' !== typeof ieNetworkThemeExportsUtils.siteName &&
// 		null !== typeof ieNetworkThemeExportsUtils.siteName &&
// 		'The Financial Express' !== ieNetworkThemeExportsUtils.siteName
// 	) {
// 		_taboola.push({ category: 'auto' });
// 		_taboola.push({ flush: true });
// 	}
// }
// if (
// 	'undefined' !== typeof ieNetworkThemeExportsUtils &&
// 	'undefined' !==
// 		typeof ieNetworkThemeExportsUtils.is_auto_loadmore_enabled &&
// 	null !== typeof ieNetworkThemeExportsUtils.is_auto_loadmore_enabled &&
// 	'1' === ieNetworkThemeExportsUtils.is_auto_loadmore_enabled
// ) {
// 	jQuery(window).one('scroll', function () {
// 		if (document.getElementById('taboola-mid-section-1')) {
// 			load_tabolla();
// 		}
// 	});
// }
