//jingming.c

inherit NPC;

void create()
{
        set_name("净明", ({"jing ming", "monk" }));
        set("title","宝象寺长老");
        set("gender", "男性");
        set("age", 80);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("per", 30);
        set("int", 30);
        set("max_qi", 700);
        set("max_jing", 700);
        set("neili", 800);
        set("max_neili", 800);
        set("jiali", 30);
        set("max_jingli", 800);
        set("jingli", 800);
        set("combat_exp", 120000);
        set_skill("unarmed", 70);
        set_skill("dodge", 70);
        set_skill("parry", 70);
        set_skill("force", 70);

        setup();
        carry_object(__DIR__"obj/sengpao")->wear();
}

int accept_fight(object me)
{
	command("say 这位"+ RANK_D->query_respect(me) +
                "你我无冤无仇，这样又是何必呢？");
        
	return 0;
}
