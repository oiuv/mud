// mafu.c 马夫

#include <ansi.h>
inherit NPC;

void create()
{
        set_name("马夫", ({ "ma fu", "mafu", "ma"}));
        set("age", 32);
        set("gender", "男性");
        set("long", "这是马厩驯马和小伙计，平时打理照料马匹。\n");
        set("attitude", "peaceful");
        set("str", 24);
        set("dex", 16);
        set("combat_exp", 50000);
        set("shen_type", 1);

        set("chat_chance",2);
        setup();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment())
                return;

        say(CYN "马夫点头哈腰地说道：这位客官，您好，打算去哪儿啊？\n" NOR);
}

int accept_object(object who, object ob)
{
        if (ob->query("money_id"))
        {
                message_vision(CYN "$N" CYN "对$n" CYN "说道：你想去" NOR +
                               HIY "(goto)" NOR + CYN "哪儿？先告诉小的再付"
                               "钱也不迟。\n" NOR, this_object(), who);
                return 0;
        }

        return 0;
}

