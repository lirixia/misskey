<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<!-- <MkButton v-if="$i.policies.chatAvailability === 'available' && !isMobile" primary gradate rounded :class="$style.start" @click="start"><i class="ti ti-plus"></i> {{ i18n.ts.startChat }}</MkButton> -->

	<MkInfo v-if="$i.policies.chatAvailability !== 'available'">{{ $i.policies.chatAvailability === 'readonly' ? i18n.ts._chat.chatIsReadOnlyForThisAccountOrServer : i18n.ts._chat.chatNotAvailableForThisAccountOrServer }}</MkInfo>

	<MkAd :preferForms="['horizontal', 'horizontal-big']"/>

	<MkInput
		v-model="searchQuery"
		:placeholder="i18n.ts._chat.searchMessages"
		type="search"
	>
		<template #prefix><i class="ti ti-search"></i></template>
	</MkInput>

	<MkButton v-if="searchQuery.length > 0" primary rounded @click="search">{{ i18n.ts.search }}</MkButton>

	<MkFoldableSection v-if="searched">
		<template #header>{{ i18n.ts.searchResult }}</template>

		<div class="_gaps_s">
			<div v-for="message in searchResults" :key="message.id" :class="$style.searchResultItem">
				<XMessage :message="message" :isSearchResult="true"/>
			</div>
		</div>
	</MkFoldableSection>

	<MkFoldableSection>
		<template #header>{{ i18n.ts._chat.history }}</template>

		<MkChatHistories/>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, onMounted, ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import { useInterval } from '@@/js/use-interval.js';
import XMessage from './XMessage.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { ensureSignin } from '@/i.js';
import { useRouter } from '@/router.js';
import * as os from '@/os.js';
import { updateCurrentAccountPartial } from '@/accounts.js';
import MkInput from '@/components/MkInput.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkChatHistories from '@/components/MkChatHistories.vue';
import { deviceKind } from '@/utility/device-kind.js';
import { globalEvents } from '@/events.js';

const MOBILE_THRESHOLD = 500;

const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const $i = ensureSignin();

const router = useRouter();

const searchQuery = ref('');
const searched = ref(false);
const searchResults = ref<Misskey.entities.ChatMessage[]>([]);

function start(ev: MouseEvent) {
	os.popupMenu([{
		text: i18n.ts._chat.individualChat,
		caption: i18n.ts._chat.individualChat_description,
		icon: 'ti ti-user',
		action: () => { startUser(); },
	}, { type: 'divider' }, {
		type: 'parent',
		text: i18n.ts._chat.roomChat,
		caption: i18n.ts._chat.roomChat_description,
		icon: 'ti ti-users-group',
		children: [{
			text: i18n.ts._chat.createRoom,
			icon: 'ti ti-plus',
			action: () => { createRoom(); },
		}],
	}], ev.currentTarget ?? ev.target);
}

async function startUser() {
	// TODO: localOnly は連合に対応したら消す
	os.selectUser({ localOnly: true }).then(user => {
		router.push(`/chat/user/${user.id}`);
	});
}

async function createRoom() {
	const { canceled, result } = await os.inputText({
		title: i18n.ts.name,
		minLength: 1,
	});
	if (canceled) return;

	const room = await misskeyApi('chat/rooms/create', {
		name: result,
	});

	router.push(`/chat/room/${room.id}`);
}

async function search() {
	const res = await misskeyApi('chat/messages/search', {
		query: searchQuery.value,
	});

	searchResults.value = res;
	searched.value = true;
}

onMounted(() => {
	updateCurrentAccountPartial({ hasUnreadChatMessages: false });

	globalEvents.on('createChat', (ev) => start(ev));
});
</script>

<style lang="scss" module>
.start {
	margin: 0 auto;
}

.searchResultItem {
	padding: 12px;
	border: solid 1px var(--MI_THEME-divider);
	border-radius: 12px;
}
</style>
