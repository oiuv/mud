// wujiang.c 武将

inherit NPC;

void create()
{
        set_name("武将", ({ "wu jiang", "wu", "jiang" }));
        set("gender", "男性");
        set("age", random(10) + 30);
        set("str", 25);
        set("long", "他威风凛凛，杀气腾腾，虽然现在只是个守"
                    "城小官，当年也曾经参加过几场大战役。\n");
        set("combat_exp", 80000);
        set("attitude", "peaceful");
        set_skill("unarmed", 70);
        set_skill("force", 70);
        set_skill("sword", 70);
        set_skill("dodge", 70);
        set_skill("parry", 70);
	set("max_qi", 700);
	set("max_jing", 600);
        set("neili", 400); 
        set("max_neili", 400);
        set("jiali", 15);
	set("max_jingli", 100);
	set("jing", 100);
	set("jingli_factor", 5);

        setup();
        carry_object(__DIR__"obj/changjian")->wield();
        carry_object(__DIR__"obj/zhanjia")->wear();
}

void init()
{
        object ob;
        ::init();
        if (interactive(ob = this_player()) && 
            ob->query_condition("killer")) 
        {
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob);
        }
}

int accept_fight(object me)
{
        message_vision("武将对$N把眼一瞪，喝道：呔，放肆，敢"
                       "跟我比试，是不是活的不耐了！\n\n", me);
        return 0;
}
