#include <armor.h>
inherit HANDS;
#include <ansi.h>;

void create()
{
        set_name(HIY "金丝手套" NOR, ({ "jinsi shoutao", "shoutao", "jinsi" }));
        set_weight(2900);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "这是一双用金丝编制而成的手套，戴上他可以拿取或触摸带毒的物品而不会中毒。\n" NOR);
                set("unit", "双");
                set("material", "iron");             
                set("value", 500);
                set("no_sell", "这你也卖？\n");
                set("armor_prop/armor", 1);
        }
        setup();
}
