<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div v-if="tab === 'my'" class="_gaps">
			<MkPagination v-slot="{ items }" ref="pagingComponent" :pagination="pagination" class="_gaps">
				<MkClipPreview v-for="item in items" :key="item.id" :clip="item" :noUserInfo="true"/>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'favorites'" class="_gaps">
			<MkClipPreview v-for="item in favorites" :key="item.id" :clip="item"/>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { watch, ref, useTemplateRef, computed } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkPagination from '@/components/MkPagination.vue';
import MkClipPreview from '@/components/MkClipPreview.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { clipsCache } from '@/cache.js';

const pagination = {
	endpoint: 'clips/list' as const,
	noPaging: true,
	limit: 10,
};

const tab = ref('my');

const favorites = ref<Misskey.entities.Clip[] | null>(null);

const pagingComponent = useTemplateRef('pagingComponent');

watch(tab, async () => {
	favorites.value = await misskeyApi('clips/my-favorites');
});

async function create() {
	const { canceled, result } = await os.form(i18n.ts.createNewClip, {
		name: {
			type: 'string',
			label: i18n.ts.name,
		},
		description: {
			type: 'string',
			required: false,
			multiline: true,
			treatAsMfm: true,
			label: i18n.ts.description,
		},
		isPublic: {
			type: 'boolean',
			label: i18n.ts.public,
			default: false,
		},
	});
	if (canceled) return;

	os.apiWithDialog('clips/create', result);

	clipsCache.delete();

	pagingComponent.value?.reload();
}

function onClipCreated() {
	pagingComponent.value?.reload();
}

function onClipDeleted() {
	pagingComponent.value?.reload();
}

const headerActions = computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.add,
	handler: create,
}]);

const headerTabs = computed(() => [{
	key: 'my',
	title: i18n.ts.myClips,
	icon: 'ti ti-paperclip',
}, {
	key: 'favorites',
	title: i18n.ts.favorites,
	icon: 'ti ti-heart',
}]);

definePage(() => ({
	title: i18n.ts.clip,
	icon: 'ti ti-paperclip',
}));
</script>

<style lang="scss" module>

</style>
