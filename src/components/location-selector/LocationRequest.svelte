<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getCurrentLocation } from '$lib/utils/location';
  import { MapPin } from 'lucide-svelte';

  export let showBackButton = false;

  const dispatch = createEventDispatcher<{
    locationGranted: { latitude: number; longitude: number };
    locationDenied: void;
    back: void;
  }>();

  const handleLocationRequest = async () => {
    try {
      const coords = await getCurrentLocation();
      dispatch('locationGranted', coords);
    } catch (error) {
      // Handle both "denied" and "never allow" cases
      dispatch('locationDenied');
    }
  };

  const handleSkip = () => {
    dispatch('locationDenied');
  };

  // Automatically request location access when component mounts
  onMount(() => {
    // Check if permission is already denied
    navigator.permissions?.query({ name: 'geolocation' }).then(permissionStatus => {
      if (permissionStatus.state === 'denied') {
        // If already denied, dispatch locationDenied event
        dispatch('locationDenied');
      } else {
        // Otherwise try to get location
        handleLocationRequest();
      }
    }).catch(() => {
      // If permissions API is not supported, try to get location anyway
      handleLocationRequest();
    });
  });
</script>

<div class="space-y-6">
  <!-- Back Button -->
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

  <div class="text-center">
    <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-4 rounded-full inline-block mx-auto">
      <MapPin class="w-8 h-8 text-white" />
    </div>
    
    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Share Your Location</h2>
      <p class="text-gray-600">Allow us to find the nearest massage locations or provide in-home service to your area</p>
    </div>

    <div class="mt-6 space-y-3">
      <button
        class="btn-primary w-full"
        on:click={handleLocationRequest}
      >
        Allow Location Access
      </button>
      <button
        class="text-gray-600 font-medium w-full border border-[rgb(var(--color-primary))] rounded-md p-2"
        on:click={handleSkip}
      >
        Skip for now
      </button>
    </div>
  </div>
</div> 