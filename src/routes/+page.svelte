<script>
	import { ArrowRight, Code, Zap, Shield, Users, FileText, Download, Play } from 'lucide-svelte';
	import { base } from '$app/paths';
  </script>
  
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
	<!-- Navigation -->
	<nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-100 dark:border-gray-800 sticky top-0 z-40">
	  <div class="container mx-auto px-4 py-4">
		<div class="flex justify-between items-center">
		  <img src="{base}/favicon.svg" alt="Logo" class="w-24" />
		  <div class="flex items-center space-x-4">
			<a href="#features" class="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">Features</a>
			<a href="#how-it-works" class="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">How it Works</a>
			<a
			  class="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2"
		  	  href="/app"
			>
			  Get Started
			  <ArrowRight class="w-4 h-4" />
		    </a>
		  </div>
		</div>
	  </div>
	</nav>
  
	<!-- Hero Section -->
	<section class="py-20 px-4">
	  <div class="container mx-auto text-center">
		<div class="max-w-4xl mx-auto">
		  <h1 class="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
			Create Minecraft
			<span class="text-green-600 dark:text-green-400">Dialogue Scripts</span>
			with Ease
		  </h1>
		  <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
			Transform your plain text conversations into professional mcfunction scripts for Minecraft Java Edition datapacks. 
		  </p>
		  <div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a
		  	  href="/app"
			  class="px-8 py-4 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
			>
			  <Play class="w-5 h-5" />
			  Start Creating
		    </a>
		  </div>
		</div>
	  </div>
	</section>
  
	<!-- Example Section -->
	<section class="py-16 px-4 bg-white/50 dark:bg-gray-900/60">
	  <div class="container mx-auto">
		<div class="max-w-6xl mx-auto">
		  <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">From Simple Text to Minecraft Code</h2>
		  <div class="grid md:grid-cols-2 gap-8 items-center">
			<div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Write Simple Dialogue</h3>
			  <div class="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
				<div class="text-gray-500 dark:text-gray-400"># Plain text format</div>
				<div>J: what's up?</div>
				<div>Jo: Idk</div>
				<div>J: kk</div>
			  </div>
			</div>
			<div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Get Professional McFunction</h3>
			  <div class="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
				<div class="text-gray-500 dark:text-gray-400"># mcfunction format</div>
				<div>scoreboard players add @s dialogue 1</div>
				<div>execute if score @s dialogue matches 0 run function characters:josh {`{Line: "what's up?"}`}</div>
				<div>execute if score @s dialogue matches 1 run function characters:john {`{Line: "Idk"}`}</div>
				<div>execute if score @s dialogue matches 2 run function characters:josh {`{Line: "kk"}`}</div>
				<div>execute if score @s dialogue matches 3.. run scoreboard players set @s dialogue -1</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</section>
  
	<!-- Features Section -->
	<section id="features" class="py-20 px-4">
	  <div class="container mx-auto">
		<div class="max-w-6xl mx-auto">
		  <h2 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">Powerful Features</h2>
		  <div class="grid md:grid-cols-3 gap-8">
			<div class="text-center p-6">
			  <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
				<Users class="w-8 h-8 text-green-600 dark:text-green-400" />
			  </div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">User Management</h3>
			  <p class="text-gray-600 dark:text-gray-300">Create and manage characters with custom names and prefixes for easy dialogue recognition.</p>
			</div>
			<div class="text-center p-6">
			  <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
				<Code class="w-8 h-8 text-blue-600 dark:text-blue-400" />
			  </div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Dual Import Modes</h3>
			  <p class="text-gray-600 dark:text-gray-300">Import from simple plain text or existing mcfunction code. We handle the conversion automatically.</p>
			</div>
			<div class="text-center p-6">
			  <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
				<Zap class="w-8 h-8 text-purple-600 dark:text-purple-400" />
			  </div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Live Preview</h3>
			  <p class="text-gray-600 dark:text-gray-300">See how your dialogue will look in-game with our interactive preview mode.</p>
			</div>
			<div class="text-center p-6">
			  <div class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
				<FileText class="w-8 h-8 text-red-600 dark:text-red-400" />
			  </div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Swappable lines</h3>
			  <p class="text-gray-600 dark:text-gray-300">This graphical editor allows you to swap lines between characters.</p>
			</div>
			<div class="text-center p-6">
			  <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
				<Download class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
			  </div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Easy Export</h3>
			  <p class="text-gray-600 dark:text-gray-300">Copy your scripts in mcfunction formatready for your Minecraft datapacks.</p>
			</div>
			<div class="text-center p-6">
			  <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
				<Shield class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
			  </div>
			  <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">No Installation</h3>
			  <p class="text-gray-600 dark:text-gray-300">Works entirely in your browser. No downloads, no setup, just start creating!</p>
			</div>
		  </div>
		</div>
	  </div>
	</section>
  
	<!-- How It Works Section -->
	<section id="how-it-works" class="py-20 px-4 bg-white/50 dark:bg-gray-900/60">
	  <div class="container mx-auto">
		<div class="max-w-4xl mx-auto">
		  <h2 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">How It Works</h2>
		  <div class="space-y-12">
			<div class="flex items-center gap-8">
			  <div class="w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
				1
			  </div>
			  <div>
				<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Create Your Characters</h3>
				<p class="text-gray-600 dark:text-gray-300">Add users with names and unique prefixes (e.g., Josh with prefix "J", John with prefix "Jo").</p>
			  </div>
			</div>
			<div class="flex items-center gap-8">
			  <div class="w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
				2
			  </div>
			  <div>
				<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Write Your Dialogue</h3>
				<p class="text-gray-600 dark:text-gray-300">Use simple format like "J: Hello there!" or import existing mcfunction code.</p>
			  </div>
			</div>
			<div class="flex items-center gap-8">
			  <div class="w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
				3
			  </div>
			  <div>
				<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Preview & Edit</h3>
				<p class="text-gray-600 dark:text-gray-300">See how your dialogue looks in-game and make adjustments in the built-in editor.</p>
			  </div>
			</div>
			<div class="flex items-center gap-8">
			  <div class="w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
				4
			  </div>
			  <div>
				<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Export & Use</h3>
				<p class="text-gray-600 dark:text-gray-300">Download your .mcfunction file and add it to your Minecraft datapack!</p>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</section>
  
	<!-- CTA Section -->
	<section class="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-800 dark:to-emerald-900">
	  <div class="container mx-auto text-center">
		<div class="max-w-3xl mx-auto">
		  <h2 class="text-4xl font-bold text-white mb-6">Ready to Create Amazing Dialogue?</h2>
		  <p class="text-xl text-green-100 dark:text-green-200 mb-8">
			Just stop thinking and hit the button below.	
		  </p>
		  <a
		  	href="/app"
			class="px-8 py-4 bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-lg font-semibold mx-auto"
		  >
			Start Creating Now
			<ArrowRight class="w-5 h-5" />
			</a>
		</div>
	  </div>
	</section>
  
	<!-- Footer -->
	<footer class="py-12 px-4 bg-gray-900 dark:bg-black text-white">
	  <div class="container mx-auto">
		<div class="max-w-6xl mx-auto">
		  <div class="text-center text-gray-400 dark:text-white-900">
			<p>Made with ❤️ for God and His Holy Mother</p>
		  </div>
		</div>
	  </div>
	</footer>
</div>
  