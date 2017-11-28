#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_learn(object me)
{
        if (me->query("int") < 24 && me->query_int() < 35)
                return notify_fail("就你那悟性？五音不全，学什么吹箫？\n");

        return 1;
}

int play(object me, object ob, string arg)
{
        int lvl;
        //int i;
        string m_name;

        if (! arg)
                return notify_fail("你要吹什么曲子？\n");

        if (! (lvl = me->query_skill(arg, 1)))
                return notify_fail("你不会吹这首曲子。\n");

        if (! SKILL_D(arg)->valid_enable("chuixiao-jifa"))
                return notify_fail("这也能当箫曲吹么？\n");

        lvl += me->query_skill("chuixiao-jifa", 1) / 2;
        m_name = to_chinese(arg);

        if (me->is_busy())
                return notify_fail("你现在正忙，等会儿再吹箫吧。\n");

        if (lvl < 15)
        {
                message_vision(WHT "\n$N" WHT "鼓足气吹了一下$n" WHT "，结果只"
                               "是发出几下刺耳的呜呜声。\n" NOR, me, ob);
        } else
        if (lvl < 30)
        {
                message_vision(WHT "\n$N" WHT "鼓足气吹了一下$n" WHT "，发出几"
                               "声怪响，难听的一塌糊涂。\n" NOR, me, ob);
        } else
        if (lvl < 60)
        {
                message_vision(WHT "\n$N" WHT "拿起$n" WHT "轻轻吹了几声，声音"
                               "还算马马虎虎，不太难听。\n" NOR, me, ob);
        } else
        if (lvl < 90)
        {
                message_vision(HIW "\n$N" HIW "拿起$n" HIW "吹了一首" + m_name +
                               HIW "，韵律洋洋洒洒，颇为不错。\n" NOR, me, ob);
        } else
        if (lvl < 150)
        {
                message_vision(HIW "\n$N" HIW "拿起$n" HIW "吹了一首" + m_name +
                               HIW "，颇为动人，引人入胜。\n" NOR, me, ob);
        } else
        if (lvl < 225)
        {
                message_vision(HIW "\n$N" HIW "拿起$n" HIW "吹了一首" + m_name +
                               HIW "，听得众人感慨万千，甚是投入。\n" NOR, me,
                               ob);
        } else
        if (lvl < 300)
        {
                message_vision(HIC "\n$N" HIC "拿起$n" HIC "吹了一首" + m_name +
                               HIC "，箫音如梦如幻，似乎有一股清香直沁心脾。\n"
                               NOR, me, ob);
        } else
        {
                message_vision(HIG "\n$N" HIG "拿起$n" HIG "吹了一首" + m_name +
                               HIG "，若哀若思，犹如身临其境，忽悲忽喜，又如乘"
                               "风而行，不知踪影。\n" NOR, me, ob);
        }
        me->start_busy(3 + random(3));

        SKILL_D(arg)->do_effect(me);
        return 1;
}
