<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let selectedDate: Date;
  export let minDate: Date = new Date();
  export let maxDate: Date = addMonths(new Date(), 3); // Allow booking up to 3 months in advance

  const dispatch = createEventDispatcher<{
    select: Date;
  }>();

  let currentMonth = new Date();

  $: days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  $: weeks = days.reduce((weeks, day) => {
    const weekIndex = Math.floor(days.indexOf(day) / 7);
    if (!weeks[weekIndex]) weeks[weekIndex] = [];
    weeks[weekIndex].push(day);
    return weeks;
  }, [] as Date[][]);

  function previousMonth() {
    currentMonth = subMonths(currentMonth, 1);
  }

  function nextMonth() {
    currentMonth = addMonths(currentMonth, 1);
  }

  function handleDateSelect(date: Date) {
    if (date < minDate || date > maxDate) return;
    dispatch('select', date);
  }

  function isDateSelectable(date: Date): boolean {
    return date >= minDate && date <= maxDate;
  }
</script>

<div class="select-none">
  <!-- Calendar Header -->
  <div class="flex items-center justify-between mb-4">
    <button
      class="p-2 hover:bg-gray-100 rounded-full transition-colors"
      on:click={previousMonth}
      disabled={startOfMonth(currentMonth) <= startOfMonth(minDate)}
    >
      <ChevronLeft class="w-5 h-5" />
    </button>
    <h3 class="font-medium">
      {format(currentMonth, 'MMMM yyyy')}
    </h3>
    <button
      class="p-2 hover:bg-gray-100 rounded-full transition-colors"
      on:click={nextMonth}
      disabled={startOfMonth(currentMonth) >= startOfMonth(maxDate)}
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>

  <!-- Calendar Grid -->
  <div class="grid grid-cols-7 gap-1">
    <!-- Day headers -->
    {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
      <div class="text-center text-sm font-medium text-gray-500 py-2">
        {day}
      </div>
    {/each}

    <!-- Calendar days -->
    {#each weeks as week}
      {#each week as day}
        <button
          class="aspect-square p-2 text-sm rounded-full transition-colors relative
            {isSameDay(day, selectedDate) ? 'bg-blue-500 text-white' : ''}
            {!isSameMonth(day, currentMonth) ? 'text-gray-300' : 'text-gray-700'}
            {isDateSelectable(day) && isSameMonth(day, currentMonth) ? 'hover:bg-blue-100' : ''}
            {!isDateSelectable(day) ? 'cursor-not-allowed opacity-50' : ''}"
          disabled={!isDateSelectable(day)}
          on:click={() => handleDateSelect(day)}
        >
          {format(day, 'd')}
          {#if isSameDay(day, new Date())}
            <div class="absolute inset-0 border-2 border-blue-500 rounded-full pointer-events-none"></div>
          {/if}
        </button>
      {/each}
    {/each}
  </div>
</div> 