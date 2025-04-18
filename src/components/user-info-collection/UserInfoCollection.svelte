<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { navigationStore } from '$lib/stores/navigation';
  import { ChevronRight, ChevronLeft, UserCircle } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const dispatch = createEventDispatcher<{
    back: void;
    complete: void;
    login: void;
  }>();

  // Current step in the info collection process
  let currentStep = 'name';
  let fullName = '';
  let email = '';
  let phone = '';
  let verificationCode = '';
  let isVerifying = false;
  let showEmailOption = false;
  
  // Validation states
  let nameError = '';
  let emailError = '';
  let phoneError = '';
  let verificationError = '';

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: true,
      showNext: false,
      stepName: 'Enter Your Info',
      onBack: () => dispatch('back'),
      showBookButton: false
    });
  }

  function validateName() {
    if (!fullName.trim()) {
      nameError = 'Name is required';
      return false;
    }
    if (!fullName.includes(' ')) {
      nameError = 'Please enter your full name';
      return false;
    }
    nameError = '';
    return true;
  }

  function validateEmail() {
    if (!email.trim()) {
      emailError = 'Email is required';
      return false;
    }
    if (!isValidEmail(email)) {
      emailError = 'Please enter a valid email address';
      return false;
    }
    emailError = '';
    return true;
  }

  function validatePhone() {
    if (!phone.trim()) {
      phoneError = 'Phone number is required';
      return false;
    }
    if (!isValidPhone(phone)) {
      phoneError = 'Please enter a valid phone number';
      return false;
    }
    phoneError = '';
    return true;
  }

  function validateVerificationCode() {
    if (!verificationCode.trim()) {
      verificationError = 'Verification code is required';
      return false;
    }
    if (!/^\d{6}$/.test(verificationCode)) {
      verificationError = 'Please enter a valid 6-digit code';
      return false;
    }
    verificationError = '';
    return true;
  }

  function handleNext() {
    switch (currentStep) {
      case 'name':
        if (validateName()) {
          currentStep = 'email';
        }
        break;
      case 'email':
        if (validateEmail()) {
          currentStep = 'phone';
        }
        break;
      case 'phone':
        if (validatePhone()) {
          currentStep = 'verification';
          isVerifying = true;
          // In a real app, this would trigger sending the verification code
          setTimeout(() => {
            showEmailOption = true;
          }, 2000);
        }
        break;
      case 'verification':
        if (validateVerificationCode()) {
          // In a real app, this would verify the code
          dispatch('complete');
        }
        break;
    }
  }

  function handleBack() {
    switch (currentStep) {
      case 'email':
        currentStep = 'name';
        break;
      case 'phone':
        currentStep = 'email';
        break;
      case 'verification':
        currentStep = 'phone';
        isVerifying = false;
        showEmailOption = false;
        break;
      default:
        dispatch('back');
    }
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone: string) {
    // Allow common phone formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
  }

  function handleEmailVerification() {
    // In a real app, this would switch to email verification
    showEmailOption = false;
    dispatch('complete');
  }

  // Format phone number as user types
  function formatPhoneNumber(value: string) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  }

  // Handle phone input
  function handlePhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhoneNumber(input.value);
    phone = formatted;
  }

  // Handle verification code input
  function handleVerificationInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Only allow digits
    const digits = input.value.replace(/\D/g, '');
    // Limit to 6 digits
    verificationCode = digits.slice(0, 6);
  }
</script>

