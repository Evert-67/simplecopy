# Simple Copy Button

A lightweight WordPress plugin by Evert Beijes / CodePug. Add shortcode buttons to copy content above a button, after an invisible start marker, or between consecutive buttons.

## Install

Open **Actions → Simple Copy tests**, select a successful run and download the `simple-copy-button-1.2.1` artifact. Extract the artifact and upload the contained plugin ZIP through **WordPress → Plugins → Add New → Upload Plugin**.

Requires WordPress 5.8+ and PHP 7.4+. Automated integration checks currently use WordPress 6.8.3 on PHP 7.4, 8.3 and 8.4.

## Use

```text
[copy_start]
Content to copy.
[copy_button label="Copy text" copied_label="Copied!" error_label="Copy failed"]
```

Use `class="btn btn-primary"` with your own Bootstrap-enabled theme, `exclude=".do-not-copy"` to omit elements, or `format="html"` for rich clipboard content where supported. Common page titles are excluded by default; `include_title="yes"` includes them.

See the [complete shortcode reference](simple-copy-button/README.txt). Existing Dutch button defaults remain unchanged; explicit label attributes provide English text.

## Tests and packaging

GitHub Actions runs PHP/JavaScript syntax checks, activates the plugin in WordPress, tests shortcode rendering and escaping, and runs Chromium DOM tests with intercepted clipboard APIs. Tests cover title exclusion, the title override, marker boundaries, multiple buttons, custom exclusions, HTML output, clipboard failures and the legacy fallback. CI builds an installable ZIP.

Clipboard interception tests the content and UI feedback, not actual OS clipboard permissions. Verify real copy/paste and theme appearance in your browser over HTTPS.

## Version 1.2.1

Imported from the supplied 1.2.0 archive. Fixes a documented option that was not implemented: excluding common page titles by default. No database changes or live-site deployment.

Repository documentation, pull request descriptions and new commit messages are maintained in English.
