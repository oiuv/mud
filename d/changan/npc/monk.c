//monk.c

inherit NPC;

void create()
{
        set_name("知客和尚", ({"monk"}));
        set("gender", "男性");
        set("attitude", "peaceful");
        set("class", "bonze");
        set("age", 20+random(10));
	set("combat_exp", 25000);
        set("shen_type", 1);
        set("per", 30);
        set("max_qi", 500);
        set("max_jing", 300);
	set("neili", 300);
	set("jiali", 5);
        set_skill("force", 15+random(20));
        set_skill("unarmed", 15+random(20));
        set_skill("dodge", 15+random(20));
        set_skill("parry", 15+random(40));

        setup();
        carry_object(__DIR__"obj/sengyi")->wear();
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

void greeting(object me)
{
        command("hi " + me->query("id"));
        return ;
}
