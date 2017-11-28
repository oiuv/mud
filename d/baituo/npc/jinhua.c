#include <ansi.h>
inherit NPC;

void create()
{
        set_name("金花", ({ "jin hua", "jin", "hua" }));
        set("gender", "女性" );
        set("age", 24);
        set("long", "一个年少貌美的姑娘。\n");
        set("shen_type", 1);
        set("combat_exp", 800);
        set("str", 18);
        set("dex", 18);
        set("con", 18);
        set("int", 18);
        set("gold_times", 1);
        set("attitude", "friendly");
        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "金花哭泣着：我的命怎么这么苦哟。\n" NOR,
                CYN "金花抹着眼泪：娘呀，我好想你呀！\n" NOR,
                CYN "金花叹口气说道：不知今生今世能否再见到我娘。\n" NOR
        }));

        set("inquiry",([
                "张妈"   : "你知道我娘？你可有她给你的信物？快给我看看。",
                "绣花鞋" : "你真有绣花鞋吗？快给我看看。",
        ]));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ob = this_player();

        ::init();
        if (interactive(ob) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment())
                return;

        say(CYN "金花道：这位" + RANK_D->query_respect(ob) +
            CYN "，我娘是白驼山庄的老佣人。你可有她消息？\n" NOR);
}

int accept_object(object who, object ob)
{
        object obn;

        if (! who || environment(who) != environment())
		return 0;

        if (! objectp(ob))
		return 0;

        if (! present(ob, who))
                return notify_fail("你没有这件东西。\n");

        if ((string)ob->query("id") != "xiuhua xie")
                return notify_fail(CYN "金花说道：你给我这个东西干嘛？\n" NOR);

        if (query("gold_times") < 1)
                return notify_fail(CYN "金花说道：我已经有绣花鞋了。\n" NOR);

        write (CYN "\n金花双手捧着绣花鞋，泪如雨下道：娘，您还"
               "挂着女儿啊。\n" NOR);

        message_sort(CYN "\n金花抹了把眼泪，不好意思道：这位" +
                     RANK_D->query_respect(who) + CYN "见笑了"
                     "。我实在没什么东西报答你，不过我知道山贼"
                     "头有个钱箱藏在床下。我这就搬出来给你。\n"
                     NOR, who);

        message_sort(HIY "\n$N" HIY "帮金花从床下搬出来一只钱"
                     "箱，迫不及待地打开一看，里面竟然搁着一大"
                     "堆白银。$N" HIY "毫不客气地把白银装进衣"
                     "服里。\n\n" NOR, who);

        obn = new("/clone/money/silver");
        obn->set_amount(20);
        obn->move(who, 1);

        set("gold_times", 0);
        destruct(ob);
        return 1;
}

void unconcious()
{
        die();
}
