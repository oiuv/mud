// smith.c

#include <ansi.h>

inherit NPC;
inherit F_DEALER;

string ask_me();
int  do_gu(string arg);
int  do_dapi(string arg);
int  do_cuihuo(string arg);
int  do_repair(string arg);
void reward(object me);

// no create_function: inherit by other NPC

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
        add_action("do_gu", "gu");
        add_action("do_dapi", "dapi");
        add_action("do_cuihuo", "cuihuo");
        add_action("do_repair", "repair");
        add_action("do_repair", "xiuli");
}

void setup()
{
        set("inquiry/job",    (: ask_me :));
        set("inquiry/工作",   (: ask_me :));
        set("inquiry/repair", "你想要修(" HIY "repair" NOR + CYN ")点什么？" NOR);
        set("inquiry/修理",   "你想要修(" HIY "repair" NOR + CYN ")点什么？" NOR);

        ::setup();
}

string ask_me()
{
        object me = this_player();

        if (me->query("combat_exp") > 10000)
                return "让您老干这个未免屈尊了吧？";

        if (me->query("qi") < 50)
                return "你还是歇会儿吧！要是出了人命我可承担不起。";

        if (me->query_temp("smith/gu"))
                return "让你去鼓(" HIY "gu" NOR + CYN ")风箱，你"
                       "怎么还磨蹭？";

        if (me->query_temp("smith/dapi"))
                return "叫你打的坯(" HIY "dapi" NOR + CYN ")你打"
                       "了没有？";

        if (me->query_temp("smith/cuihuo"))
                return "干活怎么尽偷懒？快给我淬火(" HIY "cuihuo"
                       NOR + CYN ")去！";

        switch(random(3))
        {
        case 0:
                me->set_temp("smith/gu", 1);
                return "好！你帮我鼓(" HIY "gu" NOR + CYN ")一会"
                       "儿风箱。";

        case 1:
                me->set_temp("smith/dapi", 1);
                return "这样吧，你帮我打(" HIY "dapi" NOR + CYN
                       ")一下坯吧！";

        case 2:
                me->set_temp("smith/cuihuo", 1);
                return "去帮我把这些刚出炉的淬(" HIY "cuihuo" NOR
                       + CYN ")一下火。";
        }
}

int do_gu(string arg)
{
        object me = this_player();

        if (me->is_busy())
                return notify_fail("你现在正忙。\n");

        if (! me->query_temp("smith/gu"))
        {
                message_vision(HIR "\n$n" HIR "刚偷偷的拉起鼓风机，鼓"
                               "了几阵风。\n就听见$N" HIR "对$n" HIR
                               "大喝道：滚开，乱搞什么。\n" NOR,
                               this_object(), me);
                return 1;
        }

        message_vision(HIY "$n" HIY "拉起鼓风机拼命鼓了起来，$N" HIY
                       "看了点了点头。\n" NOR,
                       this_object(), me);
        reward(me);
        return 1;
}

int do_dapi(string arg)
{
        object me = this_player();

        if (me->is_busy())
                return notify_fail("你现在正忙。\n");

        if (! me->query_temp("smith/dapi"))
        {
                message_vision(HIR "\n$n" HIR "拿起几块生铁，在手里"
                               "掂了掂。\n就听见$N" HIR "对$n" HIR
                               "大喝道：放下，乱搞什么。\n" NOR,
                               this_object(), me);
                return 1;
        }

        message_vision(HIY "$n" HIY "拿着锤子对刚出炉的火热的生铁用"
                       "力敲打着，$N" HIY "“嗯”了一声，看上去有些"
                       "满意。\n" NOR,
                       this_object(), me);
        reward(me);
        return 1;
}

int do_cuihuo(string arg)
{
        object me = this_player();

        if (me->is_busy())
                return notify_fail("你现在正忙。\n");

        if (! me->query_temp("smith/cuihuo"))
        {
                message_vision(HIR "\n$n" HIR "刚抄起一个打造好的坯子"
                               "，摆弄了几下。\n就听见$N" HIR "对$n"
                               HIR "大喝道：放下，别给我搞坏了。\n" NOR,
                               this_object(), me);
                return 1;
        }

        message_vision(HIY "$N" HIY "用铁钳抄起一块火红的坯子，伸进"
                       "了水池，“哧”的一声轻烟四冒。\n" NOR, me);
        reward(me);
        return 1;
}

