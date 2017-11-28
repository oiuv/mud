// Npc: /kungfu/class/shaolin/qing-yuan.c
// Date: YZC 96/01/19

inherit NPC;

void create()
{
	set_name("清缘比丘", ({
		"qingyuan biqiu",
		"qingyuan",
		"biqiu",
	}));
	set("long",
		"他是一位体格强健的壮年僧人，他身得虎背熊腰，全身似乎蕴含\n"
		"着无穷劲力。他身穿一袭白布黑边袈裟，似乎身怀武艺。\n"
	);


	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 30);
	set("shen_type", 1);
	set("str", 21);
	set("int", 20);
	set("con", 20);
	set("dex", 25);
	set("max_qi", 350);
	set("max_jing", 200);
	set("neili", 350);
	set("max_neili", 350);
	set("jiali", 30);
	set("combat_exp", 5000);
	set("score", 100);

	set_skill("force", 30);
	set_skill("shaolin-xinfa", 30);
	set_skill("dodge", 30);
	set_skill("shaolin-shenfa", 30);
	set_skill("strike", 30);
	set_skill("qianye-shou", 30);
	set_skill("parry", 30);
	set_skill("buddhism", 30);
	set_skill("literate", 30);

	map_skill("force", "shaolin-xinfa");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("strike", "qianye-shou");
	map_skill("parry", "qianye-shou");

	prepare_skill("strike", "qianye-shou");

	create_family("少林派", 40, "弟子");

	setup();

        carry_object("/d/shaolin/obj/qing-cloth")->wear();
}

void init()
{	
	object ob;

	::init();
	if( interactive(ob = this_player()) ) {
		remove_call_out("speaking");
		call_out("speaking", 1, ob);
	}
}

void speaking(object ob)
{
	if ( random(5) < 1 ) 
	{	
		switch( random(4) ) {
		case 0:
                       command("say 百年前的一场大火，整个少林寺就除这监牢和北边的钟楼没遭灾。唉。。。\n");
		       break;
		case 1:
                       command("say 这里四周全用钢汁浇缝的花岗岩给封了起来，你们就是变成苍蝇也飞不出去！\n");
		       break;
		case 2:
                       command("say 好好呆着别动，等会儿自然会放你们出去，不过你们自己要打架我可不管！\n");
		       break;
		case 3:
                       command("say 嘿，历年来多少巨奸大盗都在这里被关过，北边牢里的狱卒就是其中一个。\n");
		       break;
		}
	}
}


