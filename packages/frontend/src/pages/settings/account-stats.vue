<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection v-if="stats" first>
		<template #label>{{ i18n.ts.statistics }}</template>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.notesCount }}</template>
			<template #value>{{ number(stats.notesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.repliesCount }}</template>
			<template #value>{{ number(stats.repliesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.renotesCount }}</template>
			<template #value>{{ number(stats.renotesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.repliedCount }}</template>
			<template #value>{{ number(stats.repliedCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.renotedCount }}</template>
			<template #value>{{ number(stats.renotedCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.pollVotesCount }}</template>
			<template #value>{{ number(stats.pollVotesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.pollVotedCount }}</template>
			<template #value>{{ number(stats.pollVotedCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.sentReactionsCount }}</template>
			<template #value>{{ number(stats.sentReactionsCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.receivedReactionsCount }}</template>
			<template #value>{{ number(stats.receivedReactionsCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.noteFavoritesCount }}</template>
			<template #value>{{ number(stats.noteFavoritesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.followingCount }}</template>
			<template #value>{{ number(stats.followingCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.followingCount }} ({{ i18n.ts.local }})</template>
			<template #value>{{ number(stats.localFollowingCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.followingCount }} ({{ i18n.ts.remote }})</template>
			<template #value>{{ number(stats.remoteFollowingCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.followersCount }}</template>
			<template #value>{{ number(stats.followersCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.followersCount }} ({{ i18n.ts.local }})</template>
			<template #value>{{ number(stats.localFollowersCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.followersCount }} ({{ i18n.ts.remote }})</template>
			<template #value>{{ number(stats.remoteFollowersCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.pageLikesCount }}</template>
			<template #value>{{ number(stats.pageLikesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.pageLikedCount }}</template>
			<template #value>{{ number(stats.pageLikedCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.driveFilesCount }}</template>
			<template #value>{{ number(stats.driveFilesCount) }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ i18n.ts.driveUsage }}</template>
			<template #value>{{ bytes(stats.driveUsage) }}</template>
		</MkKeyValue>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.other }}</template>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>emailVerified</template>
			<template #value>{{ $i.emailVerified ? i18n.ts.yes : i18n.ts.no }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>twoFactorEnabled</template>
			<template #value>{{ $i.twoFactorEnabled ? i18n.ts.yes : i18n.ts.no }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>securityKeys</template>
			<template #value>{{ $i.securityKeys ? i18n.ts.yes : i18n.ts.no }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>usePasswordLessLogin</template>
			<template #value>{{ $i.usePasswordLessLogin ? i18n.ts.yes : i18n.ts.no }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>isModerator</template>
			<template #value>{{ $i.isModerator ? i18n.ts.yes : i18n.ts.no }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>isAdmin</template>
			<template #value>{{ $i.isAdmin ? i18n.ts.yes : i18n.ts.no }}</template>
		</MkKeyValue>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import number from '@/filters/number.js';
import bytes from '@/filters/bytes.js';
import { $i } from '@/i.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { misskeyApi } from '@/utility/misskey-api.js';

const stats = ref<any>({});

onMounted(() => {
	misskeyApi('users/stats', {
		userId: $i!.id,
	}).then(response => {
		stats.value = response;
	});
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.accountInfo,
	icon: 'ti ti-info-circle',
}));
</script>
