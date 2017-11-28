inherit ROOM;

void create()
{
        set("short", "小胡同");
        set("long", @LONG
这里是一条小胡同，就在白天这里也是昏暗不堪。 
LONG);
	set("outdoors", "zhongzhou");
        set("exits", ([
                 
                "southwest" : __DIR__"hutong",
                "northeast" : __DIR__"hutong2",                  
        ]));

        setup();
        replace_program(ROOM);
}
