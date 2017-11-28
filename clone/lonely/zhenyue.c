#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(NOR + CYN "镇岳尚方" NOR, ({ "zhenyue shangfang", "zhenyue", 
                                              "shangfang", "sword" }));
        set_weight(8000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", NOR + CYN "
此剑乃周昭王瑕在位五十一年以二年岁次壬午，铸五剑，各投
五岳，铭曰镇岳尚方，古文篆书，剑长五尺通体流光。剑脊与
剑柄之上还铸有无数密密麻麻的古篆，似乎与武学有关。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", CYN "$N" CYN "蓦地纵声长啸，霎时寒"
                                 "芒一闪，一道青光破空划过，落于$N"
                                 CYN "掌间。\n" NOR);
                set("unwield_msg", CYN "$N" CYN "一声轻哼，将手中的"
                                   "镇岳尚方宝剑插入剑鞘。\n" NOR);
                set("skill", ([
                        "name"         : "zhenyue-jue",
                        "exp_required" : 300000,
                        "jing_cost"    : 80,
                        "difficulty"   : 80,
                        "max_skill"    : 149,
                        "min_skill"    : 50
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

        if (me->query_skill_mapped("sword") != "henshan-jian"
           && me->query_skill_mapped("sword") != "zigai-jian"
           && me->query_skill_mapped("sword") != "furong-jian"
           && me->query_skill_mapped("sword") != "shilin-jian"
           && me->query_skill_mapped("sword") != "zhurong-jian"
           && me->query_skill_mapped("sword") != "tianzhu-jian"
           && me->query_skill_mapped("sword") != "wushen-jian")
                return damage_bonus / 2;

        switch (random(14))
        {
        case 0:
                victim->receive_damage("jing", n / 2, me);
                victim->receive_wound("jing", n / 4, me);
                return HIW "$N" HIW "将真气运于" NOR + CYN "镇"
                       "岳尚方" HIW "剑身，霎时剑芒暴涨，逼得$n"
                       HIW "连连后退！\n" NOR;
        case 1:
                victim->receive_damage("qi", n, me);
                victim->receive_wound("qi", n, me);
                return HIR "$N" HIR "手中" NOR + CYN "镇岳尚方"
                       HIR "青光荡漾，透出一道道寒冷的剑气直向$n"
                       HIR "而去！\n" NOR;
        }
        return damage_bonus;
}
