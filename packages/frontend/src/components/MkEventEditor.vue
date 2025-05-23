<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="zmdxowut">
	<span>{{ i18n.ts.event }}</span>
	<MkInput v-model="title" small type="text" class="input" style="margin: 16px 0 0 0;">
		<template #label>*{{ i18n.ts.title }}</template>
	</MkInput>
	<section>
		<div>
			<section>
				<MkInput v-model="startDate" small type="date" class="input">
					<template #label>*{{ i18n.ts._event.startDate }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="startTime" small type="time" class="input">
					<template #label>*{{ i18n.ts._event.startTime }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="endDate" small type="date" class="input">
					<template #label>{{ i18n.ts._event.endDate }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="endTime" small type="time" class="input">
					<template #label>{{ i18n.ts._event.endTime }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="location" small type="text" class="input">
					<template #label>{{ i18n.ts._event.location }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="url" small type="url" class="input">
					<template #label>URL</template>
				</MkInput>
			</section>
		</div>
		<div style="margin: 10px 8px;">
			<section>
				<MkSwitch v-model="showAdvanced" :disabled="false" class="input">{{ i18n.ts.advanced }}</MkSwitch>
			</section>
		</div>
		<div v-show="showAdvanced">
			<section>
				<MkInput v-model="doorTime" small type="time" class="input">
					<template #label>{{ i18n.ts._event.doorTime }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="organizer" small type="text" class="input">
					<template #label>{{ i18n.ts._event.organizer }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="organizerLink" small type="url" class="input">
					<template #label>{{ i18n.ts._event.organizerLink }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="audience" small type="text" class="input">
					<template #label>{{ i18n.ts._event.audience }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="language" small type="text" class="input">
					<template #label>{{ i18n.ts._event.language }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="ageRange" small type="text" class="input">
					<template #label>{{ i18n.ts._event.ageRange }}</template>
				</MkInput>
			</section>
			<!--<section>
				<MkInput v-model="performers" small type="text" class="input">
					<template #label>{{ i18n.ts._event.performers }}</template>
				</MkInput>
			</section>-->
			<section>
				<MkInput v-model="ticketsUrl" small type="url" class="input">
					<template #label>{{ i18n.ts._event.ticketsUrl }}</template>
				</MkInput>
			</section>
			<section>
				<MkSwitch v-model="isFree" :disabled="false">
					{{ i18n.ts._event.isFree }}
				</MkSwitch>
			</section>
			<section>
				<MkInput v-model="price" small type="text" class="input">
					<template #label>{{ i18n.ts._event.price }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="availabilityStart" small type="datetime-local" class="input">
					<template #label>{{ i18n.ts._event.availabilityStart }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="availabilityEnd" small type="datetime-local" class="input">
					<template #label>{{ i18n.ts._event.availabilityEnd }}</template>
				</MkInput>
			</section>
			<section>
				<MkInput v-model="keywords" small type="text" class="input">
					<template #label>{{ i18n.ts._event.keywords }}</template>
				</MkInput>
			</section>
		</div>
	</section>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as Misskey from 'cherrypick-js';
import MkInput from './MkInput.vue';
import MkSwitch from './MkSwitch.vue';
import type { Ref } from 'vue';
import { formatDateTimeString } from '@/utility/format-time-string.js';
import { addTime } from '@/utility/time.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	modelValue: Misskey.entities.Note['event']
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', v: {
		model: Misskey.entities.Note['event']
	})
}>();

const title = ref(props.modelValue?.title ?? null);
const startDate = ref(formatDateTimeString(addTime(new Date(), 1, 'day'), 'yyyy-MM-dd'));
const startTime = ref('00:00');
const endDate = ref('');
const endTime = ref('');
const location = ref(props.modelValue?.metadata.location ?? null);
const url = ref(props.modelValue?.metadata.url ?? null);
const showAdvanced = ref(false);
const doorTime = ref(props.modelValue?.metadata.doorTime ?? null);
const organizer = ref(props.modelValue?.metadata.organizer?.name ?? null);
const organizerLink = ref(props.modelValue?.metadata.organizer?.sameAs ?? null);
const audience = ref(props.modelValue?.metadata.audience?.name ?? null);
const language = ref(props.modelValue?.metadata.inLanguage ?? null);
const ageRange = ref(props.modelValue?.metadata.typicalAgeRange ?? null);
const ticketsUrl = ref(props.modelValue?.metadata.offers?.url ?? null);
const isFree = ref(props.modelValue?.metadata.isAccessibleForFree ?? false);
const price = ref(props.modelValue?.metadata.offers?.price ?? null);
const availabilityStart = ref(props.modelValue?.metadata.offers?.availabilityStarts ?? null);
const availabilityEnd = ref(props.modelValue?.metadata.offers?.availabilityEnds ?? null);
const keywords = ref(props.modelValue?.metadata.keywords ?? null);

function get(): Misskey.entities.Note['event'] {
	const calcAt = (date: Ref<string>, time: Ref<string>): number => (new Date(`${date.value} ${time.value}`)).getTime();

	const start = calcAt(startDate, startTime);
	const end = endDate.value ? calcAt(endDate, endTime) : null;
	return {
		title: title.value,
		start: start,
		end: end,
		metadata: {
			'@type': 'Event',
			name: title.value,
			startDate: (new Date(start)).toISOString(),
			endDate: end ? (new Date(end)).toISOString() : undefined,
			location: location.value ?? undefined,
			url: url.value ?? undefined,
			doorTime: doorTime.value ?? undefined,
			organizer: organizer.value ? {
				'@type': 'Thing',
				name: organizer.value,
				sameAs: organizerLink.value ?? undefined,
			} : undefined,
			audience: audience.value ? {
				'@type': 'Audience',
				name: audience.value,
			} : undefined,
			inLanguage: language.value ?? undefined,
			typicalAgeRange: ageRange.value ?? undefined,
			isAccessibleForFree: isFree,
			offers: ticketsUrl.value || price.value ? {
				price: price.value ?? undefined,
				priceCurrency: undefined,
				availabilityStarts: availabilityStart.value ?? undefined,
				availabilityEnds: availabilityEnd.value ?? undefined,
				url: ticketsUrl.value ?? undefined,
			} : undefined,
			keywords: keywords.value ?? undefined,
		},
	};
}

watch([
	title,
	startDate,
	startTime,
	endDate,
	endTime,
	location,
	url,
	doorTime,
	organizer,
	organizerLink,
	audience,
	language,
	ageRange,
	ticketsUrl,
	isFree,
	price,
	availabilityStart,
	availabilityEnd,
	keywords,
], () => emit('update:modelValue', get()), {
	deep: true,
});

onMounted(() => {
	emit('update:modelValue', get());
});
</script>

<style lang="scss" scoped>
.zmdxowut {
	padding: 8px 16px;

	> span {
		opacity: 0.7;
	}

	> section {
		margin: 16px 0 0 0;

		> div {
			margin: 0 8px;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 12px;

			&:last-child {
				flex: 1 0 auto;

				> div {
					flex-grow: 1;
				}

				> section {
					// MAGIC: Prevent div above from growing unless wrapped to its own line
					flex-grow: 9999;
					align-items: end;
					display: flex;
					gap: 4px;

					> .input {
						flex: 1 1 auto;
					}
				}
			}
		}
	}
}
</style>
