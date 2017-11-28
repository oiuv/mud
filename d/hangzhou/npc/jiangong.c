// jiangong 监工

#include <ansi.h>

inherit NPC;

mixed ask_mine();
mixed ask_transit();
int  do_move(string arg);
int  working(object me);
int  halt_working(object me);

void create()
{
        set_name("监工", ({ "jian gong", "jian", "gong", "jiangong" }));
        set("long", "这是一个监工，手持长鞭，眼光一眨不眨的"
                    "盯着众人，口中吆喝个不停。\n");
        set("gender", "男性");
        set("age", 32);
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
                CYN "监工喝道：快！快给我干！\n" NOR,
                CYN "监工一扬鞭子，骂道：他奶奶的，你给我放老实点。\n" NOR,
                CYN "监工打量着四周，不知道在打什么主意。\n" NOR,
                CYN "监工狠狠的抽了一个人几下，骂道：怎么把矿石掉到地上了，你这笨蛋。\n" NOR,
        }));

        carry_object("clone/weapon/changbian")->wield();
}

void init()
{
        add_action("do_mine", "mine");
}

mixed ask_mine()
{
        object me;
//      object *obs;

        me = this_player();
        if (wizardp(me))
                return "您老还是别想着深入民间体验生活了吧，这活挺累的。";

        if (me->query_temp("job/mine"))
                return "不是让你去采么？你干完了？少在我面前玩花样！";

        if (me->query("combat_exp") < 10000)
                return "滚开，就你这点本事，下井被砸死都不知道。";

        if (me->query("combat_exp") > 300000)
                return "嘿，您不是跟我开玩笑吧，干这活太委屈你了。";

        if (me->query("qi") < 120)
                return "我看你已经快死了，还是快滚吧！";

        if (me->query_str() < 28)
                return "我说你有多点力气，也来凑热闹？";

        if (! interactive(me))
                return "...";
/*
        obs = filter_array(all_inventory(environment()),
                           (: interactive($1) &&
                              $1 != $(me) &&
                              $1->query_temp("job/mine") &&
                              query_ip_number($1) == query_ip_number($(me)) :));

        if (sizeof(obs) > 0)
                return "现在已经有" + obs[0]->name() + "干活呢，你歇着吧。";
*/

        me->set_temp("job/mine", 1);
        return "好，你下井去采(mine)些矿石上来，放到那边的车上，干了活官府自然会给钱。";
}

int do_mine(string arg)
{
        object me;
        object *obs;

        me = this_player();
        if (me->is_busy())
                return notify_fail("你正忙着呢，别着急。\n");

        if (! me->query_temp("job/mine"))
                return notify_fail("你又没领活，瞎忙活啥？\n");

        // 查看当时采矿的有多少人
        obs = filter_array(all_inventory(environment(me)),
                           (: userp($1) && $1->query_temp("job/step") :));

        if (sizeof(obs) >= 15)
                return notify_fail("现在采矿的人好多，排"
                                   "队等着下井，你只好先等会儿。\n");

        me->set_temp("job/step", 1);
        me->start_busy(bind((: call_other, __FILE__, "working" :), me),
                       bind((: call_other, __FILE__, "halt_working" :), me));
        tell_object(me, HIC "你开始工作。\n" NOR);
        return 1;
}

