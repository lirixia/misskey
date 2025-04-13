/*
 * SPDX-FileCopyrightText: noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { compareVersions } from 'compare-versions';
import { version } from '@@/js/config.js';
import { misskeyApi } from '@/utility/misskey-api.js';

export async function fetchCherrypickReleases(): Promise<boolean> {
	try {
		const meta = await misskeyApi('admin/meta');
		const response = await window.fetch('https://api.github.com/repos/catsmiry/misskey/releases');
		const releasesData = await response.json();

		if (!Array.isArray(releasesData) || releasesData.length === 0) {
			console.warn('No Misskey Lirisia Remix releases found.');
			return false;
		}

		const latestRelease = meta.enableReceivePrerelease
			? releasesData[0]
			: releasesData.filter((x: any) => !x.prerelease)[0];

		if (!latestRelease || !latestRelease.tag_name || typeof latestRelease.tag_name !== 'string') {
			console.warn('Invalid latest Misskey Lirisia Remix release:', latestRelease);
			return false;
		}

		return (
			compareVersions(version, latestRelease.tag_name) < 0 &&
			compareVersions(<string>meta.skipCherryPickVersion || version, latestRelease.tag_name) < 0
		);
	} catch (error) {
		console.error('Failed to fetch Misskey Lirisia Remix releases:', error);
		return false;
	}
}
