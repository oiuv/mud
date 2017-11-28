inherit ROOM;

void create()
{
	set("short", "老庙首饰店");
	set("long", @LONG
老庙首饰店中珠光宝气四射，眩的人有些睁不开眼睛。精致的长柜中
陈设着各类首饰珠宝玉器，几个老行家正陪着客人挑选所需珠宝。一块千
年古玉雕成的祥龙，玉龙活灵活现，穿梭于祥云之中。龙嘴中含玉球，玉
球有拳头大小，翠绿欲滴。龙眼半睁半闭。珍贵之外又透着淡雅秀丽，曲
折含蓄之气。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"west" : __DIR__"sroad6",
	]));
        set("objects", ([
                __DIR__"npc/zhou" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
