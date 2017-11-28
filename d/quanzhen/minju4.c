inherit ROOM;

void create()
{
        set("short", "民居");
        set("long", @LONG
这间屋子你一进来就看见屋角大袋小袋地堆满了粮食，看
得出来今年的收成确实不错。屋内坐着一位村民，正笑嘻嘻地
看着自己的积粮，也许正在盘算这个冬天又不愁了。
LONG);
        set("exits", ([
                "northeast" : __DIR__"guchang",
        ]));

        set("objects", ([
                __DIR__"npc/cunmin" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
