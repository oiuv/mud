// lady1.c

inherit NPC;

void create()
{
	set_name("苏州女孩",({ "girl" }) );
        set("gender", "女性" );
        set("age", 16);
        set("long", 
"这是个十六、七岁的苏州女孩，清丽绝俗，一脸温柔的颜色。\n");
        set_temp("apply/defense", 5);
	set("combat_exp", 70);
//        set("shen", 100);
	set("shen_type", 1);
        set("str", 14);
        set("per", 28);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

