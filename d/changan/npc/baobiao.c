//baobiao.c

inherit NPC;

void create()
{
        set_name("群玉楼保镖", ({ "bao biao","baobiao" }));
        set("gender", "男性");
        set("age", random(10) + 20);
        set("str", 25);
	set("con", 25);
	set("spi", 25);
	set("dex", 25);
	set("int", 25);
        set("shen_type", -1);
        set("long", "他杀气腾腾，负责群玉楼所有女人的安全。\n");
        set("combat_exp", 100000);
	set("class", "fighter");
        set("attitude", "herosim");
        set_skill("unarmed", 70);
        set_skill("force", 70);
        set_skill("sword", 70);
        set_skill("dodge", 70);
        set_skill("parry", 70);
	set("max_qi", 700);
	set("max_jing", 700);
        set("max_neili", 600);
        set("neili",600);
        set("jiali", 40);
	set("max_jingli", 600);
	set("jingli", 600);

        setup();
        carry_object(__DIR__"obj/sword")->wield();
        carry_object(__DIR__"obj/zhanjia")->wear();
}

int accept_fight(object me)
{
        message_vision("群玉楼保镖对$N喝道：是不是想死啊！\n\n", me);
        return 0;
}

int heal_up()
{
        if (environment() && !is_fighting()) 
	{
                call_out("leave", 1);
                return 1;
	}
        return ::heal_up() + 1;
}

void leave()
{
//      object stone;
        this_object()->add("time", 1);
        if ((int)this_object()->query("time") >= 3) 
	{
                message("vision", name() + "嘿嘿一笑:“老子要回去"
                        "睡觉了，再有人来群玉楼闹事就叫我！”\n",
                        environment());
                destruct(this_object());
	}
        return;
}