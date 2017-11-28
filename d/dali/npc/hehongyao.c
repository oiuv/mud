// hehongyao.c

inherit NPC;

void create()
{
	set_name("何红药",({ "he hongyao", "he" }) );
        set("gender", "女性" );
        set("age", 47);
        set("long", "这女人就象个老乞婆，蓬头垢面，头发乱得象鸡窝，十指尤如
鸡爪。满脸都是奇怪的伤痕，好象是被虫蛇撕咬所致，伤痕青
黑不堪入目。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 70000);
	set("shen_type", -1);
        set("per", 12);
        set("str", 34);
        set("dex", 35);
        set("con", 36);
        set("int", 35);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 40);
        set("attitude", "friendly");
        setup();
}

