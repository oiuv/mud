#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "高昌大殿");
        set("long",
"这里就是传说中埋藏着无数宝藏高昌迷宫的大殿，四壁供
的都是泥塑木雕的佛像(fo).大殿之上有一个大大的龙椅，大堂
之上透着一股威严，有一块大匾，上书：

        " WHT "※※※※※※※※※※※※※※※※※※※
        ※                                  ※
        ※     " NOR + HIR "文     成      武     德" NOR + WHT "     ※
        ※                                  ※
        ※※※※※※※※※※※※※※※※※※※" NOR "

东西两面都是殿堂。\n");
        set("maze", 1);
        set("exits", ([
                "west" : __DIR__"wroom1",
                "east" : __DIR__"eroom1", 
        ]));
        set("item_desc", ([ 
            "fo" : "这些佛像都摆着奇怪的姿势，你感觉可以参悟(think)基本拳脚的真意。\n",
        ]));
        setup();
}

void init()
{
    add_action( "do_think", "think" );
}

int do_think()
{
    object  ob;
    int c_skill, add;

    ob = this_player();

    c_skill = (int) ob->query_skill( "unarmed", 1 );
    if ( ob->query_skill( "unarmed", 1 ) < 50 )
    {
        write( "你对基本拳脚的了解显然太低，无法从佛像领悟更深的要义。\n", ob );
        return(1);
    }

    if ( !ob->can_improve_skill( "unarmed" ) )
    {
        write( "你的实战经验不足，无法从佛像领悟更高的武学。\n" );
        return(1);
    }

    if ( ob->query( "jing" ) < 100 )
    {
        write( "你精力不能集中，现在无法领悟佛像真意。\n" );
        return(1);
    }

    if ( c_skill > 180 )
    {
        write( "你感觉自己从佛像的姿势中学不到什么东西了。\n" );
        return(1);
    }

    message_vision( "$N模仿着佛像的姿势，良久，对「基本拳脚」"
            "似有所悟。\n", ob );
    if ( ob->query( "special_skill/clever" ) )
        add = ob->query("int") * 5 / 2;
    else
        add = ob->query("int") * 3 / 2;
    ob->improve_skill( "unarmed", add );
    ob->receive_damage( "jing", 50 + random( 40 ) );
    ob->start_busy( 2 );
    return(1);
}
