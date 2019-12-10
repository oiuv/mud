// nuerhai.c

inherit NPC;

#include <ansi.h>
void create()
{
	set_name("努儿海", ({ "nu erhai", "nu" }));
	set("title", HIM"西夏一品堂"HIG"接引使"NOR);
	set("gender", "男性");
	set("age", random(10) + 20);
	set("str", 25);
	set("dex", 16);
	set("per", 13);
	set("long", "一个身形极高、鼻子极大，声音阴阳怪气的汉子。\n");

	set("combat_exp", 100000);
	set("shen_type", 1);
	set("attitude", "peaceful");
	set_skill("unarmed", 80);
	set_skill("force", 80);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	set_temp("apply/attack", 50);
	set_temp("apply/defense", 50);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 50);

	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);

	setup();
	carry_object("/d/city/npc/obj/tiejia")->wear();
}

void init()
{
	object me,ob;
	me = this_object () ;
	ob = this_player () ;
	::init();
	add_action("do_join","join");
	if( interactive(ob) && !is_fighting() )
	{
		remove_call_out("greeting");
		call_out("greeting", 1, me, ob);
	}
}

string ask_me()
{
	return "诚招天下豪杰。你想加入我一品堂(join yipintang)吗？";
}

int do_join(string arg)
{
	object ob;
//	mapping party;

	ob = this_player () ;
	if( !arg || arg!="yipintang" )
		return notify_fail("努儿海问道：“你要加入什么组织？”\n");
   	if( (int)ob->query("yipin/joined") )
		return notify_fail("努儿海奇怪地说道：“你开什么玩笑？你已经是堂中人了。”\n");
   	if( (int)ob->query("combat_exp") < 1000 )
		return notify_fail("努儿海哈的一声大笑起来：“我们只要江湖中的成名英雄。你算什么材料？”\n");
	command("gongxi "+ob->query("id"));
	message_vision("努儿海冲着$N笑道：“那好，咱们现在就是一殿之臣，一家人了！”\n",ob);
	ob->set("yipin/joined",1);
	return 1;
}
