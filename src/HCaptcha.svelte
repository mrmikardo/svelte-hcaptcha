<script lang="ts" context="module">
  declare global {
    interface Window {
      hCaptchaKey: string;
      hcaptchaOnLoad: Function;
      onSuccess: Function;
      onError: Function;
      onClose: Function;
    }
  }

  declare var hcaptcha: any;

  export enum CaptchaTheme {
    DARK = "dark",
    LIGHT = "light",
  }
</script>

<script lang="ts">
  import { onDestroy, createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let hCaptchaKey = window.hCaptchaKey || undefined;
  export let apihost;
  export let hl;
  export let reCaptchaCompat;
  export let theme;

  export const reset = () => {
    if (mounted && loaded && widgetID) hcaptcha.reset(widgetID);
  }

  // ensure that all captcha divs on a page are uniquely identifiable
  const id = Math.floor(Math.random() * 100);

  let mounted = false;
  let loaded = false;
  let widgetID;

  // construct the script tag for hCaptcha remote resources
  const query = new URLSearchParams({
    recaptchacompat: reCaptchaCompat || "",
    onload: "hcaptchaOnLoad",
  });
  const scriptSrc = `${apihost || "https://hcaptcha.com"}/${query.toString()}`;

  window.hcaptchaOnLoad = () => {
    // consumers can attach custom on:load handlers
    dispatch("load")
    loaded = true;
  };

  window.onSuccess = (token) => {
    dispatch("success", {
      token: token,
    });
  };

  window.onError = () => {
    dispatch("error");
  };

  window.onClose = () => {
    dispatch("close");
  };

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    window.hcaptchaOnLoad = null;
    window.onSuccess = null;
    // guard against script loading race conditions
    // i.e. if component is destroyed before hcaptcha reference is loaded
    if (loaded) hcaptcha = null;
  });

  $: if (mounted && loaded) {
    widgetID = hcaptcha.render(`h-captcha-${id}`, {
      sitekey: hCaptchaKey,
      hl: hl, // force a specific localisation
      theme: theme || CaptchaTheme.LIGHT,
      callback: "onSuccess",
      "error-callback": "onError",
      "close-callback": "onClose",
    });
  }
</script>

<svelte:head>
  <script src={scriptSrc} async defer>
  </script>
</svelte:head>

<div id="h-captcha-{id}" />
