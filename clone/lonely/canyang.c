#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(HIY "残阳宝剑" NOR, ({ "canyang baojian", "canyang", 
                                        "sword" }));
        set_weight(8000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIY "
此剑长五尺，细而长，通体泛出金光。剑柄弯曲，上刻残阳图
纹，剑脊之上还铸有无数密密麻麻的古篆，似乎与武学有关。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", CYN "$N" CYN "蓦地纵声长啸，霎时寒"
                                 "芒一闪，一道金光破空划过，落于$N"
                                 CYN "掌间。\n" NOR);
                set("unwield_msg", CYN "$N" CYN "一声轻哼，将手中的"
                                   "残阳宝剑插入剑鞘。\n" NOR);
                set("skill", ([
                        "name"         : "poyang-jian",
                        "exp_required" : 300000,
                        "jing_cost"    : 90,
                        "difficulty"   : 92,
                        "max_skill"    : 129,
                        "min_skill"    : 60
                ]));

                set("stable", 100);
        }
        init_sword(140);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n = me->query_skill("sword");

        if (me->query_skill("sword") < 150)
                return damage_bonus / 2;

        if (me->query_skill_mapped("sword") != "poyang-jian")
                return damage_bonus / 2;

        switch (random(4))
        {
        case 0:
                victim->receive_damage("jing", n / 2 , me);
                victim->receive_wound("jing", n / 4, me);
                return HIW "$N" HIW "长啸一声，手中" HIY "残阳宝剑" HIW 
                           "横于胸前，猛地挥出，一阵炽热的剑气将$n" 
                           HIW "逼得连连后退。\n" NOR;
        case 1:
                victim->receive_damage("qi", n, me);
                victim->receive_wound("qi", n, me);
                return HIR "$N" HIR "手中" HIY "残阳宝剑" HIR "突然剑光"
                           "一闪，耀眼夺目，一道炽热的剑气划向$n" HIR "。\n" NOR;
        }
        return damage_bonus;
}
