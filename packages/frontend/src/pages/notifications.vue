<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true" :notification="notification">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<div v-if="tab === 'all'">
			<XNotifications :class="[$style.notifications, { [$style.noRadius]: notification }]" :excludeTypes="excludeTypes"/>
		</div>
		<div v-else-if="tab === 'newNote'">
			<XNotifications :class="[$style.notifications, { [$style.noRadius]: notification }]" :excludeTypes="newNoteExcludeTypes" :notUseGrouped="true"/>
		</div>
		<div v-else-if="tab === 'mentions'">
			<MkNotes :pagination="mentionsPagination" :notification="notification"/>
		</div>
		<div v-else-if="tab === 'directNotes'">
			<MkNotes :pagination="directNotesPagination" :notification="true"/>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { notificationTypes } from '@@/js/const.js';
import XNotifications from '@/components/MkNotifications.vue';
import MkNotes from '@/components/MkNotes.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { deviceKind } from '@/utility/device-kind.js';
import { globalEvents } from '@/events.js';

const tab = ref('all');
const includeTypes = ref<string[] | null>(null);
const excludeTypes = computed(() => includeTypes.value ? notificationTypes.filter(t => !includeTypes.value.includes(t)) : undefined);
const newNoteExcludeTypes = computed(() => notificationTypes.filter(t => !['note'].includes(t)));

const props = defineProps<{
	disableRefreshButton?: boolean;
	notification?: boolean;
}>();

const mentionsPagination = {
	endpoint: 'notes/mentions' as const,
	limit: 10,
};

const directNotesPagination = {
	endpoint: 'notes/mentions' as const,
	limit: 10,
	params: {
		visibility: 'specified',
	},
};

function setFilter(ev) {
	const typeItems = notificationTypes.map(t => ({
		text: i18n.ts._notification._types[t],
		active: (includeTypes.value && includeTypes.value.includes(t)) ?? false,
		action: () => {
			includeTypes.value = [t];
		},
	}));
	const items = includeTypes.value != null ? [{
		icon: 'ti ti-x',
		text: i18n.ts.clear,
		action: () => {
			includeTypes.value = null;
		},
	}, { type: 'divider' as const }, ...typeItems] : typeItems;
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

const headerActions = computed(() => [deviceKind === 'desktop' && !props.disableRefreshButton ? {
	icon: 'ti ti-refresh',
	text: i18n.ts.reload,
	handler: (ev: Event) => {
		globalEvents.emit('reloadNotification');
	},
} : undefined, tab.value === 'all' ? {
	text: i18n.ts.filter,
	icon: 'ti ti-filter',
	highlighted: includeTypes.value != null,
	handler: setFilter,
} : undefined, tab.value === 'all' ? {
	text: i18n.ts.markAllAsRead,
	icon: 'ti ti-check',
	handler: () => {
		os.apiWithDialog('notifications/mark-all-as-read');
	},
} : undefined].filter(x => x !== undefined));

const headerTabs = computed(() => [{
	key: 'all',
	title: i18n.ts.all,
	icon: 'ti ti-point',
}, {
	key: 'newNote',
	title: i18n.ts.newNotes,
	icon: 'ti ti-pencil',
}, {
	key: 'mentions',
	title: i18n.ts.mentions,
	icon: 'ti ti-at',
}, {
	key: 'directNotes',
	title: i18n.ts.directNotes,
	icon: 'ti ti-mail',
}]);

definePage(computed(() => !props.notification ? {
	title: i18n.ts.notifications,
	icon: 'ti ti-bell',
} : null));
</script>

<style lang="scss" module>
.notifications {
	border-radius: var(--MI-radius);
	overflow: clip;

	&.noRadius {
		border-radius: 0;
	}
}
</style>
