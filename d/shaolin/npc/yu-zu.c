// yu-zu.c

inherit NPC;

void close_door(object room);

void create()
{
	set_name("狱卒", ({ "yu zu", "zu" }) );
	set("long",
		"这是一个长相十分凶恶的狱卒，满脸横肉，眼神里带着股杀气。\n");
	set("attitude", "peaceful");
	set("chat_chance", 1);
	set("chat_msg", ({
		"狱卒嘿嘿嘿地冷笑起来，当他发现你正注视著他的时候，扭头恶狠狠瞪了你一眼。\n",
		"狱卒掏出一把雪亮的匕首，缓缓地削着自己又黑又长的手指甲，嘴里哼着什麽。\n"
	}) );
	set("age", 50);
	set("combat_exp", 20000);
	set("max_jing", 500);
	set("max_qi", 500);
	set_skill("dodge", 40);
	set_skill("unarmed", 40);
	set_temp("apply/armor", 30);
	set_temp("apply/damage", 20);
	setup();
}

int accept_object(object who, object ob)
{
	object room;

	if (ob->query("money_id") && ob->value() >= 1000) 
	{
		tell_object(who, "狱卒说道：下水道里老鼠真多，替我去打几只，可别乘机溜了呵！\n\n");
		message_vision("狱卒左右张望了一下，偷偷替$N打开通往南边的小门。\n", who);

		if(!( room = find_object("d/shaolin/jianyu1")) )
			room = load_object("d/shaolin/jianyu1");

		room->set("exits/south", "d/shaolin/andao1");

		remove_call_out("close_door");
		call_out("close_door", 10, room);
		
		return 1;
	}

	return 0;
}

void close_door(object room)
{
	message("vision","狱卒飞快地站起身，上前一下把小门关了起来。\n", room);
	room->delete("exits/south");
}	

