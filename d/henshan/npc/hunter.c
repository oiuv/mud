#include <ansi.h>
inherit NPC;

mixed teach_hunting();

void create()
{
	set_name( "猎人", ({ "hunter" }) );
	set( "gender", "男性" );
	set( "class", "swordman" );
	set( "age", 45 );
	set( "str", 200 );
	set( "con", 26 );
	set( "int", 28 );
	set( "dex", 200 );
	set( "combat_exp", 12000000 );
	set( "attitude", "peaceful" );

	set_skill( "unarmed", 300 );
	set_skill( "dodge", 300 );
	set_skill( "training", 300 );
	set_skill( "hunting", 300 );

	set( "max_qi", 4500 );
	set( "max_jing", 2000 );
	set( "neili", 4000 );
	set( "max_neili", 4000 );
	set( "jiali", 150 );

	set( "inquiry", ([
				 "hunting" : (: teach_hunting:),
				 "捕猎"    : (: teach_hunting:),
			 ]) );

	setup();
	carry_object( "/clone/cloth/cloth" )->wear();
}

int accept_object( object me, object ob )
{
	if ( !me || environment( me ) != environment() )
		return(0);
	if ( !objectp( ob ) )
		return(0);
	if ( !present( ob, me ) )
		return(notify_fail( "你没有这件东西。" ) );
	if ( (string) ob->query( "id" ) == "bushou jia" )
	{
		command( "nod" );
		command( "say 这个我正用得着，在下无以为报，如果你愿意，我\n可以"
			 "教你一些捕猎的技巧。" );
		me->set_temp( "marks/hunter", 1 );
		return(1);
	}else {
		command( "shake" );
		command( "say 这是什么东西，我不需要！" );
	}

	return(1);
}

mixed teach_hunting()
{
	object	me = this_player();
	int	jing, add;

	jing	= me->query( "jing" );
	add	= me->query_int() + random( me->query_int() / 2 );

	if ( !me->query_temp( "marks/hunter" ) )
		return("你我素无往来，何出此言？\n");

	if ( me->is_busy() || me->is_fighting() )
	{
		write( "你现在正忙着。\n" );
		return(1);
	}

	if ( jing < 20 )
	{
		write( "你的精神无法集中。\n" );
		return(1);
	}

	if ( (me->query( "potential" ) - me->query( "learned_points" ) ) < 1 )
	{
		write( "你的潜能不够，无法继续学习。\n" );
		return(1);
	}
	write( HIW "猎人给你讲解了有关捕猎的一些技巧。\n" NOR );
	write( HIY "你听了猎人的指导，似乎有所心得。\n" NOR );

	me->add( "learned_points", 1 );
	me->improve_skill( "hunting", add );
	me->add( "jing", -(5 + random( 6 ) ) );

	return(1);
}

int recognize_apprentice( object me, string skill )
{
	if ( !(int) me->query_temp( "marks/hunter" ) )
		return(0);

	if ( skill != "training" && skill != "hunting" )
	{
		command( "say 我只传授训兽术(training)和狩猎技巧(hunting)。" );
		return(-1);
	}

	return(1);
}
