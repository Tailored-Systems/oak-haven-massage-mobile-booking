<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { navigationStore } from '$lib/stores/navigation';

  export let address: string;
  export let showBackButton = false;
  const dispatch = createEventDispatcher<{
    confirm: void;
    back: void;
  }>();

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: showBackButton,
      showNext: true,
      stepName: 'Confirm Your Address',
      onBack: () => dispatch('back'),
      onNext: () => dispatch('confirm')
    });
  }

  // Clean up navigation on component destroy
  onDestroy(() => {
    navigationStore.reset();
  });
</script>

<div class="space-y-6">

  <div class="p-4 bg-gray-50 rounded-lg">
    <p class="text-gray-700">{address}</p>
  </div>

  <p class="text-sm text-gray-500">
    Please confirm that this is the correct address where you'd like to receive the service.
  </p>
</div> 