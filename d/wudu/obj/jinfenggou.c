#include <weapon.h>
inherit SWORD;
#include <ansi.h>
void create()
{
        set_name(HIY "金蜈钩" NOR, ({ "jinwu gou", "gou", "jinwu" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄金光闪闪的钩子，顶端好似一只蛇头。\n");
                set("value", 10000);
                set("material", "steel");
                set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回鞘中。\n");
        }
        init_sword(200);
        setup();
}
