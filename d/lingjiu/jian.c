#include <ansi.h>; 
inherit ROOM;

void create()
{
  	set("short", "百丈涧");
  	set("long", @LONG
山道到此突然消失，在你面前是一条山涧，山涧之中云雾
缭绕，你根本无法看清对面。一条铁索(tiesuo)深入云中，旁
边有一块石碑。
LONG);
  	set("outdoors", "lingjiu");
  	set("exits",([
      		"southdown" : __DIR__"yan",
  	]));
  	set("objects",([
                CLASS_D("lingjiu") + "/yupopo" : 1,
  	]));
  	set("item_desc",([
      		"tiesuo" : YEL "这条铁索是通往对面的接天桥，你"
                           "也许可以走(zou)过去。\n" NOR,
  	]));
  	setup();
}

void init()
{
	add_action("do_zou", "zou");
}

int do_zou(string arg)
{
	object me = this_player(), room;

	if (! arg || arg != "tiesuo")
		return notify_fail("你要走什么？\n");

	if (! (room = find_object(__DIR__"xianchou")))
		room = load_object(__DIR__"xianchou");

	if (! objectp(room))
		return notify_fail(HIW "你大叫道：BUG！BUG！\n" NOR);

	message_vision(HIW "\n只见$N" HIW "轻轻跃上铁索，飘然而"
                       "去。\n" NOR, me);
        me->move(room);
	message_vision(HIW "$N" HIW "从铁索上飘然而下，来到这缥"
                       "缈峰绝顶。\n" NOR, me);
        return 1;
}

