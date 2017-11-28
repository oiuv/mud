inherit NPC;

void create()
{
        set_name("侍女", ({ "shi nu" }) );
	set("gender", "女性" );
	set("age", 20);
	set("long", "美目四盼，矫揉造作，让你恨不得在她脸蛋儿掐上一把。\n");
	set("shen_type", -1);
	set("combat_exp", 10000);
	set("str", 20);
	set("per", 27);
	set("dex", 22);
	set("con", 20);
	set("int", 21);
	set("attitude", "friendly");
	setup();
	carry_object("/d/heimuya/npc/obj/cloth")->wear();
	add_money("coin", 20);
}
