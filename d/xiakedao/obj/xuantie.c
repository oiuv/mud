// xuantie.c 玄铁令

#include <armor.h>
#include <ansi.h>

inherit NECK;

void create()
{
        set_name(HIC "玄铁令" NOR, ({ "xuan tie", "xuan" }));
        set("long", "\n这是一块碧绿色的玉牌，莹洁光绿，真是一块好玉。\n"+
         "正面雕龙刻凤，正中写着玄铁两个大字。这便是江湖上传说的玄铁令。\n");
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("value", 50000);
                set("material", "玉");
                set("armor_prop/armor", 2);
                set("female_only", 1);
        }
        setup();
}
