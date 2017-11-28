// dao-ke.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("刀客", ({ "dao ke","ke"}) );
	set("gender", "男性");
	set("age", 20);
	set("long",
		"这家伙满脸横肉，一付凶神恶煞的模样，令人望而生畏。\n");
	set("combat_exp", 15000);
        set("shen_type", -1);
	set("attitude", "heroism");

	set_skill("unarmed", 45);
	set_skill("blade", 45);
	set_skill("parry", 40);
	set_skill("dodge", 40);

	setup();

        carry_object("/d/city/obj/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();

	add_money("silver", 10);
}

void init()
{
	object room, ob;
	string mengzhu;
	
	if(!( room = find_object("/d/taishan/fengchan")) )
	room = load_object("/d/taishan/fengchan");

	if( objectp(ob = present("mengzhu", room)) ) 
	mengzhu = ob->query("winner");

	if( this_player()->query("id") == mengzhu ) {
		message_vision(HIY "刀客向$N躬身为礼，说道：盟主您老人家好！\n" NOR, 
		this_player());
	}	
}
