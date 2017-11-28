//Room: dongan-dadao.c

inherit ROOM;

void create ()
{
        set ("short", "东安大道");
        set ("long", @LONG
长安城的主街东安大道颇为热闹，除了本城的居民外，还有不少外
来的旅客和商人。东安大道再向东就是长安城的连德道口、东城门，往
西是故皇宫的冯诩道。
LONG);
        set("exits", 
        ([ //sizeof() == 2
		"west" : __DIR__"fengxu3",
        	"east" : __DIR__"dongan-daokou",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
