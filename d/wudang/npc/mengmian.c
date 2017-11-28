// mengmian.c 蒙面大汉

inherit NPC;

void create()
{
        set_name("蒙面大汉", ({ "dahan" }));
        set("long",
                "他是一个蒙面大汉。\n");
        set("gender", "男性");
        set("age", 30);
        set("attitude", "aggressive");
        set("shen_type", 1);

        set("str", 30);
        set("int", 30);
        set("con", 35);
        set("dex", 30);

        set("max_qi", 400+random(200));
        set("max_jing", 200);
        set("neili", 500);
        set("max_neili", 300);

        set("combat_exp", 2000+random(2000));
        set("score", 1000);

        set_skill("force", 60);
        set_skill("dodge", 40);
        set_skill("unarmed", 40);
        set_skill("parry", 40);
        set_skill("blade", 40);
        set_skill("yanxing-dao", 20);
        set_skill("taoism", 20);

        map_skill("parry", "yanxing-dao");
        map_skill("blade", "yanxing-dao");

        setup();
        carry_object("/clone/weapon/gangdao")->wield();
}

void init()
{
        object ob;

        ::init();
        if( interactive(ob=this_player()) && !is_fighting() )
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
	object *guard,me;
	int i;
	me=this_object();
	guard = all_inventory(environment(me));
	for(i=0; i<sizeof(guard); i++)
	{
		if( !living(guard[i]) || guard[i]==me ) continue;
		me->kill_ob(guard[i]);
	}
	command("kill zhike");
}
