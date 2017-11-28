// shutong.c 书童

#include <ansi.h>

inherit NPC;

string ask_job();
int  do_copy(string arg);
int  working(object me);
int  halt_working(object me);

void create()
{
        set_name("书童", ({ "shu tong", "tong" }));
        set("long", "这是朱先生身边的小书童，看上去年纪还小。\n");
        set("gender", "男性");
        set("age", 15);
        set("no_get", 1);
        set_skill("literate", 50);

        set("combat_exp", 1000);
        set("inquiry", ([
            "买书" : "还是找朱先生吧！我这里可不管。",
            "工作" : (: ask_job :),
            "抄书" : (: ask_job :),
            "job"  : (: ask_job :),
            "书"   : "先生那里书多得很。",
            "借书" : "借？我可没有书借给你呀！",
        ]));

        setup();
}

void init()
{
        add_action("do_copy", "copy");
}

int accept_object(object who, object ob)
{
	command("say 先生说了，无功不受禄！我不能要你的东西。");
        return 0;
}

string ask_job()
{
        object me;
        object *obs;

        me = this_player();
        if (me->query_temp("job/copy"))
                return "让你抄的书你抄完了？";

        if (me->query("combat_exp") < 1200)
                return "虽然在这里只是抄抄书，可是你经验"
                       "太差，遇到流氓捣乱可不好！";

        if (me->query("combat_exp") > 8000)
                return "大侠你还是别抄书了，我可不敢劳您大架。";

        if (me->query("qi") < 20)
                return "我看你脸色不行啊，先歇会儿吧，我可不想抄书抄出人命来。";

        if (me->query("jing") < 10)
                return "我看你精神不行啊，能抄得了书么？";

        if (me->query_int() < 25 && me->query_skill("literate", 1) < 20)
                return "您好像稍稍有那么一点点不太聪明呀！";

        if (! interactive(me))
                return "...";

        obs = filter_array(all_inventory(environment()),
                           (: interactive($1) &&
                              $1 != $(me) &&
                              $1->query_temp("job/copy") &&
                              query_ip_number($1) == query_ip_number($(me)) :));
        if (sizeof(obs) > 0)
                return "我这已经有" + obs[0]->name() + "在干活了，你等等吧。";

        me->set_temp("job/copy", 1);
        return "好，你就帮我抄书(copy)吧！笔墨纸砚在这儿。";
}

int do_copy(string arg)
{
        object me;

        me = this_player();
        if (me->is_busy())
                return notify_fail("你正忙着呢，别着急。\n");

        if (! me->query_temp("job/copy"))
        {
                message_vision("$N摸起毛笔，刚想蘸墨，就听见$n喊道："
                               "拜托拜托，千万别动文房四宝，我要收拾呢。\n",
                               me, this_object());
                return 1;
        }

        me->set_temp("job/step", 1);
	me->start_busy(bind((: call_other, __FILE__, "working" :), me),
                       bind((: call_other, __FILE__, "halt_working" :), me));
        tell_object(me, "你开始工作。\n");
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
                me->delete_temp("job/copy");
                me->delete_temp("job/step");
                return 0;
        }

        finish = 0;
        me->receive_damage("jing", 1);
        me->receive_damage("qi", 2);
        switch (me->query_temp("job/step"))
        {
        case 1:
                msg = "$N拿过砚台，慢慢地研墨。";
                break;
        case 2:
                msg = "$N看看墨磨得差不多了，摸起毛笔，轻轻哈了两口气。";
                break;
        case 3:
                msg = "$N饱蘸墨汁，翻开四书，摊开纸张，开始誊写。";
                break;
        case 4:
        case 6:
                msg = "$N聚精会神的抄写书籍。";
                break;
        case 5:
                msg = "$N蘸了蘸墨，继续仔细地抄写。";
        case 7:
                msg = "$N不断翻动着书籍，纸张越来越厚。";
                break;
        default:
                msg = "$N把书籍抄好，将纸上墨吹干，装订成册，递给$n。";
                finish = 1;
                break;
        }
        msg += "\n";

        if (finish)
        {
                object ob;
                msg += "$n看了$N抄写的书，满意道：“真好！比我"
                       "强多了。诺，这是先生给你的报酬！你可以\n"
                       "在先生那里学点文化。”\n";
                me->delete_temp("job/copy");
                me->delete_temp("job/step");

                b = 5 + random(4);
                me->add_temp("mark/朱", 20);
                me->add("combat_exp", b);
                me->improve_potential((b + 2) / 3);

                if (me->query_skill("literate", 1) < 100)
                        me->improve_skill("literate", (b + 1) / 2);

                ob = new("/clone/money/coin");
                ob->set_amount(50);
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
                                    chinese_number((b + 2) / 3) +
                                    "点潜能。\n\n" NOR);
                }
                return 0;
        }

        me->add_temp("job/step", 1);
        return 1;
}

int halt_working(object me)
{
        message_vision("$N把手中的笔墨纸砚丢到一旁，牢骚道："
                       "什么呀，根本就不是人干的活！\n", me);
        me->delete_temp("job/copy");
        me->delete_temp("job/step");
        return 1;
}
