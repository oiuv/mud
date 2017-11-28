inherit NPC;
inherit F_BANKER;

#include <ansi.h>

int do_join(string arg);
int do_unjoin(string arg);
int do_yao();
int do_decide();

void create()
{
        set_name("黄真", ({ "huang zhen", "zhen", "huang" }));
        set("long", @LONG
黄真是神剑仙猿穆人清的开门大弟子，也是这
个钱庄的老板，管理襄阳军饷。
LONG);
        set("nickname", HIY "铜笔铁算盘" NOR);
        set("gender", "男性");
        set("age", 59);
        set("attitude", "peaceful");
        set("per", 21);
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 30);

        set("max_qi", 3500);
        set("max_jing", 2000);
        set("neili", 3000);
        set("max_neili", 300);
        set("jiali", 200);

        set("combat_exp", 500000);
        set("shen_type", 1);

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :)
        }) );

        set_skill("strike", 140);
        set_skill("cuff", 140);
        set_skill("sword", 140);
        set_skill("force", 140);
        set_skill("parry", 140);
        set_skill("dodge", 140);
        set_skill("literate", 60);

        set_skill("huashan-jian", 140);
        set_skill("huashan-xinfa", 140);
        set_skill("poyu-quan", 140);
        set_skill("hunyuan-zhang", 140);
        set_skill("feiyan-huixiang", 140);

        map_skill("sword", "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("force", "huashan-xinfa");
        map_skill("cuff", "poyu-quan");
        map_skill("strike", "hunyuan-zhang");
        map_skill("dodge", "feiyan-huixiang");

        prepare_skill("cuff", "poyu-quan");
        prepare_skill("strike", "hunyuan-zhang");

        set("inquiry", ([
                "入会"     : "在我这里，可以加入(" HIY "join" NOR +
                             CYN ")商业协会。\n" NOR,
                "加入"     : "在我这里，可以加入(" HIY "join" NOR +
                             CYN ")商业协会。\n" NOR,
                "商业协会" : "在我这里，可以加入(" HIY "join" NOR +
                             CYN ")商业协会。\n" NOR,
        ]));

        create_family("华山派", 21, "弟子");

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_check", "check");
        add_action("do_check", "chazhang");
        add_action("do_convert", "convert");
        add_action("do_convert", "duihuan");
        add_action("do_deposit", "deposit");
        add_action("do_deposit", "cun");
        add_action("do_withdraw", "withdraw");
        add_action("do_withdraw", "qu");
        add_action("do_join", "join");
        add_action("do_decide", "decide");
        add_action("do_yao", "yao");
        add_action("do_unjoin", "unjoin");
        delete_temp("busy");
}

int do_join(string arg)
{
        object me = this_player();

        if (! arg || arg != "商业协会")
                return notify_fail(CYN "黄真一楞，说道：你要加入什么？我"
                                   "这里是商业协会。\n" NOR);

        if (me->query("is_vendor"))
                return notify_fail(CYN "黄真皱了皱眉，说道：你不是已经加"
                                   "入商业协会了么？\n" NOR);

        if (me->query("bad_vendor"))
                return notify_fail(CYN "黄真冷笑一声，说道：既然你已经脱"
                                   "离了商业协会，又回来作甚？\n" NOR);

        tell_object(me, CYN "\n黄真点了点头，说道：你真的打算(" HIY "dec"
                        "ide" NOR + CYN ")加入商业协会么？可考虑清楚了？"
                        "\n" NOR);
        me->set_temp("want_join", 1);
        return 1;
}

int do_unjoin(string arg)
{
        object me = this_player();

        if (! arg || arg != "商业协会")
                return notify_fail(CYN "黄真皱了皱眉，说道：你打算脱离什"
                                   "么？说话不清不楚的。\n" NOR);

        if (! me->query("is_vendor"))
                return notify_fail(CYN "黄真冷笑一声，没理你。\n" NOR);

        tell_object(me, CYN "\n黄真叹了口气，说道：如果脱离商业协会，以后"
                        "可不能反悔。你真打算(" HIY "decide" NOR + CYN ")"
                        "这么做么？\n" NOR);
        me->set_temp("want_tuoli", 1);
        return 1;
}

int do_decide()
{
	object ob, me;
        me = this_player();

        if (me->query_temp("want_join"))
        {
                message_vision(HIC "$N" HIC "对着$n" HIC "微笑道：如今世"
                               "道钱乃万能之物，以后好好干吧。\n" NOR,
                               this_object(), me);

                me->set("is_vendor", 1);
                me->delete_temp("want_join");

                ob = new("/clone/misc/shang-ling");
                ob->move(this_object());
                command("give shang ling to " + me->query("id"));
                return 1;
        } else
        if (me->query_temp("want_tuoli"))
        {
                message_vision(HIC "$N" CYN "对着$n" HIC "点点头，人各有"
                               "志，从此以后你我再无瓜葛。\n" NOR,
                               this_object(), me);

                me->delete("is_vendor");
                me->set("bad_vendor", 1);
                me->delete_temp("want_tuoli");

                if (objectp(ob = present("shang ling", me)));
                {
                        message_vision(HIR "$N" HIR "将$n" HIR "的" NOR +
                                       ob->name(1) + HIR "注销了。\n" NOR,
                                       this_object(), me);
                        destruct(ob);
                }
                return 1;
         }

         return notify_fail(CYN "黄真瞄了你一眼，皱了皱眉，没理你。\n" NOR);
}

int do_yao()
{
        object ob, me = this_player();

        if (me->query("bad_vendor"))
                return notify_fail(CYN "黄真不耐烦道：走开，走开。你又回"
                                   "来作甚？\n" NOR);

        if (! me->query("is_vendor"))
                return notify_fail(CYN "黄真瞄了你一眼，没理你。\n" NOR);

        if (present("shang ling", me))
                return notify_fail(CYN "黄真皱了皱眉道：我的天，你连这都"
                                   "要骗？果然是奸商的料。\n" NOR);

        if (me->query_temp("shang-ling"))
                return notify_fail(CYN "黄真皱眉道：刚才我不是才给了你一"
                                   "张么？那么快就弄丢了？\n" NOR);

        if (SHOP_D->is_owner(me->query("id")))
                return notify_fail(CYN "黄真微笑道：你现在不是已经开店了"
                                   "么？还要这个干嘛。\n" NOR);

        ob = new("/clone/misc/shang-ling");
        ob->move(this_object());
        me->set_temp("shang-ling", 1);
        command("give shang ling to " + me->query("id"));
        command("say 吃饭的家伙自己保管好，别老是来烦我。");
        return 1;
}
