#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "水莲洞内");
	set("long", @LONG
往前行段路后，道路也渐渐宽阔了起来。隐隐约约似乎有
水滴之声传来，你不禁想朝声音传来的方向走去 (zou)看看。
LONG);
	set("exits",([
	       "east" : __DIR__"zigai1",
	]));
	
	set("objects",([
	       "/clone/beast/yanjingshe" : 1,
	]));
	
	setup();

}


void init()
{
	object me = this_player();
	add_action("do_zou", "zou");
	add_action("do_use", "use");

	if (present("fire", me))
               	me->set_temp("marks/点", 1);

	else   	me->delete_temp("marks/点");
}	

int do_zou()
{
	object me = this_player();
	
	if (! me->query_temp("marks/点"))
		return notify_fail(HIW"\n这里一片漆黑，如果没有火光寸步难行。\n\n"NOR);
	
	if (me->is_fighting() || me->is_busy())
		return notify_fail("\n你现在正忙着呢。\n\n");
	
	me->move(__DIR__"outzigai");
	
	return 1;
}


int do_use(string arg)
{
	object me = this_player();

	if (! arg || arg != "fire") return 0;
	
	if (! present("fire", me)) return 0;

	write(HIC "\n你将火折点然了。\n\n" NOR);

	me->set_temp("marks/点", 1);

	return 1;

}
