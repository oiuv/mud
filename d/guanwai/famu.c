// /guanwai/famu.c

#include <ansi.h>

inherit ROOM;

int start_work(object me, object ob);
varargs int end_working(object me, object passive);
int working(object me);
int coagent(object me);
int halt_working(object me, object who, int silent);

void create()
{
	set("short", "伐木场");
	set("long", @LONG
这里是鹿鸣峰西坡下的一片森林，长着许多百年的参天大
树，笔直挺拔，都是上好的木材，许多人在这里砍伐(famu)木料，
然后运到中原供达官贵人们建筑豪宅。这里地处深山老林，时常
有凶猛的野兽出没。
LONG);
	set("exits", ([
		"southup" : __DIR__"luming",
	]));
	set("outdoors", "guanwai");
	setup();
}
/*
//取消伐木job
void init()
{
        add_action("do_famu", "famu");
        if (find_call_out("call_beast") == -1)
                call_out("call_beast", random(60) + 20);
}

void call_beast()
{
        object ob;
        string beast;
        int n;

        remove_call_out("call_beast");

        if (sizeof(filter_array(all_inventory(), (: interactive :))) < 1)
                return;

        // Call out wovles when player is here
        call_out("call_beast", random(200) + 30);

        if (present("he xiong", this_object()) ||
            present("ye lang", this_object()))
                return;

        switch (random(10))
        {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
                n = 1 + random(4);
                beast = "/clone/quarry/lang2";
                break;
        case 8:
                n = 1;
                beast = "/clone/quarry/xiong";
                break;
        case 9:
                n = 1;
                beast = "/clone/quarry/xiong2";
                break;
        }

        message("vision", "山坳里面突然串出" + chinese_number(n) +
                beast->query("unit") + beast->name() +
                "\n", this_object());
        while (n--)
        {
                ob = new(beast);
                ob->move(this_object());
        }
}

int do_famu(string arg)
{
        object me;
        object ob;
        object old;
        object weapon;

        me = this_player();

        if (! arg || sscanf(arg, "with %s", arg) != 1)
                return notify_fail("你要和谁一起伐木(famu with <sb>)？\n");

        ob = present(arg, this_object());
        if (! ob)
                return notify_fail("这里没有这个人可以和你一起伐木。\n");

        if (me == ob)
                return notify_fail("你是不是大脑进水...需要修理？\n");

        if (! living(ob))
                return notify_fail("你怎么也得等人家醒过来再说吧？\n");

        if (ob->query_temp("job/famu"))
        {
                if (! ob->is_busy())
                        ob->delete_temp("job/famu");
                else
                        return notify_fail("人家现在正在伐木呢。\n");
        }

        if (me->query_temp("job/famu"))
        {
                if (! me->is_busy())
                        me->delete_temp("job/famu");
                else
                        return notify_fail("你现在不是正在伐木嘛？\n");
        }

        if (ob->is_fighting())
                return notify_fail("人家现在正在打架，那有功夫理你？\n");

        if (me->is_fighting())
                return notify_fail("你还是打完了架再说吧。\n");

        if (ob->is_busy())
                return notify_fail("人家现在正忙，没功夫理你。\n");

        if (me->is_busy())
                return notify_fail("你还是等有空了再说吧。\n");

        if (ob->query("qi") < 200)
                return notify_fail("人家气力不加，还是算了吧。\n");

        if (me->query("qi") < 200)
                return notify_fail("你现在气息不够，还是养足了力气再说吧。\n");

        if (ob->query_str() < 30)
                return notify_fail("看人家那副模样不像是能干这种重活的人。\n");

        if (me->query_str() < 30)
                return notify_fail("你的膂力不够，干不了这种重活。\n");

        if (ob->query_temp("pending/job_coagent") == me)
        {
                ob->delete_temp("pending/job_coagent");
                return start_work(me, ob);
        }

        if (objectp(old = me->query_temp("pending/job_coagent")))
        {
                if (old == ob)
                        return notify_fail("你已经向别人提出要求了，可是人家还没有答应。\n");

                tell_object(old, me->name() + "改变了主意不想和你一同伐木了。\n");
                tell_object(me, "你改变了主意不想和" + old->name() + "一同伐木了。\n");
        }

        me->set_temp("pending/job_coagent", ob);
        message_vision("$N对$n热情道：“来吧，" + RANK_D->query_respect(ob) +
                       "，咱们一同伐木如何？”\n", me, ob);
        tell_object(ob, YEL + me->name() + "邀请你一同伐木，你如果"
                    "愿意就一起干(famu with " + me->query("id") + ")吧。\n" NOR);
        return 1;
}

int start_work(object me, object ob)
{
        object weapon, hand;
        object swap;

        hand = me->query_temp("handing");
        if (! objectp(hand) || ! hand->is_saw())
        {
                swap = me;
                me = ob;
                ob = swap;
                hand = me->query_temp("handing");
        }

        if (! objectp(hand) || ! hand->is_saw())
                return notify_fail("你们俩谁都没有拿锯，怎么伐木？\n");

        if ((! objectp(weapon = me->query_temp("weapon")) || weapon->query("skill_type") != "axe") &&
            (! objectp(weapon = ob->query_temp("weapon")) || weapon->query("skill_type") != "axe"))
                return notify_fail("你们没有斧头，这活干不完啊！\n");

        me->set_temp("job/famu", 1);
        me->set_temp("job/step", 1);
        me->set_temp("job/coagent", ob);
        ob->set_temp("job/famu", 1);
        ob->set_temp("job/step", 1);
        ob->set_temp("job/coagent", me);
	me->start_busy((: working :), (: halt_working :));
	ob->start_busy((: coagent :), (: halt_working :));
        tell_object(me, "你和" + ob->name() + "开始伐木。\n");
        tell_object(ob, "你和" + me->name() + "开始伐木。\n");
        return 1;
}

private varargs int end_working(object me, object passive)
{
        object coagent;

        if (! me->query_temp("job/famu"))
                return 0;

        coagent = me->query_temp("job/coagent");
        me->interrupt_me(me, 1);
        me->delete_temp("job");
        if (objectp(passive))
        {
                message_vision("$n不干了，$N也只好跟着停下手来。\n",
                               me, passive);
        }
        if (coagent) end_working(coagent, me);
        return 0;
}

int working(object me)
{
        object ob;
        object coagent;
        object weapon;
        object wood;
        string msg;
        string gmsg;
        int finish;
        int b;

        if (! me->query_temp("job/step"))
                me->set_temp("job/step", 1);

        if (! objectp(coagent = me->query_temp("job/coagent")))
        {
                message_vision("帮忙的人走了，$N只好停手不干了。\n", me);
                return end_working(me);
        }

        if (! living(me))
        {
                return end_working(me);
        }

        ob = me->query_temp("handing");
        if (! objectp(ob) || ! ob->is_saw())
        {
                message_vision("锯没了，$N停手不干了。\n", me);
                return end_working(me);
        }

        finish = 0;
        switch (me->query_temp("job/step"))
        {
        case 1:
                me->receive_damage("qi", 20);
                msg = "$N四周看看，选中了一颗上好的松树。";
                break;
        case 2:
                me->receive_damage("qi", 20);
                msg = "$N和$n走到松树旁，掂量了一下，然后抄起" + ob->name() +
                      "开始拦腰拉锯。";
                break;
        case 3:
                me->receive_damage("qi", 30);
                msg = "“吱嘎吱嘎”，木屑飞扬，地上洒了不少木屑。";
                break;
        case 4:
                me->receive_damage("qi", 30);
                msg = "“嘎吱嘎吱”，$N和$n奋力拉锯。";
                break;
        case 5:
                me->receive_damage("qi", 30);
                msg = "“吱嘎吱嘎”，地上的木屑是越来越多，锯也越来越深。";
                break;
        case 6:
                me->receive_damage("qi", 30);
                msg = "“嘎吱嘎吱”，$N和$n奋力拉锯。";
                break;
        case 7:
                me->receive_damage("qi", 30);
                msg = "“吱嘎吱嘎”，忽然“喀拉”的一声，松树有些摇晃。";
                break;
        case 8:
                if (objectp(weapon = me->query_temp("weapon")) &&
                    weapon->query("skill_type") == "axe")
                {
                        msg = "$N摆摆手，让$n扶好松树，上去就是“哐哐哐”的砍。";
                        break;
                }
                if (objectp(weapon = coagent->query_temp("weapon")) &&
                    weapon->query("skill_type") == "axe")
                {
                        msg = "$n摆摆手，让$N扶好松树，上去就是“哐哐哐”的砍。";
                        break;
                }
                
                message_vision("锯到这个份上，却没找到斧头，$N和$n"
                               "瞪瞪眼睛，只好停手。\n", me, coagent);
                return end_working(me);
        default:
                msg = "大树“吱呀吱呀”的到了下来，$N和$n连忙闪开。";
                finish = 1;
                break;
        }
        msg += "\n";

        // send message out
        gmsg = replace_string(msg, "$N", "你");
        gmsg = replace_string(gmsg, "$n", coagent->name());
        tell_object(me, gmsg);
        gmsg = replace_string(msg, "$n", "你");
        gmsg = replace_string(gmsg, "$N", me->name());
        tell_object(coagent, gmsg);

        if (finish)
        {
                me->delete_temp("job");
                coagent->delete_temp("job");
                coagent->interrupt_me(coagent, 1);

                wood = new("/d/guanwai/obj/largewood");
                wood->move(this_object());

                if (me->query_dex() / 2 + random(me->query_dex() / 3) < 12)
                {
                        message_vision("大树轰然倒地，$N还是差了一步，结"
                                       "果“啪”的一下把$N压了个严严实实。\n", me);
                        me->unconcious();
                } else
                if (coagent->query_dex() / 2 + random(coagent->query_dex() / 3) < 12)
                {
                        message_vision("大树轰然倒地，$N还是差了一步，结"
                                       "果“啪”的一下把$N压了个严严实实。\n", coagent);
                        coagent->unconcious();
                } else
                {
                        message_vision("大树轰然倒地，$N和$n抹了抹头"
                                       "上的汗，相视一笑。\n", me, coagent);

                        if (wood->move(me))
                        {
                                message_vision(HIC "$N" HIC "“嗨”的一声，在$n" HIC
                                               "的帮助下把" + wood->name() + HIC
                                               "扛了起来。\n" NOR, me, coagent);
                        } else
                        if (wood->move(coagent))
                        {
                                message_vision(HIC "$n" HIC "“嗨”的一声，在$N" HIC
                                               "的帮助下把" + wood->name() + HIC
                                               "扛了起来。\n" NOR, me, coagent);
                        } else
                        {
                                message_vision("$N和$n上去掂了掂木料，都觉得太"
                                               "重，只好先放在地上。\n",
                                               me, coagent);
                        }
                }

                if (me->query("combat_exp") >= 100000 &&
                    me->query("combat_exp") < 800000)
                {
                        // bonus to me 基础增加五倍
                        b = 75 + random(10);
                        me->add("combat_exp", b);
                        me->improve_potential((b + 10) / 3);
                        me->improve_skill("force", (b + 3) / 4);
                        tell_object(me, HIC "\n通过这次锻炼，你对武学的理解又进一步，获得了" +
                                    chinese_number(b) +
                                    "点经验和" +
                                    chinese_number((b + 10) / 3) +
                                    "点潜能。\n\n" NOR);
                }

                if (coagent->query("combat_exp") >= 100000 &&
                    coagent->query("combat_exp") < 800000)
                {
                        // bonus to coagent
                        b = 75 + random(10);
                        coagent->add("combat_exp", b);
                        coagent->improve_potential((b + 10) / 3);
                        coagent->improve_skill("force", (b + 3) / 4);
                        tell_object(coagent, HIC "\n通过这次锻炼，你对武学的理解又进一步，获得了" +
                                    chinese_number(b) +
                                    "点经验和" +
                                    chinese_number((b + 10) / 3) +
                                    "点潜能。\n\n" NOR);
                }

                return 0;
        } else
                me->add_temp("job/step", 1);

        return 1;
}

int coagent(object me)
{
        return 1;
}

int halt_working(object me, object who, int silent)
{
        if (! me->query_temp("job/famu"))
                return 1;

        if (! silent)
                message_vision("$N叹了口气，道：“累死了，我"
                               "得先揉揉肩！”\n", me);
        end_working(me);
        return 1;
}
*/