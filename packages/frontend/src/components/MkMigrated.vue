<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
	<MkModal v-if="!showChangelog" ref="modal" :zPriority="'middle'">
		<div :class="$style.root">
			<div style="display: grid;">
				<Mfm text="$[tada 🎉]" />
				<MkSparkle>
					<div :class="$style.title">{{ i18n.ts.welcome }}</div>
					<small style="opacity: 0.7;">{{ i18n.ts.cherrypickMigrated }}</small>
				</MkSparkle>
			</div>
			<div :class="$style.version">
				<div>✨{{ version }}🚀</div>
				<div style="font-size: 0.8em;">{{ basedMisskeyVersion }}</div>
			</div>
			<MkButton rounded full @click="whatIsNewCherryPick">{{ i18n.ts.whatIsNew }}</MkButton>
			<MkButton :class="$style.gotIt" primary rounded full @click="close">{{ i18n.ts.gotIt }}</MkButton>
		</div>
	</MkModal>
	<!--
<MkModal v-else-if="showChangelog" ref="modal" :zPriority="'middle'">
	<div :class="$style.root">
		<div :class="$style.title" style="margin: 0 0 1.5em; font-weight: normal;">{{ i18n.ts.whatIsNew }}</div>
		<MkButton rounded full style="margin: 8px 0 0;" @click="whatIsNewCherryPick">CherryPick</MkButton>
		<MkButton rounded full @click="whatIsNewMisskey">Misskey</MkButton>
		<MkButton :class="$style.gotIt" primary rounded full @click="close">{{ i18n.ts.ok }}</MkButton>
	</div>
</MkModal>
-->
</template>

<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue';
import { version, basedMisskeyVersion } from '@@/js/config.js';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import { i18n } from '@/i18n.js';
import { confetti } from '@/utility/confetti.js';
import * as os from '@/os.js';
import { clearCache } from '@/utility/clear-cache.js';
import { miLocalStorage } from '@/local-storage.js';

const showChangelog = ref(false);

const modal = useTemplateRef('modal');

/**
 * const whatIsNewMisskey = () => {
 * 	window.open(`https://misskey-hub.net/docs/releases/#_${basedMisskeyVersion.replace(/\./g, '')}`, '_blank');
 * };
 */

const whatIsNewCherryPick = () => {
	window.open(`https://github.com/lirixia/misskey/blob/develop/CHANGELOG_CHERRYPICK.md#${version.replace(/\./g, '')}`, '_blank');
};

const close = async () => {
	modal.value?.close();
	await os.alert({
		type: 'warning',
		title: i18n.ts.cherrypickMigratedCacheClearTitle,
		text: i18n.ts.cherrypickMigratedCacheClear,
	});
	miLocalStorage.setItem('lastVersion', version);
	await clearCache();
};

onMounted(() => {
	confetti({
		duration: 1000 * 3,
	});
});
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
}

.title {
	font-weight: bold;
}

.version {
	margin: 1em 0;
}

.gotIt {
	margin: 8px 0 0 0;
}

.cacheClear {
	composes: gotIt;
}
</style>
