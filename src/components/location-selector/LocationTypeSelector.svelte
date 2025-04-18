<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { Building2, Home, ChevronRight, UserCircle } from 'lucide-svelte';
  import { navigationStore } from '$lib/stores/navigation';

  export let showBackButton = false;
  export let isLoggedIn = false;
  
  const dispatch = createEventDispatcher<{
    select: { type: 'in-office' | 'in-home' };
    back: void;
    login: void;
  }>();

  // Set up navigation controls
  $: {
    console.log('LocationTypeSelector: Setting navigation state', {
      showBack: showBackButton,
      showNext: false,
      stepName: 'Select Location Type'
    });
    
    navigationStore.setNavigation({
      showBack: showBackButton,
      showNext: false,
      stepName: 'Select Location Type',
      onBack: () => dispatch('back')
    });
  }

  // We don't need to reset navigation here since each component
  // is responsible for setting its own navigation state
  // onDestroy(() => {
  //   console.log('LocationTypeSelector: Cleaning up navigation');
  //   navigationStore.reset();
  // });

  const handleSelection = (type: 'in-office' | 'in-home') => {
    dispatch('select', { type });
  };
</script>

<div class="space-y-6">
  <!-- {#if !isLoggedIn}
    <div class="flex justify-end">
      <button 
        class="text-gray-500 hover:text-[rgb(var(--color-primary))] transition-colors flex items-center text-sm gap-1 py-1 px-2 rounded-full hover:bg-[rgb(var(--color-primary))]  hover:bg-opacity-5"
        on:click={() => dispatch('login')}
      >
        <UserCircle class="w-4 h-4" />
        <span>Sign in</span>
      </button>
    </div>
  {/if} -->
  
  {#if showBackButton}
    <button 
      class="text-[rgb(var(--color-primary))] font-medium flex items-center"
      on:click={() => dispatch('back')}
    >
      <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  {/if}

  <div class="grid gap-4">
    <button
      class="p-6 border-2 border-gray-200 rounded-lg hover:border-[rgb(var(--color-primary))] transition-colors flex items-center justify-between"
      on:click={() => handleSelection('in-office')}
    >
      <div class="flex items-center">
        <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-3 rounded-full mr-4">
          <Building2 class="w-6 h-6 text-white" />
        </div>
        <div class="text-left">
          <h3 class="font-medium text-gray-900">Visit Our Location</h3>
          <p class="text-sm text-gray-500">Get your massage at one of our facilities</p>
        </div>
      </div>
      <ChevronRight class="w-5 h-5 text-gray-400" />
    </button>

    <button
      class="p-6 border-2 border-gray-200 rounded-lg hover:border-[rgb(var(--color-primary))] transition-colors flex items-center justify-between"
      on:click={() => handleSelection('in-home')}
    >
      <div class="flex items-center">
        <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-3 rounded-full mr-4">
          <Home class="w-6 h-6 text-white" />
        </div>
        <div class="text-left">
          <h3 class="font-medium text-gray-900">In-Home Service</h3>
          <p class="text-sm text-gray-500">We'll come to your location</p>
        </div>
      </div>
      <ChevronRight class="w-5 h-5 text-gray-400" />
    </button>
  </div>

  {#if !isLoggedIn}
    <div class="text-center pt-4 mt-4 border-t border-gray-100">
      <p class="text-sm text-gray-500">
        Returning client? 
        <button 
          class="text-[rgb(var(--color-primary))] font-medium hover:underline inline-flex items-center gap-1 underline"
          on:click={() => dispatch('login')}
        >
          Sign in for faster booking
          <ChevronRight class="w-3 h-3" />
        </button>
      </p>
    </div>
  {/if}
</div> 