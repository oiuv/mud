//JMQJIGUAN.C

inherit ROOM;
#include <ansi.h>

void create()
{
	set("short", "巨木旗神木");
	set("long", @LONG
你眼前只见一棵大树，高有百丈，十人也环抱不住。巨树倚绝壁而
生，枝叶繁茂，藤萝环绕，竟然无法一览全貌。树身有一处光滑无
比，是常有人摩挲而成。
LONG );
	set("exits", ([
		"east" : __DIR__"jmqshulin6",
        ])); 
	set("outdoors", "mingjiao");
	setup();
}

void init()
{
        add_action("do_climb", "climb");
}

int do_climb()
{
        object me=this_player();
        //mapping mypar = (mapping) me->query("party");
        me->receive_damage("qi",15);
        me->receive_wound("qi",15);
        
	message_vision(HIC "$N" HIC "三下两下就顺树身爬了上去...\n" NOR, me);
	me->move(__DIR__"jmqdating");
	tell_object(me, HIC"你爬到了巨木旗大厅。\n"NOR);
	message("vision", HIC "只见" + me->query("name") +
		"顺树身爬了上来，靠在墙边直喘气！\n"NOR,
		environment(me), me);
	return 1;
}

