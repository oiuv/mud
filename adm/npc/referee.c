// referee.c 公平子

inherit NPC;
#include <ansi.h>

int do_bihua(string arg);
int do_no();
void shout_message(string msg);

void create()
{
        set_name("公平子", ({ "gongping zi", "zi", "referee" }) );
        set("gender", "男性");
        set("age", 35);
        set("no_get", 1);
        set("long",
                "这是一位仙风道骨的中年道人，早年云游四方，性好任侠，公正无私。\n");
        set("combat_exp", 60000);
        set("shen_type", 1);
        set("attitude", "friendly");

        set("apply/attack", 50);
        set("apply/defense", 50);

        set("max_qi", 800);
        set("max_jing", 800);
        set("max_neili", 800);

        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
}


void init()
{
        ::init();
        add_action("do_bihua", "bihua");
        add_action("do_bihua", "bi");
        add_action("do_bihua", "hit");
        add_action("do_bihua", "fight");
        add_action("do_bihua", "qiecuo");
        add_action("do_halt", "halt");
        add_action("do_halt", "h");
        add_action("do_no", "beg");
        add_action("do_no", "steal");
        add_action("do_no", "quanjia");
        add_action("do_no", "persuade");
        add_action("do_no", "touxi");
        add_action("do_no", "ansuan");
        add_action("do_no", "kill");
}

int do_bihua(string arg)
{
        object me;
        object ob;
        object old;

        if (! arg || ! objectp(ob = present(arg)))
        {
                write("你要和谁比划？\n");
                return 1;
        }

        me = this_player();
        if (me == ob)
        {
                write("你是不是以为天下就你自己是老大，再没有第二个英雄了。\n");
                return 1;
        }

        if (! userp(ob))
        {
                write("你想向人家挑战，可是人家根本没有理你。\n");
                return 1;
        }

        if (! living(ob))
        {
                write("你还是等人家醒了再说吧。\n");
                return 1;
        }

        if (me->is_fighting() && me->query_competitor())
        {
                write("你现在正在和" + me->query_competitor()->name() +
                      "比试呢。\n");
                return 1;
        }

        if (ob->is_fighting())
        {
                write("人家正在动手，你上去插手干什么？\n");
                return 1;
        }

        if (me->query("qi") * 100 / me->query("max_qi") < 70)
        {
                write("你现在体力不够充沛，何必忙着动手？\n");
                return 1;
        }

        if (ob->query("qi") * 100 / ob->query("max_qi") < 70)
        {
                write("人家现在似乎体力不支，还是等会儿再说吧。\n");
                return 1;
        }

        if (me->query("combat_exp") < 10000)
        {
                write("公平子冷笑道：你是哪儿来的？我怎么从来没有"
                      "听说过？滚开！少在这里添乱。\n");
                return 1;
        }

        if (ob->query("combat_exp") < 10000)
        {
                write("公平子看看你道：算了吧，" + ob->name() +
                      "武功低微，你出手似乎有失身份。\n");
                return 1;
        }

        if (old = me->query_temp("pending/fight"))
        {
                if (old == ob)
                {
                        write("你正在向人家挑战，可是人家还没有答应。\n");
                        return 1;
                }

                tell_object(old, me->name() + "改变主意不想向你挑战了。\n");
                tell_object(me, "你改变主意不打算向" + old->name() + "挑战了。\n");
        }

        if (ob->query_temp("pending/fight") != me)
        {
                me->set_temp("pending/fight", ob);
                message_vision(HIY "\n$N" HIY "朗声对$n" HIY "道：今日幸会，我们何不一较"
                               "高低，就由" + name() + "先生为我们见证可好？\n\n" NOR,
                               me, ob);
                return 1;
        }

        ob->delete_temp("pending/fight");

        message_vision(HIY "\n$N" HIY "点头道：很好，来吧，不必客气！\n\n" NOR,
                       me, ob);

        shout_message(me->name(1) + "(" + me->query("id") + ")道：" +
                      RANK_D->query_self(me) + me->name(1) + "，今日特向" +
                      RANK_D->query_respect(ob) + "请教。");
        me->set_override("win",  bind((: call_other, __FILE__, "player_win",  environment() :), me));
        me->set_override("lost", bind((: call_other, __FILE__, "player_lost", environment() :), me));
        ob->set_override("win",  bind((: call_other, __FILE__, "player_win",  environment() :), ob));
        ob->set_override("lost", bind((: call_other, __FILE__, "player_lost", environment() :), ob));
        me->competition_with(ob);
        return 1;
}

void player_win(object env, object me)
{
        object ob;

        ob = me->query_competitor();
        if (environment(ob) != environment(me))
        {
                shout_message(name() + "笑道：" + ob->name(1) +
                              "比武时临阵脱逃，" + me->name(1) + "不战而胜。");
        } else
        if (me->query("age") > ob->query("age"))
        {
                shout_message(name() + "点头道：姜果然还是是老的辣，今日" +
                              me->name(1) + "比武战胜" + ob->name(1) + "！");
        } else
        if (me->query("age") > ob->query("age"))
        {
                shout_message(name() + "赞道：今日" + me->name(1) + "比武战胜" +
                              ob->name(1) + "，真可谓是长江后浪推前浪！");
        } else
        {
                shout_message(name() + "道：" + me->name(1) + "比武战胜" +
                              ob->name(1) + "，恭喜恭喜。");
        }
}

void player_lost(object env, object me)
{
        mapping exits;
        string exit;

        if (environment(me) != env || ! mapp(exits = env->query("exits")))
                return;

        exit = values(exits)[random(sizeof(exits))];
        me->move(exit);
        tell_room(env, "只见" + me->name() + "大叫一声，跌了下去。\n");
        message_vision("只见$N咕噜咕噜的滚下了擂台，哼哼呀呀的在地上躺了半天。\n", me);
}

int do_no()
{
        command("say " + this_player()->name() + "！这里众目睽睽，岂能做此不才之事？");
        return 1;
}

int accept_ansuan(object ob)
{
        message("vision", "一个黑影扑来，" + name() +
                "随手一挥，把" + ob->name() + "弹了出去，摔了个灰头土脸。\n",
                environment());
        tell_object(ob, "你纵身扑去，去被" + name() + "伸手一挥，把你弹了回来。\n");
        return notify_fail("人家武功太高，你还是老老实实的不要乱动。\n");
}

void receive_damage(string type, int count) {}

void kill_ob(object ob) {}

void fight_ob(object ob) {}

void shout_message(string msg)
{
        message("channel:chat", HIW "【以武会友】" + msg + "\n" NOR,
                all_interactive());
}

int want_receive_msg() { return 1; }

void receive_message(string msgclass, string msg)
{
        object ob;
        object *bct;

        if (! objectp(ob = environment()) ||
            ! arrayp(bct = ob->broadcast_to()))
        {
                // needn't broadcast to others
                return;
        }

        message("vision", WHT "【武林快报】" NOR + BBLU +
                          replace_string(msg, NOR, BBLU) + NOR,
                bct);
}
