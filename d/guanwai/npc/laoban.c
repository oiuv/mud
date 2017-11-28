// laoban.c

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("酒馆老板", ({ "lao ban" }) );
	set("gender", "男性" );
	set("age", 32);
	set("long",
		"这位酒馆老板满身狗肉香，点头哈腰着对你笑着。\n");
	set("combat_exp", 500);
	set("attitude", "friendly");
	set("no_get", "1");
	set("vendor_goods", ({
		__DIR__"obj/gourou",
		__DIR__"obj/gouroutang",
		__DIR__"obj/map",
	}));
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{	
	object ob; 
	mapping myfam; 

	ob = this_player();

	::init();
	if( interactive(ob) && !is_fighting() ) {
		if ( (myfam = ob->query("family")) 
		&& myfam["family_name"] == "丐帮" 
		&& ob->query_skill("begging",1) > 10 )
		{
			remove_call_out("saying");
			call_out("saying", 0, ob);
		}
		else
		{ 
			remove_call_out("greeting");
			call_out("greeting", 1, ob);
		}
	}
	add_action("do_buy", "buy");
	add_action("do_list", "list");
}

void greeting(object ob)
{
	if( !ob || environment(ob) != environment() ) return;
	switch( random(2) ) {
		case 0:
			say( "酒馆老板得意的说道：这么冷的天，喝碗狗肉汤是最能暖和身子的！\n");
			break;
		case 1:
			say( "酒馆老板搓了搓手，说道：这位" + RANK_D->query_respect(ob)
				+ "，狗肉大补啊，尝尝吧。\n");
			break;
	}
}

void saying(object ob)
{
        if (!ob || environment(ob) != environment()) return;

	say("\n酒馆老板大喝一声：你这臭要饭的进来干什麽？ 给我滚出去！\n\n");
	remove_call_out("kicking");
	call_out("kicking", 1, ob);
	
}

void kicking(object ob)
{
        if (!ob || environment(ob) != environment()) return;

	ob->move("/d/guanwai/nancheng");
	message("vision","只听“乒”地一声，" +  ob->query("name") +
		"被人从香肉馆里一脚踢了出来，狼狈万状的逃开了。\n", environment(ob), ob);
}
