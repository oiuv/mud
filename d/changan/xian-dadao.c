//Room: xian-dadao.c

inherit ROOM;

void create ()
{
        set ("short", "西安大道");
        set ("long", @LONG
长安城的主街西安大道颇为热闹，除了本城的居民外，还有不少外
来的旅客和商人。西安大道再向西就是长安城的永泰道口、西城门，往
东是故皇宫的扶风道。
LONG);
        set("exits", 
        ([ //sizeof() == 2
		"east" : __DIR__"fufeng3",
        	"west" : __DIR__"xian-daokou",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
