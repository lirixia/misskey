<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_spacer" style="--MI_SPACER-w: 800px; padding-top: 0;">
	<MkStickyContainer>
		<template #header>
			<MkTab v-model="include" :class="$style.tab">
				<option value="upcoming">{{ i18n.ts._event.startDate }}</option>
				<option :value="null">{{ i18n.ts.reverseChronological }}</option>
			</MkTab>
		</template>
		<MkNotes :noGap="!prefer.s.showGapBetweenNotesInTimeline" :pagination="pagination" :class="$style.tl" :getDate="include === 'upcoming' ? note => note.event.start : undefined "/>
	</MkStickyContainer>
</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkNotes from '@/components/MkNotes.vue';
import MkTab from '@/components/MkTab.vue';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const include = ref<string | null>('upcoming');

const pagination = {
	endpoint: 'notes/events/search' as const,
	limit: 10,
	offsetMode: include.value === 'upcoming',
	params: computed(() => ({
		users: [props.user.id],
		sortBy: include.value === 'upcoming' ? 'startDate' : 'createdAt',
	})),
};
</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--MI-margin) / 2) 0;
	padding: calc(var(--MI-margin) / 2) 0;
	background: var(--MI_THEME-bg);
}

.tl {
	background: var(--MI_THEME-bg);
    border-radius: var(--MI-radius);
    overflow: clip;
}
</style>
