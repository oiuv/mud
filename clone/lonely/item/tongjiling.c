#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + RED "通缉令" NOR, ({ "tongji ling", "tongji", "ling" }));
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + RED "这是一张皱巴巴的通缉令，上面还带"
                            "有隐隐血迹。\n" NOR);
                set("unit", "张");
                set("value", 10);
                set("no_sell", "官…官府的通缉令…你也敢拿来卖钱？");
                set("material", "paper");
        }
        setup();
}
