<?php
$GLOBALS['scb_checks']=0;
function scb_check($ok,$label){if(!$ok)throw new RuntimeException($label);$GLOBALS['scb_checks']++;}
scb_check(class_exists('Simple_Copy_Button_Plugin'),'Plugin activated');
foreach(['simple_copy_button','copy_button','simple_copy_start','copy_start'] as $tag) scb_check(shortcode_exists($tag),'Shortcode '.$tag);
$a=do_shortcode('[copy_button label="Copy text" format="html" include_title="yes" class="btn btn-primary"]');
scb_check(strpos($a,'data-scb-format="html"')!==false,'HTML mode');
scb_check(strpos($a,'data-scb-include-title="1"')!==false,'Title flag');
scb_check(strpos($a,'btn btn-primary')!==false,'Custom classes');
scb_check(strpos(do_shortcode('[copy_button format="invalid"]'),'data-scb-format="text"')!==false,'Format fallback');
$b=Simple_Copy_Button_Plugin::render_button_shortcode(['label'=>'<img src=x onerror=alert(1)>','scope'=>'" onmouseover="bad']);
scb_check(strpos($b,'<img')===false,'Label escaped');
scb_check(strpos($b,'&quot; onmouseover=&quot;bad')!==false,'Attribute escaped');
scb_check(Simple_Copy_Button_Plugin::wrap_content_scope('<p>Plain</p>')==='<p>Plain</p>','Unrelated content preserved');
scb_check(strpos(Simple_Copy_Button_Plugin::wrap_content_scope('[copy_button]'),'scb-content-scope')!==false,'Content wrapped');
scb_check(strpos(do_shortcode('[copy_start id="test"]'),'data-scb-start-id="test"')!==false,'Start marker');
if($GLOBALS['scb_checks']!==14)throw new RuntimeException('Unexpected check count');
echo $GLOBALS['scb_checks']." WordPress checks passed\n";