void reward(object me)
{
        int exp, pot;
        object coin;

        me->delete_temp("smith/gu");
        me->delete_temp("smith/dapi");
        me->delete_temp("smith/cuihuo");

        coin = new("/clone/money/coin");
		// 奖励增加5倍（2013-12-01 20:18:55）
        coin->set_amount(50 + random(50));
        coin->move(this_object());
        message_vision(CYN "$N" CYN "对$n" CYN "道：干得不坏，这是给"
                       "你的工钱。\n" NOR, this_object(), me);

        command("give coin to " + me->query("id"));
		// 奖励增加5+5倍（2013-12-01 20:18:55）
        exp = 20 + random(10);
        pot = 10 + random(10);

        me->add("combat_exp", exp);
        me->improve_potential(pot);

        if (me->query("potential") > me->query_potential_limit())
        	pot = 1;

        tell_object(me, HIC "你获得了" + chinese_number(exp) +
                        "点经验和" + chinese_number(pot) + "点潜能。"
                        "\n" NOR );

        me->receive_damage("qi", 30 + random(20));
        me->start_busy(3);
}

int do_repair(string arg)
{
        object me;
        object ob;
        mixed  msg;
        int consistence;
        int cost;
        mapping repair;

        if (! arg)
                return notify_fail("你打算修理什么物件？\n");

        me = this_player();

        if (! objectp(ob = present(arg, me)))
                return notify_fail("你身上好像没有这样东西。\n");

        if (undefinedp(consistence = ob->query("consistence")))
                return notify_fail(ob->name() + "似乎不需要在这里修理吧？\n");

        if (consistence >= 100)
                return notify_fail(ob->name() + "现在完好无损，修理做什么？\n");

        if (! undefinedp(msg = ob->query("no_repair")))
        {
                if (! stringp(msg))
                        write(CYN + name() + CYN "皱眉道：这东西我可修"
                              "理不了。\n" NOR);
                else
                        write(CYN + name() + CYN "皱眉道：" + msg + NOR
                              + CYN);
                return 1;
        }

        if (mapp(repair = me->query_temp("pending/repair")) &&
            repair["item"] == ob)
        {
                if (me->is_busy())
                        return notify_fail("你现在正忙着呢！\n");

                if (MONEY_D->player_pay(me, repair["cost"]) != 1)
                        return notify_fail("你身上的钱不够呀！\n");

                message_vision(HIW "$n" HIW "把" + ob->name() + HIW "递"
                               "给了$N" HIW "。\n只见$N" HIW "拿起工具，"
                               "东敲西补，将" + ob->name() + HIW "好好修"
                               "了修。\n" NOR, this_object(), me);

                ob->set("consistence", 100);
                message_vision(HIC "$N" HIC "道：“好了。”随手把" + ob->name()
                               + HIC "还给了$n" HIC "，$n" HIC "看了看，"
                               "满意的掏出了一些钱付了帐。\n" NOR,
                               this_object(), me);

                me->start_busy(1 + random(100 - consistence) / 10);
                me->delete_temp("pending/repair");
                return 1;
        }

        cost = (120 - consistence) * ob->query("value") / 480;
        if (cost >= 100000) cost = ((cost - 100000) / 2 + 100000) / 10000 * 10000; else
        if (cost >= 10000)  cost = cost / 1000 * 1000; else
        if (cost >= 1000)   cost = cost / 100 * 100; else
        if (cost >= 100)    cost = cost / 10 * 10;

        message_vision(CYN "\n$n" CYN "拿出一" + ob->query("unit") +
                       ob->name() + NOR + CYN "，$N" CYN "瞥了一眼"
                       "，道：要修好它得要" + MONEY_D->price_str(cost) +
                       NOR + CYN "才行。\n" NOR, this_object(), me);

        tell_object(me, YEL "如果你的确想修理这件物品，请再输入一次这条命令。\n" NOR);
        me->set_temp("pending/repair/item", ob);
        me->set_temp("pending/repair/cost", cost);
        return 1;
}
