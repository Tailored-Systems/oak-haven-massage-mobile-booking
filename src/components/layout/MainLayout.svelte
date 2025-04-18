<script lang="ts">
  import { Menu, X } from 'lucide-svelte';
  import { navigationStore } from '$lib/stores/navigation';
  
  export let showMenu = true;
  
  let isMenuOpen = false;
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  // Debug navigation state
  $: {
    console.log('MainLayout: Navigation state', $navigationStore);
  }
</script>

<div class="min-h-screen flex flex-col bg-white">
  <header class="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
    <!-- Top row with logo and menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="w-40">
          <img 
            src="/images/oak-haven-logo.svg" 
            alt="Oak Haven Massage Therapy" 
            class="h-auto w-full"
          />
        </div>

        <!-- Hamburger Menu Button -->
        {#if showMenu}
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(var(--color-primary))]"
            on:click={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Main menu"
          >
            <Menu class="h-6 w-6" />
          </button>
        {/if}
      </div>
    </div>

    <!-- Navigation row with back/next and step name -->
    {#if $navigationStore.showBack || $navigationStore.showNext || $navigationStore.showBookButton || $navigationStore.stepName}
      <div class="border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Back button -->
            <div class="w-24">
              {#if $navigationStore.showBack}
                <button 
                  class="text-[rgb(var(--color-primary))] font-medium flex items-center"
                  on:click={$navigationStore.onBack}
                >
                  <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              {/if}
            </div>

            <!-- Step name -->
            <div class="text-center font-medium text-2xl text-gray-900">
              {$navigationStore.stepName}
            </div>

            <!-- Next button -->
            <div class="w-24 text-right">
              {#if $navigationStore.showNext}
                <button 
                  class="text-[rgb(var(--color-primary))] font-medium flex items-center ml-auto"
                  on:click={$navigationStore.onNext}
                >
                  Next
                  <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              {:else if $navigationStore.showBookButton}
                <button 
                  class="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center ml-auto"
                  on:click={$navigationStore.onBook}
                >
                  Book
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </header>

  <!-- Menu Overlay -->
  {#if isMenuOpen}
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 z-50" 
      on:click={closeMenu}
      aria-hidden="true"
    >
    </div>
    <div 
      class="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 p-4 transform transition-transform duration-200 ease-in-out"
      class:translate-x-0={isMenuOpen}
      class:-translate-x-full={!isMenuOpen}
    >
      <button 
        class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
        on:click={closeMenu}
        aria-label="Close menu"
      >
        <X class="w-6 h-6" />
      </button>
      <div class="mt-12">
        <h2 class="text-xl font-semibold mb-4">Menu</h2>
        <nav>
          <ul class="space-y-2">
            <li>
              <a 
                href="/" 
                class="block py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                on:click={closeMenu}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="/services" 
                class="block py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                on:click={closeMenu}
              >
                Services
              </a>
            </li>
            <li>
              <a 
                href="/about" 
                class="block py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                on:click={closeMenu}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="/contact" 
                class="block py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                on:click={closeMenu}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <main class="flex-1 mt-28">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <slot />
    </div>
  </main>
</div> 