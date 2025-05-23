<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="group && $i.id === group.ownerId ? headerActions : null" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div>
			<transition :name="prefer.s.animation ? 'zoom' : ''" mode="out-in">
				<div v-if="group" class="_gaps_s">
					<div style="margin-top: var(--MI-margin);">{{ i18n.ts.members }}</div>
					<div :class="$style.content">
						<div :class="$style.users">
							<div v-for="user in users" :key="user.id" :class="$style.user" class="_panel">
								<MkAvatar :user="user" :class="$style.avatar" link preview/>
								<div :class="$style.body">
									<MkA v-user-preview="user" :class="$style.username" :to="userPage(user)">
										<MkUserName :user="user" :class="$style.name"/>
									</MkA>
									<MkAcct :user="user" :class="$style.acct"/>
								</div>
								<div v-if="user.id === group.ownerId" v-tooltip="i18n.ts._group.leader" style="color: var(--MI_THEME-badge);"><i class="ti ti-crown"></i></div>
								<div v-else-if="group && $i.id === group.ownerId">
									<button v-tooltip="i18n.ts._group.banish" class="_button" @click="removeUser(user)"><i class="ti ti-x"></i></button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</transition>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import * as os from '@/os.js';
import { $i } from '@/i.js';
import { mainRouter } from '@/router.js';
import { definePage } from '@/page.js';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences.js';
import { userPage } from '@/filters/user.js';
import { misskeyApi } from '@/utility/misskey-api.js';

const props = defineProps<{
	groupId: string;
}>();

const group = ref(null);
const users = ref([]);

function fetchGroup() {
	misskeyApi('users/groups/show', {
		groupId: props.groupId,
	}).then(_group => {
		group.value = _group;
		misskeyApi('users/show', {
			userIds: group.value.userIds,
		}).then(_users => {
			users.value = _users;
		});
	});
}

function invite() {
	os.selectUser({ includeSelf: false, localOnly: true }).then(user => {
		os.apiWithDialog('users/groups/invite', {
			groupId: group.value.id,
			userId: user.id,
		});
	});
}

async function removeUser(user) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx._group.banishConfirm({ name: user.name || user.username, group: group.value.name }),
	});
	if (canceled) return;

	os.apiWithDialog('users/groups/pull', {
		groupId: group.value.id,
		userId: user.id,
	}).then(() => {
		users.value = users.value.filter(x => x.id !== user.id);
	});
}

async function renameGroup() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
		default: group.value.name,
	});
	if (canceled) return;

	await os.apiWithDialog('users/groups/update', {
		groupId: group.value.id,
		name: name,
	});

	group.value.name = name;
}

function transfer() {
	os.selectUser({ includeSelf: false, localOnly: true }).then(user => {
		os.apiWithDialog('users/groups/transfer', {
			groupId: group.value.id,
			userId: user.id,
		});
	});
}

async function deleteGroup() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx.removeAreYouSure({ x: group.value.name }),
	});
	if (canceled) return;

	await os.apiWithDialog('users/groups/delete', {
		groupId: group.value.id,
	});
	mainRouter.push('/my/groups');
}

watch(() => props.listId, fetchGroup, { immediate: true });

const headerActions = computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.invite,
	handler: () => {
		invite();
	},
}, {
	icon: 'ti ti-edit',
	text: i18n.ts.rename,
	handler: () => {
		renameGroup();
	},
}, {
	icon: 'ti ti-arrows-exchange',
	text: i18n.ts.transfer,
	handler: () => {
		transfer();
	},
}, {
	icon: 'ti ti-trash',
	text: i18n.ts.delete,
	handler: () => {
		deleteGroup();
	},
}]);

const headerTabs = computed(() => []);

definePage(computed(() => group.value ? {
	title: group.value.name,
	icon: 'ti ti-briefcase',
} : null));

</script>

<style lang="scss" module>
.content {
	display: flex;
	flex-wrap: wrap;
	gap: var(--MI-margin);
}

.users {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
	grid-gap: 12px;
	width: 100%;
}

.user {
	display: flex;
	align-items: center;
	padding: 16px;
}

.avatar {
	width: 50px;
	height: 50px;
}

.body {
	flex: 1;
	padding: 8px;
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
}

.username {
	font-weight: bold;
	text-decoration: none;

	&:hover {
		color: var(--MI_THEME-renoteHover);
		text-decoration: none;
	}
}

.name {
	display: block;
	font-weight: bold;
}

.acct {
	opacity: 0.5;
}
</style>
