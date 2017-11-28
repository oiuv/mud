// yayi.c  官府衙役
inherit NPC;

void create()
{
	set_name("衙役", ({ "ya yi", "ya" }));
	set("gender", "男性");
	set("age", 25);

	set("long", "一个高大威猛的汉子，因为久在官府做事，脸上已经磨炼得毫无表情。\n");
	set("combat_exp", 7500);
	set("shen_type", 1);
        set_skill("unarmed", 30);
        set_skill("dodge", 30);
	set("chat_msg_combat", ({
		"衙役说道：你当这里是什么地方，敢来这里骚扰？\n",
		"衙役说道：你要是再无理取闹，当心捕头把你抓去坐牢!\n",
		"衙役手中的刀越砍越快，让你应接不暇。\n",
		"衙役说道：衙门岂是你放肆的地方？！\n"
	}) );
	setup();
	carry_object(__DIR__"obj/yayifu")->wear();
}
	
