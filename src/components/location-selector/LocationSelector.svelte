<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import type { Coordinates, Location } from '$lib/utils/location';
  import LocationRequest from './LocationRequest.svelte';
  import LocationTypeSelector from './LocationTypeSelector.svelte';
  import LocationSearch from './LocationSearch.svelte';
  import AddressConfirmation from './AddressConfirmation.svelte';
  import { navigationStore } from '$lib/stores/navigation';

  export let initialCoordinates: Coordinates | null = null;
  export let showBackButton = false;
  export let previousView: 'location-selector' | 'location-search' = 'location-selector';
  export let selectedServiceType: 'in-office' | 'in-home' | null = null;

  const dispatch = createEventDispatcher<{
    complete: {
      serviceType: 'in-office' | 'in-home';
      location: Location;
    };
    confirm: void;
    back: void;
  }>();

  // Flow states
  type FlowState = 
    | 'requesting-location'
    | 'selecting-location-type'
    | 'searching-location'
    | 'confirming-address';

  let currentState: FlowState = 'requesting-location';
  let userCoordinates: Coordinates | null = null;
  let serviceType: 'in-office' | 'in-home' | null = null;
  let selectedLocation: Location | null = null;

  // Only transition to service type selection if we have coordinates
  $: if (initialCoordinates && currentState === 'requesting-location') {
    userCoordinates = initialCoordinates;
    currentState = 'selecting-location-type';
  }

  // If we're coming back from the service selection page, go directly to the location search
  $: if (previousView === 'location-search') {
    currentState = 'searching-location';
    // Use the previously selected service type
    serviceType = selectedServiceType;
  }

  const handleLocationGranted = (event: CustomEvent<Coordinates>) => {
    userCoordinates = event.detail;
    currentState = 'selecting-location-type';
  };

  const handleLocationDenied = () => {
    // Stay in requesting-location state if denied
    currentState = 'selecting-location-type';
  };

  const handleServiceTypeSelect = (event: CustomEvent<{ type: 'in-office' | 'in-home' }>) => {
    serviceType = event.detail.type;
    currentState = 'searching-location';
  };

  const handleLocationSelect = (event: CustomEvent<{ location: Location }>) => {
    selectedLocation = event.detail.location;
    if (serviceType === 'in-home') {
      currentState = 'confirming-address';
    } else {
      // For in-office, we'll wait for the next event to complete
      // The next event will be triggered by the Confirm Location button
    }
  };

  const handleLocationNext = () => {
    if (serviceType === 'in-office' && selectedLocation) {
      dispatch('complete', { 
        serviceType: serviceType,
        location: selectedLocation
      });
    }
  };

  const handleAddressConfirmed = (event: CustomEvent<{ location: Location }>) => {
    selectedLocation = event.detail.location;
    dispatch('complete', { 
      serviceType: serviceType!,
      location: selectedLocation
    });
  };

  const handleBack = () => {
    switch (currentState) {
      case 'selecting-location-type':
        currentState = 'requesting-location';
        break;
      case 'searching-location':
        currentState = 'selecting-location-type';
        break;
      case 'confirming-address':
        currentState = 'searching-location';
        break;
    }
  };

  // We don't need to reset navigation here since each child component
  // is responsible for setting its own navigation state
  // onDestroy(() => {
  //   console.log('LocationSelector: Cleaning up navigation');
  //   navigationStore.reset();
  // });
</script>

<div class="min-h-screen bg-white">
  <!-- Main Content -->
  <main class="pt-20 px-4 pb-8">
    {#if currentState === 'requesting-location'}
      <LocationRequest
        on:locationGranted={handleLocationGranted}
        on:locationDenied={handleLocationDenied}
      />
    {:else if currentState === 'selecting-location-type'}
      <LocationTypeSelector
        showBackButton={false}
        on:select={handleServiceTypeSelect}
        on:back={handleBack}
      />
    {:else if currentState === 'searching-location'}
      <LocationSearch
        userCoordinates={userCoordinates}
        serviceType={serviceType}
        showBackButton={true}
        on:select={handleLocationSelect}
        on:back={handleBack}
        on:next={handleLocationNext}
      />
    {:else if currentState === 'confirming-address' && selectedLocation}
      <AddressConfirmation
        location={selectedLocation}
        showBackButton={true}
        on:confirm={handleAddressConfirmed}
        on:back={handleBack}
      />
    {/if}
  </main>
</div> 