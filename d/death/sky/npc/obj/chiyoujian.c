#include <weapon.h>
#include <ansi.h>
inherit SWORD;
void create()
{
        set_name( WHT "玄蚩神剑" NOR,  ({ "chiyou jian", "sword", "jian" }));
        set_weight(20000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄玄铁铸造的长剑，剑柄上雕有蚩尤的头像。\n");
                set("value", 100000);
                set("material", "gold");
                set("wield_msg", HIR "$N" HIR "抽出玄蚩神剑挥舞了个剑花，只感到一阵"
                                 NOR + HIW "寒气" NOR + HIR "扑面而来。\n" NOR);
        }
        init_sword(200);
        setup();
}
