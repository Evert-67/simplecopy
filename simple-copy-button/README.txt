=== Simple Copy Button ===
Contributors: CodePug
Tags: copy, clipboard, shortcode, button
Requires at least: 5.8
Requires PHP: 7.4
Stable tag: 1.2.1
License: GPLv2 or later

Add copy buttons with shortcodes. A button copies content from the beginning of its scope, from the nearest preceding start marker, or from the previous copy button. Common WordPress page titles are excluded by default.

== Installation ==
Upload the installable plugin ZIP through Plugins > Add New > Upload Plugin, then activate it. Existing installations can be replaced. There are no plugin settings or database migrations.

== Shortcodes ==
Buttons: [simple_copy_button] or [copy_button]
Invisible start markers: [simple_copy_start] or [copy_start]

== Examples ==
Text A
[simple_copy_button label="Copy text A" class="btn btn-primary"]

Text B
[copy_button label="Copy text B" class="btn btn-success"]

The first button copies content up to that button. The second copies content between the two buttons.

== Start marker example ==
This introduction is not copied.
[copy_start]
Only this section is copied.
This line is included too.
[copy_button label="Copy this section"]

== Button options ==
label="Copy text"
class="btn btn-primary"
copied_label="Copied!"
error_label="Copy failed"
format="text" or format="html"
scope=".entry-content" optional CSS selector for the copy area
exclude=".do-not-copy" optional CSS selector for elements to exclude
include_title="yes" includes common page titles

Existing Dutch default labels are preserved for compatibility. Set label, copied_label and error_label explicitly for an English interface.

== Start marker options ==
id="section-a" optional identifier in the HTML; it does not pair a button with a named marker. The nearest preceding marker determines the start.

== Page titles ==
The following classes are excluded unless include_title="yes":
.entry-title, .page-title, .post-title, .wp-block-post-title

== Clipboard behaviour ==
Plain text preserves line breaks for common block elements. HTML mode uses ClipboardItem when available. Otherwise writeText copies the HTML source as plain text. Older browsers use the execCommand fallback. Clipboard permissions and HTTPS/secure-context restrictions still depend on the browser.

Keep custom scope selectors valid and use a scope containing the button. Invalid exclude selectors are ignored. Theme CSS determines any Bootstrap classes you supply; no framework is bundled.

== Changelog ==
= 1.2.1 =
* Implement the documented default page-title exclusion and include_title override.
* Add English documentation and GitHub checks for WordPress shortcodes and browser DOM/clipboard behaviour.
= 1.2.0 =
* Original uploaded version, with scope wrappers, shortcode aliases and configurable copy options.
