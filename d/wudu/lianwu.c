inherit ROOM;

void create()
{
        set("short", "练武场");
        set("long", @LONG
这里是院内的练武场，黄土场地上摆放着一些练功的石锁，沙袋。
一个小头目正在指导弟子练武。 
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"dating",
                "south" : __DIR__"nanyuan",
                "west" : __DIR__"damen",
                "north" : __DIR__"beiyuan",
        ]));
    
        setup();
        //replace_program(ROOM);
}
