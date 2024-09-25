<script lang="ts" context="module">
  declare global {
    interface Window {
      sitekey: string;
      hcaptchaOnLoad: Function | null;
      onSuccess: Function | null;
      onError: Function;
      onClose: Function;
      onExpired: Function;
      hcaptcha: any;
    }
  }

  declare var hcaptcha: any;

  export enum CaptchaTheme {
    DARK = 'dark',
    LIGHT = 'light'
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher<{
    load: null;
    mount: null;
    error: null;
    close: null;
    success: { token: string };
    expired: null;
  }>();

  export let sitekey: string;
  export let apihost: string = 'https://js.hcaptcha.com/1/api.js';
  export let hl: string = '';
  export let reCaptchaCompat: boolean = false;
  export let theme: CaptchaTheme = CaptchaTheme.LIGHT;
  export let size: 'normal' | 'compact' | 'invisible' = 'normal';

  export const reset = () => {
    if (mounted && loaded && widgetID) hcaptcha.reset(widgetID);
  };

  export const execute = (options: any) => {
    if (mounted && loaded && widgetID) return hcaptcha.execute(widgetID, options);
  };

  // ensure that all captcha divs on a page are uniquely identifiable
  const id = Math.floor(Math.random() * 100);

  let mounted = false;
  let loaded = false;
  let widgetID: string;

  // construct the script tag for hCaptcha remote resources
  const query = new URLSearchParams({
    recaptchacompat: reCaptchaCompat ? 'on' : 'off',
    onload: 'hcaptchaOnLoad',
    render: 'explicit'
  });

  onMount(() => {
    if (!sitekey) sitekey = window.sitekey;

    window.hcaptchaOnLoad = () => {
      // consumers can attach custom on:load handlers
      dispatch('load');
      loaded = true;
    };

    window.onSuccess = (token: string) => {
      dispatch('success', { token });
    };

    window.onError = () => {
      dispatch('error');
    };

    window.onClose = () => {
      dispatch('close');
    };

    window.onExpired = () => {
      dispatch('expired');
    };

    dispatch('mount');
    mounted = true;
    return () => {
      hcaptcha.reset(widgetID);
      hcaptcha.remove(widgetID);
      window.hcaptchaOnLoad = null;
      window.onSuccess = null;
      // guard against script loading race conditions
      // i.e. if component is destroyed before hcaptcha reference is loaded
      if (loaded) hcaptcha = null;
    };
  });

  $: if (mounted && loaded) {
    widgetID = hcaptcha.render(`h-captcha-${id}`, {
      sitekey,
      hl, // force a specific localisation
      theme,
      callback: 'onSuccess',
      'error-callback': 'onError',
      'close-callback': 'onClose',
      'expired-callback': 'onExpired',
      size
    });
  }
</script>

<svelte:head>
  {#if mounted && !window?.hcaptcha}
    <script src={`${apihost}?${query}`} async defer></script>
  {/if}
</svelte:head>

<div id="h-captcha-{id}" />
