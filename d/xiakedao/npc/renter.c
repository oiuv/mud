// renter.c 弟子

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

#define GUARD_CMD       "/cmds/std/guard"

mixed ask_rent();
mixed try_to_hire(object me, object ob);
void hire(object helper, object owner);
void create_all_helper();

mapping *info = ({
// level 1
([      "life"  : 500,
        "neili" : 800,
        "cost"  : 10,
]),
// level 2
([      "life"  : 800,
        "neili" : 1000,
        "cost"  : 20,
]),
// level 3
([      "life"  : 1000,
        "neili" : 1200,
        "cost"  : 25,
]),
// level 4
([      "life"  : 1200,
        "neili" : 1600,
        "cost"  : 30,
]),
// level 5
([      "life"  : 1500,
        "neili" : 2000,
        "cost"  : 35,
]),
// level 6
([      "life"  : 2000,
        "neili" : 2500,
        "cost"  : 40,
]),
// level 7
([      "life"  : 2500,
        "neili" : 3000,
        "cost"  : 50,
]),
// level 8
([      "life"  : 3000,
        "neili" : 3500,
        "cost"  : 60,
]),
// level 9
([      "life"  : 3500,
        "neili" : 4000,
        "cost"  : 80,
]),
// level 10
([      "life"  : 4000,
        "neili" : 5000,
        "cost"  : 100,
]),
// level 11
([      "life"  : 4500,
        "neili" : 6000,
        "cost"  : 150,
]),
// level 12
([      "life"  : 5000,
        "neili" : 7000,
        "cost"  : 200,
]),
// level 13
([      "life"  : 6000,
        "neili" : 8000,
        "cost"  : 300,
]),
// level 14
([      "life"  : 7000,
        "neili" : 9000,
        "cost"  : 500,
]),
// level 15
([      "life"  : 8000,
        "neili" : 9999,
        "cost"  : 700,
]),
});

void create()
{
        set_name("黄衣使者", ({ "xiake dizi", "dizi", "renter" }));
        set("long", "他身着黄衫，表情郁郁，似乎身有武功。\n");

        set("gender", "男性");
        set("age", 25);
        set("shen_type", 1);
        set("attitude", "peaceful");

        set("inquiry", ([
                "同门" : (: ask_rent :), 
                "师兄" : (: ask_rent :), 
                "rent" : (: ask_rent :), 
        ]));

        create_family("侠客岛", 0, "弟子");
        setup();
        carry_object("/clone/misc/cloth")->wear();

        call_out("create_all_helper", 0);
}

mixed ask_rent()
{
        object me;
        object *obs;
        string msg;
        string fam;
        int i;

        me = this_player();
        if (me->query("weiwang") < 1000)
                return "你这点名头也能使唤人？算了吧！";

        if (me->query("score") < 10000)
                return "你江湖阅历太浅，还是免了。";

        if (me->query("combat_exp") < 100000)
                return "你的武功太差，想支使谁呀？";

        if (me->query("combat/DPS") > 30)
                return "你这人，伤人太多，我们侠客岛的弟子可不能助纣为虐。";

        if (me->query("combat/WPK") > 30)
                return "你这人呀！辣手无情，杀人无算，张兄李兄没找你算帐就不错了。";

        if (arrayp(obs = me->query_temp("hire")))
        {
                obs -= ({ 0 });
                fam = query("family/family_name");
                obs = filter_array(obs, (: $1->query("family/family_name") == $(fam) :));
                if (sizeof(obs))
                        return "现在不是有" + obs[0]->name() + "和你在一起么？你还想怎么样？";
        }

        obs = query_temp("helpers");
        if (! arrayp(obs) || (obs = obs - ({ 0 }), sizeof(obs) < 1))
                return "我的师兄弟都走啦，你还是等两天再来吧。";

        msg = "$N笑了笑，道：“现在我身边的师兄弟有这么几个，你看看吧。”\n";
        for (i = 0; i < sizeof(obs); i++)
                msg += sprintf("%2d. %-27s  等级：%d\n",
                               i + 1,
                               obs[i]->name(1) + "(" + obs[i]->query("id") + ")",
                               obs[i]->query("npc_level"));
        switch (random(5))
        {
        case 0:
                msg += "$N看了看$n，道：“你想找谁帮你的忙，不妨和我说说。”\n";
                break;
        case 1:
                msg += "$N对$n道：“我的师兄弟水平各有高下，你找一个派得上用场的吧！”\n";
                break;
        case 2:
                msg += "$N微微一笑，对$n道：“你觉得谁合适？”\n";
                break;
        }
        message_vision(msg, this_object(), me);
        return 1;
}

