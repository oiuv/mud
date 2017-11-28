// huitong.c

inherit NPC;

void create()
{
        set_name("慧通禅师", ({"huitong chanshi","monk", "huitong","chanshi"}));
        set("long",
        "慧通禅师是宝象寺的主持，神色庄重，举止间自有一番威仪。\n");
	set("title", "宝象寺主持");
        set("gender", "男性");
        set("attitude", "friendly");
        set("class", "bonze");
        set("age", 69);
        set("per", 25);
        set("max_qi", 900);
        set("max_jing", 900);
        set("neili", 900);
        set("max_neili", 900);
        set("jiali", 40);
	set("max_jingli", 900);
	set("jingli", 900);
	set("combat_exp", 200000);
        set("shen_type", 1);

        set_skill("force", 90);
        set_skill("unarmed", 90);
        set_skill("dodge", 90);
	set_skill("parry", 90);
	
        setup();
        carry_object(__DIR__"obj/sengpao")->wear();
}
