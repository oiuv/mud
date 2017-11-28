//guanbing.c

inherit NPC;

void create()
{
        set_name("官兵", ({ "guan bing", "bing" }));
        set("age", 18 + random(10));
        set("gender", "男性");
        set("long","正在守城的官兵，千万不要招惹他们，否则可能会有杀身之祸。\n");
        set("attitude", "peaceful");
        set("shen_type", 1);
	set("str", 20);
        set("combat_exp", 20000);
	set("max_qi", 400);
	set("max_jing", 400);
	set("max_neili", 200);
	set("neili", 200);
	set("jiali", 10);
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("blade", 40);
        set_skill("force", 40);

        setup();
        carry_object(__DIR__"obj/gangdao")->wield();
        carry_object(__DIR__"obj/bingfu")->wear();
}
void init()
{
        object ob;
        ::init();
        if (interactive(ob = this_player()) && 
            (int)ob->query_condition("killer")) 
        {
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob);
        }
}

int accept_fight(object me)
{
        message_vision("小兵对$N喝道：大胆刁民，竟敢攻击朝廷命官？\n", me);
        kill_ob(me);
        return 1;
}
