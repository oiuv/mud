// jiangong 监工

#include <ansi.h>

inherit NPC;

mixed ask_mine();
mixed ask_transit();
int   do_mine(string arg);
int   working(object me);
int   halt_working(object me);

void create()
{
        set_name("监工", ({ "jian gong", "jiangong" }));
        set("long", "这是一个监工，眼光不断闪烁，不知"
                    "道在打什么坏主意\n");
        set("gender", "男性");
        set("age", 38);
        set("no_get", 1);
        set_skill("unarmed", 100);

        set_temp("apply/attack", 100);
        set_temp("apply/damage", 100);

        set("combat_exp", 500000);
        set("shen_type", 1);
        set("inquiry", ([
                "job"  : "你是想采矿(mine)啊，还是运货(transit)？",
                "工作" : "你是想采矿(mine)啊，还是运货(transit)？",
                "采矿" : (: ask_mine :),
                "mine" : (: ask_mine :),
                "运货" : (: ask_transit :),
                "transit" : (: ask_transit :),
        ]));
        setup();

        set("chat_chance", 1);
        set("chat_msg", ({
                "监工喝道：快！快给我干！\n",
                "监工一扬鞭子，骂道：他奶奶的，你给我放老实点。\n",
                "监工打量着四周，不知道在打什么主意。 \n",
                "监工狠狠的抽了一个人几下，骂道：怎么把石头掉到地上了，你这笨蛋。\n",
        }));
}

void init()
{
        add_action("do_mine", "move");
        add_action("do_mine", "mine");
}

mixed ask_mine()
{
        object me;
//      object *obs;

        me = this_player();
        if (wizardp(me))
                return "您老还是别想着深入民间体验生活了吧，这活挺累的。";

        if (me->query_temp("job/move"))
                return "让你搬的石料你搬了没有？再胡闹我抽死你！";

        if (me->query("combat_exp") < 1500)
                return "你这点经验也来采石场混？随便一大哥看你不顺眼就把你放倒了。";

        if (me->query("combat_exp") > 100000)
                return "大侠你也来搬石头？免了免了，我还是另找人吧！";

        if (me->query("qi") < 60)
                return "我看你上气不接下气了嘛，还是算了吧，我可不想闹出人命来。";

        if (me->query_str() < 25)
                return "我说你有多点力气，也来凑热闹？";

        if (! interactive(me))
                return "...";
/*
        obs = filter_array(all_inventory(environment()),
                           (: interactive($1) &&
                              $1 != $(me) &&
                              $1->query_temp("job/move") &&
                              query_ip_number($1) == query_ip_number($(me)) :));
        if (sizeof(obs) > 0)
                return "现在已经有" + obs[0]->name() + "干活呢，你歇着吧。";
*/
        me->set_temp("job/move", 1);
        return "好，你就去山上搬石料下来(move)，我这工资可不菲哦。";
}

int do_mine(string arg)
{
        object me;

        me = this_player();
        if (me->is_busy())
                return notify_fail("你正忙着呢，别着急。\n");

        if (! me->query_temp("job/move"))
                return notify_fail("你又没领活，瞎忙活啥？\n");

        me->set_temp("job/step", 1);
		//说明：wizard做任务会报错
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
                me->delete_temp("job/move");
                me->delete_temp("job/step");
                return 0;
        }

        finish = 0;
        switch (me->query_temp("job/step"))
        {
        case 1:
                me->receive_damage("qi", 1);
                msg = "$N快步的朝山上走去。";
                break;
        case 2:
                me->receive_damage("qi", 1);
                msg = "$N走到山腰，道：我是来搬石料的。";
                break;
        case 3:
                me->receive_damage("qi", 1);
                msg = "来往的工人扫了$N一眼，似乎没看到。一个爆破手道：嗨，那儿，去那儿搬。";
                break;
        case 4:
                me->receive_damage("qi", 6);
                msg = "$N赶到爆破的地方，选了一块正合适自己的石料，扛在肩头。";
                break;
        case 5:
        case 7:
        case 9:
                me->receive_damage("qi", 8);
                msg = "$N扛着石料，一步一步往山下挨。";
                break;
        case 6:
                me->receive_damage("qi", 9);
                msg = "$N喘了口气，掂了掂肩头的石料，继续前进。";
                break;
        case 8:
                me->receive_damage("qi", 10);
                msg = "$N觉得肩头的石料越来越重，只好换一下肩扛。";
                break;
        default:
                me->receive_damage("qi", 5);
                msg = "$N把石料扛到$n那里，把石料装上车子，总算松了口气。";
                finish = 1;
                break;
        }
        msg += "\n";

        if (finish)
        {
                object ob;
                if (me->query_str() >= 30)
                        msg += "$n看了$N搬的石料，讶道：厉害"
                               "啊，这么大块石料也搬下来了！\n";
                else
                        msg += "$n看了$N搬的石料，道：行，干得"
                               "不赖！喏，这是你的工钱。\n";
                me->delete_temp("job/move");
                me->delete_temp("job/step");

                // 本地石料增多
                environment(me)->improve_product_amount("stone",
                                                        15 + (me->query_str() - 30) * 4 + random(8));
				// 奖励增加5倍
                b = 35 + random(20);
                me->add("combat_exp", b);
                me->improve_potential((b + 10) / 3);
                me->improve_skill("unarmed", (b + 5) / 2);

                ob = new("/clone/money/coin");
                ob->set_amount(100 + (me->query_str() - 25) * 10);
                ob->move(me, 1);
        }

        message_vision(msg, me, this_object());
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
        if (me->query_temp("job/step") >= 4)
        {
                message_vision("$N把肩头的石料一仍，骂骂咧咧道："
                               "累死我了，真不是人干的活！\n", me);
        } else
        {
                message_vision("$N叹了口气，道：今天不干了！\n", me);
        }

        me->delete_temp("job/move");
        me->delete_temp("job/step");
        return 1;
}