<div class="space-y-8 mt-20">
  <div class="text-center mb-8">
    <h2 class="text-gray-600 mt-2 px-4">Please provide your information to complete the booking</h2>
  </div>

  <div class="max-w-md mx-auto">
    {#if currentStep === 'name'}
      <div transition:slide|local={{ duration: 300, easing: quintOut }} class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          class="input-field {nameError ? 'border-red-500' : ''}"
          placeholder="Enter your full name"
          bind:value={fullName}
          on:keydown={(e) => e.key === 'Enter' && handleNext()}
        />
        {#if nameError}
          <p class="text-sm text-red-500">{nameError}</p>
        {/if}
        <div class="flex justify-end items-center mt-4 text-sm">
          <button
            class="btn-primary"
            on:click={handleNext}
            disabled={!fullName.trim()}
          >
            Continue
            <ChevronRight class="w-4 h-4 inline-block ml-1" />
          </button>
        </div>
      </div>
    {:else if currentStep === 'email'}
      <div transition:slide|local={{ duration: 300, easing: quintOut }} class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          class="input-field {emailError ? 'border-red-500' : ''}"
          placeholder="Enter your email address"
          bind:value={email}
          on:keydown={(e) => e.key === 'Enter' && handleNext()}
        />
        {#if emailError}
          <p class="text-sm text-red-500">{emailError}</p>
        {/if}
        <div class="flex justify-between items-center mt-4">
          <button
            class="btn-primary w-1/2 text-sm"
            on:click={handleBack}
          >
            <ChevronLeft class="w-4 h-4 inline-block mr-1" />
            Back
          </button>
          <div class="w-4"></div>
          <button
            class="btn-primary flex-grow text-sm"
            on:click={handleNext}
            disabled={!email.trim()}
          >
            Continue
            <ChevronRight class="w-4 h-4 inline-block ml-1" />
          </button>
        </div>
      </div>
    {:else if currentStep === 'phone'}
      <div transition:slide|local={{ duration: 300, easing: quintOut }} class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          class="input-field {phoneError ? 'border-red-500' : ''}"
          placeholder="(123) 456-7890"
          value={phone}
          on:input={handlePhoneInput}
          on:keydown={(e) => e.key === 'Enter' && handleNext()}
        />
        {#if phoneError}
          <p class="text-sm text-red-500">{phoneError}</p>
        {/if}
        <div class="flex justify-between items-center mt-4">
          <button
            class="btn-primary w-1/2 text-sm"
            on:click={handleBack}
          >
            <ChevronLeft class="w-4 h-4 inline-block mr-1" />
            Back
          </button>
          <div class="w-4"></div>
          <button
            class="btn-primary flex-grow text-sm"
            on:click={handleNext}
            disabled={!phone.trim()}
          >
            Continue
            <ChevronRight class="w-4 h-4 inline-block ml-1" />
          </button>
        </div>
      </div>
    {:else if currentStep === 'verification'}
      <div transition:slide|local={{ duration: 300, easing: quintOut }} class="space-y-4">
        <div class="text-center mb-4">
          <p class="text-gray-600">We've sent a verification code to: <br/>{phone}</p>
        </div>
        <label class="block text-sm font-medium text-gray-700">Verification Code</label>
        <div class="flex justify-center">
          <input
            type="text"
            class="input-field text-center tracking-widest text-xl font-mono w-48 {verificationError ? 'border-red-500' : ''}"
            placeholder="000000"
            value={verificationCode}
            on:input={handleVerificationInput}
            maxlength="6"
            on:keydown={(e) => e.key === 'Enter' && handleNext()}
          />
        </div>
        {#if verificationError}
          <p class="text-sm text-red-500 text-center">{verificationError}</p>
        {/if}
        <div class="flex justify-between items-center mt-4">
          <button
            class="btn-primary w-1/2 text-sm"
            on:click={handleBack}
          >
            <ChevronLeft class="w-4 h-4 inline-block mr-1" />
            Back
          </button>
          <div class="w-4"></div>
          <button
            class="btn-primary flex-grow text-sm"
            on:click={handleNext}
            disabled={!verificationCode.trim()}
          >
            Verify
            <ChevronRight class="w-4 h-4 inline-block ml-1" />
          </button>
        </div>
        {#if showEmailOption}
          <div class="text-center mt-4">
            <button
              class="text-[rgb(var(--color-primary))] font-medium hover:underline inline-flex items-center gap-1"
              on:click={handleEmailVerification}
            >
              Verify through email instead
              <ChevronRight class="w-3 h-3" />
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="text-center pt-4 mt-8 border-t border-gray-100">
    <p class="text-sm text-gray-500">
      Already registered? 
      <button 
        class="text-[rgb(var(--color-primary))] font-medium hover:underline inline-flex items-center gap-1"
        on:click={() => dispatch('login')}
      >
        Sign in for faster booking
        <ChevronRight class="w-3 h-3" />
      </button>
    </p>
  </div>
</div> 