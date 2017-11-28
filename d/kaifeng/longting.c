inherit ROOM;

void create()
{
        set("short", "龙亭大殿");
        set("long", @LONG
龙亭大殿原先是帝王行宫，后宋亡之后，宫殿颓废，后人
在此地复建大殿，殿内珍宝林陈高檐直柱，令人叹为观止。集
南北宫殿建筑之大成。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"road5",
  		"west" : __DIR__"tinyuan",
	]));

        setup();
        replace_program(ROOM);
}
