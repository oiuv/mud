//butou.c

inherit NPC;

void create()
{
        set_name("捕头", ({ "bu tou"}));
        set("age", 40);
        set("gender", "男性");
        set("long","长安巡捕头领\n");
        set("attitude", "peaceful");
        set("shen_type", 1);
	set("str", 20);
        set("combat_exp", 100000);
	set("max_qi", 600);
	set("max_jing", 600);
	set("max_neili", 500);
	set("neili", 500);
	set("jiali", 30);
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("blade", 40);
        set_skill("force", 40);

        setup();
        carry_object(__DIR__"obj/gangdao")->wield();
        carry_object(__DIR__"obj/cloth")->wear();
        carry_object(__DIR__"obj/laofang-key");
}