int working(object me)
{
        string msg;
        int finish;
        int b;
        object bonus;

        if (! me->query_temp("job/step"))
                me->set_temp("job/step", 1);

        if (! living(me))
        {
                me->delete_temp("job/mine");
                me->delete_temp("job/step");
                return 0;
        }

        finish = 0;
        switch (me->query_temp("job/step"))
        {
        case 1:
                me->receive_damage("qi", 1);
                msg = "$N快步的朝井上走去。";
                break;
        case 2:
                me->receive_damage("qi", 1);
                msg = "$N走到井口，道：我是来采矿石的。";
                break;
        case 3:
                me->receive_damage("qi", 1);
                msg = "井口几个人看了看$N，一个人摆了摆手，让你坐到篮子里。";
                break;
        case 4:
                me->receive_damage("qi", 1);
                msg = "$N坐在篮中，井口的人开始放绳，只听吱吱嘎嘎的，你慢慢的向下坠去。";
                break;
        case 5:
                me->receive_damage("qi", 1);
                msg = "$N眼前越来越黑，可是绳子还是放个不停。";
                break;
        case 6:
                me->receive_damage("qi", 1);
                msg = "忽然$N的眼前一亮，原来是一盏油灯，昏暗的火焰不断的跳动。";
                break;
        case 7:
                me->receive_damage("qi", 1);
                msg = "绳子还是不断的向下放，漫漫似乎没有尽头。";
                break;
        case 8:
                me->receive_damage("qi", 1);
                msg = "篮子忽然停住了，看来是到了地方，$N不禁松了一口气。";
                break;
        case 9:
                me->receive_damage("qi", 3);
                msg = "$N看到有一些人正在努力的干活，$N连忙赶上去，也拿起铲子。";
                break;
        case 10:
                me->receive_damage("qi", 6);
                msg = "$N慢慢的收集蓝色的矿石，将它们放到篮中。";
                break;
        case 11:
                me->receive_damage("qi", 8);
                msg = "$N觉得分量差不多了，跨进篮中，拉了拉绳子。";
                break;
        case 12:
                me->receive_damage("qi", 1);
                msg = "等了片刻，篮子忽然晃了晃，$N渐渐的向上升了上去。";
                break;
        case 13:
                me->receive_damage("qi", 1);
                msg = "光线越来越亮，终于到了洞口，只见井口几个人忙得满头大汗。";
                break;
        case 14:
                me->receive_damage("qi", 7);
                msg = "$N不及道谢，连忙扛起篮子，奔大车去了。";
                break;
        case 15:
                me->receive_damage("qi", 6);
                msg = "$N赶到大车旁边，“哗啦啦”将矿石撒到车中。";
                break;
        default:
                me->receive_damage("qi", 4);
                msg = "$N摸了摸了汗，看看空篮子，总算是干完一趟了。";
                finish = 1;
                break;
        }
        msg += "\n";

        if (finish)
        {
                if (me->query_str() >= 35)
                        msg += "$n看了$N采上来的矿石，点点头道：很好"
                               "！这一趟弄了不少啊！\n";
                else
                        msg += "$n看了$N搬的石料，道：还行，马马虎虎"
                               "吧。走，那边领工钱去。\n";

                // 本地矿石增多
                environment(me)->improve_product_amount("cuprum_ore",
                                                        10 + (me->query_str() - 28));

                me->delete_temp("job/mine");
                me->delete_temp("job/step");

                if (me->query("combat_exp") < 300000)
                {
                        b = 40 + random(15);	//基础奖励增加4倍
                        me->add("combat_exp", b);
                        me->improve_potential((b + 10) / 3);
                        me->improve_skill("unarmed", (b + 5) / 2);
                }

                bonus = new("/clone/money/coin");
                bonus->set_amount(100 + (me->query_str() - 28) * 3);
        }

        msg = replace_string(msg, "$N", "你");
        msg = replace_string(msg, "$n", name());
        message("vision", msg, me);
        if (finish)
        {
                tell_object(me, "你去管事的那里领到了工钱。\n");
                bonus->move(me, 1);
                if (b > 0)
                {
                        tell_object(me, HIC "\n经过这次锻炼，你对武学也有了一些体会，获得了" +
                                    chinese_number(b) + "点经验和一些潜能。\n\n" NOR);
                }
                return 0;
        }

        me->add_temp("job/step", 1);
        return 1;
}

