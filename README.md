# svelte-hcaptcha

## Overview

hCaptcha Component Library for SvelteJS.

[hCaptcha](https://www.hcaptcha.com/) is a drop-replacement for reCAPTCHA that protects user privacy, rewards websites, and helps companies get their data labeled. It's a
simple way of proving that site users are human.

[Sign up](https://www.hcaptcha.com/signup-interstitial) at hCaptcha to get your sitekey today. **You need a sitekey to use this library**.

This library is heavily inspired by [react-hcaptcha](https://github.com/hCaptcha/react-hcaptcha).

## Installation

You can install this library via npm:

`npm install svelte-hcaptcha --save-dev`

## Usage

The two requirements for usage are the `sitekey` prop and a parent component such as a `<form />`. The component `HCaptcha` component will automatically include and load the hCaptcha API library and append it to the parent component, ready for use.

The `HCaptcha` component dispatches various events which you can listen to in the parent;
 * `mount` - the component has been mounted
 * `load` - the hCaptcha API script has successfully loaded
 * `success` - a user has successfully completed an hCaptcha challenge. The payload of this event contains a `token` which can be used to verify the captcha
 * `error` - something went wrong when the user attempted the captcha
 * `close` - the captcha was closed
 * `expired` - the captcha has expired and needs to be re-verified

You can read more about these events [below](#events). In particular, errors are described [here](https://docs.hcaptcha.com/configuration/#error-codes).

If you don't supply the `sitekey` prop to the `HCaptcha` component, then it will try and load this from a `window.sitekey` variable. This approach can be useful e.g. when the component is to be mounted on a synchronously-rendered page, as you can inject the `window.sitekey` variable from a server backend.

Note also that it's not possible to develop against `localhost` or `127.0.0.1` when using this component. A useful tool in this scenario is [ngrok](https://ngrok.com/). On Linux, you can also add an entry into `/etc/hosts` like `127.0.0.1    test.mydomain.com`, then you can run svelte with `--host test.mydomain.com`. This is explained in the [HCaptcha docs](https://docs.hcaptcha.com/#local-development).

### Basic usage

```svelte
<form>
  <HCaptcha 
    sitekey={mySitekey} 
    theme={CaptchaTheme.DARK}
    on:success={handleSuccess}
    on:error={handleError}
  />
</form>
```

If you want to be able to **reset** the component (hint: you probably want to do this, for instance, if captcha verification fails), then you'll need to *bind* to it in the parent. The component exposes a `.reset()` method;

```svelte
<script>
  let captcha;

  const handleError = () => {
    captcha.reset();
  }
</script>

...

<form>
  <HCaptcha 
    bind:this={captcha}
    on:error={handleError}
  />
</form>
```

## Props

| Name     | Values/Type | Required | Default | Description |
|----------|-------------|----------|---------|-------------|
|`sitekey` |`String`      |Yes      | `-`     |This is your sitekey, this allows you to load captcha. If you need a sitekey, please visit [hCaptcha](https://www.hcaptcha.com/), and sign up to get your sitekey.|
|`apihost` |`String`|No|`https://hcaptcha.com`|See enterprise docs.|
|`hl`|`String`|No|`-`|Forces a specific localization. See [here](https://docs.hcaptcha.com/languages/) for supported language codes.|
|`reCaptchaCompa`|`Boolean`|No|`null`|Disable drop-in replacement for reCAPTCHA with `false` to prevent hCaptcha from injecting into `window.grecaptcha`.|
|`theme`|`CaptchaTheme`|No|`CaptchaTheme.LIGHT`|hCaptcha supports a dark mode and a light mode. By default we render the light variant; set to `CaptchaTheme.DARK` to get the dark mode variant.|

## Events

|Event    | Params  | Description  |
|---------|---------|--------------|
|`success`|`token`|Fires when a user successfully completes a captcha challenge. Contains the token which is required to verify the captcha.|
|`load`|`-`|Fires when the hCaptcha api script has finished loading.|
|`mount`|`-`|Fires when the component is mounted.|
|`close`|`-`|Fires when the captcha is closed by the user (i.e. s/he has not completed it).|
|`error`|`-`|Fires when hCaptcha encounters an error and cannot continue. If you specify an error callback, you must inform the user that they should retry.|
|`expired`|`-`|Fires when the token is expired and needs to be re-verified.|

## Methods

|Method|Description|
|------|-----------|
|`reset()`|Reset the current challenge.|
|`execute()`|Trigger the HCaptcha workflow programmatically. See [HCaptcha docs](https://docs.hcaptcha.com/configuration/#hcaptchaexecutewidgetid) for details.|

## Contributing

Pull requests, suggestions, comments, critiques - all welcome :)

Please get in touch with the maintainers if you need help or advice to get the project to run.