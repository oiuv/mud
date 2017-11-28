// wshangfan.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("乌夷商贩", ({ "shang fan", "shang", "fan" }) );
	set("gender", "男性" );
	set("age", 22);
	set("long", "一位乌夷族的商贩，挑着一担皮毛野味在贩卖。\n");
	set("combat_exp", 5000);
        set("str", 27);
        set("str", 22);
        set("dex", 11);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	setup();
	carry_object(__DIR__"obj/wdahui")->wear();
	add_money("coin", 100);
}

