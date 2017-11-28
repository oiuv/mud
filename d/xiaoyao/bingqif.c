inherit ROOM;

void create()
{
        set("short", "打铁屋");
        set("long", @LONG
这里是树林深处的一间小石屋，看来是打造兵器的，屋子
中有个大火炉好烫的呢，屋中还有一张石几，上面放在一些已
经打造好的兵器。
LONG);
        set("exits", ([
                "south" : __DIR__"xiaodao2",
        ]));
        set("no_clean_up", 0);
        set("objects", ([
               __DIR__"obj/blade" : 2,
        ]));
        setup();
}
