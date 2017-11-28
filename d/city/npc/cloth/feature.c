// feather.c

#include <armor.h>
#include <ansi.h>
#include <mudlib.h>

inherit CLOTH;

void create()
{
        set_name(HIW "孔雀羽衣" NOR, ({ "kongque yuyi", "kongque", "yuyi" }) ); 
        set_weight(600);

        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一件出自天宫织女妙手神裁的羽"
			    "纱轻衣。款式新颖别致，\n轻柔飘逸的。"
			    "放在手中简直轻若无物，真是一件服饰极品。\n" NOR);

                set("unit", "件");
	        set("value", 100000);
                set("material", "feather");
                set("armor_prop/per", 10);
                set("armor_prop/armor", 10);
                set("armor_prop/armor_vs_force", 10);
                set("armor_prop/attack", -2); 
		set("wear_msg", HIW "$N" HIW "轻柔的展开一件洁白如雪的飘逸纱"
			        "衣轻轻披在身上，映衬的\n$P" HIW "肌肤如"
				"雪一般，一张盈盈笑脸如出水芙蓉，"
				"让人意动魂摇。\n" NOR);

        }

        setup();
}
