inherit ROOM;
#include <ansi.h>

void create()
{
        set("short","冰洞");
        set("long",@LONG
蛇！一条足有水桶粗的白蛇，正横卧在冰洞正中，望见有人
进来，呼地一声直立起来，吐出血红的信子，径直扑了过来。带
过来一股腥臭的味道。旁边一面冰壁很薄，隐约可见里面有什么
东西。
LONG);
        set("exits",([
            	"out"  : __DIR__"wave2", 
        ])); 
        set("objects", ([
                "/clone/beast/xuanmang" : 1, 
        ]));
        setup();
}

void init()
{
        add_action("do_break", "break");
}

int do_break(string arg)
{
    	object me;
    	me = this_player();

    	message_vision(HIW "$N" HIW "走到冰壁前，运劲向冰壁轰去！\n" NOR, me);

    	if (me->query("neili") < 2000)
    	{
       		message_vision(HIR "结果只听一声闷哼，$N" HIR "被冰壁的"
                               "寒气回侵经脉，眼前一黑……\n" NOR, me);
       		me->set("neili", 0);
       		me->unconcious();
       		return 1;
    	}
    	message_vision(HIY "$N" HIY "只听一声轰响，冰壁被轰穿了，露出一"
                       "个小洞来。\n" NOR, me);
    	set("exits/enter", __DIR__"yudong");
    	me->set("neili", 0);
    	remove_call_out("close");
    	call_out("close", 5, this_object());
    	return 1;
}

void close_out()
{
    	if (query("exits/enter")) delete("exits/enter");
}

void close(object room)
{
    	message("vision", HIW "一股寒气自洞中冒出，将洞口又冻了个严严实实。\n"
                          NOR, room);
    	room->delete("exits/enter");
}

int valid_leave(object me)
{
        if (objectp(present("xuanbing chimang", environment(me))))
           	return notify_fail(HIY "你正欲离开此地，却只见" NOR + HIW "玄冰" NOR +
                                   HIR "赤" NOR + HIW "蟒" NOR + HIY "一个盘旋，顿时将"
                                   "去路完全封锁。\n" NOR);
        return ::valid_leave(me);
}

