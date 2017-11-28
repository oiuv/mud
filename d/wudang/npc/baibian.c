// baibian.c

#include <ansi.h>

inherit NPC;

void create()
{
	seteuid(getuid());
	set_name("张三", ({ "zhang san", "zhang", "san", "bai bian" }) );
	set("title", HIY "百变道人" NOR);
	set("gender", "男性" );
	set("age", 50);
	set("long", "一位邋邋遢遢的道士。\n");
	set("attitude", "heroism");
	set("class", "taoist");

	set("str", 21);
	set("con", 30);
	set("int", 27);
	set("dex", 23);

	set("max_qi", 600);
	set("max_jing", 300);
	set("neili", 600);
	set("max_neili", 600);
	set("jiali", 30);
	set("shen_type", -1);
	set("env/wimpy", 60);

	set_temp("apply/attack",  10);
	set_temp("apply/defense", 20);

	set("combat_exp", 25000);

	set_skill("force", 43); 
	set_skill("unarmed", 51);
	set_skill("sword", 37);
	set_skill("dodge", 59);
	set_skill("parry", 40);
	set_skill("taiji-quan", 42); 
	set_skill("taiji-jian", 41); 
	set_skill("taiji-shengong", 40); 
	set_skill("tiyunzong", 53);

	map_skill("force", "taiji-shengong");
	map_skill("unarmed","taiji-quan");
	map_skill("parry", "taiji-quan");
	map_skill("sword", "taiji-jian");
	map_skill("dodge", "tiyunzong");

	create_family("武当派", 3, "弟子");

	set("chat_chance", 8);
	set("chat_msg", ({
		(: random_move :)
	}) );

	setup();

	carry_object("/clone/misc/mask");
	add_money("gold", 3);
        
}

void init()
{	
	object ob, me;
	mapping skill_status, map_status;
	string *sname, *mname;
	int i;

	me = this_object();
	ob = this_player();

	::init();

	if (me->is_fighting() || wizardp(ob)) return;

	remove_call_out("pretending");
	call_out("pretending", 1, ob);
	
	me->map_skill("unarmed");
	me->map_skill("dodge");
	me->map_skill("parry");

	if ( !(skill_status = ob->query_skills()) ) return;
	sname  = keys(skill_status);

	for(i=0; i<sizeof(skill_status); i++) {
		me->set_skill(sname[i], skill_status[sname[i]]);
	}

	if ( !(map_status = ob->query_skill_map()) ) return;
	mname  = keys(map_status);

	for(i=0; i<sizeof(map_status); i++) {
		me->map_skill(mname[i], map_status[mname[i]]);
	}

	set("neili", 600);
	set("jiali", 30);
	
}

void pretending(object ob)
{

	object me = this_object();
 
	if(!ob || !userp(ob) || environment(ob) != environment()) return;

	switch( random(3) ) {
		case 0:
                       command("grin " + ob->query("id"));
                       command("pretend " + ob->query("id"));
                       command("exert recover");
		       break;
		case 1:
                       command("hi " + ob->query("id"));
                       command("exert heal");
                       command("exert recover");
		       break; 
		case 2:
                       command("stare " + ob->query("id"));
		       me->fight_ob(ob);
		       ob->fight_ob(me);
		       break;
	}
}
