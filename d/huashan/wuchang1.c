// wuchang1.c

inherit ROOM;

void create()
{
        set("short", "南练武场");
	set("long", @LONG
这里是华山派的练武场，场上立这几个木人，西南通向广场，北面是另一
个练武场，东边也是一个练武场，可是不知怎么的，似乎很少有人过去。附近
到处是华山的弟子人来人往，热闹非凡。
LONG );
        set("exits", ([ /* sizeof() == 2 */
            "southwest" : __DIR__"square",
            "north"     : __DIR__"wuchang2",
	    "east"      : __DIR__"wuchang3",
        ]));
        set("outdoors", "huashan" );
        set("for_family", "华山派");

        setup();
	replace_program(ROOM);
}

