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
  export let onLoadListeners = [];

  // ensure that all captcha divs on a page are uniquely identifiable
  const id = Math.floor(Math.random() * 100);

  let mounted = false;
  let loaded = false;

  // construct the script tag for hCaptcha remote resources
  const query = new URLSearchParams({
    recaptchacompat: reCaptchaCompat || "",
    onload: "hcaptchaOnLoad",
  });
  const scriptSrc = `${apihost || "https://hcaptcha.com"}/${query.toString()}`;

  window.hcaptchaOnLoad = () => {
    // handle onload callbacks from consumers
    onLoadListeners.filter((listener) => {
      listener();
      return false;
    });
    loaded = true;
  };

  window.onSuccess = (token) => {
    dispatch("success", {
      token: token,
    });
  };

  window.onError = () => {
    dispatch("error");
    // TODO add support for consumer onError handlers
  };

  window.onClose = () => {
    dispatch("close");
    // TODO add support for consumer onClose handlers
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
    hcaptcha.render(`h-captcha-${id}`, {
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
