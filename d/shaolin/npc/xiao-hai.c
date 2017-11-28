// xiao-hai.c

inherit NPC;

void create()
{
	set_name("小孩",({ "xiao hai", "kid" }) );
        set("gender", "男性" );
        set("age", 11);
        set("long", "这是个农家小孩子。不知为何跑到山上玩耍。\n");
//	set("shen_type", 1);
        set("combat_exp", 50);
        set("shen", 50);
	set("str", 11);
	set("dex", 11);
	set("con", 11);
	set("int", 11);
        set("attitude", "heroism");
        setup();
	carry_object("/clone/misc/cloth")->wear();
}