mixed ask_transit()
{
        string startroom;
        int c;
        object ob;
        object me;
        int amount;

        if (! stringp(startroom = query("startroom")) ||
            find_object(startroom) != environment())
                // not in start room
                return "我...我有点头晕...";

        me = this_player();

        if (me->query("score") < 1000)
                return "你这人阅历这么浅，也敢接这差使？";

        if (me->query("combat_exp") < 30000)
                return "一边儿去！你这人本事太差，我可不放心让你押货！";

        if (me->query("combat_exp") > 300000)
                return "嘿，您不是跟我开玩笑吧，干这活太委屈你了。";

        if (objectp(me->query_temp("job/gw_cart")))
                return "上次让你送的你完事了么？快去！别罗嗦！";

        if ((amount = me->query("job/gw_stone")) > 0)
        {
                amount = (amount + 99) / 20;
                // 五天(MUD时间)内如果货物还没有送达，则不能领
                message_sort("$N冷笑一声，对$n道：“" + me->name(1) +
                             "，上次你送的石料... 哼！你本事"
                             "低微，这次我不多加追究了，可是"
                             "那一车石料岂能就这样白白的丢了"
                             "？你先赔了" + chinese_number(amount) +
                             "两白银再说！”\n",
                             this_object(), me);
                return 1;
        }

        c = environment(me)->query_product_amount("stone");
        if (c < 800)
                return "现在还没有多少石料呢，不忙运走，你等等吧。";
        else
        if (c < 1200)
                message_vision("$N看了看$n，道：“也好，虽然"
                               "现在还不多，不过也差不多了。”\n",
                               this_object(), me);
        else
        if (c < 2000)
                message_vision("$N点点头，对$n道：“好吧，就"
                               "快满一车了，就发了吧。”\n",
                               this_object(), me);
        if (c < 10000)
                message_vision("$N看到$n，招呼道：“正好，正"
                               "打算发车呢，就你来吧！”\n",
                               this_object(), me);
        else
        if (c < 30000)
                message_vision("$N连忙道：“快准备吧，这里已"
                               "经有好几车了！”\n",
                               this_object(), me);
        else
                message_vision("$N看到$n，大喜道：“正好！眼"
                               "看这库里就要满了，你来的正好！”\n",
                               this_object(), me);

        if (c > 3000) c = 3000;
        environment(me)->improve_product_amount("stone", -c);

        // 生成交通工具
        ob = new("/clone/misc/cart");
        ob->set_temp("goods/name", "石料");
        ob->set_temp("goods/id",   "stone");
        ob->set_temp("goods/unit", "斤");
        ob->set_temp("goods/amount", c);
        message_sort("$N吆喝两声，叫人推过一" + ob->query("unit") +
                     ob->name() + "来，回头对" + me->name() +
                     "道：“来！你把这车货物送到长安工部石厂去，"
                     "你别把石头不当钱，丢了一样要你的命！”\n",
                     this_object(), me);
        tell_object(me, YEL + name() + "交给你一" + ob->query("unit") +
                        ob->name() + "。\n" NOR);
        ob->move(environment(me));
        ob->set_owner(me);

        // 记录这次任务的信息
        me->set("job/gw_stone", c);
        me->set_temp("job/gw_cart", ob);
        ob->set_temp("job/info", "gw_stone");
        ob->set_temp("job/owner", me);

        return 1;
}

int accept_object(object who, object ob)
{
        int amount;

        if (! ob->query("money_id"))
                return 0;

        if ((amount = who->query("job/gw_stone")) > 0)
        {
                amount = (amount + 99) / 20;
                if (ob->value() < amount * 100)
                {
                        message_vision("$N看了看$n递过来的钱，大喝"
                                       "道：“就这点？一边儿去！”\n",
                                       this_object(), who);
                        return 0;
                }

                message_vision("$N鼻子哼了一声，接过" + ob->name() +
                               "，道：“算了，就不追究你了。”\n",
                               this_object(), who);
                who->delete("job/gw_stone");
        } else
        {
                message_vision("$N眉开眼笑，把" + ob->name() +
                               "接了过来，收入包囊，却不理会$n。\n",
                               this_object(), who);
        }

        destruct(ob);
        return -1;
}
