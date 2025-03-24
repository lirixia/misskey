<!--
SPDX-FileCopyrightText: Miry(@catsmiry)
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :showHeader="widgetProps.showHeader" data-cy-mkw-todo class="mkw-todo">
	<template #icon><i class="ti ti-checklist"></i></template>
	<template #header>{{ i18n.ts._widgets.todo }}</template>

	<div class="todo-container">
		<ul>
			<li v-for="(todo, index) in todos" :key="index">
				{{ todo }}
				<MkButton @click="completeTask(index)">{{ i18n.ts._widgets.complete }}</MkButton>
			</li>
		</ul>
		<div class="input-container">
			<MkInput v-model="newTodo" :placeholder="i18n.ts._widgets.addNewTodo"/>
			<MkButton @click="addTodo">{{ i18n.ts._widgets.addTodo }}</MkButton>
		</div>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { GetFormResultType } from '@/utility/form.js';
import MkContainer from '@/components/MkContainer.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import { i18n } from '@/i18n.js';
import { store } from '@/store.js';

const name = 'todo';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		default: true,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name, widgetPropsDef, props, emit);

const todos = ref<string[]>(store.s.todos || []);
const newTodo = ref<string>('');

const loadTodos = () => {
	todos.value = store.s.todos || [];
};

const saveTodos = () => {
	store.set('todos', todos.value);
};

const addTodo = () => {
	if (newTodo.value.trim()) {
		todos.value.push(newTodo.value.trim());
		newTodo.value = '';
		saveTodos();
	}
};

const completeTask = (index: number) => {
	todos.value.splice(index, 1);
	saveTodos();
};

onMounted(() => {
	loadTodos();
});

// storeの値の変更を監視
watch(() => store.r.todos, newTodos => {
	if (newTodos.value) {
		todos.value = newTodos.value;
	}
});

const widgetId = computed(() => props.widget ? props.widget.id : null);

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: widgetId.value,
});
</script>

<style lang="scss" scoped>
.todo-container {
	text-align: left;
	padding: 16px;

	ul {
		list-style: none;
		padding: 0;

		li {
			display: flex;
			justify-content: space-between;
			padding: 8px 0;
			border-bottom: 1px solid var(--MI_THEME-divider);

			.MkButton {
				margin-left: 8px;
			}
		}
	}

	.input-container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 16px;

		.MkInput {
			width: 70%;
			margin-right: 8px;
		}

		.MkButton {
			padding: 8px 16px;
		}
	}
}
</style>
