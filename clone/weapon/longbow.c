// longbow.c

#include <ansi.h>

inherit __DIR__"bow";

void create()
{
        set_name("长弓", ({ "long bow", "bow", "chang gong", "gong" }));
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "张");
                set("long", "一张长弓，打造得颇为精致，具有相当好的准确度。\n");
				//set("value", 80000);
				set("value", 40000);
                set("power", 180000);   // 攻击威力
                set("accuracy", 150);   // 准确度150%
        }
        setup();
}
