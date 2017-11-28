// Room: /d/shaolin/zhonglou1.c
// Date: YZC 96/01/19

#include <ansi.h>

inherit ROOM;

void close_passage();
string look_floor();
//int do_open();
int do_open(string arg);

void create()
{
	set("short", "钟楼一层");
	set("long", @LONG
这里是塔楼的底层，一缕缕阳光从墙上的花砖缝隙里透射
进来，在青砖地上投下别致的光影，如同一格格棋盘相似。往
上看，长长的木楼梯盘绕而上，似乎永无尽头。墙角，梯级都
相当洁净，看来经常有僧人打扫。
LONG );
	set("exits", ([
		"up" : __DIR__"zhonglou2",
		"out" : __DIR__"zhonglou",
	]));
	set("item_desc",([
		"floor"		:	(: look_floor :),
	]));
	set("objects",([
		__DIR__"npc/saodi-seng" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
}


void init()
{
//        add_action("do_open", "open");
}

int do_open(string arg)
{
	object room/*, me*/;

	if( !arg || arg=="" )
		return 0;

	if( arg=="brick" && !present("blade", this_player()))
		return notify_fail("空手挖？ 恐怕不行吧！\n");

	if( arg=="brick" && !query("exits/down") )
	{
		message_vision( 
		"$N走到楼梯下，趴在地上，试着用戒刀伸进青砖缝里，慢慢的撬着……\n"
		"等到青砖一块块地起了出来，地上露出一个大洞，几排石阶往下伸去，\n"
		"从这里分明通向一个暗道。\n", this_player());

		set("exits/down", __DIR__"andao3");
		if( room = find_object(__DIR__"andao3") ) 
		{
			room->set("exits/up", __FILE__);
			message("vision", "天花板忽然发出轧轧的声音，露出一个向上的阶梯。\n",
				room );
		}
		remove_call_out("close_passage");
		call_out("close_passage", 3);
		return 1;
	}
	return 0;
}

void close_passage()
{
	object man, room, *ob;
	int i;

	if( !query("exits/down") )
		return;

	message("vision", 
	"只听乒地一声响，钟楼小门被推了开来，一群僧兵一涌而入。\n"
	"他们有的砌砖，有的拌浆，七手八脚地用砖块把洞口封了起来，\n"
	"再在砖缝间浇入烧红的铁汁。\n", this_object() );

	man=new(__DIR__"npc/seng-bing3");
	man->move(this_object());
	man=new(__DIR__"npc/seng-bing3");
	man->move(this_object());
	man=new(__DIR__"npc/seng-bing3");
	man->move(this_object());
	man=new(__DIR__"npc/seng-bing3");
	man->move(this_object());

	ob = all_inventory(this_object());
	for(i=0; i<sizeof(ob); i++) {
		if( !living(ob[i]) || !userp(ob[i]) || ob[i]==man ) continue;
		if( userp(ob[i]) ) { 
			man->set_leader(ob[i]);
			man->kill_ob(ob[i]);
			ob[i]->fight_ob(man);
		}
	}

	if( room = find_object(__DIR__"andao3") ) {
//		room->delete("exits/up");
		message("vision", 
	"只听乒，乓几声巨响，接着几滴滚烫的铁水滴了下来。\n"
	"向上的洞口被人用砖块严严实实地封了起来。\n", room );
	}
	delete("exits/down");
}

string look_floor()
{
	return
	"一片结实平整的青砖地面，只在楼梯下的一角处略显凹凸不平。\n";
}