int accept_object(object me, object ob)
{
        object helper;
        object *obs;
        int cost;
        int n;

        if (! ob->query("money_id"))
                return 0;

        if (! objectp(helper = me->query_temp("pending/rent/helper")))
        {
                command("say 你给我钱干什么？赞助我们侠客岛么？");
                return 0;
        }

        cost = me->query_temp("pending/rent/cost");
        n = ob->value() / 10000;
        if (n < cost)
        {
                command("say 我们这里可不能打折，你还是免了吧！");
                if (n * 2 >= cost && me->query("special_skill/treat"))
                        message_vision("$N跪在地上，抱着$n，哭喊道：“你就"
                                       "可怜可怜我这穷鬼吧！”\n$n看了，颇"
                                       "为无奈，摇摇头，叹口气道：“好吧好"
                                       "吧，算了。”\n", me, this_object());
                else
                        return 0;
        }

        message_vision("$n接过$N递过来的" + ob->name() +
                       "，记在帐上，有道：“等会儿！”\n",
                       me, this_object());
        destruct(ob);
        message_vision("$N高声喊道：“" + helper->name() +
                       "！快来，快来啊，送钱的上门了！”\n", this_object());
        helper->move(environment());
        message_vision("$n走了过来，看了看$N。\n", me, helper);
        command("say 好啦，" + helper->name() + "，就是这位" +
                RANK_D->query_respect(me) + "，你一同去吧。");
        message_vision("$n点点头，和$N寒暄两句，跟在了$P的身后。\n",
                       me, helper);

        // 初始化雇佣的人
        // 设置雇佣开始的时间，主人，去掉目前的正在雇佣的状
        // 态，跟随主人，开始并维持心跳。
        helper->set_temp("help_time", time());
        helper->set_temp("owner", me);
        helper->delete_temp("renter");
        helper->set_leader(me);
        helper->keep_heart_beat();

        // 设置主人的信息
        obs = me->query_temp("hire");
        if (arrayp(obs))
        {
                obs -= ({ 0 }); obs += ({ helper });
        } else
                obs = ({ helper });
        me->set_temp("hire", obs);

        GUARD_CMD->main(helper, me);
        me->delete_temp("pending/rent");

        obs = me->query_temp("helpers");
        if (arrayp(obs)) obs -= ({ helper, 0 }); else obs = 0;
        set_temp("helpers", obs);

        CHANNEL_D->do_channel(this_object(), "rumor",
                me->name(1) + "在南海邀请到了一名侠客岛弟子。");
        return -1;
}

mixed accept_ask(object me, string topic)
{
        object ob;
        object *obs;

        obs = query_temp("helpers");
        if (! arrayp(obs)) obs = ({ }); else obs -= ({ 0 });

        foreach (ob in obs)
                if (ob->id(topic) || ob->name(1) == topic)
                        return try_to_hire(me, ob);

        message_vision(CYN "$N" CYN "看了看$n" CYN "，疑问道"
                       "：“你想干什么？是要找我的" HIY "同门"
                       NOR CYN "师兄弟么？”\n" NOR,
                       this_object(), me);
        return 1;
}

mixed try_to_hire(object me, object ob)
{
        object *obs;
        string fam;
        int cost;

        if (arrayp(obs = me->query_temp("hire")))
        {
                obs -= ({ 0 });
                fam = query("family/family_name");
                obs = filter_array(obs, (: $1->query("family/family_name") == $(fam) :));
                if (sizeof(obs))
                        return obs[0]->name() + "现在不是正和你在一起么？还不够啊？";
        }

        if (me->query("combat_exp") < ob->query("combat_exp") * 2 / 3)
                return "算了吧，" + ob->name() + "武功也强你太多，他可没兴趣帮你。";

        if (ob->query("combat_exp") * 2 < me->query("combat_exp"))
                return "哦？你武功这么好，" + ob->name() + "恐怕帮不上你什么忙吧。";

        cost = info[ob->query("npc_level") - 1]["cost"];
        message_vision("$N微微一笑，道：“好吧，不过你也得意"
                       "思意思啊，我们侠客岛开销也不小的。”\n"
                       "$N仔细考虑了一会儿，对$n道：“这样吧，就" +
                       chinese_number(cost) + "两黄金吧。 ”\n",
                       this_object(), me);
        me->set_temp("pending/rent/cost", cost);
        me->set_temp("pending/rent/helper", ob);
        return 1;
}

void create_all_helper()
{
        object *obs;
        int *lvls = ({ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 });
        int lvl;
        object ob;
        string startroom;

        if (! stringp(startroom = query("startroom")) ||
            environment() != find_object(startroom))
                return;

        obs = query_temp("helpers");
        if (! arrayp(obs)) obs = ({ }); else obs -= ({ 0 });
        lvls -= obs->query("npc_level");
        while (sizeof(obs) < 10)
        {
                lvl = lvls[random(sizeof(lvls))];
                ob = new(CLASS_D("generate") + "/helper");
                // initialize the npc
                ob->set("npc_level", lvl);
                ob->set_temp("renter", this_object());
                NPC_D->init_npc_skill(ob, lvl);
                ob->init_man(info[lvl - 1]);
                lvls -= ({ lvl });
                obs += ({ ob });
                ob->create_family("侠客岛", 0, "弟子");
        }

        obs = sort_array(obs, (: (int) $1->query("npc_level") - (int) $2->query("npc_level") :));
        set_temp("helpers", obs);
}

void remove()
{
        object *obs;
        object ob;

        obs = query_temp("helpers");
        if (! arrayp(obs)) return;
        obs -= ({ 0 });

        // 析构所有的师兄弟
        foreach (ob in obs) ob->destruct_by_owner();
}

void move_or_destruct()
{
        remove();
}

void reset()
{
        create_all_helper();
}
