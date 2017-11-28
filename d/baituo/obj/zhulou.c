// Code of JHSH
// zhulou.c 竹篓
// maco

#include <ansi.h>
inherit ITEM;

int no_limit_amount(){ return 1; }
void create()
{
	set_name("竹篓", ({ "zhu lou", "lou", "basket"}) );
	set_weight(1000);
	set_max_encumbrance(100000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "个");
		set("long", "一个竹条编成的篓子，是欧阳世家的人专门用来捕蛇的。\n");
		set("material", "bamboo");
		set("value", 100);
	}
	setup();
}

void init()
{
	add_action( "do_catch", "catch" );
	add_action( "do_catch", "buzhuo" );
	add_action( "do_free", "free" );
	add_action( "do_free", "fang" );
}

int is_container() {return 1;}

int do_catch(string arg)
{
	object obj = this_object(), me = this_player();
	object snake;

	if (me->is_busy()
	|| me->query_temp("pending/exercising"))
		return notify_fail("你现在正忙着呢。\n");

	if(me->is_fighting())
		return notify_fail("先解决眼前的敌人再说吧。\n");

	if ( !arg )
		return notify_fail("你要捕捉什么？\n" );

	snake = present(arg, environment(me));

	if( !objectp(snake = present(arg, me)) && !objectp(snake = present(arg, environment(me)))) 
		return notify_fail("你要捕捉什么？\n" );

	if (snake->query("race") != "蛇类") 
		return notify_fail("这竹篓是用来捉蛇的。\n");

	if( obj->query("keeper") != me->query("id") ) 
		return notify_fail("这不是你的竹篓，还是别乱动的好。\n");

	if( snake->query("who_breed") )
		return notify_fail("这条"+snake->name()+"是欧阳世家培养出来的，即使捉了，也不能进行育种。\n");

	if( snake->query_lord() != me && living(snake) 
	&& snake->query("caught") != me->query("id") ) 
		return notify_fail(snake->name()+"并非你所驯养，直接动手捉相当危险。\n");

	if(!snake->query("bt_snake")) 
		return notify_fail("这不是欧阳世家蛇谷的品种。\n");

	if( snake->move(obj) ) 
	{
		message_vision("$N将"+snake->name()+"捉了起来，从尾巴起慢慢放进竹篓。\n", me, snake);
		snake->delete("frightened");
		if( !snake->query("caught") ) 
                me->improve_skill( "training", atoi(snake->query("snake_poison")) );

		snake->set("caught", me->query("id"));
	return 1;
	}
	else return 0;
}

int do_free(string arg)
{
	object me, obj, snake, *inv;
	int i;
	me = this_player();
	obj = this_object();

	if( !arg )
		return notify_fail("你想把什麽放出竹篓？\n");

	if( me->is_busy() )
		return notify_fail("你正忙着呢。\n");

	if( obj->query("keeper") != me->query("id") ) 
		return notify_fail("这不是你的竹篓，还是别乱动的好。\n");

	if(arg=="all") {

		if( me->is_fighting() )
			return notify_fail("你还在战斗中！一次祗能放一条蛇。\n");

		inv = all_inventory(obj);
		if( !sizeof(inv) )
			return notify_fail("那里面没有任何东西。\n");

		for(i=0; i<sizeof(inv); i++) {
			if( inv[i]->query("race") != "蛇类" ) continue;
			inv[i]->move(environment(me));
			message_vision("$N将一条$n放出竹篓。\n"NOR, me, inv[i]);
		}
		write("竹篓里的蛇全被放出来了。\n");
		return 1;

	}

	if( !objectp(snake = present(arg, obj)) )
		return notify_fail("竹篓里没有这个生物。\n");

	if( !snake->is_character() || snake->is_corpse() )
		return notify_fail("那并不是活物，直接用拿的就可以了。\n");

	message_vision("$N将一"+snake->query("unit")+"$n放出竹篓。\n"NOR, me, snake);

	snake->move(environment(me));

	if( me->is_fighting() ) me->start_busy(1);

	return 1;
}

int reject(object ob)
{
	if (ob->query("race") == "蛇类") {
		notify_fail("请用捕捉(catch | buzhuo)指令。\n");
		return 1;
		}

	notify_fail("这竹篓是用来捉蛇的。\n");
	return 1;
}
