inherit ROOM;

void create()
{
        set("short",  "长江岸边" );
        set("long", @LONG
这里是长江北岸，江水在你身边哗哗的流淌，偶尔你会在
沙滩上发现有一些残刀断戟，原来西边不远就是有名的古战场
赤壁。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
                "east" : __DIR__"chibi4",
		"west" : __DIR__"chibi6",                
        ]));

             
        setup();
        replace_program(ROOM);
} 
