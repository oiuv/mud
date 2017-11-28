#include <ansi.h>
inherit ITEM;

string long();

void create()
{
        set_name(NOR + WHT "剑典残篇" NOR, ({ "jiandian canpian", "jiandian", "canpian" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", "这是一张残缺不全的书页。\n" NOR);
                set("value", 30);
                set("no_sell", "什么世道，就一张破纸头也拿来卖钱？");
                set("material", "paper");
                set("skill_name", "基本剑法");      // 研究技能的名称
                set("skill_type", "sword");         // 研究技能的种类
                set("power_point", 30000);          // 增加技能的点数
                set("need_exp", 100000);            // 研究所需的最低经验
                set("min_lvl", 100);                // 研究所需的最低等级
                set("max_lvl", 300);                // 能够研究的最高等级
        }
        setup();
}

void init()
{
        add_action("do_read", "read");
}

string long()
{
        string msg;

        if (query("power_point"))
        {
                msg = WHT "这是一张" + name() + NOR + WHT "，看样子"
                      "已经颇有年时了。页片上用隶体密密麻麻写满了蝇"
                      "头小字，似乎都和" + query("skill_name") +
                      "有关，你可以试着读读(read)看，也许对武学能够"
                      "有所帮助。";
        } else
                msg = "这是一张残缺不全的书页，可字迹已无法辨清了。";

        return sort_string(msg, 54);
}

int do_read(string arg)
{
        object me = this_player();
        //mapping my = me->query_entire_dbase();	//Warning: Unused local variable

        int na = this_object()->name();
        string booksk = this_object()->query("skill_type");

        if (me->is_busy())
                return notify_fail("你现在正在忙。\n");

        if (me->is_fighting())
                return notify_fail("战斗中无法研读新知。\n");

        if (arg && id(arg))
        {
                if (me->query("combat_exp") < query("need_exp"))
                        return notify_fail("你觉得残页上记载的东西太过深奥，凭自"
                                           "己的武学似乎难以参详。\n");

                if (me->query_skill(booksk, 1) < query("min_lvl"))
                        return notify_fail("你觉得自己对这项技能的了解尚过浅薄，"
                                           "一时无法参详透彻。\n");

                if (me->query_skill(booksk, 1) >= query("max_lvl"))
                        return notify_fail("你觉得残页上记载的东西太过浅显，无法"
                                           "从中获得任何帮助。\n");

                if (! me->can_improve_skill(booksk))
                        return notify_fail("你参详了半天，发觉似乎是由于自身经验"
                                           "不足的缘故，很多东西无法理解。\n");

                message_vision(HIW "$N" HIW "聚精会神地阅读「" NOR + na + HIW
                               "」上所记载的东西，似乎有所收获。\n" NOR, me);

                if (me->can_improve_skill(booksk))
                        me->improve_skill(booksk, query("power_point"));

                tell_object(me, HIY "你只觉以前存在的诸多疑问豁然开朗，对「" +
                                query("skill_name") + "」有了新的感悟。\n" NOR);

                me->start_busy(random(20) + 20);
                destruct(this_object());
                return 1;
        }
}

int query_autoload()
{
        return 1;
}

