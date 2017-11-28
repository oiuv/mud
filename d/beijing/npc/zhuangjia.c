inherit NPC;

void create()
{
	set_name("庄家", ({ "zhuang jia", "zhuang", "jia" }) );
	set("gender", "男性" );
	set("age", 22);
	set("long", "赌馆里管赌局的庄家。\n");
	set("shen_type", 1);
	set("combat_exp", 10000);
        set("str", 10);
        set("dex", 10);
        set("con", 10);
        set("int", 10);
	set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);
        set("chat_chance", 1);
	setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
	add_money("silver", 1);
}
