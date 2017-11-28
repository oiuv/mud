// yangzong.c

inherit NPC;
#include <ansi.h>

void create()
{
        set_name("央宗", ({ "yang zong", "yang", "zong" }));
        set("long", "他是一位藏族同胞。\n");
        set("gender", "男性");
        set("age", 30);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("str", 20);
        set("int", 20);
        set("con", 25);
        set("dex", 20);

        set("max_qi", 300);
        set("max_jing", 200);
        set("neili", 300);
        set("max_neili", 300);

        set("combat_exp", 5000);
        set("score", 1000);

        set_skill("force", 60);
        set_skill("dodge", 40);
        set_skill("unarmed", 40);
        set_skill("parry", 40);
        set_skill("sword", 40);
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
	if (! ob) return;

        say (CYN "央宗合什为礼，说道：阿弭佗佛！" +
	     RANK_D->query_respect(ob) + CYN "，贫僧这厢有礼了。\n" NOR);
}
