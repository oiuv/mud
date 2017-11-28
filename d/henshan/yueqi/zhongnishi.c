#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_QIN;

void create()
{
        set_name(HIC "仲尼式琴·宋朝" NOR, ({ "zhongni qin", "zhongni", "qin" }));
        set_weight(500);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "把");
  			   
                set("long", HIC "此琴体扁身薄，琴体怪异，琴轸右面垂下深\n"
                                "舌罗汉腿，漆色亮绿，微泛绿光，仲尼式琴\n"
                                "为元朝主流。\n" NOR);
		set("value", 200000);
		set("material", "wood");
	     }
	setup();
}

void init()
{
        add_action("play_qin", "play");
}
