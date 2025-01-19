<template>
<MkContainer :showHeader="widgetProps.showHeader" data-cy-mkw-todo class="mkw-todo">
	<template #icon><i class="ti ti-checklist"></i></template>
	<template #header>{{ i18n.ts._widgets.todo }}</template>

	<div class="todo-container">
		<ul>
			<li v-for="(todo, index) in todos" :key="index">
				{{ todo }}
				<button @click="completeTask(index)">{{ i18n.ts._widgets.complete }}</button>
			</li>
		</ul>
		<input v-model="newTodo" :placeholder="i18n.ts._widgets.addNewTodo" />
		<button @click="addTodo">{{ i18n.ts._widgets.addTodo }}</button>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useWidgetPropsManager, WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import { GetFormResultType } from '@/scripts/form.js';
import MkContainer from '@/components/MkContainer.vue';
import { i18n } from '@/i18n.js';

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

const todos = ref<string[]>([]);
const newTodo = ref<string>('');

const loadTodos = () => {
	const savedTodos = localStorage.getItem('todos');
	if (savedTodos) {
		todos.value = JSON.parse(savedTodos);
	}
};

const saveTodos = () => {
	localStorage.setItem('todos', JSON.stringify(todos.value));
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

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
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

			button {
				background: var(--MI_THEME-primary);
				color: white;
				border: none;
				border-radius: 4px;
				padding: 4px 8px;
				cursor: pointer;

				&:hover {
					background: var(--MI_THEME-primary-dark);
				}
			}
		}
	}

	input {
		width: calc(100% - 100px);
		padding: 8px;
		margin-right: 8px;
		border: 1px solid var(--MI_THEME-divider);
		border-radius: 4px;
	}

	button {
		background: var(--MI_THEME-primary);
		color: white;
		border: none;
		border-radius: 4px;
		padding: 8px 16px;
		cursor: pointer;

		&:hover {
			background: var(--MI_THEME-primary-dark);
		}
	}
}
</style>
