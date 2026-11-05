<?php
/**
 * Plugin Name: Simple Copy Button
 * Plugin URI:  https://codepug.nl/
 * Description: Add shortcode buttons that copy content above the button, after a start marker, or between consecutive copy buttons.
 * Version:     1.2.1
 * Author:      Evert Beijes
 * Text Domain: simple-copy-button
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Simple_Copy_Button_Plugin
{
    private const VERSION = '1.2.1';

    private const BUTTON_SHORTCODE = 'simple_copy_button';
    private const BUTTON_ALIAS = 'copy_button';

    private const START_SHORTCODE = 'simple_copy_start';
    private const START_ALIAS = 'copy_start';

    public static function init(): void
    {
        add_shortcode(self::BUTTON_SHORTCODE, [__CLASS__, 'render_button_shortcode']);
        add_shortcode(self::BUTTON_ALIAS, [__CLASS__, 'render_button_shortcode']);

        // Invisible start marker: sets the start of the next copy range.
        add_shortcode(self::START_SHORTCODE, [__CLASS__, 'render_start_shortcode']);
        add_shortcode(self::START_ALIAS, [__CLASS__, 'render_start_shortcode']);

        // Wrap post content that contains one of the shortcodes so JavaScript knows the safe copy area.
        add_filter('the_content', [__CLASS__, 'wrap_content_scope'], 8);

        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
    }

    public static function enqueue_assets(): void
    {
        $base_url = plugin_dir_url(__FILE__);

        // Load these small assets across the frontend to support widgets, templates and blocks.
        wp_enqueue_style(
            'simple-copy-button',
            $base_url . 'assets/simple-copy-button.css',
            [],
            self::VERSION
        );

        wp_enqueue_script(
            'simple-copy-button',
            $base_url . 'assets/simple-copy-button.js',
            [],
            self::VERSION,
            true
        );
    }

    public static function wrap_content_scope(string $content): string
    {
        $shortcodes = [
            self::BUTTON_SHORTCODE,
            self::BUTTON_ALIAS,
            self::START_SHORTCODE,
            self::START_ALIAS,
        ];

        foreach ($shortcodes as $shortcode) {
            if (stripos($content, '[' . $shortcode) !== false) {
                return '<div class="scb-content-scope">' . $content . '</div>';
            }
        }

        return $content;
    }

    public static function render_start_shortcode(array $atts = []): string
    {
        $atts = shortcode_atts([
            'id' => '',
        ], $atts, self::START_SHORTCODE);

        $id_attr = '';
        if (!empty($atts['id'])) {
            $id_attr = ' data-scb-start-id="' . esc_attr((string) $atts['id']) . '"';
        }

        return '<span class="scb-copy-start" data-scb-marker="1" data-scb-start-marker="1" aria-hidden="true"' . $id_attr . '></span>';
    }

    public static function render_button_shortcode(array $atts = []): string
    {
        $atts = shortcode_atts([
            'label'         => __('Kopieer tekst', 'simple-copy-button'),
            'class'         => '',
            'copied_label'  => __('Gekopieerd!', 'simple-copy-button'),
            'error_label'   => __('Kopiëren mislukt', 'simple-copy-button'),
            'format'        => 'text', // text or html
            'scope'         => '',     // optional CSS selector, e.g. .entry-content
            'exclude'       => '',     // optional CSS selector to remove from copied text/html
            'include_title' => 'no',   // no by default: do not copy common WordPress/page titles
        ], $atts, self::BUTTON_SHORTCODE);

        $format = strtolower((string) $atts['format']) === 'html' ? 'html' : 'text';
        $include_title = self::truthy((string) $atts['include_title']) ? '1' : '0';

        $classes = 'scb-copy-button';
        if (!empty($atts['class'])) {
            $classes .= ' ' . sanitize_html_class_list((string) $atts['class']);
        }

        $label = (string) $atts['label'];

        return sprintf(
            '<div class="scb-copy-wrap" data-scb-marker="1"><button type="button" class="%1$s" data-scb-copy-button="1" data-scb-format="%2$s" data-scb-copied-label="%3$s" data-scb-error-label="%4$s" data-scb-scope="%5$s" data-scb-exclude="%6$s" data-scb-include-title="%7$s"><span class="scb-copy-label">%8$s</span></button></div>',
            esc_attr($classes),
            esc_attr($format),
            esc_attr((string) $atts['copied_label']),
            esc_attr((string) $atts['error_label']),
            esc_attr((string) $atts['scope']),
            esc_attr((string) $atts['exclude']),
            esc_attr($include_title),
            esc_html($label)
        );
    }

    private static function truthy(string $value): bool
    {
        return in_array(strtolower(trim($value)), ['1', 'true', 'yes', 'ja', 'on'], true);
    }
}

if (!function_exists('sanitize_html_class_list')) {
    /**
     * Sanitizes a whitespace-separated list of HTML classes.
     */
    function sanitize_html_class_list(string $classes): string
    {
        $parts = preg_split('/\s+/', trim($classes));
        $parts = array_filter(array_map('sanitize_html_class', (array) $parts));
        return implode(' ', $parts);
    }
}

Simple_Copy_Button_Plugin::init();