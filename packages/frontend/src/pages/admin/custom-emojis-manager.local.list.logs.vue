<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkWindow
	ref="uiWindow"
	:initialWidth="400"
	:initialHeight="500"
	:canResize="true"
	@closed="emit('closed')"
>
	<template #header>
		<i class="ti ti-notes" style="margin-right: 0.5em;"></i> {{ i18n.ts._customEmojisManager._gridCommon.registrationLogs }}
	</template>
	<div class="_spacer">
		<XRegisterLogs :logs="logs"/>
	</div>
</MkWindow>
</template>

<script setup lang="ts">
import type { RequestLogItem } from './custom-emojis-manager.impl.js';
import MkWindow from '@/components/MkWindow.vue';
import XRegisterLogs from '@/pages/admin/custom-emojis-manager.logs.vue';

import { i18n } from '@/i18n.js';

defineProps<{
	logs: RequestLogItem[];
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

</script>
