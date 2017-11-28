#include <ansi.h> 
inherit ROOM;

void init();
void close_gate();
int do_close(string arg);
string look_gate();
int do_open(string arg);

void create()
{
	set("short", "山门殿");
	set("long", @LONG
这里便是少林寺的前殿山门殿了。只见殿内青砖铺地，两侧
分列哼、哈二将。身躯雄伟，面相忿怒，头带宝冠，上半身裸露，
手执金刚杵，一鼓鼻，一张口，露牙睁目，凶猛可畏。两边各放
一红木供桌，陈列香烛，以供僧俗叩拜。自此的左右各有一间偏
殿，供比丘们打坐诵经之用。南面是一道三丈来高的朱红杉木包
铜大门(gate)。
LONG);
	set("exits", ([
		"east" : __DIR__"smdian1",
		"west" : __DIR__"smdian2",
		"north" : __DIR__"taijie",
	]));
	set("item_desc",([
		"gate" : (: look_gate :),
	]));
	set("objects",([
		__DIR__"npc/seng-bing3" : 2,
		__DIR__"npc/xiang-ke" : 1,
	]));
	setup();
}

void init()
{
	add_action("do_open", "open");
	add_action("do_close", "close");
}

void close_gate()
{
	object room;

	if(!( room = find_object(__DIR__"guangchang1")) )
		room = load_object(__DIR__"guangchang1");
	if(objectp(room))
	{
		delete("exits/south");
			message("vision", HIY "僧兵上前把大门关了起来。\n" NOR,
                                          this_object());
		room->delete("exits/north");
		message("vision", HIY "只听乒地一声，里面有人把大门关上了。\n"
                                  NOR, room);
	}
}

int do_close(string arg)
{
	if (!query("exits/south"))
		return notify_fail("大门已经是关着的了。\n");

	if (!arg || (arg != "gate" && arg != "south"))
		return notify_fail("你要关什么？\n");

	message_vision(CYN "$N" CYN "朝着僧兵点了点头。\n" NOR, this_player());

	remove_call_out("close_gate");
	call_out("close_gate", 2);

	return 1;
}

int do_open(string arg)
{
	object room;

	if (query("exits/south"))
		return notify_fail("大门已经是开着了。\n");

	if (!arg || (arg != "gate" && arg != "south"))
		return notify_fail("你要开什么？\n");

	if(!( room = find_object(__DIR__"guangchang1")) )
		room = load_object(__DIR__"guangchang1");
	if(objectp(room))
	{
		set("exits/south", __DIR__"guangchang1");
		message_vision(HIY "$N" HIY "使劲把大门打了开来。\n" NOR, this_player());
		room->set("exits/north", __FILE__);
		message("vision", HIY "只听吱地一声，里面有人把大门打开了。\n" NOR, room);
		remove_call_out("close_gate");
		call_out("close_gate", 10);
	}

	return 1;
}

string look_gate()
{
        return YEL "一道三丈来高的朱红杉木包铜大门。\n" NOR;
}

int valid_leave(object me, string dir)
{
	if (me->query("id") == "seng bing" &&  dir == "south" ) return 0;

	return ::valid_leave(me, dir);
}

