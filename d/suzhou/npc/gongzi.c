// gongzi.c
inherit NPC;

void create()
{
	set_name("公子哥", ({ "gongzi ge", "gongzi", "ge" }) );
	set("gender", "男性" );
	set("age", 19);
	set("long", "这是个流里流气到处揩油挥霍的花花公子。\n");
	set("attitude", "friendly");
	set("shen_type", -1);

	set("str", 21);
	set("int", 23);
	set("con", 22);
	set("dex", 20);
	
	set("max_qi", 400);
	set("max_jing", 200);
	set("neili", 100);
	set("max_neili", 100);
	set("combat_exp", 30000+random(10000));
	set("score", 10000);
	setup();
	add_money("silver", 10);
}

void init()
{
	object ob;

	::init();

	if( interactive(ob = this_player()) && !is_fighting() ) {
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}
}
void greeting(object ob)
{
	if( !ob || environment(ob) != environment() ) return;
	if(ob->query("gender")=="女性")
	{
	    if(random(2)==1)
		say(" 公子哥拧了一下"+ob->query("name")+"的脸蛋，一脸坏笑道："+RANK_D->query_respect(ob)+
		     "长得好象还很不赖嘛，陪我玩玩可好？\n");
        else
		say(" 公子哥一眼看到"+ob->query("name")+"顿时大乐：这位"+RANK_D->query_respect(ob)+
		     "来得正好，走，乐乐去？\n");
          }

}
