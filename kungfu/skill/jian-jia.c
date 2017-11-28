// jian-jia.c 蒹葭

#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "tanqin-jifa"; }

int valid_learn(object me)
{
        if (me->query_skill("tanqin-jifa", 1) < 30)
                return notify_fail("你的弹琴技法水平太差，还是先练好再说吧！\n");

        if (me->query_skill("tanqin-jifa", 1) < me->query_skill("qiuyue-lai", 1))
                return notify_fail("你的弹琴技法所有有限，无法领会更精妙的蒹葭。\n");

        return 1;
}

int practice_skill(object me)
{
        object ob;

        if (! objectp(ob = me->query_temp("handing")) ||
            ! ob->valid_as_qin())
                return notify_fail("你不拿琴在手上，怎么练习？\n");

        if ((int)me->query("jing") < 80)
                return notify_fail("你的精神不够好，没法练习了。\n");

        if ((int)me->query("qi") < 30)
                return notify_fail("你现在口干舌燥，实在是太累了。\n");

        me->receive_damage("jing", 25);
        me->receive_damage("qi", 10);

        return 1;
}

void do_effect(object me)
{
        object *obs;
        int i;

        obs = all_inventory(environment(me));
        for (i = 0; i < sizeof(obs); i++)
        {
                if (! obs[i]->is_character() || obs[i] == me || ! living(obs[i]))
                        continue;

                tell_object(obs[i], HIC "但听琴韵中奏着「" HIW "蒹葭苍苍，白露为霜，所谓伊"
                                    "人，在天一方……" HIC "」\n却不知琴韵何以如此缠绵，竟"
                                    "似充满了思慕之情。\n" NOR);

                if (obs[i]->query_temp("love") == me->query("id"))
                {
                        tell_object(obs[i], HIM "你心中蓦地一动：他琴中所提的「伊人」难道"
                                            "是我么？\n" NOR);

                        message("vision", HIM "\n只见" HIM + obs[i]->name() + HIM "的脸微"
                                          "微一红。\n" NOR, environment(obs[i]), ({obs[i]}));

                        continue;
                }
        }
}
