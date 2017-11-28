#include <ansi.h>

inherit NPC;

object room = 0;

void create()
{
	set_name( "庄家", ({ "zhuang jia", "zhuang" }) );
	set("long", "这是赌场的职业赌徒，骰子上的功夫出神入化。\n");
	set("attitude", "friendly");
	set("title", HIR "骰子圣手" NOR);
        set("force_factor", 30);
        set("max_kee", 3000);
        set("max_sen", 3000);
        set("eff_gin", 3000);
        set("eff_kee", 3000);
        set("eff_sen", 3000);
        set("kee", 3000);
        set("sen", 3000);
        set("max_force", 3000);
        set("force", 3000);
        set("max_mana", 3000);
        set("mana", 3000);
	set("age", 47);
	set_temp("apply/damage",600);
        set("gender", "男性" );
	set("str", 40);
	set("cor", 35);
	set("cps", 30);
	set("per",10);
	set("max_force",3000);
	set("force_factor",40);
	set_skill("parry",170);
	set_skill("unarmed",170);
        set_skill("force",170);
	set_skill("dodge",170);
	set("combat_exp", 300000);

	setup();
        carry_object(__DIR__"obj/choupao")->wear();
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
        switch(random(3))
        {
        case 0:
                say(CYN "庄家笑咪咪地说道：这位" + RANK_D->query_respect(ob) +
                    CYN "，过来赌两手，看看运气如何？\n" NOR);
                break;
        case 1:
                say(CYN "庄家晃了晃手中的骰子，叫道：这位" + RANK_D->query_respect(ob) +
                    CYN "，别犹豫了。来下一注吧！\n" NOR);
                break;
        case 2:
                say(CYN "庄家说道：这位" + RANK_D->query_respect(ob) +
                    CYN "，来！来！来！ 先押一把！\n" NOR);
                break;
        }
}
