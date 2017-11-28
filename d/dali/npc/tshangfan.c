// tshangfan.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("台夷商贩", ({ "shang fan", "shang", "fan" }) );
	set("gender", "男性" );
	set("age", 22);
	set("long", "一位台夷族的商贩，正在贩卖一竹篓刚打上来的活蹦乱跳的鲜鱼。\n");
	set("combat_exp", 3000);
        set("per", 17);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	setup();
	carry_object(__DIR__"obj/ttoujin")->wear();
	carry_object(__DIR__"obj/tduanqun")->wear();
	add_money("coin", 100);
}

