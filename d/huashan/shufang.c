//shufang.c

inherit ROOM;

#include <ansi.h>

void create()
{
	set("short","华山书房");
	set("long",@LONG
这里是华山派的书房，靠墙是一排书架，里面堆着乱七八糟的一大堆
书，最近老有人上山寻事，都很久没人整理书房了，要找啥书都很麻烦。
右侧有张书桌，桌上四宝俱备。
LONG);
	set("exits",([
		"north" : __DIR__"garden",
	]));

	set("objects",([
		"/clone/book/zhengqi_book" : 1,
	]));
	set("book_count", 1);
	setup();
}

void init()
{
	add_action("do_zhengli", "zhengli");
}

int do_zhengli()
{
	object ob, me=this_player();
	me->add("qi", -5);
	if ((query("book_count") > 0) && (random(5) == 3))
	{
		message_vision(HIY "$N" HIY "辛辛苦苦整理了好半天，居然在"
			       "破杂物堆里发现了一本书。\n"NOR,me);
		ob=new("/clone/book/sword_book2");
		ob->move(me);
		add("book_count", -1);
	} else
		message_vision(HIY "$N" HIY "辛辛苦苦整理了好半天，啥都没"
			       "找到，真是白忙了。\n"NOR,me);
	return 1;
}

void reset()
{
	::reset();
	set("book_count", 1);
}

