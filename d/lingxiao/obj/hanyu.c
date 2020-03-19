inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIW "极北寒玉" NOR, ({"jibei hanyu", "jibei", "hanyu", "yu"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
         	set("long", HIW "极地万年寒冰凝结而成，看上去洁白剔透，散发"
                            "出雪一般的光泽。\n" NOR);
                set("unit", "块");
                set("value", 10000);
        }
        setup();
}

