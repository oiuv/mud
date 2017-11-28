inherit ROOM;

void create()
{
        set("short", "北院");
        set("long", @LONG
这里是北院，院子里静悄悄的。北面有一个厨房，远远飘来一股
饭香，想是该开饭了。  
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"bingqi",
                "south" : __DIR__"lianwu",
                "north" : __DIR__"chufang",
        ]));

        setup();
}
