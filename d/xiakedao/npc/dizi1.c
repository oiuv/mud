// dizi1.c 弟子

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("侠客岛弟子", ({ "di zi", "di", "zi" }));
        set("long", "这是三十多岁的壮汉，膀大腰圆，是岛主从中原招募来的。\n");

        set("gender", "男性");
        set("age", 30);
        set("shen_type",1);
        set("attitude", "peaceful");

        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);

        set("qi", 500);
        set("max_qi", 500);
        set("jing", 200);
        set("max_jing", 200);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", 30);

        set("combat_exp", 30000);
        set("score", 10);
        set_skill("force", 70);
        set_skill("unarmed", 70);
        set_skill("dodge", 70);
        set_skill("parry", 70);
        set_skill("hand", 70);
        set_skill("staff", 50);

        create_family("侠客岛", 0, "弟子");
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();
        ob = this_player();
        if (interactive(ob) && !ob->is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        object room;

        if (! stringp(query("startroom")))
                return;

        room = find_object(query("startroom"));

        if (! ob || environment(ob) != environment() || environment() != room)
                return;

        switch (random(2))
        {
        case 0:
                say("侠客岛弟子说道：这位" + RANK_D->query_respect(ob) +
                    "，快请到迎宾馆中歇歇脚吧。\n");
                break;
        case 1:
                say("侠客岛弟子恭手说道：这位" + RANK_D->query_respect(ob) +
                    "，岛主正在等你呢。\n");
                break;
        }
}
