#include <weapon.h>
#include <ansi.h>
inherit SWORD;

void create()
{
        set_name(NOR + WHT "倚天剑" NOR, ({ "yitian jian", "yitian", "jian", "sword" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", HIY "这便与天下至尊的屠龙宝刀并称的倚天剑。\n" NOR);
                set("value", 500);
                set("material", "wood");
                set("wield_msg", HIM "$N" HIM "「唰」的抽出$n" HIM "，顿时闻"
                                 "到一股奇异的香味。\n仔细一看，原来这柄倚天"
                                 "剑竟是木头制成的。\n" NOR);
        }
        init_sword(10);
        setup();
}