int halt_working(object me)
{
        message_vision(HIR "$N" HIR "摇摇头，没说话，将工具使劲摔在"
                       "地上，不干了。\n" NOR, me);
        me->delete_temp("job/mine");
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
                return "我…我有点头晕…等…等会儿……";

        me = this_player();

        if (me->query("score") < 1000)
                return "我看你这人阅历太浅啊，可不敢让你运货。";

        if (me->query("combat_exp") < 50000)
                return "不行不行，你这人本事太差，路上别把货都丢了！";

        if (me->query("combat_exp") > 500000)
                return "嘿，您不是跟我开玩笑吧，干这活太委屈你了。";

        if (objectp(me->query_temp("job/hz_cart")))
                return "上次让你送的你完事了么？快去！少和我罗嗦！";

        if ((amount = me->query("job/hz_cuprum_ore")) > 0)
        {
                amount = (amount + 99) / 100;
                // 五天(MUD时间)内如果货物还没有送达，则不能领
                message_sort("$N冷笑一声，对$n道：“" + me->name(1) +
                             "，上次你送的货...哼！看在你本事"
                             "低微的份上，我不多加追究了，可"
                             "是那车铜矿石岂能就这样白白的丢"
                             "了？你先赔了" + chinese_number(amount) +
                             "两黄金，冲抵铜价再说！”\n",
                             this_object(), me);
                return 1;
        }

        c = environment(me)->query_product_amount("cuprum_ore");
        if (c < 300)
                return "现在还没有多少矿石呢，不忙运走，你等等吧。";
        else
        if (c < 800)
                message_vision("$N看了看$n，道：“也好，虽然"
                               "现在还不多，不过也差不多了。”\n",
                               this_object(), me);
        else
        if (c < 1000)
                message_vision("$N点点头，对$n道：“好吧，就"
                               "快满一车了，就发了吧。”\n",
                               this_object(), me);
        if (c < 3000)
                message_vision("$N看到$n，招呼道：“正好，正"
                               "打算发车呢，就你来吧！”\n",
                               this_object(), me);
        else
        if (c < 8000)
                message_vision("$N连忙道：“快准备吧，这里已"
                               "经有好几车了！”\n",
                               this_object(), me);
        else
                message_vision("$N看到$n，大喜道：“正好！眼"
                               "看这库里就要满了，你来的正好！”\n",
                               this_object(), me);

        if (c > 1000) c = 1000;
        environment(me)->improve_product_amount("cuprum_ore", -c);

        // 生成交通工具
        ob = new("/clone/misc/cart");
        ob->set_temp("goods/name", "铜矿石");
        ob->set_temp("goods/id",   "cuprum_ore");
        ob->set_temp("goods/unit", "斤");
        ob->set_temp("goods/amount", c);
        message_sort("$N一声呼喊，叫人推过一" + ob->query("unit") +
                     ob->name() + "来，这才对" + me->name() +
                     "道：“你把这车货物送到长安工部铜厂去，"
                     "你给我听好了：这可是朝廷的东西！丢了我"
                     "要你的脑袋！去吧！运到了自有赏格！”\n",
                     this_object(), me);
        tell_object(me, YEL + name() + "交给你一" + ob->query("unit") +
                        ob->name() + "。\n" NOR);
        ob->move(environment(me));
        ob->set_owner(me);

        // 记录这次任务的信息
        me->set("job/hz_cuprum_ore", c);
        me->set_temp("job/hz_cart", ob);
        ob->set_temp("job/info", "hz_cuprum_ore");
        ob->set_temp("job/owner", me);

        return 1;
}

int accept_object(object who, object ob)
{
        int amount;

        if (! ob->query("money_id"))
                return 0;

        if ((amount = who->query("job/hz_cuprum_ore")) > 0)
        {
                amount = (amount + 99) / 100;
                if (ob->value() < amount * 10000)
                {
                        message_vision(CYN "$N" CYN "看了看$n"
                                       CYN "递过来的钱，大喝"
                                       "道：“就这点？一边儿去"
                                       "！”\n" NOR,
                                       this_object(), who);
                        return 0;
                }

                message_vision(CYN "$N" CYN "鼻子哼了一声，接过"
                               + ob->name() + NOR + CYN "，道："
                               "“算了，就不追究你了。”\n" NOR,
                               this_object(), who);
                who->delete("job/hz_cuprum_ore");
        } else
        {
                message_vision(CYN "$N" CYN "眉开眼笑，把"
                               + ob->name() + NOR +
                               CYN "接了过来，收入包囊，却不理会$n"
                               CYN "。\n" NOR, this_object(), who);
        }

        destruct(ob);
        return -1;
}