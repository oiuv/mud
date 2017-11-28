inherit ROOM;

void create()
{
        set("short", "山陕甘会馆");
        set("long", @LONG
山陕甘会馆是山西，陕西，甘肃的富商巨贾建造的，是旅
汴同乡聚会的场所，就是给这三地的人聚会的。当然也有在此
来商谈生意的。里面就是关帝庙。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"eroad2",
  		"east" : __DIR__"paifang",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
