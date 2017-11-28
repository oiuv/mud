#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "chuixiao-jifa" ||
                                        usage == "tanqin-jifa"; }

int valid_learn(object me)
{
        if (me->query_skill("tanqin-jifa", 1) < 50 &&
            me->query_skill("chuixiao-jifa", 1) < 50)
                return notify_fail("你的吹萧和弹琴的技法水平都太差，还是先练好再说吧！\n");

        if (me->query_skill("tanqin-jifa", 1) < me->query_skill("qingxin-pushan", 1) &&
            me->query_skill("cuhixiao-jifa", 1) < me->query_skill("qingxin-pushan", 1))
                return notify_fail("在掌握更娴熟的吹萧技法或弹琴技法之前，你无法领会更精妙的笑傲江湖曲。\n");

        return 1;
}

int practice_skill(object me)
{
        object ob;

        if (! objectp(ob = me->query_temp("handing")) ||
            ! ob->valid_as_qin() &&
            ! ob->valid_as_xiao())
                return notify_fail("你手上即没有箫，也没有琴，怎么练习？\n");

        if ((int)me->query("jing") < 100)
                return notify_fail("你的精神不够好，没法练习了。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你现在实在是太累了，练不动了。\n");

        me->receive_damage("jing", 60);
        me->receive_damage("qi", 40);

        return 1;
}

void do_effect(object me)
{
        object *obs;
        object ob;
        string type;
        string other;
        int amount;
        int lvl;
        int i;

        lvl = me->query_skill("xiaoao-jianghu", 1);

        if (lvl < 100)
                return;

        if (previous_object() == find_object(SKILL_D("chuixiao-jifa")))
        {
                type = "xajh/xiao";
                other = "xajh/qin";
        } else
        if (previous_object() == find_object(SKILL_D("tanqin-jifa")))
        {
                type = "xajh/qin";
                other = "xajh/qin";
        } else
                return;

        // special effort
        obs = all_inventory(environment(me));
        for (i = 0; i < sizeof(obs); i++)
        {
                ob = obs[i];
                if (ob == me || ! ob->is_character() || ! living(ob))
                        continue;

                if (ob->query_temp("xajh/powerup") ||
                    time() - ob->query_temp(other) > 30 ||
                    ! stringp(ob->query_temp("xajh/player")) ||
                    ob->query_temp("xajh/player") == me->query("id"))
                {
                        ob->set_temp(type, time());
                        ob->set_temp("xajh/player", me->query("id"));
                        ob->set_temp("xajh/player_name", me->name());
                        message("visoin", HIG "你听了" + me->name() +
                                HIG "的曲子，觉得非常的慷慨豪迈。\n" NOR, ob);
                } else
                {
                        // 双人合奏
                        amount = lvl;
                        if (amount > ob->query_skill("force"))
                                amount = ob->query_skill("force");
                        amount /= 6;
                        ob->delete_temp(other);
                        ob->delete_temp(type);
                        ob->add_temp("apply/attack", amount);
                        ob->add_temp("apply/dodge", amount);
                        ob->set_temp("xajh/powerup", 1);
                
                        call_out("remove_effect", lvl / 2, ob, amount);
                        message("vision", HIG "你听了" + me->name() +
                                HIG "和" + ob->query_temp("xajh/player_name") +
                                "合奏的笑傲江湖，只觉得心潮澎湃，充满了力量。\n" NOR, ob);
                        ob->delete_temp("xajh/player");
                        ob->delete_temp("xajh/player_name");
                }
        }
}

void remove_effect(object me, int amount)
{
        if (! objectp(me))
                return;
        if ((int)me->query_temp("xajh/powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/dodge", -amount);
                me->delete_temp("xajh/powerup");
                tell_object(me, "你的心情渐渐的平息下来。\n");
        }
}
