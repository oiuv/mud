// bshangfan.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("台夷商贩", ({ "shang fan", "shang", "fan" }) );
	set("gender", "女性" );
	set("age", 32);
	set("long", "一个摆夷妇女，背着个竹篓贩买些丝织物品和手工艺品。\n");
	set("combat_exp", 2500);
        set("per", 17);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	setup();
	carry_object(__DIR__"obj/bduanqun")->wear();
	add_money("coin", 100);
}

