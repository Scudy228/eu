<template>
	<div class="space-y-2">
		<div
			class="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden cursor-crosshair"
			style="height: 120px;"
		>
			<canvas
				ref="canvasRef"
				class="w-full h-full touch-none"
				@mousedown="startDrawing"
				@mousemove="draw"
				@mouseup="stopDrawing"
				@mouseleave="stopDrawing"
				@touchstart.prevent="startDrawingTouch"
				@touchmove.prevent="drawTouch"
				@touchend="stopDrawing"
			/>
			<div
				v-if="!hasSignature"
				class="absolute inset-0 flex items-center justify-center pointer-events-none"
			>
				<span class="text-sm text-slate-400 font-medium">Dessinez votre signature ici</span>
			</div>
		</div>
		<button
			type="button"
			class="text-sm text-red-500 hover:text-red-700 font-semibold underline transition-colors"
			@click="clearSignature"
		>
			Effacer la signature
		</button>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{ modelValue?: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const hasSignature = ref(false);
let lastX = 0;
let lastY = 0;

onMounted(() => {
	const canvas = canvasRef.value;
	if (!canvas) return;
	canvas.width = 600;
	canvas.height = 150;
	if (props.modelValue) {
		const img = new Image();
		img.onload = () => {
			const ctx = canvas.getContext('2d');
			ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
		};
		img.src = props.modelValue;
		hasSignature.value = true;
	}
});

const getCtx = () => {
	const canvas = canvasRef.value;
	if (!canvas) return null;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.strokeStyle = '#003399';
	ctx.lineWidth = 2.5;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	return ctx;
};

const getPos = (e: MouseEvent) => {
	const canvas = canvasRef.value!;
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	return {
		x: (e.clientX - rect.left) * scaleX,
		y: (e.clientY - rect.top) * scaleY
	};
};

const getTouchPos = (e: TouchEvent) => {
	const canvas = canvasRef.value!;
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const touch = e.touches[0]!;
	return {
		x: (touch.clientX - rect.left) * scaleX,
		y: (touch.clientY - rect.top) * scaleY
	};
};

const startDrawing = (e: MouseEvent) => {
	const pos = getPos(e);
	lastX = pos.x;
	lastY = pos.y;
	isDrawing.value = true;
};

const draw = (e: MouseEvent) => {
	if (!isDrawing.value) return;
	const ctx = getCtx();
	if (!ctx) return;
	const pos = getPos(e);
	ctx.beginPath();
	ctx.moveTo(lastX, lastY);
	ctx.lineTo(pos.x, pos.y);
	ctx.stroke();
	lastX = pos.x;
	lastY = pos.y;
	hasSignature.value = true;
};

const startDrawingTouch = (e: TouchEvent) => {
	const pos = getTouchPos(e);
	lastX = pos.x;
	lastY = pos.y;
	isDrawing.value = true;
};

const drawTouch = (e: TouchEvent) => {
	if (!isDrawing.value) return;
	const ctx = getCtx();
	if (!ctx) return;
	const pos = getTouchPos(e);
	ctx.beginPath();
	ctx.moveTo(lastX, lastY);
	ctx.lineTo(pos.x, pos.y);
	ctx.stroke();
	lastX = pos.x;
	lastY = pos.y;
	hasSignature.value = true;
};

const stopDrawing = () => {
	if (!isDrawing.value) return;
	isDrawing.value = false;
	const canvas = canvasRef.value;
	if (canvas && hasSignature.value) {
		emit('update:modelValue', canvas.toDataURL('image/png'));
	}
};

const clearSignature = () => {
	const canvas = canvasRef.value;
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	ctx?.clearRect(0, 0, canvas.width, canvas.height);
	hasSignature.value = false;
	emit('update:modelValue', null);
};
</script>
