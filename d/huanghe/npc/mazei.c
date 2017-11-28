// mazei.c

inherit NPC;


void create()
{
        set_name("马贼", ({ "ma zei", "zei" }));
        set("gender", "男性");
        set("age", random(10) + 30);
        set("str", 25);
        set("dex", 16);
        set("per", 16);
        set("long", "一个彪悍的马贼。\n");
        set("combat_exp", 50000);
        set("shen_type", -1);
        set("attitude", "peaceful");

        set_skill("unarmed", 60);
        set_skill("force", 60);
        set_skill("sword", 60);
        set_skill("dodge", 60);
        set_skill("parry", 60);
        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/armor", 50);
        set_temp("apply/damage", 30);

        set("neili", 400);
        set("max_neili", 400);
        set("jiali", 10);

        setup();
        carry_object("/clone/weapon/gangjian")->wield();
        carry_object("/d/city/npc/obj/tiejia")->wear();
}

void init()
{
        object ob;
        ::init();

        if (interactive(ob = this_player()) && (int)ob->query_temp("mazei"))
        {
                say( "马贼对着你大吼：你竟敢不交！老子宰了你！\n");
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob);
        }
        if( interactive(ob) && !is_fighting() && !(int)ob->query_temp("mazei"))
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if( !ob || environment(ob) != environment() ) return;
        say( "马贼横刀当道，一声大喊：此山是我开，此树是我栽，若要
从此过，留下买路财 !\n");
        say( "马贼说道：识相点儿，宝贝儿留下来就让你小子走！\n");
        ob->set_temp("mazei",1);
}

int accept_object(object who, object ob)
{
	
	if (ob->query("money_id") && ob->value() >= 5000) 
	{
             say( "马贼大喊一声：既然交了钱，就请马前过。\n");
             ob->delete_temp("mazei");
		return 1;
	}
       say( "马贼大怒：就这么点钱？\n");
       return 0;
}


