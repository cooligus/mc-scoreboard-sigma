<script>
	import { ArrowRight, Code, Zap, Shield, Users, FileText, Download, Play } from 'lucide-svelte';
	import { base } from '$app/paths';
	import Navbar from '$lib/components/Navbar.svelte';
	const navbarButtons = [
		{ label: 'Features', href: '#features', variant: 'ghost' },
		{ label: 'How it Works', href: '#how-it-works', variant: 'ghost' },
		{ label: 'Get Started', href: `${base}/app`, icon: ArrowRight, variant: 'success' }
	];
</script>

<div
	class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
>
	<!-- Navigation -->
	<Navbar buttons={navbarButtons} />

	<!-- Hero Section -->
	<section class="px-4 py-20">
		<div class="container mx-auto text-center">
			<div class="mx-auto max-w-4xl">
				<h1 class="mb-6 text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
					Create Minecraft
					<span class="text-green-600 dark:text-green-400">Dialogue Scripts</span>
					with Ease
				</h1>
				<p class="mb-8 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
					Transform your plain text conversations into professional mcfunction scripts for Minecraft
					Java Edition datapacks.
				</p>
				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<a
						href="{base}/app"
						class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
					>
						<Play class="h-5 w-5" />
						Start Creating
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Example Section -->
	<section class="bg-white/50 px-4 py-16 dark:bg-gray-900/60">
		<div class="container mx-auto">
			<div class="mx-auto max-w-6xl">
				<h2 class="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
					From Simple Text to Minecraft Code
				</h2>
				<div class="grid items-center gap-8 md:grid-cols-2">
					<div>
						<h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
							Write Simple Dialogue
						</h3>
						<div class="rounded-lg bg-gray-900 p-6 font-mono text-sm text-green-400">
							<div class="text-gray-500 dark:text-gray-400"># Plain text format</div>
							<div>J: what's up?</div>
							<div>Jo: Idk</div>
							<div>J: kk</div>
						</div>
					</div>
					<div>
						<h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
							Get Professional McFunction
						</h3>
						<div class="rounded-lg bg-gray-900 p-6 font-mono text-sm text-green-400">
							<div class="text-gray-500 dark:text-gray-400"># mcfunction format</div>
							<div>scoreboard players add @s dialogue 1</div>
							<div>
								execute if score @s dialogue matches 0 run function characters:josh {`{Line: "what's up?"}`}
							</div>
							<div>
								execute if score @s dialogue matches 1 run function characters:john {`{Line: "Idk"}`}
							</div>
							<div>
								execute if score @s dialogue matches 2 run function characters:josh {`{Line: "kk"}`}
							</div>
							<div>
								execute if score @s dialogue matches 3.. run scoreboard players set @s dialogue -1
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="px-4 py-20">
		<div class="container mx-auto">
			<div class="mx-auto max-w-6xl">
				<h2 class="mb-16 text-center text-4xl font-bold text-gray-900 dark:text-white">
					Powerful Features
				</h2>
				<div class="grid gap-8 md:grid-cols-3">
					<div class="p-6 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
						>
							<Users class="h-8 w-8 text-green-600 dark:text-green-400" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
							User Management
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Create and manage characters with custom names and prefixes for easy dialogue
							recognition.
						</p>
					</div>
					<div class="p-6 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
						>
							<Code class="h-8 w-8 text-blue-600 dark:text-blue-400" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
							Dual Import Modes
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Import from simple plain text or existing mcfunction code. We handle the conversion
							automatically.
						</p>
					</div>
					<div class="p-6 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
						>
							<Zap class="h-8 w-8 text-purple-600 dark:text-purple-400" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
							Live Preview
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							See how your dialogue will look in-game with our interactive preview mode.
						</p>
					</div>
					<div class="p-6 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
						>
							<FileText class="h-8 w-8 text-red-600 dark:text-red-400" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
							Swappable lines
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							This graphical editor allows you to swap lines between characters.
						</p>
					</div>
					<div class="p-6 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900"
						>
							<Download class="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">Easy Export</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Copy your scripts in mcfunction formatready for your Minecraft datapacks.
						</p>
					</div>
					<div class="p-6 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900"
						>
							<Shield class="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
							No Installation
						</h3>
						<p class="text-gray-600 dark:text-gray-300">
							Works entirely in your browser. No downloads, no setup, just start creating!
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section id="how-it-works" class="bg-white/50 px-4 py-20 dark:bg-gray-900/60">
		<div class="container mx-auto">
			<div class="mx-auto max-w-4xl">
				<h2 class="mb-16 text-center text-4xl font-bold text-gray-900 dark:text-white">
					How It Works
				</h2>
				<div class="space-y-12">
					<div class="flex items-center gap-8">
						<div
							class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white dark:bg-green-500"
						>
							1
						</div>
						<div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
								Create Your Characters
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Add users with names and unique prefixes (e.g., Josh with prefix "J", John with
								prefix "Jo").
							</p>
						</div>
					</div>
					<div class="flex items-center gap-8">
						<div
							class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white dark:bg-green-500"
						>
							2
						</div>
						<div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
								Write Your Dialogue
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Use simple format like "J: Hello there!" or import existing mcfunction code.
							</p>
						</div>
					</div>
					<div class="flex items-center gap-8">
						<div
							class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white dark:bg-green-500"
						>
							3
						</div>
						<div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
								Preview & Edit
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								See how your dialogue looks in-game and make adjustments in the built-in editor.
							</p>
						</div>
					</div>
					<div class="flex items-center gap-8">
						<div
							class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white dark:bg-green-500"
						>
							4
						</div>
						<div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
								Export & Use
							</h3>
							<p class="text-gray-600 dark:text-gray-300">
								Download your .mcfunction file and add it to your Minecraft datapack!
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section
		class="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-20 dark:from-green-800 dark:to-emerald-900"
	>
		<div class="container mx-auto text-center">
			<div class="mx-auto max-w-3xl">
				<h2 class="mb-6 text-4xl font-bold text-white">Ready to Create Amazing Dialogue?</h2>
				<p class="mb-8 text-xl text-green-100 dark:text-green-200">
					Just stop thinking and hit the button below.
				</p>
				<a
					href="{base}/app"
					class="mx-auto flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-green-600 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:text-green-400 dark:hover:bg-gray-800"
				>
					Start Creating Now
					<ArrowRight class="h-5 w-5" />
				</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 px-4 py-12 text-white dark:bg-black">
		<div class="container mx-auto">
			<div class="mx-auto max-w-6xl">
				<div class="dark:text-white-900 text-center text-gray-400">
					<p>Made with ❤️ for God and His Holy Mother</p>
				</div>
			</div>
		</div>
	</footer>
</div>
