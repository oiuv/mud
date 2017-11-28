#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(NOR + CYN "软猬甲" NOR, ({ "ruanwei jia", "ruanwei", "jia" }));
        set_weight(8000);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "件");
                set("long", NOR + CYN "
这是一件黑黝黝的软甲，粗看下毫不起眼。这便是桃花岛至宝
软猬甲，只见整个甲身乌黑亮泽，着手柔软，却又是坚硬胜铁，
宝甲外围还生满了倒刺，尖利无比。\n" NOR);
                set("value", 100000);
                set("no_sell", "这是啥？黑不溜秋的。");
                set("material", "cloth");
                set("armor_prop/armor", 150);
                set("stable", 100);
        }
        setup();
}

mixed valid_damage(object ob, object me, int damage)
{
        if (! ob->query_temp("weapon")
           && ! ob->query_temp("secondary_weapon")
           && ! random(ob->query("score")) < 100000
           && random(50) == 1)
	{
                ob->receive_damage("qi", damage, me);
                ob->receive_wound("qi", damage * 2 / 3, me);

                return ([ "damage" : -damage,
                          "msg" : HIR "$N" HIR "一招刚触及$n" HIR "身体，忽觉"
                                  "掌心一阵刺痛，大惊之下连忙缩手。\n" NOR ]);
	}
}
