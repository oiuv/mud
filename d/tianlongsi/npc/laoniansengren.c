// laoniansengren.c
inherit NPC;
inherit F_DEALER;

void init();
void greeting(object ob);
string ask_me();
void create()
{
	set_name("老年僧人", ({ "laonian sengren", "seng", "sengren" }) );
	set("gender", "男性" );
	set("age", 80);
	set("long","他是寺中掌管烟火的僧人。\n");
	set("combat_exp", 1000);
	set("attitude", "friendly");
	set("rank_info/respect", "老僧");
	set("vendor_goods", ({
		"/d/tianlongsi/obj/xiang",
	}));
	set("inquiry" ,([
		"舍利子" : (:ask_me():),
	]));
	setup();
	carry_object("/d/xueshan/obj/c-jiasha")->wear();
}

void init()
{	
	object ob; 
//	mapping myfam; 
	ob = this_player();
	::init();
	remove_call_out("greeting");
	call_out("greeting", 1, ob);
	add_action("do_buy", "buy");
	add_action("do_list", "list");
}

void greeting(object ob)
{
	if( !ob || environment(ob) != environment() ) return;
	say( "老年僧人笑咪咪地说道：这位" + RANK_D->query_respect(ob)
				+ "，买柱香吧。\n");
}

string ask_me()
{
	object me=this_player();
	if(me->query_temp("marks/ask_temp2"))
		{
		me->set_temp("marks/ask_temp3",1);
		return "“失窃的那天晚上我看见一个黑影往后面跑了。\n";
		}
	else
		return "“你胡说八道什么？”\n";
}