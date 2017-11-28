//Room: nanan-dadao.c

inherit ROOM;

void create ()
{
        set ("short", "南安大道");
        set ("long", @LONG
长安城的主街南安大道颇为热闹，除了本城的居民外，还有不少外
来的旅客和商人。南安大道再向南就是长安城的南城门，往北是故皇宫
的青龙街。
LONG);
        set("exits", 
        ([ //sizeof() == 2
		"south" : __DIR__"nanan-daokou",
        	"north" : __DIR__"qinglong2",
                "east"  : __DIR__"gongbu",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
