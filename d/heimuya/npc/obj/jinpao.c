#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(HIW "日月锦袍" NOR, ({ "jin pao", "jin", "pao", "cloth" }));
        set("long", HIW "这是一件日月神教长老所穿戴的华丽锦袍。\n" NOR);
        set_weight(10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("material", "cloth");
                set("unit", "件");
                set("armor_prop/armor", 1);
                set("value", 10000);
                set("no_sell", "我的天…连日月神教的东西你都拿出来卖？");
        }
        setup();
}
