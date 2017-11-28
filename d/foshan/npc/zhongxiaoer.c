// zhongxiaoer.c

inherit NPC;

void create()
{
	set_name("钟小二",({ "zhong xiaoer", "zhong", "xiaoer" }) );
        set("gender", "男性" );
        set("age", 3);
        set("long", "他是钟阿四的二儿子，几只狼狗在追着撕咬他。\n");
        set("combat_exp", 50);
//        set("shen", 50);
	set("shen_type", 1);
	set("str", 11);
	set("dex", 11);
	set("con", 11);
	set("int", 11);
        set("attitude", "friendly");
        setup();
	carry_object("/clone/cloth/cloth")->wear();
}

