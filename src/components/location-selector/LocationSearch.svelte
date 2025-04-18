<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import type { Coordinates, Location } from '$lib/utils/location';
  import { calculateDistance } from '$lib/utils/location';
  import { Search, MapPin, Clock } from 'lucide-svelte';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import { navigationStore } from '$lib/stores/navigation';

  // Use environment variable for Mapbox access token
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  export let userCoordinates: Coordinates | null = null;
  export let serviceType: 'in-office' | 'in-home' | null = null;
  export let showBackButton = false;
  export let showNextButton = false;
  const dispatch = createEventDispatcher<{
    select: { location: Location };
    back: void;
    next: void;
  }>();

  // Set up navigation controls
  $: {
    console.log('LocationSearch: Setting navigation state', {
      showBack: showBackButton,
      showNext: showNextButton,
      serviceType,
      stepName: serviceType === 'in-home' ? 'Confirm Your Address' : 'Select Location'
    });
    
    navigationStore.setNavigation({
      showBack: showBackButton,
      showNext: showNextButton,
      stepName: serviceType === 'in-home' ? 'Confirm Your Address' : 'Select Location',
      onBack: () => dispatch('back'),
      onNext: () => dispatch('next')
    });
  }

  let searchQuery = '';
  let isSearching = false;
  let locations: Location[] = [];
  let nearestLocation: Location | null = null;
  let map: mapboxgl.Map | null = null;
  let mapContainer: HTMLDivElement;
  let selectedLocation: Location | null = null;
  let markers: mapboxgl.Marker[] = [];

  // Mock data - replace with actual API call
  const mockLocations: Location[] = [
    {
      "name": "Alamo Heights",
      "address": "4400 Broadway, San Antonio, Texas 78209, United States",
      "coordinates": {
        "latitude": 29.466969,
        "longitude": -98.463294
      }
    },
    {
      "name": "Bulverde",
      "address": "22103 Bulverde Road, San Antonio, Texas 78259, United States",
      "coordinates": {
        "latitude": 29.64607,
        "longitude": -98.427492
      }
    },
    {
      "name": "Huebner",
      "address": "15502 Huebner Road, San Antonio, Texas 78248, United States",
      "coordinates": {
        "latitude": 29.584433,
        "longitude": -98.534005
      }
    },
    {
      "name": "620 - Pecan Park",
      "address": "12809 Rm 620, Austin, Texas 78750, United States",
      "coordinates": {
        "latitude": 30.460545,
        "longitude": -97.820454
      }
    }
  ];

  $: {
    if (userCoordinates) {
      const locationsWithDistance = mockLocations.map(loc => ({
        ...loc,
        distance: calculateDistance(userCoordinates, loc.coordinates)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      nearestLocation = locationsWithDistance[0];
      locations = locationsWithDistance;
      
      // Pre-select the nearest location if no location is selected yet
      if (!selectedLocation && nearestLocation) {
        selectedLocation = nearestLocation;
        // Dispatch the selection event
        dispatch('select', { location: nearestLocation });
      }
    } else {
      locations = mockLocations;
      nearestLocation = null;
    }
  }

  const handleSearch = async () => {
    isSearching = true;
    // TODO: Implement actual search functionality
    // For now, just filter mock data
    locations = mockLocations.filter(loc => 
      loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    isSearching = false;
  };

  const handleLocationSelect = (location: Location) => {
    selectedLocation = location;
    dispatch('select', { location });
    updateMapMarkers();
    centerMapOnSelection();
  };

  const initializeMap = () => {
    if (!mapContainer) return;

    // Initialize map with a closer zoom
    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userCoordinates ? [userCoordinates.longitude, userCoordinates.latitude] : [-98.4934, 29.4579],
      zoom: 20
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for map to load before adding markers
    map.on('load', () => {
      updateMapMarkers();
      
      // If we have user coordinates, zoom out to show ~100 mile radius
      if (userCoordinates && map) {
        map.flyTo({
          center: [userCoordinates.longitude, userCoordinates.latitude],
          zoom: 7, // This zoom level shows roughly 100 mile radius
          duration: 1000
        });
      }
    });
  };

  const updateMapMarkers = () => {
    if (!map) return;

    // Remove existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    // Add markers for locations
    locations.forEach(location => {
      const isSelected = selectedLocation?.name === location.name;
      
      const marker = new mapboxgl.Marker({
        color: isSelected ? '#3B82F6' : // Light blue for selected
               '#000000', // Black for non-selected
        scale: isSelected ? 1.2 : 1
      })
        .setLngLat([location.coordinates.longitude, location.coordinates.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3 class="font-medium">${location.name}</h3>
          <p class="text-sm">${location.address}</p>
          ${location.distance !== undefined ? `<p class="text-sm text-[rgb(var(--color-primary))] mt-1">${kmToMiles(location.distance).toFixed(1)} miles away</p>` : ''}
        `));

      // Add click event to select location
      marker.getElement().addEventListener('click', () => {
        handleLocationSelect(location);
      });

      if (map) {
        marker.addTo(map);
      }
      markers.push(marker);
    });

    // Add user location marker if available
    if (userCoordinates) {
      const userMarker = new mapboxgl.Marker({
        color: '#FF6B6B', // Light red for user location
        scale: 1.2
      })
        .setLngLat([userCoordinates.longitude, userCoordinates.latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<p class="text-sm">Your Location</p>'));

      if (map) {
        userMarker.addTo(map);
      }
      markers.push(userMarker);
    }
  };

  const centerMapOnSelection = () => {
    if (!map || !selectedLocation) return;

    // Center the map on the selected location
    map.flyTo({
      center: [selectedLocation.coordinates.longitude, selectedLocation.coordinates.latitude],
      zoom: 8, // Keep consistent with initial zoom
      duration: 300
    });
  };

  // Helper function to extract city from address
  const getCityFromAddress = (address: string): string => {
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return '';
  };

  // Helper function to convert km to miles
  const kmToMiles = (km: number): number => {
    return km * 0.621371;
  };

  // Helper function to estimate drive time in minutes
  const getDriveTime = (distanceKm: number): number => {
    // Assuming average speed of 60 km/h in city
    return Math.round((distanceKm / 60) * 60);
  };

  onMount(() => {
    initializeMap();
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  // Update map when locations or user coordinates change
  $: if (map && (locations.length > 0 || userCoordinates)) {
    updateMapMarkers();
  }
</script>

<div class="space-y-6">

  <!-- Nearest Location (if available) -->
  {#if serviceType === 'in-office' && nearestLocation && userCoordinates && !selectedLocation}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div class="flex items-center text-blue-600 text-sm mb-2">
        <MapPin class="w-4 h-4 mr-1" />
        <span>Nearest Location</span>
      </div>
      <button
        class="w-full text-left"
        on:click={() => handleLocationSelect(nearestLocation!)}
      >
        <h3 class="text-lg font-semibold text-gray-900">{nearestLocation.name}</h3>
        <h4 class="text-sm text-gray-600">{getCityFromAddress(nearestLocation.address)}</h4>
        <p class="text-sm text-gray-500 mt-1">{nearestLocation.address}</p>
        {#if nearestLocation.distance !== undefined}
          <div class="flex items-center text-sm text-blue-600 mt-1">
            <Clock class="w-4 h-4 mr-1" />
            <span>{getDriveTime(nearestLocation.distance)} min drive</span>
            <span class="mx-2">•</span>
            <span>{kmToMiles(nearestLocation.distance).toFixed(1)} miles away</span>
          </div>
        {/if}
      </button>
    </div>
  {/if}

  <!-- Selected Location Card (if available) -->
  {#if selectedLocation}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{selectedLocation.name}</h3>
      <h4 class="text-sm text-gray-600">{getCityFromAddress(selectedLocation.address)}</h4>
      <p class="text-sm text-gray-500 mt-1">{selectedLocation.address}</p>
      {#if selectedLocation.distance !== undefined}
        <div class="flex items-center text-sm text-blue-600 mt-1">
          <Clock class="w-4 h-4 mr-1" />
          <span>{getDriveTime(selectedLocation.distance)} min drive</span>
          <span class="mx-2">•</span>
          <span>{kmToMiles(selectedLocation.distance).toFixed(1)} miles away</span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Confirm Location Button (for in-office when location is selected) -->
  {#if serviceType === 'in-office' && selectedLocation}
    <button
      class="btn-primary w-full mb-4"
      on:click={() => dispatch('next')}
    >
      Confirm Location
    </button>
  {/if}

  <!-- Search Bar -->
  <div class="relative mb-4">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search class="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      on:input={handleSearch}
      placeholder={serviceType === 'in-home' ? "Enter your address" : "Search locations"}
      class="input-field pl-10"
    />
  </div>

  <!-- Map -->
  <div 
    bind:this={mapContainer}
    class="rounded-lg h-64 mb-4 overflow-hidden"
  ></div>

  <!-- Location List -->
  {#if serviceType === 'in-office'}
    <div class="space-y-3">
      {#each locations as location}
        <button
          class="w-full p-3 border rounded-lg transition-colors text-left hover:border-blue-200"
          class:border-blue-200={selectedLocation?.name === location.name}
          class:bg-blue-50={selectedLocation?.name === location.name}
          on:click={() => handleLocationSelect(location)}
        >
          <h3 class="font-medium text-gray-900">{location.name}</h3>
          <h4 class="text-sm text-gray-600">{getCityFromAddress(location.address)}</h4>
          <p class="text-sm text-gray-500 mt-1">{location.address}</p>
          {#if location.distance !== undefined}
            <div class="flex items-center text-sm text-blue-600 mt-1">
              <Clock class="w-4 h-4 mr-1" />
              <span>{getDriveTime(location.distance)} min drive</span>
              <span class="mx-2">•</span>
              <span>{kmToMiles(location.distance).toFixed(1)} miles away</span>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {:else}
    <button
      class="btn-primary w-full"
      on:click={() => handleLocationSelect({
        address: searchQuery,
        coordinates: userCoordinates || { latitude: 0, longitude: 0 }
      })}
    >
      Confirm Address
    </button>
  {/if}
</div> 