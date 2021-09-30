// power.c
// 新增内功运功效果，提升武学作用

#include <ansi.h>

inherit F_CLEAN_UP;

mapping valid_types = ([
        "force":        "内功",
        "unarmed":      "拳脚",
        "sword":        "剑法",
        "blade":        "刀法",
        "staff":        "杖法",
        "hammer":       "锤法",
        "club" :        "棍法",
        "throwing":     "暗器",
        "parry":        "招架",
        "dodge":        "轻功",
        "magic":        "法术",
        "whip":         "鞭法",
        "dagger":       "短兵",
        "finger":       "指法",
        "hand":         "手法",
        "cuff":         "拳法",
        "claw":         "爪法",
        "strike":       "掌法",
        "medical":      "医术",
        "poison":       "毒技",
        "cooking":      "厨艺",
        "chuixiao-jifa" : "吹萧",
        "guzheng-jifa"  : "古筝",
        "tanqin-jifa"   : "弹琴",
]);

int exert(object me, object target)
{
    int skill;
    mapping map;
    string *skills;
    string sk;
    int i, lev;
    sk = "force";
    lev = me->query_skill("force");

    skill = me->query_skill("martial-cognize", 1);
    skills = keys(valid_types);
    map = me->query_skill_map();

    if (target != me)
        return notify_fail("你只能提升自己的战斗力。\n");

    if ((int)me->query("neili") < 100)
        return notify_fail("你的内力不够！\n");

    if ((int)me->query_temp("power"))
        return notify_fail("你已经在运功中了。\n");

    if ((int)me->query_skill("force") < 200)
        return notify_fail("你的内功修为不够,无法提升自己的功力。\n");

    if (skill < 120)
        return notify_fail("你的武学修养不够,无法提升自己的功力。\n");

    for (i = 0; i < sizeof(skills); i++)
    {
            if (undefinedp(map[skills[i]]))
                    continue;

            if (! me->query_skill(skills[i]))
                    continue;

            if (lev < me->query_skill(skills[i]))
            {
                sk = skills[i];
                lev = me->query_skill(skills[i]);
            }
    }

    me->set("neili", 0);

    message_combatd(HIY "$N" HIY "纵声长笑，丹田中内力激荡，"
                        "衣角悄然扬起，似乎要乘风而去，飘飘欲仙！\n" NOR, me);

    me->add_temp("apply/" + sk, skill / 5);

    me->set_temp("power", 1);

    if (me->is_fighting()) me->start_busy(3);

    return 1;
}
