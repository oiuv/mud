inherit ROOM;

void create()
{
        set("short", "山间平地");
        set("long", @LONG
这里有点荒凉，小草也长得无精打采的，看来是星宿的弟
子毒练多了，毒素都聚集在这里，连草木也遭了殃。地上零零
散散的摆了几个木人，有些破旧。
LONG );
        set("exits", ([
		        "east" : __DIR__"wuchang2",
        ]));
        set("outdoors", "xingxiu");
        set("for_family", "星宿派");
        setup();
        replace_program(ROOM);
}
