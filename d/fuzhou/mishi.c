#include <ansi.h>
#include <room.h>
inherit ROOM;

string look_hua();
string look_liang();
int valid_leave( object me, string dir );

void create()
{
	set( "short", "柴房" );
	set( "long", @LONG
这是向阳老宅后院的一间小柴房，房屋里布满了蛛网，地
面满是灰尘，看样子已经很久没有人打扫了。房间的墙壁破烂
不堪，左首处悬挂着一幅画(hua)，角落处斜放着几捆干柴。
LONG );
	set( "exits", ([
		 "east" : __DIR__ "houyuan",
	]) );
	set( "item_desc", ([
		 "hua"     : (: look_hua:),
		 "liang"   : (: look_liang:),
	]) );
	set( "objects", ([
		 "/d/wudu/obj/ganchai" : 2,
	]) );
	setup();
}

void init()
{
	add_action( "do_jump", "jump" );
}

string look_hua()
{
	object me = this_player();

	if ( me->query( "score" ) < 1000 )
		return(HIR "\n一幅陈旧的画卷，画中乃是达摩老祖，没有什么不同。\n" NOR);

	if ( me->query( "score" ) < 3000 )
		return(HIR "\n一幅陈旧的画卷，画中达摩老祖左手握个剑诀，慈祥安和。\n" NOR);

	me->set_temp( "marks/辟1", 1 );
	return(HIR "\n一幅陈旧的画卷，画中达摩老祖左手握个剑诀，正指向房梁(liang)处。\n" NOR);
}

string look_liang()
{
	object me = this_player();

	if ( !me->query_temp( "marks/辟1" ) )
		return("你要看什么？\n");

	if ( query( "move" ) )
		return(WHT "一根楠木做的房梁，上面有崭新的刮痕，似乎不久前才有人动过。\n" NOR);

	me->set_temp( "marks/辟2", 1 );
	return(WHT "一根楠木做的房梁，可惜年代太久，已经腐烂得不成样子了。\n" NOR);
}

int do_jump( string arg )
{
	object ob, me = this_player();

	if ( !arg || arg != "liang" )
		return(0);

	if ( me->query_temp( "marks/辟2" ) )
	{
		if ( me->query_dex() < 40 )
			write( HIC "你试图跳上房梁，无奈身法不够敏捷，只好做罢。\n" NOR );
		else{
			foreach( ob in deep_inventory( me ) )
			if ( ob->is_character() )
			{
				if ( ob == me->query_temp( "is_riding" ) )
				{
					message_vision( "$N从$n上飞身跳下。\n", me, ob );
					me->delete_temp( "is_riding" );
					ob->delete_temp( "is_rided_by" );
					ob->move( environment( me ) );
				} else {
					ob->move( environment( me ) );
					message_vision( "\n$N将" + ob->name() + "从背上放了下来"
							"，躺在地上。\n\n" NOR, me );
				}
			}

			message( "vision", HIY "只见" + me->name() + HIY "一纵身跃上了房"
				 "梁。\n" NOR, environment( me ), me );
			set( "move", 1 );
			write( HIY "\n你纵身轻轻一跃，跳上了房梁。\n\n" NOR );
			me->move( __DIR__ "liang" );
			message( "vision", HIY "只见" + me->name() + HIY "从下面的柴房跃"
				 "了上来。\n" NOR, environment( me ), me );
		}
		return(1);
	}
	write( "什么？\n" );

	return(1);
}

int valid_leave( object me, string dir )
{
	me->delete_temp( "marks/辟1" );
	me->delete_temp( "marks/辟2" );
	return(::valid_leave( me, dir ) );
}
