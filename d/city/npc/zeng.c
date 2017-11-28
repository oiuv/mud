// zeng.c

#include <ansi.h>

inherit NPC;
inherit F_DEALER;

string ask_job();

int  working(object me);
int  halt_working(object me);

void create()
{
	set_name("曾柔", ({ "zeng rou", "zeng", "rou" }));
	set("gender", "女性");
	set("age", 16);
	set("per", 25);
	set("con", 25);
	set("int", 25);
	set("dex", 25);
	set("str", 25);
	set("long",
"她是韦爵爷不知道第几房的小妾，在这里开个成衣铺，卖些不知道
哪来的衣服。有人说那都是韦爵爷从宫中弄出来的禁品。话这么说，
生意照样红活。\n");
	set_skill("unarmed", 60);
	set_skill("changquan", 60);
	map_skill("unarmed", "changquan");
	set_temp("apply/damage", 15);

	set("combat_exp", 50000);
	set("attitude", "friendly");
	set("vendor_goods", ({
		__DIR__"cloth/belt",
		__DIR__"cloth/boots",
		__DIR__"cloth/bu-shoes",
		__DIR__"cloth/cloth",
		__DIR__"cloth/color-dress",
		__DIR__"cloth/fu-cloth",
		__DIR__"cloth/gui-dress",
		__DIR__"cloth/hat",
		__DIR__"cloth/jade-belt",
		__DIR__"cloth/liu-dress",
		__DIR__"cloth/marry-dress",
		__DIR__"cloth/mini-dress",
		__DIR__"cloth/moon-dress",
		__DIR__"cloth/pink-dress",
		__DIR__"cloth/qi-dress",
		__DIR__"cloth/red-dress",
		__DIR__"cloth/scarf",
		__DIR__"cloth/sha-dress",
		__DIR__"cloth/shoes",
		__DIR__"cloth/xian-cloth",
		__DIR__"cloth/xiu-cloth",
		__DIR__"cloth/xiu-scarf",
		__DIR__"cloth/yan-dress",
		__DIR__"cloth/zi-dress",
	}));
	
        set("inquiry", ([
            "工作" : (: ask_job :),
            "job"  : (: ask_job :),
        ]));

	setup();
	carry_object(__DIR__"cloth/feature");
	carry_object(__DIR__"cloth/feature")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
        add_action("do_sew", "sew");
}

string ask_job()
{
        object me;
//      object *obs;

        me = this_player();
        if (me->query_temp("job/sew"))
                return "让你做的衣服你弄好了么？";

        if (me->query("gender") != "女性")
                return "这女孩子家的活你也来干？";

        if (me->query("combat_exp") < 50)
                return "让你在我这儿干活我还真有点不放心。";

        if (me->query("combat_exp") > 30000)
                return "大侠您好，您还是看见什么好的自己选件吧，让您干活也太委屈了！";

        if (me->query("qi") < 30)
                return "你脸色这么差，还是先歇会儿吧。";

        if (me->query("jing") < 30)
                return "你精神头不行啊，别把我的料子糟踏了！";

        if (me->query_int() < 20)
                return "嘻嘻...你这么笨手笨脚的，也会做衣服？";

        if (! interactive(me))
                return "...";
/*
//取消人数限制
        obs = filter_array(all_inventory(environment()),
                           (: interactive($1) &&
                              $1 != $(me) &&
                              $1->query_temp("job/sew") &&
                              query_ip_number($1) == query_ip_number($(me)) :));
        if (sizeof(obs) > 0)
                return "现在已经有" + obs[0]->name() + "在帮我啦，不劳你了。";
*/
        me->set_temp("job/sew", 1);
        return "好，你就帮我做点裁缝(sew)的小活吧！喏，东西都在这儿。";
}

int do_sew(string arg)
{
        object me;

        me = this_player();
        if (me->is_busy())
                return notify_fail("你正忙着呢，别着急。\n");

        if (! me->query_temp("job/sew"))
        {
                message_vision("$N偷偷的拿起一个顶针，$n一声娇吒道："
                               "你给我放下，有什么好玩的？\n",
                               me, this_object());
                return 1;
        }

        me->set_temp("job/step", 1);
	me->start_busy(bind((: call_other, __FILE__, "working" :), me),
                       bind((: call_other, __FILE__, "halt_working" :), me));
        tell_object(me, "你开始缝纫。\n");
        return 1;
}

int working(object me)
{
        string msg;
        int finish;
        int b;

        if (! me->query_temp("job/step"))
                me->set_temp("job/step", 1);

        if (! living(me))
        {
                me->delete_temp("job/sew");
                me->delete_temp("job/step");
                return 0;
        }

        finish = 0;
        me->receive_damage("jing", 1);
        me->receive_damage("qi", 2);
        switch (me->query_temp("job/step"))
        {
        case 1:
                msg = "$N戴上一个顶针，摸出针线。";
                break;
        case 2:
                msg = "$N展开布料，对着样子比划了半天。";
                break;
        case 3:
                msg = "$N轻轻的折了折料子，留下几条痕印。";
                break;
        case 4:
        case 6:
                msg = "$N专心致志的一针一线的缝纫。";
                break;
        case 5:
                msg = "$N凝眉看了看样子，若有所思。";
        case 7:
                msg = "$N轻动纤纤细指，缝针上下穿梭，衣服的模样渐渐的出来了。";
                break;
        default:
                msg = "$N把衣服缝好，烫熨完毕，叠好递给$n。";
                finish = 1;
                break;
        }
        msg += "\n";

        if (finish)
        {
                object ob;
                msg += "$n看了$N缝出来的衣服，点头道：不错，有点意思。\n";
                me->delete_temp("job/sew");
                me->delete_temp("job/step");
				//基础奖励增加5倍
                b = 20 + random(20);
                me->add("combat_exp", b);
                me->improve_potential((b + 10) / 3);

                ob = new("/clone/money/coin");
                ob->set_amount(60);
                ob->move(me, 1);
        }

	msg = replace_string(msg, "$N", "你");
	msg = replace_string(msg, "$n", name());
	tell_object(me, msg);

        if (finish)
        {
                if (b > 0)
                {
                        tell_object(me, HIC "\n你获得了" +
                                    chinese_number(b) +
                                    "点经验和" +
                                    chinese_number((b + 10) / 3) +
                                    "点潜能。\n\n" NOR);
                }
                return 0;
        }

        me->add_temp("job/step", 1);
        return 1;
}

int halt_working(object me)
{
        message_vision("$N把手中的针线一扔，嘀咕道："
                       "没劲，本姑娘不干了！\n", me);
        me->delete_temp("job/sew");
        me->delete_temp("job/step");
        return 1;
}
