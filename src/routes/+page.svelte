<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import LocationSelector from '../components/location-selector/LocationSelector.svelte';
  import ServiceSelector from '../components/service-selector/ServiceSelector.svelte';
  import BookingDetails from '../components/booking-details/BookingDetails.svelte';
  import BookingConfirmation from '../components/booking-confirmation/BookingConfirmation.svelte';
  import UserInfoCollection from '../components/user-info-collection/UserInfoCollection.svelte';
  import PaymentPage from '../components/payment/PaymentPage.svelte';
  import BookingComplete from '../components/booking-complete/BookingComplete.svelte';
  import type { Location, Coordinates } from '$lib/utils/location';
  import { getCurrentLocation } from '$lib/utils/location';
  import { bookingStore } from '$lib/stores/booking';
  
  let initialCoordinates: Coordinates | null = null;
  let currentView: 'location' | 'service' | 'booking-details' | 'confirmation' | 'user-info' | 'payment' | 'final-confirmation' = 'location';
  let previousView: 'location-selector' | 'location-search' = 'location-selector';
  let selectedServiceType: 'in-office' | 'in-home' | null = null;

  // Scroll to top whenever the view changes, but only in the browser
  $: if (browser && currentView) {
    window.scrollTo(0, 0);
  }

  const handleLocationComplete = (event: CustomEvent<{
    serviceType: 'in-office' | 'in-home';
    location: Location;
  }>) => {
    // Store the location and service type in the booking session
    bookingStore.setLocation(event.detail.location);
    bookingStore.setServiceType(event.detail.serviceType);
    
    // Store the service type locally for navigation
    selectedServiceType = event.detail.serviceType;
    
    // Set the previous view to location-search before switching to service
    previousView = 'location-search';
    
    // Switch to the service selection view
    currentView = 'service';
  };

  const handleServiceBack = () => {
    // Go back to the previous view (LocationSearch)
    currentView = 'location';
  };

  const handleServiceComplete = () => {
    // Move to the booking details view
    currentView = 'booking-details';
  };

  const handleBookingDetailsBack = () => {
    // Go back to service selection
    currentView = 'service';
  };

  const handleBookingComplete = () => {
    // Move to the confirmation view
    currentView = 'confirmation';
  };

  const handleConfirmationBack = () => {
    // Go back to booking details
    currentView = 'booking-details';
  };

  const handleEditLocation = () => {
    // Go back to location selection
    currentView = 'location';
  };

  const handleEditService = () => {
    // Go back to service selection
    currentView = 'service';
  };

  const handleEditDateTime = () => {
    // Go back to booking details
    currentView = 'booking-details';
  };

  const handleEditTherapist = () => {
    // Go back to booking details
    currentView = 'booking-details';
  };

  const handleFinalizeBooking = () => {
    // Move to user information collection
    currentView = 'user-info';
  };

  const handleUserInfoBack = () => {
    // Go back to confirmation
    currentView = 'confirmation';
  };

  const handleUserInfoComplete = () => {
    // Move to payment page
    currentView = 'payment';
  };

  const handlePaymentBack = () => {
    // Go back to user info
    currentView = 'user-info';
  };

  const handlePaymentComplete = () => {
    // Move to final confirmation
    currentView = 'final-confirmation';
  };

  const handleBookingCompleteDone = () => {
    // Reset the booking flow
    currentView = 'location';
    bookingStore.reset();
  };

  const handleLogin = () => {
    // In a real app, this would navigate to the login page
    alert('Login functionality would be implemented here');
  };

  // Request location on page load
  onMount(() => {
    // Listen for geolocation permission changes
    navigator.permissions?.query({ name: 'geolocation' }).then(permissionStatus => {
      if (permissionStatus.state === 'granted') {
        getCurrentLocation().then(coords => {
          initialCoordinates = coords;
        }).catch(() => {
          initialCoordinates = null;
        });
      }

      permissionStatus.addEventListener('change', (e: Event) => {
        const status = e.target as PermissionStatus;
        if (status.state === 'granted') {
          getCurrentLocation().then(coords => {
            initialCoordinates = coords;
          }).catch(() => {
            initialCoordinates = null;
          });
        }
      });
    });
  });
</script>

<div class="min-h-screen bg-white">
  <main class="px-4 pb-8">
    {#if currentView === 'location'}
      <LocationSelector
        {initialCoordinates}
        {previousView}
        {selectedServiceType}
        on:complete={handleLocationComplete}
      />
    {:else if currentView === 'service'}
      <ServiceSelector
        showBackButton={true}
        on:back={handleServiceBack}
        on:complete={handleServiceComplete}
      />
    {:else if currentView === 'booking-details'}
      <BookingDetails
        showBackButton={true}
        on:back={handleBookingDetailsBack}
        on:complete={handleBookingComplete}
      />
    {:else if currentView === 'confirmation'}
      <BookingConfirmation
        on:back={handleConfirmationBack}
        on:editLocation={handleEditLocation}
        on:editService={handleEditService}
        on:editDateTime={handleEditDateTime}
        on:editTherapist={handleEditTherapist}
        on:finalize={handleFinalizeBooking}
      />
    {:else if currentView === 'user-info'}
      <UserInfoCollection
        on:back={handleUserInfoBack}
        on:complete={handleUserInfoComplete}
        on:login={handleLogin}
      />
    {:else if currentView === 'payment'}
      <PaymentPage
        on:back={handlePaymentBack}
        on:paymentComplete={handlePaymentComplete}
      />
    {:else if currentView === 'final-confirmation'}
      <BookingComplete
        on:done={handleBookingCompleteDone}
      />
    {/if}
  </main>
</div>
