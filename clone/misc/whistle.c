/* whistle.c 马哨 */

#include <ansi.h>

#define RIDE_CMD              "/cmds/std/ride"
#define UNRIDE_CMD            "/cmds/std/unride"

inherit ITEM;

void init()
{
    if ( interactive( this_player() ) &&
         environment() == this_player() )
    {
        add_action( "do_whistle", "whistle" );
    }
}

void create()
{
    set_name( HIG "马哨" NOR, ({ "ma shao", "shao" }) );
    if ( clonep() )
        set_default_object( __FILE__ );
    else {
        set( "unit", "个" );
        set( "long", HIC "这是一个玉制马哨，需要马时吹(whistle)一下就行了。\n" NOR );
        set( "family", 0 );
        set( "whistle", 10 );
    }

    setup();
}

int do_whistle()
{
    object  horse;
    string  err, file;
    object  me  = this_player();
    object  ob  = this_object();

    if ( me->is_busy() || me->query( "doing" ) )
        return(notify_fail( "你现在正忙呢，等你有空了再说吧。\n" ) );

    if ( me->is_in_prison() )
        return(notify_fail( "你正在坐牢呢，想干什么？！\n" ) );

    if ( me->is_ghost() )
        return(notify_fail( "等你还了阳再召唤吧。\n" ) );

    if ( ob->query("family") && me->query( "family/family_name" ) != "八卦门" )
        return(notify_fail( "你又不是镇远镖局的人，没有马匹可呼唤。\n" ) );

    if ( environment( me )->query( "no_ride" ) ||
         environment( me )->query( "maze" ) )
        return(notify_fail( "你发现这里有点古怪，口哨的声音传不出去！\n" ) );

    if ( !environment( me )->query( "outdoors" ) )
        return(notify_fail( "你还是到户外再呼唤马匹吧！\n" ) );

    if ( environment( me )->query( "outdoors" ) == "wuguan" )
        return(notify_fail( "你的马进不了郭府，再怎么吹口哨也没用！\n" ) );

    if (me->query_temp( "is_riding" ))
        return(notify_fail( "你不是骑在马上吗？\n"));

    if (sizeof(filter_array(all_inventory(environment(me)),
                            (: $1->query("ridable") :))))
        return(notify_fail( "你身边已经有骑坐可用了，不用再呼唤吧？\n"));

    switch ( random( 3 ) )
    {
    case 0:
        file = "/clone/horse/huangbiaoma";
        break;
    case 1:
        file = "/clone/horse/zaohongma";
        break;
    default:
        file = "/clone/horse/ziliuma";
    }
    call_other( file, "???" );
    err = catch( horse = new( file ) );
    if ( err || !ob->query( "whistle" ))
    {
        message_vision( HIM "$N" HIM "吹了一声马哨，"
                "然而什么也没有发生 :)\n" NOR, me );
        return(1);
    }
    horse->move( environment( me ) );
    horse->reset_action();
    horse->set_leader( me );
    message_vision( HIC "$N" HIC "拿出马哨吹了一声，"
            "一匹$n" HIC "从远处跑了过来。\n" NOR, me, horse );
    ob->add( "whistle", -1 );
    RIDE_CMD->main(me, horse->query("id"));

    if ( me->is_fighting() )
        me->start_busy( 1 + random( 3 ) );

    return(1);
}
