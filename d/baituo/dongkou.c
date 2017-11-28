inherit ROOM;

void create()
{
        set("short", "洞口");
        set("long", @LONG
这里是山贼的老窝的洞口，几个山贼把守在洞前，来回的
巡视着，守备很是森严。
LONG);
        set("outdoors", "baituo");
        set("exits", ([
                "north" : __DIR__"dongnei",
                "south" : __DIR__"xiaolu4",
        ]));

        set("objects",([
                __DIR__"npc/shanzei2" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
