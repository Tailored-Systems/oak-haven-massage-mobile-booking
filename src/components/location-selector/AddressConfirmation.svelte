<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { Location } from '$lib/utils/location';
  import { MapPin } from 'lucide-svelte';
  import { navigationStore } from '$lib/stores/navigation';

  export let location: Location;
  export let showBackButton = false;

  const dispatch = createEventDispatcher<{
    confirm: { location: Location };
    back: void;
  }>();

  // Set up navigation controls
  $: {
    console.log('AddressConfirmation: Setting navigation state', {
      showBack: showBackButton,
      showNext: false,
      stepName: 'Confirm Your Address'
    });
    
    navigationStore.setNavigation({
      showBack: showBackButton,
      showNext: false,
      stepName: 'Confirm Your Address',
      onBack: () => dispatch('back')
    });
  }

  // We don't need to reset navigation here since each component
  // is responsible for setting its own navigation state
  // onDestroy(() => {
  //   console.log('AddressConfirmation: Cleaning up navigation');
  //   navigationStore.reset();
  // });

  const handleConfirm = () => {
    dispatch('confirm', { location });
  };
</script>

<div class="space-y-6">
  <div class="text-center">
    <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-4 rounded-full inline-block mx-auto">
      <MapPin class="w-8 h-8 text-white" />
    </div>
    
    <div class="mt-6">
      <p class="text-gray-600">Please verify that this is the correct address for your in-home massage service</p>
    </div>

    <div class="mt-6 p-4 border border-gray-200 rounded-lg">
      <p class="text-gray-900 font-medium">{location.address}</p>
    </div>

    <div class="mt-6">
      <button
        class="btn-primary w-full"
        on:click={handleConfirm}
      >
        Confirm Address
      </button>
    </div>
  </div>
</div> 