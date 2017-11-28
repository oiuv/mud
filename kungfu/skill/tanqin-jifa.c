#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_learn(object me)
{
        if (me->query("int") < 24 && me->query_int() < 35)
                return notify_fail("就你那悟性？五音不全，学什么弹琴？\n");

        return 1;
}

int play(object me, object ob, string arg)
{
        int lvl;
        //int i;
        string m_name;

        if (! arg)
                return notify_fail("你要弹什么曲子？\n");

        if (! (lvl = me->query_skill(arg, 1)))
                return notify_fail("你不会弹这首曲子。\n");

        if (! SKILL_D(arg)->valid_enable("tanqin-jifa"))
                return notify_fail("这不能用来弹奏。\n");

        lvl += me->query_skill("tanqin-jifa", 1) / 2;
        m_name = to_chinese(arg);

        if (me->is_busy())
                return notify_fail("你现在正忙，等会儿再弹琴吧。\n");

        if (lvl < 15)
        {
                message_vision(WHT "\n$N" WHT "胡乱拨了拨$n" WHT "，结果只是发"
                               "出了几下刺耳的杂音。\n" NOR, me, ob);
        } else
        if (lvl < 30)
        {
                message_vision(WHT "\n$N" WHT "拨拉了一下$n" WHT "，发出几声怪"
                               "响，难听的一塌糊涂。\n" NOR, me, ob);
        } else
        if (lvl < 60)
        {
                message_vision(WHT "\n$N" WHT "摆好$n" WHT "轻轻弹了几下，声音"
                               "还算清脆，不太难听。\n" NOR, me, ob);
        } else
        if (lvl < 90)
        {
                message_vision(HIW "\n$N" HIW "摆好$n" HIW "弹了一首" + m_name +
                               HIW "，韵律洋洋洒洒，颇为不错。\n" NOR, me, ob);
        } else
        if (lvl < 150)
        {
                message_vision(HIW "\n$N" HIW "摆好$n" HIW "弹了一首" + m_name +
                               HIW "，颇为动人，引人入胜。\n" NOR, me, ob);
        } else
        if (lvl < 225)
        {
                message_vision(HIW "\n$N" HIW "摆好$n" HIW "弹了一首" + m_name +
                               HIW "，听得众人感慨万千，甚是投入。\n" NOR, me,
                               ob);
        } else
        if (lvl < 300)
        {
                message_vision(HIC "\n$N" HIC "摆好$n" HIC "弹了一首" + m_name +
                               HIC "，琴音宛若溪水荡流，怡然陶趣，雅致万千。\n"
                               NOR, me, ob);
        } else
        {
                message_vision(HIG "\n$N" HIG "摆好$n" HIG "弹了一首" + m_name +
                               HIG "，宛若清溪流上心头，令人无酒自醉，却又似身"
                               "至仙境，心灵空明。\n" NOR, me, ob);
        }
        me->start_busy(3 + random(3));

        SKILL_D(arg)->do_effect(me);
        return 1;
}
