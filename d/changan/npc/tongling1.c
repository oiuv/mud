//tongling.c

inherit NPC;

void create()
{
        set_name("张衡", ({ "zhang heng"}) );
        set("gender", "男性");
        set("age", 30);
        set("combat_exp", 200000);
	set("title", "御林军统领");
        set("attitude", "friendly");
	set("per", 25);
        set("str", 35);
        set("max_qi", 900);
        set("max_jing", 900);
	set("max_jingli", 900);
	set("jingli", 900);
        set("neili", 900);
        set("max_neili", 900);
        set("jiali", 50);
        set_skill("hammer", 120);
        set_skill("unarmed", 120);
        set_skill("parry", 120);
        set_skill("dodge", 120);
	set_skill("force", 120);
       
        setup();
        carry_object(__DIR__"obj/hammer")->wield();
        carry_object(__DIR__"obj/zhanjia")->wear();
}

int accept_fight(object me)
{
        command("say 我贵为御林军统领，岂能与你一般见识！");
        return 0;
}
