#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_QIN;

void create()
{
        set_name(HIY "蕉叶古琴·明朝" NOR, ({ "jiaoye qin", "jiaoye", "qin" }));
        set_weight(700);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "把");
  			    
                set("long", HIY "此琴乃弘治嘉靖年间著名斫琴家祝海鹤所制\n"
				"琴形旖旎秀逸，蕉叶卷边工雅生动，音色润\n"
				"匀透静，为琴器中难得一见的珍品。\n" NOR);
		set("value", 800000);
		set("material", "wood");
	     }
	setup();
}

void init()
{
        add_action("play_qin", "play");
}
