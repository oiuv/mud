// oldman.c

inherit NPC;

void create()
{
	set_name("摆夷老叟",({ "old man", "old", "man" }) );
        set("gender", "男性" );
        set("age", 72);
        set("long", 
"一个摆夷老叟大大咧咧地坐在竹篱板舍门口，甩着三四个巴掌大的棕吕树叶，瞧着道
上来来往往的人们，倒也快活自在。\n");
        set_temp("apply/defense", 5);
	set("combat_exp", 700);
	set("shen_type", 1);
        set("per", 13);
        set("str", 14);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

