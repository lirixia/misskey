<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<span style="unicode-bidi: plaintext; display: inline-block;">
	<Mfm :text="userName(user)" :author="user" :plain="true" :nowrap="nowrap" :emojiUrls="user.emojis" :enableEmojiMenu="enableEmojiMenu"/>
</span>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'cherrypick-js';
import { userName } from '@/filters/user.js';

const props = withDefaults(defineProps<{
	user: Misskey.entities.User;
	nowrap?: boolean;
	enableEmojiMenu?: boolean;
}>(), {
	nowrap: true,
	enableEmojiMenu: false,
});
</script>
